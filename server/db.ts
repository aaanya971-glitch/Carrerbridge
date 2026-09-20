import initSqlJs, { Database } from 'sql.js';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

let db: Database | null = null;
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'careerbridge.sqlite');

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + '_salt_cb_2026').digest('hex');
}

export function saveDatabase(): void {
  if (!db) return;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  } catch (err) {
    console.error('Error saving database to disk:', err);
  }
}

export async function getDatabase(): Promise<Database> {
  if (db) return db;

  const SQL = await initSqlJs();

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (fs.existsSync(DB_PATH)) {
    try {
      const fileBuffer = fs.readFileSync(DB_PATH);
      db = new SQL.Database(fileBuffer);
      console.log('Loaded existing SQLite database from disk.');
    } catch (e) {
      console.warn('Could not read existing database file, creating fresh database.', e);
      db = new SQL.Database();
    }
  } else {
    db = new SQL.Database();
    console.log('Created fresh in-memory SQLite database.');
  }

  initSchemaAndSeed(db);
  saveDatabase();
  return db;
}

function initSchemaAndSeed(database: Database) {
  // Execute relational schema creation
  database.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'student',
      education TEXT,
      college TEXT,
      course TEXT,
      year_of_study TEXT,
      skills TEXT,
      interests TEXT,
      location TEXT,
      phone TEXT,
      bio TEXT,
      resume_url TEXT,
      resume_text TEXT,
      certifications TEXT,
      projects TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS scholarships (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      provider TEXT NOT NULL,
      description TEXT NOT NULL,
      eligibility TEXT NOT NULL,
      education_level TEXT NOT NULL,
      amount TEXT NOT NULL,
      deadline TEXT NOT NULL,
      category TEXT NOT NULL,
      official_url TEXT NOT NULL,
      verified INTEGER NOT NULL DEFAULT 1,
      required_documents TEXT,
      location TEXT,
      income_range TEXT,
      is_government INTEGER DEFAULT 0,
      is_fully_funded INTEGER DEFAULT 0,
      views_count INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS internships (
      id TEXT PRIMARY KEY,
      company TEXT NOT NULL,
      role TEXT NOT NULL,
      skills TEXT NOT NULL,
      location TEXT NOT NULL,
      work_mode TEXT NOT NULL,
      stipend TEXT NOT NULL,
      duration TEXT NOT NULL,
      deadline TEXT NOT NULL,
      official_url TEXT NOT NULL,
      description TEXT NOT NULL,
      verified INTEGER NOT NULL DEFAULT 1,
      views_count INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      company TEXT NOT NULL,
      role TEXT NOT NULL,
      skills TEXT NOT NULL,
      experience TEXT NOT NULL,
      salary TEXT NOT NULL,
      location TEXT NOT NULL,
      work_mode TEXT NOT NULL,
      deadline TEXT NOT NULL,
      official_url TEXT NOT NULL,
      description TEXT NOT NULL,
      verified INTEGER NOT NULL DEFAULT 1,
      views_count INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS courses (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      provider TEXT NOT NULL,
      category TEXT NOT NULL,
      duration TEXT NOT NULL,
      level TEXT NOT NULL,
      price TEXT NOT NULL,
      is_free INTEGER DEFAULT 0,
      certificate_available INTEGER DEFAULT 1,
      official_url TEXT NOT NULL,
      description TEXT NOT NULL,
      verified INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS bookmarks (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      resource_id TEXT NOT NULL,
      resource_type TEXT NOT NULL,
      created_at TEXT NOT NULL,
      UNIQUE(user_id, resource_id, resource_type)
    );

    CREATE TABLE IF NOT EXISTS applications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      opportunity_id TEXT NOT NULL,
      opportunity_type TEXT NOT NULL,
      title TEXT NOT NULL,
      company_or_provider TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Interested',
      applied_date TEXT,
      notes TEXT,
      deadline TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_skills (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      skill TEXT NOT NULL,
      proficiency TEXT DEFAULT 'Intermediate',
      verified INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS roadmaps (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      career_goal TEXT NOT NULL,
      current_education TEXT,
      skills TEXT,
      steps_json TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // Seed default Users if empty
  const userCheck = database.exec("SELECT COUNT(*) as count FROM users");
  const userCount = userCheck[0]?.values[0]?.[0] as number;

  if (userCount === 0) {
    const studentPass = hashPassword('password123');
    const adminPass = hashPassword('admin123');
    const now = new Date().toISOString();

    database.run(`
      INSERT INTO users (id, name, email, password_hash, role, education, college, course, year_of_study, skills, interests, location, phone, bio, resume_text, certifications, projects, created_at)
      VALUES 
      ('usr_student_1', 'Pravin Kumar', 'student@careerbridge.edu', '${studentPass}', 'student', 'Undergraduate (B.Tech)', 'Indian Institute of Information Technology', 'Computer Science and Engineering', '3rd Year', 'Python, JavaScript, React, SQL, Machine Learning, Git', 'Software Development, AI/ML, Cloud Computing', 'Bangalore, India', '+91 98765 43210', 'Passionate 3rd-year CS student aiming for full-stack engineering and cloud-native application development.', 'Skills: Python, React, TypeScript, Node.js, SQL, Linux.\nEducation: B.Tech in CSE (GPA: 8.8/10).\nProjects: Campus portal in React & Express; Real-time AI chat interface.\nCertifications: AWS Cloud Practitioner.', 'AWS Certified Cloud Practitioner, HackerRank SQL Gold', 'CareerBridge Resource Hub, Distributed Key-Value Store', '${now}'),
      ('usr_admin_1', 'Admin Supervisor', 'admin@careerbridge.edu', '${adminPass}', 'admin', 'Master of Technology', 'National Institute of Technology', 'Computer Applications', 'Faculty / Admin', 'Platform Management, Policy Verification, Analytics', 'Student Mentorship, Education Policy', 'New Delhi, India', '+91 98111 22233', 'Administrator and Career Counselor at CareerBridge.', '', 'Certified Career Analyst', 'Career Portal Infrastructure', '${now}')
    `);
  }

  // Seed 10 Realistic Scholarships if empty
  const schCheck = database.exec("SELECT COUNT(*) as count FROM scholarships");
  const schCount = schCheck[0]?.values[0]?.[0] as number;
  if (schCount === 0) {
    const scholarships = [
      {
        id: 'sch_1',
        title: 'Reliance Foundation Undergraduate Scholarship',
        provider: 'Reliance Foundation',
        description: 'Supports meritorious undergraduate students across all disciplines to pursue higher studies in India with generous financial grants and mentorship.',
        eligibility: 'First-year regular undergraduate students with min 60% in 12th; household income < ₹15 Lakhs.',
        education_level: 'Undergraduate',
        amount: 'Up to ₹2,00,000 for entire degree',
        deadline: '2026-10-15',
        category: 'Merit-cum-Means',
        official_url: 'https://www.reliancefoundation.org',
        verified: 1,
        required_documents: '12th Marksheet, Income Certificate, College Bonafide, ID Proof',
        location: 'All India',
        income_range: '< ₹15,00,000 / year',
        is_government: 0,
        is_fully_funded: 0
      },
      {
        id: 'sch_2',
        title: 'Google Generation Scholarship (Women in Tech)',
        provider: 'Google LLC',
        description: 'Aimed at helping women in computer science and technology excel in tech careers through scholarships and access to Google mentorship community.',
        eligibility: 'Women students enrolled as full-time undergraduate students in Computer Science, Computer Engineering, or closely related technical field.',
        education_level: 'Undergraduate',
        amount: '$2,500 USD (Approx ₹2,08,000)',
        deadline: '2026-11-30',
        category: 'Diversity & Tech',
        official_url: 'https://buildyourfuture.withgoogle.com/scholarships',
        verified: 1,
        required_documents: 'Resume, Academic Transcripts, 2 Essay Questions, Reference Letter',
        location: 'APAC / India',
        income_range: 'No income bar',
        is_government: 0,
        is_fully_funded: 0
      },
      {
        id: 'sch_3',
        title: 'Central Sector Scheme of Scholarships (CSSS)',
        provider: 'Ministry of Education, Govt of India',
        description: 'National government scholarship to provide financial assistance to meritorious students from low-income families to meet day-to-day college expenses.',
        eligibility: 'Above 80th percentile in relevant stream in Class 12 board; family income below ₹4.5 Lakhs/year.',
        education_level: 'Undergraduate / Postgraduate',
        amount: '₹12,000 / year (UG) to ₹20,000 / year (PG)',
        deadline: '2026-10-31',
        category: 'Government Merit',
        official_url: 'https://scholarships.gov.in',
        verified: 1,
        required_documents: 'Aadhaar Card, Income Certificate, 12th Board Scorecard, Bank Passbook',
        location: 'National (India)',
        income_range: '< ₹4,50,000 / year',
        is_government: 1,
        is_fully_funded: 0
      },
      {
        id: 'sch_4',
        title: 'Tata Trusts Medical & Healthcare Fellowship',
        provider: 'Tata Trusts',
        description: 'Financial aid provided to students pursuing MBBS, BDS, and allied healthcare professional degrees across recognized institutions in India.',
        eligibility: 'Students pursuing 2nd year onwards in MBBS/BDS with min 60% marks in previous professional examinations.',
        education_level: 'Professional Degree',
        amount: '30% to 80% Tuition Fee Coverage',
        deadline: '2026-11-15',
        category: 'Healthcare & Science',
        official_url: 'https://www.tatatrusts.org',
        verified: 1,
        required_documents: 'NEET Scorecard, Fee Receipts, Income Certificate, Previous Year Marksheets',
        location: 'All India',
        income_range: '< ₹6,00,000 / year',
        is_government: 0,
        is_fully_funded: 0
      },
      {
        id: 'sch_5',
        title: 'Adobe Women-in-Technology Scholarship',
        provider: 'Adobe Research',
        description: 'Global initiative creating gender balance in technology by sponsoring female student leaders who demonstrate academic and creative excellence.',
        eligibility: 'Female undergraduate or master students in Computer Science or Artificial Intelligence.',
        education_level: 'Undergraduate / Masters',
        amount: '$10,000 USD + Adobe Creative Cloud Subscription',
        deadline: '2026-12-10',
        category: 'Tech Leadership',
        official_url: 'https://research.adobe.com/scholarship.html',
        verified: 1,
        required_documents: 'Resume, Academic Transcript, Statement of Purpose, 3 Recommendation Letters',
        location: 'Global / India',
        income_range: 'Open',
        is_government: 0,
        is_fully_funded: 1
      },
      {
        id: 'sch_6',
        title: 'ONGC Scholarship for Meritorious SC/ST/OBC Students',
        provider: 'Oil and Natural Gas Corporation (ONGC)',
        description: 'Corporate social responsibility initiative providing annual scholarships to engineering, MBBS, and MBA students from reserved and economically weaker categories.',
        eligibility: 'Students in 1st year of Engineering/MBBS/Geology with min 60% marks in Class 12; family income < ₹2 Lakhs.',
        education_level: 'Undergraduate / Masters',
        amount: '₹48,000 / year',
        deadline: '2026-10-05',
        category: 'Affirmative Action',
        official_url: 'https://ongcscholar.org',
        verified: 1,
        required_documents: 'Caste Certificate, Income Certificate, College Admission Proof, Class 12 Certificate',
        location: 'All India',
        income_range: '< ₹2,00,000 / year',
        is_government: 1,
        is_fully_funded: 0
      },
      {
        id: 'sch_7',
        title: 'Narotam Sekhsaria Post-Graduate Scholarship',
        provider: 'Narotam Sekhsaria Foundation',
        description: 'Interest-free loan scholarship awarded to outstanding Indian students wishing to pursue postgraduate studies at top Indian or global universities.',
        eligibility: 'Indian graduates below 30 years holding distinction marks, with confirmed or pending admission in top accredited universities.',
        education_level: 'Postgraduate',
        amount: 'Interest-free loan up to ₹20,00,000',
        deadline: '2026-09-28',
        category: 'Higher Studies',
        official_url: 'https://pg.nsfoundation.co.in',
        verified: 1,
        required_documents: 'Undergraduate Marksheets, University Offer Letter, GRE/GMAT score if applicable',
        location: 'International / India',
        income_range: 'Open',
        is_government: 0,
        is_fully_funded: 0
      },
      {
        id: 'sch_8',
        title: 'AWS AI & Machine Learning Scholarship',
        provider: 'Amazon Web Services & Udacity',
        description: 'Scholarship program focused on underrepresented students globally, providing Udacity Nanodegrees, cloud credits, and career mentorship in AI & ML.',
        eligibility: 'Any student 16+ enrolled in high school or university completing the AWS DeepRacer Student League track.',
        education_level: 'Open (High School / College)',
        amount: 'Full Udacity AI Nanodegree ($4,000 value)',
        deadline: '2026-11-20',
        category: 'AI / Machine Learning',
        official_url: 'https://aws.amazon.com/deepracer/student',
        verified: 1,
        required_documents: 'AWS DeepRacer Student completion badge, Enrollment proof',
        location: 'Global',
        income_range: 'Open',
        is_government: 0,
        is_fully_funded: 1
      },
      {
        id: 'sch_9',
        title: 'S.N. Bose National Scholars Program',
        provider: 'IUSSTF & Govt of India',
        description: 'Prestigious fellowship fostering exchange between premier Indian institutions and US universities for summer research internships in STEM.',
        eligibility: 'B.Tech/M.Tech/M.Sc students in STEM fields ranked in top 5% of their class.',
        education_level: 'Undergraduate / Masters',
        amount: 'Stipend, Airfare, Health Insurance & US University Housing',
        deadline: '2026-10-25',
        category: 'Research Fellowship',
        official_url: 'https://iusstf.org',
        verified: 1,
        required_documents: 'Research Statement, Transcripts, 2 Faculty Recommendations, NOC from Dean',
        location: 'India / USA',
        income_range: 'Merit-based',
        is_government: 1,
        is_fully_funded: 1
      },
      {
        id: 'sch_10',
        title: 'Demo University Alumni Innovation Grant (Sample Resource)',
        provider: 'College Innovation Council (Demo)',
        description: 'Sample university-funded microgrant designed to support prototype development, patent filings, and hardware projects for student makers.',
        eligibility: 'Any registered student team with an approved prototype or faculty advisor proposal.',
        education_level: 'All Students',
        amount: '₹50,000 Seed Grant',
        deadline: '2026-12-31',
        category: 'Startup & Innovation',
        official_url: 'https://example.edu/innovation-grant-sample',
        verified: 0,
        required_documents: 'Project Pitch Deck, Budget Breakdown, Faculty Endorsement',
        location: 'Demo Campus',
        income_range: 'No restriction',
        is_government: 0,
        is_fully_funded: 1
      }
    ];

    for (const s of scholarships) {
      database.run(`
        INSERT INTO scholarships (id, title, provider, description, eligibility, education_level, amount, deadline, category, official_url, verified, required_documents, location, income_range, is_government, is_fully_funded, views_count, created_at)
        VALUES ('${s.id}', '${s.title.replace(/'/g, "''")}', '${s.provider.replace(/'/g, "''")}', '${s.description.replace(/'/g, "''")}', '${s.eligibility.replace(/'/g, "''")}', '${s.education_level}', '${s.amount.replace(/'/g, "''")}', '${s.deadline}', '${s.category}', '${s.official_url}', ${s.verified}, '${s.required_documents.replace(/'/g, "''")}', '${s.location}', '${s.income_range.replace(/'/g, "''")}', ${s.is_government}, ${s.is_fully_funded}, 142, '${new Date().toISOString()}')
      `);
    }
  }

  // Seed 10 Realistic Internships if empty
  const internCheck = database.exec("SELECT COUNT(*) as count FROM internships");
  const internCount = internCheck[0]?.values[0]?.[0] as number;
  if (internCount === 0) {
    const internships = [
      {
        id: 'int_1',
        company: 'Google',
        role: 'Software Engineering Intern (Summer 2027)',
        skills: 'Data Structures, Algorithms, C++, Java, Python',
        location: 'Bangalore / Hyderabad, India',
        work_mode: 'Hybrid',
        stipend: '₹1,25,000 / month',
        duration: '10 - 12 Weeks',
        deadline: '2026-10-15',
        official_url: 'https://careers.google.com/students',
        description: 'Work alongside Google engineers solving real-world challenges across Search, Android, Cloud, and Workspace systems. Hands-on coding and mentor pairing.',
        verified: 1
      },
      {
        id: 'int_2',
        company: 'Microsoft',
        role: 'Explore Intern (1st & 2nd Year Undergrads)',
        skills: 'Problem Solving, Python, C#, Object-Oriented Design',
        location: 'Hyderabad / Noida, India',
        work_mode: 'In-office',
        stipend: '₹90,000 / month',
        duration: '8 Weeks',
        deadline: '2026-11-01',
        official_url: 'https://careers.microsoft.com/students',
        description: 'Rotational 8-week program offering software engineering and program management experience for early-stage university students.',
        verified: 1
      },
      {
        id: 'int_3',
        company: 'ISRO (Space Applications Centre)',
        role: 'Research Project Intern (Satellite Data & AI)',
        skills: 'Python, GIS, Remote Sensing, Machine Learning, OpenCV',
        location: 'Ahmedabad, India',
        work_mode: 'On-site',
        stipend: '₹15,000 / month + Lab Access',
        duration: '6 Months',
        deadline: '2026-10-30',
        official_url: 'https://www.sac.gov.in',
        verified: 1,
        description: 'Opportunity for pre-final and final year engineering/M.Sc students to execute academic dissertation projects on geospatial analytics and satellite image classification.'
      },
      {
        id: 'int_4',
        company: 'Razorpay',
        role: 'Frontend Engineering Intern',
        skills: 'React, TypeScript, Tailwind CSS, Next.js, Redux',
        location: 'Bangalore, India',
        work_mode: 'Hybrid',
        stipend: '₹45,000 / month',
        duration: '6 Months',
        deadline: '2026-10-20',
        official_url: 'https://razorpay.com/jobs',
        verified: 1,
        description: 'Contribute to payment checkout experiences, merchant dashboards, and responsive accessibility design systems used by millions daily.'
      },
      {
        id: 'int_5',
        company: 'TCS Research',
        role: 'Research Intern – Cyber Physical Systems',
        skills: 'IoT, Cryptography, Python, Linux, Embedded C',
        location: 'Pune, India',
        work_mode: 'Hybrid',
        stipend: '₹35,000 / month',
        duration: '3 - 6 Months',
        deadline: '2026-11-15',
        official_url: 'https://www.tcs.com/careers/research-internships',
        verified: 1,
        description: 'Collaborate with senior scientists on next-gen cybersecurity, digital twins, and industrial IoT protocols.'
      },
      {
        id: 'int_6',
        company: 'Zomato',
        role: 'Product Analytics & Data Intern',
        skills: 'SQL, Python, Pandas, Tableau, A/B Testing',
        location: 'Gurgaon, India',
        work_mode: 'In-office',
        stipend: '₹40,000 / month',
        duration: '3 Months',
        deadline: '2026-10-28',
        official_url: 'https://www.zomato.com/careers',
        verified: 1,
        description: 'Analyze user funnels, delivery logistics metrics, and restaurant partner retention patterns using big-data queries.'
      },
      {
        id: 'int_7',
        company: 'CRED',
        role: 'Backend Engineering Intern (Go & Microservices)',
        skills: 'Go, PostgreSQL, Redis, Kafka, Docker',
        location: 'Bangalore, India',
        work_mode: 'In-office',
        stipend: '₹60,000 / month',
        duration: '6 Months',
        deadline: '2026-11-05',
        official_url: 'https://cred.club/careers',
        verified: 1,
        description: 'Build high-concurrency transactional payment pipelines with low latency requirements in modern cloud architectures.'
      },
      {
        id: 'int_8',
        company: 'DRDO (Centre for AI & Robotics)',
        role: 'Student Project Trainee – Robotics & Vision',
        skills: 'ROS, C++, Python, Deep Learning, SLAM',
        location: 'Bangalore, India',
        work_mode: 'On-site',
        stipend: 'Government Approved Norms',
        duration: '6 Months',
        deadline: '2026-09-30',
        official_url: 'https://www.drdo.gov.in',
        verified: 1,
        description: 'Work on autonomous navigation, robotic path planning, and real-time sensor fusion systems.'
      },
      {
        id: 'int_9',
        company: 'IBM Cloud',
        role: 'DevOps & Cloud Native Intern',
        skills: 'Docker, Kubernetes, Linux, Terraform, CI/CD',
        location: 'Kochi / Remote, India',
        work_mode: 'Remote',
        stipend: '₹30,000 / month',
        duration: '4 Months',
        deadline: '2026-11-25',
        official_url: 'https://www.ibm.com/employment',
        verified: 1,
        description: 'Automate build pipelines, containerized deployments, and observability metrics using Prometheus and Grafana.'
      },
      {
        id: 'int_10',
        company: 'NextGen Fintech Labs (Demo Opportunity)',
        role: 'UI/UX Design Intern (Sample Opportunity)',
        skills: 'Figma, Wireframing, User Research, Prototyping',
        location: 'Remote',
        work_mode: 'Remote',
        stipend: '₹20,000 / month',
        duration: '2 Months',
        deadline: '2026-12-20',
        official_url: 'https://example.com/demo-design-intern',
        verified: 0,
        description: 'Sample demo internship for college prototype testing. Focuses on mobile banking interfaces and user interaction flows.'
      }
    ];

    for (const i of internships) {
      database.run(`
        INSERT INTO internships (id, company, role, skills, location, work_mode, stipend, duration, deadline, official_url, description, verified, views_count, created_at)
        VALUES ('${i.id}', '${i.company.replace(/'/g, "''")}', '${i.role.replace(/'/g, "''")}', '${i.skills.replace(/'/g, "''")}', '${i.location.replace(/'/g, "''")}', '${i.work_mode}', '${i.stipend.replace(/'/g, "''")}', '${i.duration.replace(/'/g, "''")}', '${i.deadline}', '${i.official_url}', '${i.description.replace(/'/g, "''")}', ${i.verified}, 210, '${new Date().toISOString()}')
      `);
    }
  }

  // Seed 10 Realistic Jobs if empty
  const jobCheck = database.exec("SELECT COUNT(*) as count FROM jobs");
  const jobCount = jobCheck[0]?.values[0]?.[0] as number;
  if (jobCount === 0) {
    const jobs = [
      {
        id: 'job_1',
        company: 'Infosys',
        role: 'Specialist Programmer (Entry-Level)',
        skills: 'Java, Python, Data Structures, Algorithms, Cloud',
        experience: '0 - 1 Years (Freshers eligible)',
        salary: '₹9.5 - 11.5 LPA',
        location: 'Bangalore / Pune / Hyderabad',
        work_mode: 'Hybrid',
        deadline: '2026-10-31',
        official_url: 'https://www.infosys.com/careers',
        description: 'Elite programming track designing scalable cloud microservices, distributed caching, and enterprise applications for global Fortune 500 clients.',
        verified: 1
      },
      {
        id: 'job_2',
        company: 'QuickHeal Security',
        role: 'Associate Cybersecurity Analyst',
        skills: 'Network Security, SIEM, Wireshark, Python, Linux, Vulnerability Assessment',
        experience: '0 - 2 Years',
        salary: '₹6.5 - 8.5 LPA',
        location: 'Pune, India',
        work_mode: 'In-office',
        deadline: '2026-11-15',
        official_url: 'https://www.quickheal.co.in/careers',
        description: 'Monitor Security Operations Center (SOC) telemetry, identify intrusion attempts, conduct log analysis, and collaborate with incident response teams.',
        verified: 1
      },
      {
        id: 'job_3',
        company: 'PhonePe',
        role: 'Associate Software Engineer (Backend)',
        skills: 'Java, Spring Boot, MySQL, Kafka, Microservices',
        experience: 'Fresh Graduates',
        salary: '₹14 - 18 LPA',
        location: 'Bangalore, India',
        work_mode: 'In-office',
        deadline: '2026-10-18',
        official_url: 'https://www.phonepe.com/careers',
        description: 'Architect resilient backend services that process millions of high-value UPI transactions per second with 99.999% uptime guarantees.',
        verified: 1
      },
      {
        id: 'job_4',
        company: 'Mu Sigma',
        role: 'Trainee Decision Scientist',
        skills: 'Statistics, R/Python, SQL, Business Problem Solving, Data Visualization',
        experience: '0 - 1 Years',
        salary: '₹7.0 - 9.0 LPA',
        location: 'Bangalore, India',
        work_mode: 'In-office',
        deadline: '2026-11-10',
        official_url: 'https://www.mu-sigma.com/careers',
        description: 'Work with cross-functional global decision sciences squads translating ambiguous business puzzles into empirical data modeling roadmaps.',
        verified: 1
      },
      {
        id: 'job_5',
        company: 'Swiggy',
        role: 'Junior UI/UX Designer',
        skills: 'Figma, Design Systems, Typography, Rapid Prototyping, Usability Testing',
        experience: '0 - 2 Years',
        salary: '₹8.0 - 12.0 LPA',
        location: 'Bangalore, India',
        work_mode: 'Hybrid',
        deadline: '2026-10-25',
        official_url: 'https://careers.swiggy.com',
        description: 'Design smooth consumer ordering interactions, partner merchant apps, and design tokens for web and native mobile clients.',
        verified: 1
      },
      {
        id: 'job_6',
        company: 'L&T Technology Services',
        role: 'Graduate Engineer Trainee – Embedded & IoT',
        skills: 'C, C++, RTOS, Microcontrollers, UART/I2C, Hardware Debugging',
        experience: 'Freshers (B.Tech ECE/EEE/CSE)',
        salary: '₹5.5 - 7.0 LPA',
        location: 'Mysore / Chennai, India',
        work_mode: 'In-office',
        deadline: '2026-11-30',
        official_url: 'https://www.ltts.com/careers',
        description: 'Participate in cutting-edge automotive telemetry, industrial automation systems, and connected smart device hardware firmware development.',
        verified: 1
      },
      {
        id: 'job_7',
        company: 'Amazon AWS',
        role: 'Cloud Support Associate',
        skills: 'Linux, Networking (TCP/IP, DNS), Cloud Fundamentals, Troubleshooting, Python',
        experience: '0 - 1 Years',
        salary: '₹12 - 15 LPA',
        location: 'Hyderabad / Bangalore',
        work_mode: 'Hybrid',
        deadline: '2026-10-22',
        official_url: 'https://amazon.jobs',
        verified: 1,
        description: 'Serve as the technical expert assisting enterprise architects and engineers deploying scalable workloads on Amazon Web Services infrastructure.'
      },
      {
        id: 'job_8',
        company: 'Tata Consultancy Services (TCS)',
        role: 'TCS Digital Engineer',
        skills: 'Full Stack Web, Python, Cloud, Agile, REST APIs',
        experience: 'Campus Recruits / 0-1 Yr',
        salary: '₹7.0 - 7.5 LPA',
        location: 'Pan India',
        work_mode: 'Hybrid',
        deadline: '2026-10-10',
        official_url: 'https://www.tcs.com/careers',
        verified: 1,
        description: 'Build modernized digital solutions using contemporary open-source stacks, automated test suites, and micro-frontend architectures.'
      },
      {
        id: 'job_9',
        company: 'NPCI (National Payments Corp of India)',
        role: 'Management Trainee (Fintech & Product)',
        skills: 'Product Management, Business Analysis, Fintech Architecture, Communication',
        experience: 'Freshers (MBA / B.Tech)',
        salary: '₹8.5 - 11 LPA',
        location: 'Mumbai / Hyderabad',
        work_mode: 'In-office',
        deadline: '2026-11-20',
        official_url: 'https://www.npci.org.in/careers',
        verified: 1,
        description: 'Contribute to India’s flagship national payment rails (UPI, RuPay, NETC FasTag) scaling digital inclusion for over 1 billion citizens.'
      },
      {
        id: 'job_10',
        company: 'CloudScale Demo Labs (Sample Resource)',
        role: 'Junior DevOps Engineer (Demo Role)',
        skills: 'Docker, Linux, Bash, CI/CD, Git',
        experience: '0 - 1 Years',
        salary: '₹6.0 - 8.0 LPA',
        location: 'Remote',
        work_mode: 'Remote',
        deadline: '2026-12-15',
        official_url: 'https://example.com/demo-devops-job',
        verified: 0,
        description: 'Sample demo posting showcasing automated cloud container orchestration and continuous integration testing.'
      }
    ];

    for (const j of jobs) {
      database.run(`
        INSERT INTO jobs (id, company, role, skills, experience, salary, location, work_mode, deadline, official_url, description, verified, views_count, created_at)
        VALUES ('${j.id}', '${j.company.replace(/'/g, "''")}', '${j.role.replace(/'/g, "''")}', '${j.skills.replace(/'/g, "''")}', '${j.experience.replace(/'/g, "''")}', '${j.salary.replace(/'/g, "''")}', '${j.location.replace(/'/g, "''")}', '${j.work_mode}', '${j.deadline}', '${j.official_url}', '${j.description.replace(/'/g, "''")}', ${j.verified}, 185, '${new Date().toISOString()}')
      `);
    }
  }

  // Seed 10 Realistic Courses if empty
  const crsCheck = database.exec("SELECT COUNT(*) as count FROM courses");
  const crsCount = crsCheck[0]?.values[0]?.[0] as number;
  if (crsCount === 0) {
    const courses = [
      {
        id: 'crs_1',
        title: 'CS50: Introduction to Computer Science',
        provider: 'Harvard University / edX',
        category: 'Software Development',
        duration: '12 Weeks (Self-paced)',
        level: 'Beginner to Intermediate',
        price: 'Free (Verified Certificate optional)',
        is_free: 1,
        certificate_available: 1,
        official_url: 'https://cs50.harvard.edu/x',
        verified: 1,
        description: 'Legendary introductory course on algorithmic thinking and computational problem solving using C, Python, SQL, HTML/CSS, and JavaScript.'
      },
      {
        id: 'crs_2',
        title: 'Google Cybersecurity Professional Certificate',
        provider: 'Google / Coursera',
        category: 'Cybersecurity',
        duration: '6 Months (7 hrs/week)',
        level: 'Beginner Friendly',
        price: 'Financial Aid Available (Audit Free)',
        is_free: 0,
        certificate_available: 1,
        official_url: 'https://www.coursera.org/professional-certificates/google-cybersecurity',
        verified: 1,
        description: 'Comprehensive industry training preparing students for entry-level SOC analyst roles. Covers Linux, SQL, Python for security, SIEM tools, and intrusion detection.'
      },
      {
        id: 'crs_3',
        title: 'Machine Learning Specialization',
        provider: 'DeepLearning.AI & Stanford / Andrew Ng',
        category: 'Artificial Intelligence',
        duration: '3 Months (9 hrs/week)',
        level: 'Intermediate',
        price: 'Free to audit / Paid certificate',
        is_free: 0,
        certificate_available: 1,
        official_url: 'https://www.deeplearning.ai/courses/machine-learning-specialization',
        verified: 1,
        description: 'Foundational AI curriculum teaching supervised learning, neural networks, decision trees, and reinforcement learning with modern Python & TensorFlow.'
      },
      {
        id: 'crs_4',
        title: 'AWS Cloud Practitioner Essentials',
        provider: 'Amazon Web Services (AWS Skill Builder)',
        category: 'Cloud Computing',
        duration: '6 Hours',
        level: 'Beginner',
        price: 'Free',
        is_free: 1,
        certificate_available: 1,
        official_url: 'https://aws.amazon.com/training/digital/aws-cloud-practitioner-essentials',
        verified: 1,
        description: 'Official self-paced introduction to AWS cloud concepts, security, architecture, pricing models, and core storage/compute services.'
      },
      {
        id: 'crs_5',
        title: 'Meta Front-End Developer Professional Certificate',
        provider: 'Meta / Coursera',
        category: 'Web Development',
        duration: '7 Months',
        level: 'Beginner to Intermediate',
        price: 'Financial Aid Available',
        is_free: 0,
        certificate_available: 1,
        official_url: 'https://www.coursera.org/professional-certificates/meta-front-end-developer',
        verified: 1,
        description: 'Master HTML5, CSS3, modern JavaScript ES6, React components, state management, Jest unit testing, and UI portfolio project creation.'
      },
      {
        id: 'crs_6',
        title: 'Linux Foundation: Introduction to Linux (LFS101x)',
        provider: 'The Linux Foundation / edX',
        category: 'Systems & DevOps',
        duration: '8 Weeks',
        level: 'Beginner',
        price: 'Free',
        is_free: 1,
        certificate_available: 1,
        official_url: 'https://training.linuxfoundation.org/training/introduction-to-linux',
        verified: 1,
        description: 'Hands-on practical exploration of command line utilities, bash shell scripting, system administration, and filesystem hierarchy.'
      },
      {
        id: 'crs_7',
        title: 'Google Data Analytics Professional Certificate',
        provider: 'Google / Coursera',
        category: 'Data Science',
        duration: '6 Months',
        level: 'Beginner',
        price: 'Financial Aid Available',
        is_free: 0,
        certificate_available: 1,
        official_url: 'https://grow.google/certificates/data-analytics',
        verified: 1,
        description: 'Learn in-demand skills: spreadsheets, SQL database queries, Tableau interactive dashboards, and R programming for business insights.'
      },
      {
        id: 'crs_8',
        title: 'Docker & Kubernetes: The Practical Guide',
        provider: 'Academind / Udemy',
        category: 'DevOps & Cloud',
        duration: '23 Hours on-demand',
        level: 'Intermediate',
        price: '₹499 (Standard Sale)',
        is_free: 0,
        certificate_available: 1,
        official_url: 'https://academind.com',
        verified: 1,
        description: 'Complete hands-on containerization course covering Dockerfiles, multi-container networks, Kubernetes pods, deployments, services, and cloud hosting.'
      },
      {
        id: 'crs_9',
        title: 'Google UX Design Professional Certificate',
        provider: 'Google / Coursera',
        category: 'UI/UX Design',
        duration: '6 Months',
        level: 'Beginner',
        price: 'Financial Aid Available',
        is_free: 0,
        certificate_available: 1,
        official_url: 'https://grow.google/certificates/ux-design',
        verified: 1,
        description: 'Design high-fidelity interactive prototypes in Figma, conduct user empathy interviews, test wireframes, and compile a 3-project design portfolio.'
      },
      {
        id: 'crs_10',
        title: 'Introduction to Ethical Hacking (Demo Course)',
        provider: 'CyberCampus Academy (Sample Resource)',
        category: 'Cybersecurity',
        duration: '4 Weeks',
        level: 'Beginner',
        price: 'Free Sample',
        is_free: 1,
        certificate_available: 1,
        official_url: 'https://example.edu/demo-ethical-hacking',
        verified: 0,
        description: 'Sample course module for educational demonstration of web vulnerabilities, OWASP Top 10 concepts, and defensive best practices.'
      }
    ];

    for (const c of courses) {
      database.run(`
        INSERT INTO courses (id, title, provider, category, duration, level, price, is_free, certificate_available, official_url, description, verified, created_at)
        VALUES ('${c.id}', '${c.title.replace(/'/g, "''")}', '${c.provider.replace(/'/g, "''")}', '${c.category}', '${c.duration}', '${c.level}', '${c.price.replace(/'/g, "''")}', ${c.is_free}, ${c.certificate_available}, '${c.official_url}', '${c.description.replace(/'/g, "''")}', ${c.verified}, '${new Date().toISOString()}')
      `);
    }
  }

  // Seed default bookmarks & applications for student demo
  const appCheck = database.exec("SELECT COUNT(*) as count FROM applications");
  const appCount = appCheck[0]?.values[0]?.[0] as number;
  if (appCount === 0) {
    const studentId = 'usr_student_1';
    database.run(`
      INSERT INTO bookmarks (id, user_id, resource_id, resource_type, created_at)
      VALUES 
      ('bm_1', '${studentId}', 'sch_1', 'scholarship', '${new Date().toISOString()}'),
      ('bm_2', '${studentId}', 'int_1', 'internship', '${new Date().toISOString()}'),
      ('bm_3', '${studentId}', 'job_1', 'job', '${new Date().toISOString()}'),
      ('bm_4', '${studentId}', 'crs_2', 'course', '${new Date().toISOString()}');

      INSERT INTO applications (id, user_id, opportunity_id, opportunity_type, title, company_or_provider, status, applied_date, notes, deadline, created_at)
      VALUES 
      ('app_1', '${studentId}', 'sch_1', 'scholarship', 'Reliance Foundation Undergraduate Scholarship', 'Reliance Foundation', 'Applied', '2026-09-10', 'Submitted 12th marksheet and bonafide certificate.', '2026-10-15', '${new Date().toISOString()}'),
      ('app_2', '${studentId}', 'int_1', 'internship', 'Software Engineering Intern (Summer 2027)', 'Google', 'Interview', '2026-09-12', 'Passed coding round 1; technical interview scheduled next week.', '2026-10-15', '${new Date().toISOString()}'),
      ('app_3', '${studentId}', 'int_4', 'internship', 'Frontend Engineering Intern', 'Razorpay', 'Shortlisted', '2026-09-14', 'Resume screened; awaiting assessment test invite.', '2026-10-20', '${new Date().toISOString()}'),
      ('app_4', '${studentId}', 'job_1', 'job', 'Specialist Programmer (Entry-Level)', 'Infosys', 'Saved', NULL, 'Will apply after completing final project repository.', '2026-10-31', '${new Date().toISOString()}'),
      ('app_5', '${studentId}', 'int_2', 'internship', 'Explore Intern', 'Microsoft', 'Selected', '2026-08-20', 'Received offer letter for summer cohort.', '2026-11-01', '${new Date().toISOString()}');
    `);
  }
}
