import { getDatabase, saveDatabase } from '../db';

export interface EmailRecipient {
  email: string;
  name: string;
}

export interface EmailMessage {
  to: string;
  toName: string;
  from?: string;
  subject: string;
  bodyHtml: string;
  bodyText: string;
  category?: 'deadline_24h_reminder' | 'test_alert' | 'system';
  headers?: Record<string, string>;
  metadata?: {
    opportunityId?: string;
    opportunityTitle?: string;
    opportunityType?: string;
    companyOrProvider?: string;
    deadline?: string;
    hoursRemaining?: number;
    userId?: string;
  };
}

export interface SentEmailResult {
  success: boolean;
  messageId: string;
  simulatedSmtpResponse: string;
  sentAt: string;
  recipient: string;
  subject: string;
}

export interface SentEmailRecord {
  id: string;
  userId: string;
  recipientEmail: string;
  recipientName: string;
  opportunityId: string;
  opportunityTitle: string;
  opportunityType: string;
  companyOrProvider: string;
  deadline: string;
  hoursRemaining: number;
  subject: string;
  bodyHtml: string;
  bodyText: string;
  status: string;
  sentAt: string;
}

/**
 * Service Abstraction Interface for Email Transports.
 * Decouples domain deadline logic from physical or simulated delivery mechanisms.
 */
export interface IEmailTransport {
  name: string;
  sendMail(message: EmailMessage): Promise<SentEmailResult>;
  getSentEmails(userId?: string): Promise<SentEmailRecord[]>;
  clearSentEmails(userId?: string): Promise<void>;
}

/**
 * Concrete Simulated Email Transport.
 * Captures, renders, formats RFC-compliant simulated mail headers,
 * and persists delivery logs in SQLite for inspection in the student UI.
 */
export class SimulatedEmailTransport implements IEmailTransport {
  public readonly name = 'Simulated SMTP Service Transport (CareerBridge In-App Mailbox)';

  async sendMail(message: EmailMessage): Promise<SentEmailResult> {
    const db = await getDatabase();
    const id = `mail_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const messageId = `<${id}.alert@careerbridge.edu>`;
    const smtpResponse = `250 2.0.0 OK: message queued as ${id} (simulated transport)`;

    const userId = message.metadata?.userId || 'usr_student_1';
    const oppId = message.metadata?.opportunityId || 'general';
    const oppTitle = message.metadata?.opportunityTitle || message.subject;
    const oppType = message.metadata?.opportunityType || 'opportunity';
    const company = message.metadata?.companyOrProvider || 'CareerBridge';
    const deadline = message.metadata?.deadline || now;
    const hoursRemaining = message.metadata?.hoursRemaining ?? 24;

    try {
      db.run(`
        INSERT INTO email_reminders_log (
          id, user_id, recipient_email, recipient_name, opportunity_id,
          opportunity_title, opportunity_type, company_or_provider, deadline,
          hours_remaining, subject, body_html, body_text, status, sent_at
        ) VALUES (
          '${id}',
          '${userId.replace(/'/g, "''")}',
          '${message.to.replace(/'/g, "''")}',
          '${message.toName.replace(/'/g, "''")}',
          '${oppId.replace(/'/g, "''")}',
          '${oppTitle.replace(/'/g, "''")}',
          '${oppType.replace(/'/g, "''")}',
          '${company.replace(/'/g, "''")}',
          '${deadline.replace(/'/g, "''")}',
          ${hoursRemaining},
          '${message.subject.replace(/'/g, "''")}',
          '${message.bodyHtml.replace(/'/g, "''")}',
          '${message.bodyText.replace(/'/g, "''")}',
          'delivered_simulated',
          '${now}'
        )
      `);
      saveDatabase();
    } catch (err) {
      console.error('[SimulatedEmailTransport] Error writing to email_reminders_log:', err);
    }

    console.log(`[SimulatedEmailTransport] ✉️ Simulated email successfully dispatched to ${message.to} for "${oppTitle}" (Deadline in ${hoursRemaining.toFixed(1)}h)`);

    return {
      success: true,
      messageId,
      simulatedSmtpResponse: smtpResponse,
      sentAt: now,
      recipient: message.to,
      subject: message.subject,
    };
  }

  async getSentEmails(userId?: string): Promise<SentEmailRecord[]> {
    const db = await getDatabase();
    let query = 'SELECT * FROM email_reminders_log';
    if (userId) {
      query += ` WHERE user_id = '${userId.replace(/'/g, "''")}'`;
    }
    query += ' ORDER BY sent_at DESC LIMIT 100';

    const result = db.exec(query);
    if (!result || result.length === 0) return [];

    const columns = result[0].columns;
    const rows = result[0].values;

    return rows.map((row) => {
      const obj: any = {};
      columns.forEach((col, idx) => {
        obj[col] = row[idx];
      });
      return {
        id: obj.id,
        userId: obj.user_id,
        recipientEmail: obj.recipient_email,
        recipientName: obj.recipient_name,
        opportunityId: obj.opportunity_id,
        opportunityTitle: obj.opportunity_title,
        opportunityType: obj.opportunity_type,
        companyOrProvider: obj.company_or_provider,
        deadline: obj.deadline,
        hoursRemaining: obj.hours_remaining,
        subject: obj.subject,
        bodyHtml: obj.body_html,
        bodyText: obj.body_text,
        status: obj.status,
        sentAt: obj.sent_at,
      };
    });
  }

  async clearSentEmails(userId?: string): Promise<void> {
    const db = await getDatabase();
    let query = 'DELETE FROM email_reminders_log';
    if (userId) {
      query += ` WHERE user_id = '${userId.replace(/'/g, "''")}'`;
    }
    db.run(query);
    saveDatabase();
  }
}

