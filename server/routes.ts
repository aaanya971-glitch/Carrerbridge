import { Router, Request, Response } from 'express';
import { getDatabase, hashPassword, saveDatabase } from './db';
import {
  getAiRecommendations,
  analyzeResumeWithAi,
  analyzeSkillGapWithAi,
  getAiChatbotResponse,
} from './gemini';

export const apiRouter = Router();

// Helper to extract user ID from Authorization header
function getAuthUserId(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  // Format: Bearer <userId> or Bearer demo_token_<userId>
  const token = authHeader.replace(/^Bearer\s+/, '').trim();
  if (token.startsWith('token_')) {
    return token.replace('token_', '');
  }
  return token || null;
}

// ==================== AUTH ROUTES ====================

apiRouter.post('/auth/register', async (req: Request, res: Response) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      education,
      college,
      course,
      yearOfStudy,
      skills,
      interests,
      location,
      role = 'student',
    } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const db = await getDatabase();
    const existing = db.exec(`SELECT id FROM users WHERE email = '${email.replace(/'/g, "''")}'`);
    if (existing.length > 0 && existing[0].values.length > 0) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const userId = `usr_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const passHash = hashPassword(password);
    const now = new Date().toISOString();

    db.run(`
      INSERT INTO users (id, name, email, password_hash, role, education, college, course, year_of_study, skills, interests, location, phone, bio, resume_text, certifications, projects, created_at)
      VALUES (
        '${userId}',
        '${(name || '').replace(/'/g, "''")}',
        '${(email || '').replace(/'/g, "''")}',
        '${passHash}',
        '${role === 'admin' ? 'admin' : 'student'}',
        '${(education || '').replace(/'/g, "''")}',
        '${(college || '').replace(/'/g, "''")}',
        '${(course || '').replace(/'/g, "''")}',
        '${(yearOfStudy || '').replace(/'/g, "''")}',
        '${(skills || '').replace(/'/g, "''")}',
        '${(interests || '').replace(/'/g, "''")}',
        '${(location || '').replace(/'/g, "''")}',
        '${(phone || '').replace(/'/g, "''")}',
        '',
        '',
        '',
        '',
        '${now}'
      )
    `);

    saveDatabase();

    const token = `token_${userId}`;
    res.json({
      success: true,
      token,
      user: {
        id: userId,
        name,
        email,
        role: role === 'admin' ? 'admin' : 'student',
        education,
        college,
        course,
        yearOfStudy,
        skills,
        interests,
        location,
        phone,
      },
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Failed to register: ' + err.message });
  }
});

apiRouter.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const db = await getDatabase();
    const passHash = hashPassword(password);
    const query = `SELECT * FROM users WHERE email = '${email.replace(/'/g, "''")}' AND password_hash = '${passHash}'`;
    const result = db.exec(query);

    if (result.length === 0 || result[0].values.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const columns = result[0].columns;
    const values = result[0].values[0];
    const userObj: any = {};
    columns.forEach((col, idx) => {
      userObj[col] = values[idx];
    });

    delete userObj.password_hash;
    const token = `token_${userObj.id}`;

    res.json({
      success: true,
      token,
      user: userObj,
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed: ' + err.message });
  }
});