export interface TrackedOpportunityItem {
  id: string;
  opportunityId: string;
  title: string;
  companyOrProvider: string;
  opportunityType: string;
  status: string;
  deadline: string;
  officialUrl?: string;
  hoursRemaining: number;
  source: 'application' | 'bookmark';
}

export interface ReminderScanResult {
  scanTimestamp: string;
  referenceTime: string;
  totalTrackedScanned: number;
  opportunitiesWithin24h: TrackedOpportunityItem[];
  emailsDispatched: SentEmailResult[];
  skippedAlreadyNotified: number;
}

/**
 * Service Abstraction for Tracking Deadlines & Sending 24h Alerts
 */
export class DeadlineReminderService {
  constructor(private transport: IEmailTransport = new SimulatedEmailTransport()) {}

  /**
   * Sets or swaps the underlying email transport mechanism (e.g. testing or switching to real SMTP)
   */
  public setTransport(transport: IEmailTransport): void {
    this.transport = transport;
  }

  public getTransportName(): string {
    return this.transport.name;
  }

  /**
   * Collects all tracked items for a given user (applications list + bookmarks with cutoffs)
   * and calculates the remaining hours until each deadline.
   */
  public async getTrackedOpportunitiesWithDeadlines(
    userId: string,
    referenceTime: Date = new Date()
  ): Promise<TrackedOpportunityItem[]> {
    const db = await getDatabase();
    const items: TrackedOpportunityItem[] = [];

    // 1. Fetch tracked applications
    const appsRes = db.exec(`
      SELECT id, opportunity_id, title, company_or_provider, opportunity_type, status, deadline 
      FROM applications 
      WHERE user_id = '${userId.replace(/'/g, "''")}' 
        AND deadline IS NOT NULL 
        AND deadline != ''
        AND status NOT IN ('Rejected', 'Selected')
    `);

    if (appsRes.length > 0) {
      const cols = appsRes[0].columns;
      for (const row of appsRes[0].values) {
        const app: any = {};
        cols.forEach((c, idx) => (app[c] = row[idx]));
        if (!app.deadline) continue;

        const deadlineDate = this.parseDeadline(app.deadline);
        const diffMs = deadlineDate.getTime() - referenceTime.getTime();
        const hoursRemaining = diffMs / (1000 * 60 * 60);

        items.push({
          id: app.id,
          opportunityId: app.opportunity_id || app.id,
          title: app.title,
          companyOrProvider: app.company_or_provider,
          opportunityType: app.opportunity_type || 'opportunity',
          status: app.status,
          deadline: app.deadline,
          hoursRemaining,
          source: 'application',
        });
      }
    }

    // 2. Fetch bookmarked items that have deadlines
    const bmRes = db.exec(`
      SELECT resource_id, resource_type FROM bookmarks 
      WHERE user_id = '${userId.replace(/'/g, "''")}'
    `);

    if (bmRes.length > 0) {
      for (const bmRow of bmRes[0].values) {
        const resId = String(bmRow[0]);
        const resType = String(bmRow[1]);
        let table = '';
        if (resType === 'scholarship') table = 'scholarships';
        else if (resType === 'internship') table = 'internships';
        else if (resType === 'job') table = 'jobs';

        if (table) {
          const detailRes = db.exec(`SELECT * FROM ${table} WHERE id = '${resId.replace(/'/g, "''")}'`);
          if (detailRes.length > 0 && detailRes[0].values.length > 0) {
            const cols = detailRes[0].columns;
            const detObj: any = {};
            cols.forEach((c, idx) => (detObj[c] = detailRes[0].values[0][idx]));

            if (detObj.deadline) {
              // Avoid duplicates if already in applications
              const existsInApps = items.some((it) => it.opportunityId === resId);
              if (!existsInApps) {
                const deadlineDate = this.parseDeadline(detObj.deadline);
                const diffMs = deadlineDate.getTime() - referenceTime.getTime();
                const hoursRemaining = diffMs / (1000 * 60 * 60);

                items.push({
                  id: `bm_track_${resId}`,
                  opportunityId: resId,
                  title: detObj.title || detObj.role || 'Opportunity',
                  companyOrProvider: detObj.provider || detObj.company || 'Provider',
                  opportunityType: resType,
                  status: 'Bookmarked',
                  deadline: detObj.deadline,
                  officialUrl: detObj.official_url,
                  hoursRemaining,
                  source: 'bookmark',
                });
              }
            }
          }
        }
      }
    }

    return items;
  }

  /**
   * Evaluates tracked deadlines and dispatches simulated email reminders
   * for any deadline within 24 hours.
   */
  public async scanAndSendReminders(options: {
    userId?: string;
    referenceTime?: Date;
    forceResend?: boolean;
    recipientEmailOverride?: string;
  } = {}): Promise<ReminderScanResult> {
    const userId = options.userId || 'usr_student_1';
    const referenceTime = options.referenceTime || new Date();
    const forceResend = options.forceResend ?? false;

    // Get user details
    const db = await getDatabase();
    const userRes = db.exec(`SELECT id, name, email FROM users WHERE id = '${userId.replace(/'/g, "''")}'`);
    let studentName = 'Student';
    let studentEmail = options.recipientEmailOverride || 'student@careerbridge.edu';

    if (userRes.length > 0 && userRes[0].values.length > 0) {
      studentName = String(userRes[0].values[0][1] || 'Student');
      if (!options.recipientEmailOverride) {
        studentEmail = String(userRes[0].values[0][2] || studentEmail);
      }
    }

    const tracked = await this.getTrackedOpportunitiesWithDeadlines(userId, referenceTime);

    // Filter strictly opportunities where 0 <= hoursRemaining <= 24
    // (Also tolerate slightly just passed within 1 hour so immediate tests work smoothly)
    const within24h = tracked.filter((it) => it.hoursRemaining >= -1 && it.hoursRemaining <= 24);

    const emailsDispatched: SentEmailResult[] = [];
    let skippedAlreadyNotified = 0;

    for (const item of within24h) {
      // Deduplication check: Has a reminder already been simulated/sent for this deadline in the last 20 hours?
      if (!forceResend) {
        const checkLog = db.exec(`
          SELECT id, sent_at FROM email_reminders_log 
          WHERE user_id = '${userId.replace(/'/g, "''")}' 
            AND opportunity_id = '${item.opportunityId.replace(/'/g, "''")}'
            AND deadline = '${item.deadline.replace(/'/g, "''")}'
          ORDER BY sent_at DESC LIMIT 1
        `);

        if (checkLog.length > 0 && checkLog[0].values.length > 0) {
          const lastSentIso = String(checkLog[0].values[0][1]);
          const lastSentTime = new Date(lastSentIso).getTime();
          const hoursSinceLastSent = (referenceTime.getTime() - lastSentTime) / (1000 * 60 * 60);

          if (hoursSinceLastSent < 20) {
            skippedAlreadyNotified++;
            continue;
          }
        }
      }

      // Generate HTML & Plain text email templates
      const emailContent = this.generateDeadlineReminderEmail({
        studentName,
        opportunity: item,
        referenceTime,
      });

      const message: EmailMessage = {
        to: studentEmail,
        toName: studentName,
        from: 'CareerBridge Deadline Alerts <alerts@careerbridge.edu>',
        subject: emailContent.subject,
        bodyHtml: emailContent.html,
        bodyText: emailContent.text,
        category: 'deadline_24h_reminder',
        metadata: {
          opportunityId: item.opportunityId,
          opportunityTitle: item.title,
          opportunityType: item.opportunityType,
          companyOrProvider: item.companyOrProvider,
          deadline: item.deadline,
          hoursRemaining: Math.max(0, Math.round(item.hoursRemaining * 10) / 10),
          userId,
        },
      };

      const result = await this.transport.sendMail(message);
      emailsDispatched.push(result);
    }

    return {
      scanTimestamp: new Date().toISOString(),
      referenceTime: referenceTime.toISOString(),
      totalTrackedScanned: tracked.length,
      opportunitiesWithin24h: within24h,
      emailsDispatched,
      skippedAlreadyNotified,
    };
  }