apiRouter.get('/auth/me', async (req: Request, res: Response) => {
  try {
    const userId = getAuthUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized. Please login.' });
    }

    const db = await getDatabase();
    const result = db.exec(`SELECT * FROM users WHERE id = '${userId.replace(/'/g, "''")}'`);

    if (result.length === 0 || result[0].values.length === 0) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    const columns = result[0].columns;
    const values = result[0].values[0];
    const userObj: any = {};
    columns.forEach((col, idx) => {
      userObj[col] = values[idx];
    });
    delete userObj.password_hash;

    res.json({ user: userObj });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/auth/profile', async (req: Request, res: Response) => {
  try {
    const userId = getAuthUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const {
      name,
      education,
      college,
      course,
      year_of_study,
      skills,
      interests,
      location,
      phone,
      bio,
      resume_text,
      certifications,
      projects,
    } = req.body;

    const db = await getDatabase();
    db.run(`
      UPDATE users SET
        name = COALESCE('${(name || '').replace(/'/g, "''")}', name),
        education = '${(education || '').replace(/'/g, "''")}',
        college = '${(college || '').replace(/'/g, "''")}',
        course = '${(course || '').replace(/'/g, "''")}',
        year_of_study = '${(year_of_study || '').replace(/'/g, "''")}',
        skills = '${(skills || '').replace(/'/g, "''")}',
        interests = '${(interests || '').replace(/'/g, "''")}',
        location = '${(location || '').replace(/'/g, "''")}',
        phone = '${(phone || '').replace(/'/g, "''")}',
        bio = '${(bio || '').replace(/'/g, "''")}',
        resume_text = '${(resume_text || '').replace(/'/g, "''")}',
        certifications = '${(certifications || '').replace(/'/g, "''")}',
        projects = '${(projects || '').replace(/'/g, "''")}'
      WHERE id = '${userId.replace(/'/g, "''")}'
    `);

    saveDatabase();

    // Fetch updated user
    const result = db.exec(`SELECT * FROM users WHERE id = '${userId.replace(/'/g, "''")}'`);
    const columns = result[0].columns;
    const values = result[0].values[0];
    const userObj: any = {};
    columns.forEach((col, idx) => {
      userObj[col] = values[idx];
    });
    delete userObj.password_hash;

    res.json({ success: true, user: userObj });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== SCHOLARSHIPS ====================

apiRouter.get('/scholarships', async (req: Request, res: Response) => {
  try {
    const { search, educationLevel, category, isGovernment, isFullyFunded, verifiedOnly } = req.query;
    const db = await getDatabase();

    let query = 'SELECT * FROM scholarships WHERE 1=1';

    if (search) {
      const s = String(search).replace(/'/g, "''");
      query += ` AND (title LIKE '%${s}%' OR provider LIKE '%${s}%' OR description LIKE '%${s}%' OR eligibility LIKE '%${s}%')`;
    }
    if (educationLevel && educationLevel !== 'All') {
      query += ` AND education_level LIKE '%${String(educationLevel).replace(/'/g, "''")}%'`;
    }
    if (category && category !== 'All') {
      query += ` AND category LIKE '%${String(category).replace(/'/g, "''")}%'`;
    }
    if (isGovernment === 'true' || isGovernment === '1') {
      query += ` AND is_government = 1`;
    }
    if (isFullyFunded === 'true' || isFullyFunded === '1') {
      query += ` AND is_fully_funded = 1`;
    }
    if (verifiedOnly === 'true' || verifiedOnly === '1') {
      query += ` AND verified = 1`;
    }

    query += ' ORDER BY verified DESC, deadline ASC';

    const result = db.exec(query);
    const items = formatQueryResults(result);
    res.json({ items });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/scholarships', async (req: Request, res: Response) => {
  try {
    const db = await getDatabase();
    const id = `sch_${Date.now()}`;
    const {
      title,
      provider,
      description,
      eligibility,
      education_level = 'Undergraduate',
      amount,
      deadline,
      category = 'Merit-cum-Means',
      official_url = '#',
      verified = 1,
      required_documents = 'Mark sheets, ID Proof',
      location = 'All India',
      income_range = 'Open',
      is_government = 0,
      is_fully_funded = 0,
    } = req.body;

    db.run(`
      INSERT INTO scholarships (id, title, provider, description, eligibility, education_level, amount, deadline, category, official_url, verified, required_documents, location, income_range, is_government, is_fully_funded, views_count, created_at)
      VALUES (
        '${id}',
        '${(title || '').replace(/'/g, "''")}',
        '${(provider || '').replace(/'/g, "''")}',
        '${(description || '').replace(/'/g, "''")}',
        '${(eligibility || '').replace(/'/g, "''")}',
        '${(education_level || '').replace(/'/g, "''")}',
        '${(amount || '').replace(/'/g, "''")}',
        '${(deadline || '2026-12-31').replace(/'/g, "''")}',
        '${(category || '').replace(/'/g, "''")}',
        '${(official_url || '').replace(/'/g, "''")}',
        ${verified ? 1 : 0},
        '${(required_documents || '').replace(/'/g, "''")}',
        '${(location || '').replace(/'/g, "''")}',
        '${(income_range || '').replace(/'/g, "''")}',
        ${is_government ? 1 : 0},
        ${is_fully_funded ? 1 : 0},
        0,
        '${new Date().toISOString()}'
      )
    `);

    saveDatabase();
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/scholarships/:id', async (req: Request, res: Response) => {
  try {
    const db = await getDatabase();
    const id = req.params.id;
    const body = req.body;

    db.run(`
      UPDATE scholarships SET
        title = '${(body.title || '').replace(/'/g, "''")}',
        provider = '${(body.provider || '').replace(/'/g, "''")}',
        description = '${(body.description || '').replace(/'/g, "''")}',
        eligibility = '${(body.eligibility || '').replace(/'/g, "''")}',
        education_level = '${(body.education_level || '').replace(/'/g, "''")}',
        amount = '${(body.amount || '').replace(/'/g, "''")}',
        deadline = '${(body.deadline || '').replace(/'/g, "''")}',
        category = '${(body.category || '').replace(/'/g, "''")}',
        official_url = '${(body.official_url || '').replace(/'/g, "''")}',
        verified = ${body.verified ? 1 : 0},
        is_government = ${body.is_government ? 1 : 0},
        is_fully_funded = ${body.is_fully_funded ? 1 : 0}
      WHERE id = '${id.replace(/'/g, "''")}'
    `);

    saveDatabase();
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.delete('/scholarships/:id', async (req: Request, res: Response) => {
  try {
    const db = await getDatabase();
    db.run(`DELETE FROM scholarships WHERE id = '${req.params.id.replace(/'/g, "''")}'`);
    saveDatabase();
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== INTERNSHIPS ====================

apiRouter.get('/internships', async (req: Request, res: Response) => {
  try {
    const { search, workMode, location } = req.query;
    const db = await getDatabase();

    let query = 'SELECT * FROM internships WHERE 1=1';
    if (search) {
      const s = String(search).replace(/'/g, "''");
      query += ` AND (company LIKE '%${s}%' OR role LIKE '%${s}%' OR skills LIKE '%${s}%' OR description LIKE '%${s}%')`;
    }
    if (workMode && workMode !== 'All') {
      query += ` AND work_mode = '${String(workMode).replace(/'/g, "''")}'`;
    }
    if (location && location !== 'All') {
      query += ` AND location LIKE '%${String(location).replace(/'/g, "''")}%'`;
    }

    query += ' ORDER BY verified DESC, deadline ASC';

    const result = db.exec(query);
    const items = formatQueryResults(result);
    res.json({ items });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/internships', async (req: Request, res: Response) => {
  try {
    const db = await getDatabase();
    const id = `int_${Date.now()}`;
    const body = req.body;

    db.run(`
      INSERT INTO internships (id, company, role, skills, location, work_mode, stipend, duration, deadline, official_url, description, verified, views_count, created_at)
      VALUES (
        '${id}',
        '${(body.company || '').replace(/'/g, "''")}',
        '${(body.role || '').replace(/'/g, "''")}',
        '${(body.skills || '').replace(/'/g, "''")}',
        '${(body.location || 'Remote').replace(/'/g, "''")}',
        '${(body.work_mode || 'Remote').replace(/'/g, "''")}',
        '${(body.stipend || 'Competitive').replace(/'/g, "''")}',
        '${(body.duration || '3 Months').replace(/'/g, "''")}',
        '${(body.deadline || '2026-12-31').replace(/'/g, "''")}',
        '${(body.official_url || '#').replace(/'/g, "''")}',
        '${(body.description || '').replace(/'/g, "''")}',
        ${body.verified ? 1 : 0},
        0,
        '${new Date().toISOString()}'
      )
    `);

    saveDatabase();
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/internships/:id', async (req: Request, res: Response) => {
  try {
    const db = await getDatabase();
    const id = req.params.id;
    const body = req.body;

    db.run(`
      UPDATE internships SET
        company = '${(body.company || '').replace(/'/g, "''")}',
        role = '${(body.role || '').replace(/'/g, "''")}',
        skills = '${(body.skills || '').replace(/'/g, "''")}',
        location = '${(body.location || '').replace(/'/g, "''")}',
        work_mode = '${(body.work_mode || '').replace(/'/g, "''")}',
        stipend = '${(body.stipend || '').replace(/'/g, "''")}',
        duration = '${(body.duration || '').replace(/'/g, "''")}',
        deadline = '${(body.deadline || '').replace(/'/g, "''")}',
        official_url = '${(body.official_url || '').replace(/'/g, "''")}',
        description = '${(body.description || '').replace(/'/g, "''")}',
        verified = ${body.verified ? 1 : 0}
      WHERE id = '${id.replace(/'/g, "''")}'
    `);

    saveDatabase();
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.delete('/internships/:id', async (req: Request, res: Response) => {
  try {
    const db = await getDatabase();
    db.run(`DELETE FROM internships WHERE id = '${req.params.id.replace(/'/g, "''")}'`);
    saveDatabase();
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== JOBS ====================

apiRouter.get('/jobs', async (req: Request, res: Response) => {
  try {
    const { search, workMode, location } = req.query;
    const db = await getDatabase();

    let query = 'SELECT * FROM jobs WHERE 1=1';
    if (search) {
      const s = String(search).replace(/'/g, "''");
      query += ` AND (company LIKE '%${s}%' OR role LIKE '%${s}%' OR skills LIKE '%${s}%' OR description LIKE '%${s}%')`;
    }
    if (workMode && workMode !== 'All') {
      query += ` AND work_mode = '${String(workMode).replace(/'/g, "''")}'`;
    }
    if (location && location !== 'All') {
      query += ` AND location LIKE '%${String(location).replace(/'/g, "''")}%'`;
    }

    query += ' ORDER BY verified DESC, deadline ASC';

    const result = db.exec(query);
    const items = formatQueryResults(result);
    res.json({ items });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/jobs', async (req: Request, res: Response) => {
  try {
    const db = await getDatabase();
    const id = `job_${Date.now()}`;
    const body = req.body;

    db.run(`
      INSERT INTO jobs (id, company, role, skills, experience, salary, location, work_mode, deadline, official_url, description, verified, views_count, created_at)
      VALUES (
        '${id}',
        '${(body.company || '').replace(/'/g, "''")}',
        '${(body.role || '').replace(/'/g, "''")}',
        '${(body.skills || '').replace(/'/g, "''")}',
        '${(body.experience || 'Freshers').replace(/'/g, "''")}',
        '${(body.salary || 'Best in Industry').replace(/'/g, "''")}',
        '${(body.location || 'All India').replace(/'/g, "''")}',
        '${(body.work_mode || 'Hybrid').replace(/'/g, "''")}',
        '${(body.deadline || '2026-12-31').replace(/'/g, "''")}',
        '${(body.official_url || '#').replace(/'/g, "''")}',
        '${(body.description || '').replace(/'/g, "''")}',
        ${body.verified ? 1 : 0},
        0,
        '${new Date().toISOString()}'
      )
    `);

    saveDatabase();
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/jobs/:id', async (req: Request, res: Response) => {
  try {
    const db = await getDatabase();
    const id = req.params.id;
    const body = req.body;

    db.run(`
      UPDATE jobs SET
        company = '${(body.company || '').replace(/'/g, "''")}',
        role = '${(body.role || '').replace(/'/g, "''")}',
        skills = '${(body.skills || '').replace(/'/g, "''")}',
        experience = '${(body.experience || '').replace(/'/g, "''")}',
        salary = '${(body.salary || '').replace(/'/g, "''")}',
        location = '${(body.location || '').replace(/'/g, "''")}',
        work_mode = '${(body.work_mode || '').replace(/'/g, "''")}',
        deadline = '${(body.deadline || '').replace(/'/g, "''")}',
        official_url = '${(body.official_url || '').replace(/'/g, "''")}',
        description = '${(body.description || '').replace(/'/g, "''")}',
        verified = ${body.verified ? 1 : 0}
      WHERE id = '${id.replace(/'/g, "''")}'
    `);

    saveDatabase();
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.delete('/jobs/:id', async (req: Request, res: Response) => {
  try {
    const db = await getDatabase();
    db.run(`DELETE FROM jobs WHERE id = '${req.params.id.replace(/'/g, "''")}'`);
    saveDatabase();
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== COURSES ====================

apiRouter.get('/courses', async (req: Request, res: Response) => {
  try {
    const { search, category, isFree, level } = req.query;
    const db = await getDatabase();

    let query = 'SELECT * FROM courses WHERE 1=1';
    if (search) {
      const s = String(search).replace(/'/g, "''");
      query += ` AND (title LIKE '%${s}%' OR provider LIKE '%${s}%' OR category LIKE '%${s}%' OR description LIKE '%${s}%')`;
    }
    if (category && category !== 'All') {
      query += ` AND category LIKE '%${String(category).replace(/'/g, "''")}%'`;
    }
    if (isFree === 'true' || isFree === '1') {
      query += ` AND is_free = 1`;
    }
    if (level && level !== 'All') {
      query += ` AND level LIKE '%${String(level).replace(/'/g, "''")}%'`;
    }

    query += ' ORDER BY verified DESC, id ASC';

    const result = db.exec(query);
    const items = formatQueryResults(result);
    res.json({ items });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/courses', async (req: Request, res: Response) => {
  try {
    const db = await getDatabase();
    const id = `crs_${Date.now()}`;
    const body = req.body;

    db.run(`
      INSERT INTO courses (id, title, provider, category, duration, level, price, is_free, certificate_available, official_url, description, verified, created_at)
      VALUES (
        '${id}',
        '${(body.title || '').replace(/'/g, "''")}',
        '${(body.provider || '').replace(/'/g, "''")}',
        '${(body.category || 'General').replace(/'/g, "''")}',
        '${(body.duration || 'Self-paced').replace(/'/g, "''")}',
        '${(body.level || 'Beginner').replace(/'/g, "''")}',
        '${(body.price || 'Free').replace(/'/g, "''")}',
        ${body.is_free ? 1 : 0},
        ${body.certificate_available ? 1 : 0},
        '${(body.official_url || '#').replace(/'/g, "''")}',
        '${(body.description || '').replace(/'/g, "''")}',
        ${body.verified ? 1 : 0},
        '${new Date().toISOString()}'
      )
    `);

    saveDatabase();
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== BOOKMARKS ====================

apiRouter.get('/bookmarks', async (req: Request, res: Response) => {
  try {
    const userId = getAuthUserId(req) || 'usr_student_1';
    const db = await getDatabase();

    const bookmarksRes = db.exec(`SELECT * FROM bookmarks WHERE user_id = '${userId.replace(/'/g, "''")}'`);
    const bookmarks = formatQueryResults(bookmarksRes);

    // Hydrate each bookmark with the underlying opportunity item
    const hydrated = [];
    for (const b of bookmarks) {
      let table = 'scholarships';
      if (b.resource_type === 'internship') table = 'internships';
      else if (b.resource_type === 'job') table = 'jobs';
      else if (b.resource_type === 'course') table = 'courses';

      const itemRes = db.exec(`SELECT * FROM ${table} WHERE id = '${b.resource_id.replace(/'/g, "''")}'`);
      const itemData = formatQueryResults(itemRes)[0];
      if (itemData) {
        hydrated.push({
          ...b,
          details: itemData,
        });
      }
    }

    res.json({ items: hydrated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/bookmarks/toggle', async (req: Request, res: Response) => {
  try {
    const userId = getAuthUserId(req) || 'usr_student_1';
    const { resourceId, resourceType } = req.body;

    if (!resourceId || !resourceType) {
      return res.status(400).json({ error: 'resourceId and resourceType are required.' });
    }

    const db = await getDatabase();
    const existing = db.exec(`
      SELECT id FROM bookmarks 
      WHERE user_id = '${userId.replace(/'/g, "''")}' 
      AND resource_id = '${resourceId.replace(/'/g, "''")}'
    `);

    if (existing.length > 0 && existing[0].values.length > 0) {
      // Remove
      db.run(`
        DELETE FROM bookmarks 
        WHERE user_id = '${userId.replace(/'/g, "''")}' 
        AND resource_id = '${resourceId.replace(/'/g, "''")}'
      `);
      saveDatabase();
      return res.json({ bookmarked: false });
    } else {
      // Add
      const id = `bm_${Date.now()}`;
      db.run(`
        INSERT INTO bookmarks (id, user_id, resource_id, resource_type, created_at)
        VALUES ('${id}', '${userId.replace(/'/g, "''")}', '${resourceId.replace(/'/g, "''")}', '${resourceType}', '${new Date().toISOString()}')
      `);
      saveDatabase();
      return res.json({ bookmarked: true });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== APPLICATIONS (KANBAN) ====================

apiRouter.get('/applications', async (req: Request, res: Response) => {
  try {
    const userId = getAuthUserId(req) || 'usr_student_1';
    const db = await getDatabase();
    const result = db.exec(`SELECT * FROM applications WHERE user_id = '${userId.replace(/'/g, "''")}' ORDER BY created_at DESC`);
    const items = formatQueryResults(result);
    res.json({ items });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/applications', async (req: Request, res: Response) => {
  try {
    const userId = getAuthUserId(req) || 'usr_student_1';
    const { opportunityId, opportunityType, title, companyOrProvider, status = 'Interested', notes, deadline } = req.body;

    const db = await getDatabase();
    const id = `app_${Date.now()}`;
    const now = new Date().toISOString();

    db.run(`
      INSERT INTO applications (id, user_id, opportunity_id, opportunity_type, title, company_or_provider, status, applied_date, notes, deadline, created_at)
      VALUES (
        '${id}',
        '${userId.replace(/'/g, "''")}',
        '${(opportunityId || id).replace(/'/g, "''")}',
        '${(opportunityType || 'internship').replace(/'/g, "''")}',
        '${(title || '').replace(/'/g, "''")}',
        '${(companyOrProvider || '').replace(/'/g, "''")}',
        '${(status || 'Interested').replace(/'/g, "''")}',
        ${status === 'Applied' ? `'${now.slice(0, 10)}'` : 'NULL'},
        '${(notes || '').replace(/'/g, "''")}',
        '${(deadline || '').replace(/'/g, "''")}',
        '${now}'
      )
    `);

    saveDatabase();
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/applications/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const { status, notes } = req.body;
    const db = await getDatabase();

    const appliedDateSql = status === 'Applied' ? `, applied_date = COALESCE(applied_date, '${new Date().toISOString().slice(0, 10)}')` : '';

    db.run(`
      UPDATE applications SET
        status = '${(status || 'Interested').replace(/'/g, "''")}',
        notes = '${(notes || '').replace(/'/g, "''")}'
        ${appliedDateSql}
      WHERE id = '${id.replace(/'/g, "''")}'
    `);

    saveDatabase();
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.delete('/applications/:id', async (req: Request, res: Response) => {
  try {
    const db = await getDatabase();
    db.run(`DELETE FROM applications WHERE id = '${req.params.id.replace(/'/g, "''")}'`);
    saveDatabase();
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== DEADLINE TRACKER ====================

apiRouter.get('/deadlines', async (req: Request, res: Response) => {
  try {
    const db = await getDatabase();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Aggregate deadlines across scholarships, internships, jobs, applications
    const sch = formatQueryResults(db.exec('SELECT id, title, provider as organization, deadline, "scholarship" as type, verified FROM scholarships'));
    const int = formatQueryResults(db.exec('SELECT id, role as title, company as organization, deadline, "internship" as type, verified FROM internships'));
    const job = formatQueryResults(db.exec('SELECT id, role as title, company as organization, deadline, "job" as type, verified FROM jobs'));

    const all = [...sch, ...int, ...job].map((item: any) => {
      const d = new Date(item.deadline);
      const diffDays = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      let status = 'Upcoming';
      if (diffDays < 0) {
        status = 'Expired';
      } else if (diffDays === 0) {
        status = 'Due Today';
      } else if (diffDays <= 7) {
        status = 'Due Soon';
      }

      return {
        ...item,
        diffDays,
        status,
      };
    });

    all.sort((a, b) => a.diffDays - b.diffDays);
    res.json({ deadlines: all });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== OPPORTUNITY MATCHING SYSTEM ====================

apiRouter.post('/match', async (req: Request, res: Response) => {
  try {
    const userId = getAuthUserId(req) || 'usr_student_1';
    const { opportunitySkills = '', opportunityEducation = '', opportunityLocation = '', opportunityCategory = '' } = req.body;

    const db = await getDatabase();
    const userRes = db.exec(`SELECT * FROM users WHERE id = '${userId.replace(/'/g, "''")}'`);
    const user = formatQueryResults(userRes)[0] || {
      skills: 'Python, React, JavaScript, SQL',
      education: 'Undergraduate',
      interests: 'Software Development, AI/ML',
      location: 'Bangalore, India',
    };

    const userSkillsList = (user.skills || '').split(',').map((s: string) => s.trim().toLowerCase());
    const oppSkillsList = (opportunitySkills || '').split(',').map((s: string) => s.trim().toLowerCase());

    const matchedSkills = oppSkillsList.filter((s: string) => userSkillsList.some((us: string) => us.includes(s) || s.includes(us)));
    const missingSkills = oppSkillsList.filter((s: string) => !userSkillsList.some((us: string) => us.includes(s) || s.includes(us)));

    const skillsMatch = oppSkillsList.length > 0 ? Math.round((matchedSkills.length / oppSkillsList.length) * 100) : 85;

    const educationMatch = (user.education || '').toLowerCase().includes((opportunityEducation || '').toLowerCase().slice(0, 5)) ? 100 : 80;

    const userInterests = (user.interests || '').toLowerCase();
    const oppCat = (opportunityCategory || '').toLowerCase();
    const interestMatch = userInterests.includes(oppCat) || oppCat.includes(userInterests.split(',')[0] || '') ? 90 : 70;

    const userLoc = (user.location || '').toLowerCase();
    const oppLoc = (opportunityLocation || '').toLowerCase();
    const locationMatch = oppLoc.includes('remote') || oppLoc.includes('all india') || userLoc.includes(oppLoc) ? 95 : 75;

    const overallMatch = Math.round(skillsMatch * 0.45 + educationMatch * 0.2 + interestMatch * 0.2 + locationMatch * 0.15);

    res.json({
      matchPercentage: Math.min(99, Math.max(45, overallMatch)),
      breakdown: {
        skillsMatch: Math.min(100, Math.max(30, skillsMatch)),
        educationMatch,
        interestMatch,
        locationMatch,
      },
      missingSkills,
      matchedSkills,
      whyRecommended: `Matches your background in ${user.course || 'tech studies'} with ${matchedSkills.slice(0, 3).join(', ')} alignment.`,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== MY CAREER ROADMAP ====================

apiRouter.get('/roadmap', async (req: Request, res: Response) => {
  try {
    const userId = getAuthUserId(req) || 'usr_student_1';
    const db = await getDatabase();
    const result = db.exec(`SELECT * FROM roadmaps WHERE user_id = '${userId.replace(/'/g, "''")}' ORDER BY updated_at DESC LIMIT 1`);
    const item = formatQueryResults(result)[0];

    if (!item) {
      // Default 7-step roadmap
      const defaultSteps = [
        { id: 1, title: 'Step 1: Build Core Fundamentals', description: 'Master Data Structures & Algorithms, Git version control, and Unix shell basics.', completed: true },
        { id: 2, title: 'Step 2: Learn Required Technical Skills', description: 'Deep dive into language specifics (Python/TypeScript), relational SQL schemas, and REST APIs.', completed: true },
        { id: 3, title: 'Step 3: Complete Targeted Certifications', description: 'Earn an accredited foundational certificate (e.g., AWS Cloud Practitioner or Google Cybersecurity).', completed: false },
        { id: 4, title: 'Step 4: Build Real-World Production Projects', description: 'Architect 2-3 full-stack applications with public GitHub repositories, CI/CD, and live URL demo.', completed: false },
        { id: 5, title: 'Step 5: Apply for Structured Internships', description: 'Apply across tech portals, university career fairs, and open source cohorts (GSoC/Outreachy).', completed: false },
        { id: 6, title: 'Step 6: Prepare for Technical & Behavioral Interviews', description: 'Practice LeetCode mediums, system design scenarios, and behavioral STAR stories.', completed: false },
        { id: 7, title: 'Step 7: Apply for Graduate Roles & Negotiate Offers', description: 'Submit tailored applications to junior full-time positions with personalized referrals.', completed: false },
      ];
      return res.json({
        careerGoal: 'Full Stack Cloud Engineer',
        currentEducation: 'B.Tech CSE (3rd Year)',
        skills: 'Python, React, SQL, Git',
        steps: defaultSteps,
      });
    }

    res.json({
      careerGoal: item.career_goal,
      currentEducation: item.current_education,
      skills: item.skills,
      steps: JSON.parse(item.steps_json),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/roadmap/generate', async (req: Request, res: Response) => {
  try {
    const userId = getAuthUserId(req) || 'usr_student_1';
    const { careerGoal, currentEducation, skills } = req.body;

    const steps = [
      {
        id: 1,
        title: 'Step 1: Build Core Fundamentals',
        description: `Strengthen basic computer science fundamentals, data structures, and terminal tools aligned with ${careerGoal}.`,
        completed: true,
      },
      {
        id: 2,
        title: 'Step 2: Learn Required Technical Skills',
        description: `Focus on hands-on frameworks and languages: Expand from your foundation (${skills}) into professional design patterns.`,
        completed: false,
      },
      {
        id: 3,
        title: 'Step 3: Complete Industry Certifications',
        description: `Acquire recognized certifications in ${careerGoal} to validate practical expertise to hiring managers.`,
        completed: false,
      },
      {
        id: 4,
        title: 'Step 4: Build Deployable Capstone Projects',
        description: `Create two end-to-end portfolio projects simulating real industry challenges in ${careerGoal} with automated tests and CI/CD.`,
        completed: false,
      },
      {
        id: 5,
        title: 'Step 5: Apply for Internships & Open Source',
        description: `Target high-learning summer internships, research labs, or startup roles to gain production experience.`,
        completed: false,
      },
      {
        id: 6,
        title: 'Step 6: Prepare for Coding & System Interviews',
        description: `Rigorous practice of algorithmic problem solving, mock technical interviews, and resume storytelling.`,
        completed: false,
      },
      {
        id: 7,
        title: 'Step 7: Apply for Target Full-Time Positions',
        description: `Leverage alumni networks, LinkedIn referrals, and career fairs to secure top entry-level positions.`,
        completed: false,
      },
    ];

    const db = await getDatabase();
    const id = `rdm_${Date.now()}`;
    const now = new Date().toISOString();

    db.run(`
      INSERT OR REPLACE INTO roadmaps (id, user_id, career_goal, current_education, skills, steps_json, updated_at)
      VALUES (
        '${id}',
        '${userId.replace(/'/g, "''")}',
        '${(careerGoal || 'Software Engineer').replace(/'/g, "''")}',
        '${(currentEducation || '').replace(/'/g, "''")}',
        '${(skills || '').replace(/'/g, "''")}',
        '${JSON.stringify(steps).replace(/'/g, "''")}',
        '${now}'
      )
    `);

    saveDatabase();
    res.json({ careerGoal, currentEducation, skills, steps });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/roadmap/toggle-step', async (req: Request, res: Response) => {
  try {
    const userId = getAuthUserId(req) || 'usr_student_1';
    const { stepId, completed } = req.body;

    const db = await getDatabase();
    const result = db.exec(`SELECT * FROM roadmaps WHERE user_id = '${userId.replace(/'/g, "''")}' ORDER BY updated_at DESC LIMIT 1`);
    const item = formatQueryResults(result)[0];

    if (!item) {
      return res.status(404).json({ error: 'Roadmap not found.' });
    }

    const steps = JSON.parse(item.steps_json);
    const updated = steps.map((s: any) => (s.id === stepId ? { ...s, completed } : s));

    db.run(`
      UPDATE roadmaps 
      SET steps_json = '${JSON.stringify(updated).replace(/'/g, "''")}', updated_at = '${new Date().toISOString()}'
      WHERE id = '${item.id}'
    `);

    saveDatabase();
    res.json({ success: true, steps: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== AI ENDPOINTS ====================

apiRouter.post('/ai/recommendations', async (req: Request, res: Response) => {
  try {
    const profile = req.body;
    const recommendations = await getAiRecommendations(profile);
    res.json(recommendations);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/ai/resume-analyze', async (req: Request, res: Response) => {
  try {
    const { resumeText, targetJob } = req.body;
    if (!resumeText || resumeText.trim().length < 20) {
      return res.status(400).json({ error: 'Please provide valid resume text or details.' });
    }
    const result = await analyzeResumeWithAi(resumeText, targetJob);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/ai/skill-gap', async (req: Request, res: Response) => {
  try {
    const { targetRole, currentSkills } = req.body;
    if (!targetRole) {
      return res.status(400).json({ error: 'Target role is required.' });
    }
    const skillsArray = Array.isArray(currentSkills) ? currentSkills : (currentSkills || '').split(',').map((s: string) => s.trim());
    const result = await analyzeSkillGapWithAi(targetRole, skillsArray);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/ai/chat', async (req: Request, res: Response) => {
  try {
    const { botName = 'Sam', language = 'English', userMessage, chatHistory = [], studentContext } = req.body;

    if (!userMessage) {
      return res.status(400).json({ error: 'Message cannot be empty.' });
    }

    const reply = await getAiChatbotResponse({
      botName,
      language,
      userMessage,
      chatHistory,
      studentContext,
    });

    res.json({ reply, botName, language });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== ADMIN ENDPOINTS ====================

apiRouter.get('/admin/stats', async (req: Request, res: Response) => {
  try {
    const db = await getDatabase();

    const studentsCount = (db.exec("SELECT COUNT(*) FROM users WHERE role = 'student'")[0]?.values[0]?.[0] as number) || 0;
    const scholarshipsCount = (db.exec('SELECT COUNT(*) FROM scholarships')[0]?.values[0]?.[0] as number) || 0;
    const internshipsCount = (db.exec('SELECT COUNT(*) FROM internships')[0]?.values[0]?.[0] as number) || 0;
    const jobsCount = (db.exec('SELECT COUNT(*) FROM jobs')[0]?.values[0]?.[0] as number) || 0;
    const coursesCount = (db.exec('SELECT COUNT(*) FROM courses')[0]?.values[0]?.[0] as number) || 0;
    const applicationsCount = (db.exec('SELECT COUNT(*) FROM applications')[0]?.values[0]?.[0] as number) || 0;

    const todayStr = new Date().toISOString().slice(0, 10);
    const expiredCount =
      ((db.exec(`SELECT COUNT(*) FROM scholarships WHERE deadline < '${todayStr}'`)[0]?.values[0]?.[0] as number) || 0) +
      ((db.exec(`SELECT COUNT(*) FROM internships WHERE deadline < '${todayStr}'`)[0]?.values[0]?.[0] as number) || 0) +
      ((db.exec(`SELECT COUNT(*) FROM jobs WHERE deadline < '${todayStr}'`)[0]?.values[0]?.[0] as number) || 0);

    // Platform analytics chart data
    const careerInterestStats = [
      { name: 'Software Development', students: 48, percentage: 38 },
      { name: 'Cybersecurity', students: 26, percentage: 21 },
      { name: 'Data Science & AI', students: 24, percentage: 19 },
      { name: 'Cloud & DevOps', students: 16, percentage: 13 },
      { name: 'UI/UX Design', students: 11, percentage: 9 },
    ];

    const applicationStatusStats = [
      { status: 'Applied', count: 42, color: '#3b82f6' },
      { status: 'Shortlisted', count: 18, color: '#eab308' },
      { status: 'Interview', count: 12, color: '#a855f7' },
      { status: 'Selected', count: 8, color: '#22c55e' },
      { status: 'Saved / Interested', count: 35, color: '#64748b' },
    ];

    const monthlyTrends = [
      { month: 'May', views: 820, applications: 45 },
      { month: 'Jun', views: 1150, applications: 72 },
      { month: 'Jul', views: 1420, applications: 98 },
      { month: 'Aug', views: 1980, applications: 140 },
      { month: 'Sep', views: 2450, applications: 185 },
    ];

    res.json({
      totals: {
        students: studentsCount,
        scholarships: scholarshipsCount,
        internships: internshipsCount,
        jobs: jobsCount,
        courses: coursesCount,
        applications: applicationsCount,
        expired: expiredCount,
      },
      charts: {
        careerInterests: careerInterestStats,
        applicationStatuses: applicationStatusStats,
        monthlyTrends,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/admin/students', async (req: Request, res: Response) => {
  try {
    const db = await getDatabase();
    const result = db.exec("SELECT id, name, email, education, college, course, year_of_study, skills, interests, location, created_at FROM users WHERE role = 'student' ORDER BY created_at DESC");
    const items = formatQueryResults(result);
    res.json({ students: items });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Interactive SQL query console for DB demonstration in college presentation
apiRouter.post('/admin/sql-console', async (req: Request, res: Response) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Query is required.' });
    }

    const db = await getDatabase();
    const trimmed = query.trim();

    // Prevent dropping core schema for safety
    if (/^DROP\s+TABLE\s+users/i.test(trimmed)) {
      return res.status(403).json({ error: 'Cannot drop core users table in demonstration mode.' });
    }

    if (/^SELECT/i.test(trimmed)) {
      const result = db.exec(trimmed);
      const rows = formatQueryResults(result);
      const columns = result[0]?.columns || [];
      return res.json({ success: true, type: 'SELECT', rows, columns, count: rows.length });
    } else {
      db.run(trimmed);
      saveDatabase();
      return res.json({ success: true, type: 'EXEC', message: 'Query executed successfully.' });
    }
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Helper to convert sql.js exec output to JSON array of objects
function formatQueryResults(res: any[]): any[] {
  if (!res || res.length === 0) return [];
  const columns = res[0].columns;
  const values = res[0].values;
  return values.map((row: any[]) => {
    const obj: any = {};
    columns.forEach((col: string, idx: number) => {
      obj[col] = row[idx];
    });
    return obj;
  });
}