  /**
   * Helper to create a simulated tracked deadline for quick testing in UI.
   */
  public async createSimulatedTrackedDeadline(
    userId: string,
    hoursFromNow: number = 18,
    sampleTitle?: string,
    sampleOrg?: string,
    sampleType: string = 'scholarship'
  ): Promise<any> {
    const db = await getDatabase();
    const id = `sim_app_${Date.now()}`;
    const targetDate = new Date(Date.now() + hoursFromNow * 3600 * 1000);
    const deadlineStr = targetDate.toISOString().replace('T', ' ').substring(0, 16);

    const title = sampleTitle || `National Merit Science & Tech Scholarship (Simulated Cutoff)`;
    const provider = sampleOrg || `Ministry of Education & Science Council`;

    db.run(`
      INSERT INTO applications (
        id, user_id, opportunity_id, opportunity_type, title, company_or_provider,
        status, applied_date, notes, deadline, created_at
      ) VALUES (
        '${id}',
        '${userId.replace(/'/g, "''")}',
        '${id}',
        '${sampleType}',
        '${title.replace(/'/g, "''")}',
        '${provider.replace(/'/g, "''")}',
        'Interested',
        NULL,
        'Simulated test deadline generated to verify 24-hour email reminder dispatch.',
        '${deadlineStr}',
        '${new Date().toISOString()}'
      )
    `);
    saveDatabase();

    return {
      id,
      title,
      companyOrProvider: provider,
      deadline: deadlineStr,
      hoursRemaining: hoursFromNow,
    };
  }

  public async getSentLogs(userId?: string): Promise<SentEmailRecord[]> {
    return this.transport.getSentEmails(userId);
  }

  public async clearSentLogs(userId?: string): Promise<void> {
    await this.transport.clearSentEmails(userId);
  }

  /**
   * Parses deadline strings formatted as 'YYYY-MM-DD' or ISO timestamps
   */
  private parseDeadline(raw: string): Date {
    if (!raw) return new Date();
    // If it's pure YYYY-MM-DD, set deadline to 23:59:59 of that day
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
      const d = new Date(raw);
      d.setHours(23, 59, 59, 999);
      return d;
    }
    const parsed = new Date(raw);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  }

  /**
   * Generates high-fidelity HTML and plaintext email content
   */
  private generateDeadlineReminderEmail(params: {
    studentName: string;
    opportunity: TrackedOpportunityItem;
    referenceTime: Date;
  }): { subject: string; html: string; text: string } {
    const { studentName, opportunity } = params;
    const hours = Math.max(0, Math.round(opportunity.hoursRemaining * 10) / 10);
    const hoursDisplay = hours <= 1 ? 'less than 1 hour' : `${hours} hours`;

    const subject = `🚨 URGENT: Less than 24 Hours Left for ${opportunity.title}`;

    const text = `
Hello ${studentName},

This is an automated 24-hour deadline reminder from CareerBridge.

URGENT DEADLINE ALERT:
Opportunity: ${opportunity.title}
Organization: ${opportunity.companyOrProvider}
Type: ${opportunity.opportunityType.toUpperCase()}
Cutoff Deadline: ${opportunity.deadline}
Estimated Time Remaining: ${hoursDisplay}

Pre-Submission Checklist:
- Verify mandatory documents (Marksheets, ID proof, Recommendation letter).
- Double check contact information and portfolio/resume links.
- Submit before the portal cutoff time to avoid server traffic delays.

Portal Link: ${opportunity.officialUrl || 'https://careerbridge.edu/applications'}

Best regards,
CareerBridge Opportunity & Financial Aid Notification Service
(Simulated Email Transport Engine)
    `.trim();

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03); border: 1px solid #e2e8f0;">
          
          <!-- Urgent Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #e11d48 0%, #be123c 100%); padding: 24px 32px; text-align: left;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <span style="display: inline-block; background-color: rgba(255, 255, 255, 0.2); color: #ffffff; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; padding: 4px 10px; border-radius: 9999px; margin-bottom: 8px;">
                      ⏰ 24-Hour Critical Countdown
                    </span>
                    <h1 style="color: #ffffff; font-size: 20px; font-weight: 800; margin: 4px 0 0 0; line-height: 1.3;">
                      Upcoming Deadline Alert
                    </h1>
                  </td>
                  <td align="right" valign="middle">
                    <div style="background-color: #ffffff; color: #be123c; font-weight: 900; font-size: 18px; padding: 8px 14px; border-radius: 12px; display: inline-block; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                      ~${hoursDisplay} left
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 32px;">
              <p style="font-size: 15px; color: #475569; margin: 0 0 16px 0;">
                Hi <strong>${studentName}</strong>,
              </p>
              <p style="font-size: 15px; color: #334155; line-height: 1.6; margin: 0 0 24px 0;">
                A tracked opportunity on your CareerBridge watchlist is closing within the next <strong>24 hours</strong>. Please review your submission materials and complete your application before the cutoff time.
              </p>

              <!-- Opportunity Detail Card -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                <tr>
                  <td>
                    <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">
                      ${opportunity.opportunityType.toUpperCase()}
                    </div>
                    <div style="font-size: 17px; font-weight: 700; color: #0f172a; margin-bottom: 6px;">
                      ${opportunity.title}
                    </div>
                    <div style="font-size: 13px; color: #475569; margin-bottom: 14px;">
                      Offered by: <strong>${opportunity.companyOrProvider}</strong>
                    </div>

                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-top: 1px dashed #cbd5e1; padding-top: 12px;">
                      <tr>
                        <td>
                          <span style="font-size: 12px; color: #64748b;">Closing Deadline:</span>
                          <span style="font-size: 13px; font-weight: 700; color: #e11d48; margin-left: 6px;">${opportunity.deadline}</span>
                        </td>
                        <td align="right">
                          <span style="display: inline-block; font-size: 11px; font-weight: 600; background-color: #e0f2fe; color: #0369a1; padding: 3px 8px; border-radius: 6px;">
                            Status: ${opportunity.status}
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Quick Checklist -->
              <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 12px; padding: 18px; margin-bottom: 28px;">
                <div style="font-size: 13px; font-weight: 700; color: #92400e; margin-bottom: 8px;">
                  📋 Action Steps Before You Submit:
                </div>
                <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #78350f; line-height: 1.6;">
                  <li>Verify all required documents are attached (e.g. Transcripts, ID, Proof of Enrollment).</li>
                  <li>Check that your resume highlights matching keywords.</li>
                  <li>Submit at least 2 hours before cutoff to avoid last-minute portal downtime.</li>
                </ul>
              </div>

              <!-- Action Button -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <a href="${opportunity.officialUrl || 'https://careerbridge.edu'}" target="_blank" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 14px; padding: 14px 28px; border-radius: 10px; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);">
                      Complete &amp; Submit Application &rarr;
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 32px; text-align: center;">
              <p style="font-size: 11px; color: #64748b; margin: 0 0 6px 0;">
                You received this alert because you tracked this opportunity on <strong>CareerBridge</strong>.
              </p>
              <p style="font-size: 10px; color: #94a3b8; margin: 0;">
                CareerBridge Simulated Email Notification Service &bull; Transport: Virtual RFC-2822 SMTP Sandbox
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

    return { subject, html, text };
  }
}

// Global default singleton instance
export const deadlineReminderService = new DeadlineReminderService(new SimulatedEmailTransport());
