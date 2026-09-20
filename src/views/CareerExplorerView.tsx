import React, { useState } from 'react';
import {
  Compass,
  ArrowRight,
  CheckCircle2,
  Award,
  TrendingUp,
  Layers,
  Code2,
  Shield,
  Cloud,
  Smartphone,
  Cpu,
  Palette,
  Briefcase,
  Sparkles,
  BookOpen,
  Target,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface CareerTrack {
  id: string;
  title: string;
  category: string;
  salary: string;
  growth: string;
  summary: string;
  icon: any;
  skills: string[];
  certifications: string[];
  companies: string[];
  milestones: {
    level: string;
    title: string;
    description: string;
    topics: string[];
  }[];
}

const CAREER_TRACKS: CareerTrack[] = [
  {
    id: 'full-stack',
    title: 'Full Stack Web Developer',
    category: 'Software Engineering',
    salary: '₹6 - 18 LPA',
    growth: '+22% YoY (Very High)',
    summary:
      'Architect resilient web platforms handling high-traffic client user experiences, scalable REST/GraphQL APIs, and transactional databases.',
    icon: Code2,
    skills: ['JavaScript / TypeScript', 'React / Next.js', 'Node.js / Express', 'PostgreSQL / MongoDB', 'Git & Docker', 'System Design'],
    certifications: ['AWS Certified Developer Associate', 'Meta Front-End Professional Certificate'],
    companies: ['Google', 'Microsoft', 'Swiggy', 'Zomato', 'Razorpay', 'Atlassian'],
    milestones: [
      {
        level: 'Phase 1: Foundations',
        title: 'Modern Web & Core Programming',
        description: 'Semantic HTML5, CSS3 / Tailwind, modern ES6+ TypeScript, and Git version control.',
        topics: ['DOM Manipulation', 'Async / Promises', 'TypeScript Types & Generics', 'Responsive Design'],
      },
      {
        level: 'Phase 2: Frontend Engineering',
        title: 'Component Architecture & State',
        description: 'Master React, hooks, state management, client routing, and performance optimization.',
        topics: ['React 18 / 19', 'Zustand / Redux', 'Server-Side Rendering (Next.js)', 'Web Vitals'],
      },
      {
        level: 'Phase 3: Backend & Databases',
        title: 'APIs, Data Models & Persistence',
        description: 'Build secure Express / NestJS services, database normalization, and authentication.',
        topics: ['REST & GraphQL', 'PostgreSQL & ORMs (Prisma)', 'JWT / OAuth 2.0', 'Redis Caching'],
      },
      {
        level: 'Phase 4: Production & Deployment',
        title: 'CI/CD, Containers & Cloud Hosting',
        description: 'Containerize with Docker, configure automated GitHub Actions pipelines, and deploy.',
        topics: ['Docker & Compose', 'GitHub Actions', 'AWS ECS / Vercel', 'Microservices vs Monolith'],
      },
    ],
  },
  {
    id: 'data-science-ai',
    title: 'Data Science & Machine Learning',
    category: 'Artificial Intelligence',
    salary: '₹8 - 24 LPA',
    growth: '+35% YoY (Exceptional)',
    summary:
      'Extract insights from big data, train predictive statistical models, and deploy deep learning pipelines for automated decision making.',
    icon: Sparkles,
    skills: ['Python', 'Pandas & NumPy', 'Scikit-Learn', 'PyTorch / TensorFlow', 'SQL & BigQuery', 'MLOps'],
    certifications: ['TensorFlow Developer Certificate', 'AWS Machine Learning Specialty', 'IBM Data Science'],
    companies: ['Amazon', 'Flipkart', 'Fractal Analytics', 'Mu Sigma', 'JPMorgan Chase'],
    milestones: [
      {
        level: 'Phase 1: Mathematics & Data Wrangling',
        title: 'Linear Algebra & Statistics',
        description: 'Probability, hypothesis testing, matrix operations, and Python data manipulation.',
        topics: ['NumPy & Pandas', 'Data Cleaning', 'Exploratory Data Analysis (EDA)', 'Statistical Tests'],
      },
      {
        level: 'Phase 2: Classical Machine Learning',
        title: 'Supervised & Unsupervised Learning',
        description: 'Regression, classification, decision trees, random forests, and gradient boosting.',
        topics: ['Scikit-Learn', 'Feature Engineering', 'Hyperparameter Tuning', 'Cross-Validation'],
      },
      {
        level: 'Phase 3: Deep Learning & Neural Nets',
        title: 'Computer Vision & NLP',
        description: 'Build CNNs for image classification and transformers for natural language comprehension.',
        topics: ['PyTorch Foundations', 'CNN Architectures', 'Hugging Face Transformers', 'Transfer Learning'],
      },
      {
        level: 'Phase 4: MLOps & Production AI',
        title: 'Serving Models & Observability',
        description: 'Package models as microservices via FastAPI and monitor model drift in production.',
        topics: ['FastAPI Inference', 'MLflow / Weights & Biases', 'Docker for ML', 'Model Drift Detection'],
      },
    ],
  },
  {
    id: 'cybersecurity',
    title: 'Cybersecurity Analyst & Penetration Tester',
    category: 'Security & Forensics',
    salary: '₹7 - 20 LPA',
    growth: '+28% YoY (Critical Demand)',
    summary:
      'Defend corporate digital perimeters, conduct vulnerability assessments, ethical hacking, and configure SIEM incident detection.',
    icon: Shield,
    skills: ['Network Security', 'Wireshark & Nmap', 'Burp Suite', 'Linux Hardening', 'SIEM (Splunk)', 'Cryptography'],
    certifications: ['CompTIA Security+', 'CEH (Certified Ethical Hacker)', 'OSCP (Offensive Security)'],
    companies: ['PwC', 'Deloitte Cyber', 'CrowdStrike', 'Cisco', 'Infosys Cyber Defense'],
    milestones: [
      {
        level: 'Phase 1: Systems & Networking Core',
        title: 'TCP/IP, OSI & Linux Administration',
        description: 'Deep understanding of packets, routing, DNS, Linux permissions, and shell scripting.',
        topics: ['Subnetting & Firewalls', 'Bash Scripting', 'Wireshark Analysis', 'Identity Management'],
      },
      {
        level: 'Phase 2: Web & Network Vulnerabilities',
        title: 'OWASP Top 10 & Exploitation',
        description: 'Identify SQL injection, XSS, CSRF, and misconfigured API endpoints using Burp Suite.',
        topics: ['Burp Suite Pro', 'Metasploit', 'Port Scanning (Nmap)', 'Web App Pen Testing'],
      },
      {
        level: 'Phase 3: Blue Team & Security Operations',
        title: 'Incident Detection & SOC Analysis',
        description: 'Configure log aggregation, write SIEM correlation rules, and triage alert triggers.',
        topics: ['Splunk / Elastic SIEM', 'Snort IDS/IPS', 'Memory Forensics', 'Incident Playbooks'],
      },
      {
        level: 'Phase 4: Governance & Compliance',
        title: 'Risk Management & Zero Trust',
        description: 'Implement Zero-Trust architecture, ISO 27001 auditing, and cloud security postures.',
        topics: ['Cloud Security (AWS IAM)', 'Zero Trust Frameworks', 'Threat Intelligence', 'GDPR/DPDP Act'],
      },
    ],
  },
  {
    id: 'cloud-devops',
    title: 'Cloud & DevOps Platform Engineer',
    category: 'Infrastructure',
    salary: '₹8 - 22 LPA',
    growth: '+25% YoY (High)',
    summary:
      'Design reliable multi-cloud infrastructure as code, automated continuous deployment pipelines, and Kubernetes container orchestrations.',
    icon: Cloud,
    skills: ['AWS / GCP / Azure', 'Terraform (IaC)', 'Kubernetes & Helm', 'Docker', 'CI/CD Pipelines', 'Prometheus & Grafana'],
    certifications: ['AWS Solutions Architect Associate', 'CKA (Certified Kubernetes Administrator)'],
    companies: ['Red Hat', 'VMware', 'Accenture Cloud First', 'Wipro', 'Microsoft'],
    milestones: [
      {
        level: 'Phase 1: Linux & Scripting',
        title: 'System Internals & Automation',
        description: 'Command line mastery, processes, cron jobs, and Python/Bash scripting for sysadmins.',
        topics: ['Bash Scripting', 'SSH & Key Management', 'Networking Protocols', 'Git Workflows'],
      },
      {
        level: 'Phase 2: Containers & Orchestration',
        title: 'Docker & Kubernetes Basics',
        description: 'Package applications into portable containers and manage pods, services, and ingress.',
        topics: ['Dockerfile Optimization', 'K8s Deployments & Services', 'ConfigMaps & Secrets', 'Helm Charts'],
      },
      {
        level: 'Phase 3: Infrastructure as Code',
        title: 'Terraform & Cloud Architecture',
        description: 'Provision reproducible VPCs, subnets, EC2/EKS clusters, and load balancers declaratively.',
        topics: ['Terraform Modules', 'AWS IAM & VPC Peering', 'S3 & RDS Provisioning', 'State Management'],
      },
      {
        level: 'Phase 4: Observability & SRE',
        title: 'Monitoring, SLIs/SLOs & Chaos Engineering',
        description: 'Collect metrics, build dashboards, and set up alert dispatchers to maintain 99.99% uptime.',
        topics: ['Prometheus & Grafana', 'ELK Stack Logging', 'OpenTelemetry', 'Disaster Recovery'],
      },
    ],
  },
  {
    id: 'mobile-app',
    title: 'Mobile App Developer (Flutter & Android)',
    category: 'Mobile Engineering',
    salary: '₹5 - 16 LPA',
    growth: '+18% YoY',
    summary:
      'Craft fluid, high-performance cross-platform iOS and Android mobile experiences with offline caching and native device API bridges.',
    icon: Smartphone,
    skills: ['Flutter & Dart', 'Kotlin / Jetpack Compose', 'REST Integration', 'SQLite / Room', 'Push Notifications', 'App Store Publishing'],
    certifications: ['Google Associate Android Developer', 'Meta React Native Specialization'],
    companies: ['PhonePe', 'Paytm', 'Cred', 'Ola', 'Urban Company'],
    milestones: [
      {
        level: 'Phase 1: Language & Core UI',
        title: 'Dart/Kotlin & Widget Trees',
        description: 'Master language syntax, OOP, reactive layouts, and adaptive material designs.',
        topics: ['Dart OOP', 'Stateless vs Stateful', 'Flexbox & Layouts', 'Material 3 Themes'],
      },
      {
        level: 'Phase 2: State Management & Navigation',
        title: 'Clean Architecture on Mobile',
        description: 'Implement Provider / Bloc / Riverpod to separate UI from business logic cleanly.',
        topics: ['Bloc / Riverpod', 'Deep Linking', 'Form Validation', 'Repository Pattern'],
      },
      {
        level: 'Phase 3: Hardware & Offline Storage',
        title: 'Local Databases & Background Sync',
        description: 'Persist state locally via SQLite/Hive, handle location, camera, and bluetooth.',
        topics: ['SQLite / Hive DB', 'Camera & GPS Plugins', 'WorkManager / Background Tasks', 'Biometrics'],
      },
      {
        level: 'Phase 4: Release & Performance',
        title: 'CI/CD, App Store & Play Store',
        description: 'Code signing, automated Play Console releases, crashlytics, and 60 FPS profiling.',
        topics: ['Firebase Crashlytics', 'ProGuard / Obfuscation', 'Fastlane Automation', 'Play Store Policy'],
      },
    ],
  },
  {
    id: 'ai-llm',
    title: 'AI & Generative AI Engineer',
    category: 'Artificial Intelligence',
    salary: '₹10 - 30 LPA',
    growth: '+45% YoY (Fastest Growing)',
    summary:
      'Harness Foundation Models (Gemini, Claude, GPT), construct Retrieval-Augmented Generation (RAG) pipelines, and fine-tune domain-specific agents.',
    icon: Sparkles,
    skills: ['Python', 'Google Gemini API', 'LangChain / LlamaIndex', 'Vector Databases (Chroma/Pinecone)', 'Prompt Engineering', 'LoRA Fine-tuning'],
    certifications: ['Google Cloud Generative AI Leader', 'DeepLearning.AI LangChain Certification'],
    companies: ['Google Cloud', 'Microsoft AI', 'Anthropic Ecosystem', 'Persistent Systems', 'LTIMindtree'],
    milestones: [
      {
        level: 'Phase 1: Foundation Models & Prompt Engineering',
        title: 'LLM Mechanics & API Integration',
        description: 'Understand attention mechanisms, tokenization, temperature, and few-shot system prompting.',
        topics: ['Google GenAI SDK', 'Structured Output / JSON Mode', 'Chain of Thought Prompting', 'Embeddings'],
      },
      {
        level: 'Phase 2: RAG & Vector Search',
        title: 'Retrieval Augmented Generation',
        description: 'Ingest enterprise documents, chunk text intelligently, and query semantic vector indexes.',
        topics: ['LlamaIndex / LangChain', 'Vector DBs (Chroma/Pgvector)', 'Hybrid Search & Re-ranking', 'Document Parsing'],
      },
      {
        level: 'Phase 3: Autonomous AI Agents',
        title: 'Tool Use & Function Calling',
        description: 'Build agentic loops where models select and execute code tools, APIs, and web searches.',
        topics: ['Function Calling', 'Multi-Agent Frameworks (CrewAI)', 'Memory Stores', 'Guardrails & Safety'],
      },
      {
        level: 'Phase 4: Evaluation & Fine-Tuning',
        title: 'RAG Triad & Quantization',
        description: 'Benchmark faithfulness and relevancy, and fine-tune open models via LoRA / QLoRA.',
        topics: ['Ragas Evaluation', 'Hugging Face PEFT', 'vLLM Serving', 'Cost & Latency Optimization'],
      },
    ],
  },
  {
    id: 'product-mgmt',
    title: 'Associate Product Manager (APM)',
    category: 'Product & Strategy',
    salary: '₹8 - 20 LPA',
    growth: '+20% YoY',
    summary:
      'Bridge engineering, design, and business goals to deliver user-obsessed products with measurable retention metrics.',
    icon: Briefcase,
    skills: ['Product Roadmapping', 'User Persona Research', 'Wireframing (Figma)', 'SQL & Analytics (Mixpanel)', 'Agile / Scrum', 'A/B Testing'],
    certifications: ['Product School Certified PM', 'Scrum Product Owner (CSPO)'],
    companies: ['Flipkart APM Cohort', 'Ola', 'MakeMyTrip', 'Zoho', 'Razorpay'],
    milestones: [
      {
        level: 'Phase 1: User Empathy & Problem Discovery',
        title: 'Customer Interviews & JTBD',
        description: 'Conduct user research, map customer journey frictions, and craft Jobs-To-Be-Done frameworks.',
        topics: ['User Interviewing', 'Problem Statements', 'Value Proposition Canvas', 'TAM/SAM/SOM'],
      },
      {
        level: 'Phase 2: Metrics & Experimentation',
        title: 'North Star Metric & Analytics',
        description: 'Define input vs output metrics, instrument funnel tracking, and design A/B test experiments.',
        topics: ['AARRR Pirate Metrics', 'Mixpanel / Amplitude', 'Hypothesis Formulation', 'SQL for PMs'],
      },
      {
        level: 'Phase 3: Execution & PRDs',
        title: 'Product Requirement Documents & Sprints',
        description: 'Write crystal-clear PRDs, user stories, acceptances criteria, and lead sprint rituals.',
        topics: ['PRD Writing', 'Jira & Agile Workflows', 'Prioritization (RICE/MoSCoW)', 'Tech Tradeoffs'],
      },
      {
        level: 'Phase 4: Go-To-Market & Growth',
        title: 'Launch Strategy & Pricing',
        description: 'Coordinate GTM releases with marketing, sales, and customer success teams.',
        topics: ['GTM Strategy', 'Feature Flag Rollouts', 'Product-Led Growth (PLG)', 'Monetization Models'],
      },
    ],
  },
  {
    id: 'ui-ux',
    title: 'UI/UX Product Designer',
    category: 'Design & Human Factors',
    salary: '₹5 - 15 LPA',
    growth: '+19% YoY',
    summary:
      'Design accessible, delightful, and human-centric software interfaces through design systems, prototypes, and usability testing.',
    icon: Palette,
    skills: ['Figma Mastery', 'Design Systems & Tokens', 'Micro-interactions', 'Information Architecture', 'Usability Audits', 'Design Tokens'],
    certifications: ['Google UX Design Professional Certificate', 'Nielsen Norman Group UX Master'],
    companies: ['Microsoft IDC', 'Infosys Experience', 'Thoughtworks', 'Freshworks', 'Swiggy Studio'],
    milestones: [
      {
        level: 'Phase 1: Design Fundamentals & Psychology',
        title: 'Visual Hierarchy & Gestalt Principles',
        description: 'Color theory, optical spacing, typographic contrast, and heuristic usability evaluations.',
        topics: ['Gestalt Laws', 'Type Scales & Baseline Grids', 'Contrast & WCAG 2.1 AA', 'Fitts’s & Hicks Law'],
      },
      {
        level: 'Phase 2: Figma Mastery & Prototyping',
        title: 'Components, Auto-Layout & Variants',
        description: 'Build responsive auto-layout frames, interactive states, and component variant libraries.',
        topics: ['Figma Auto-Layout 5.0', 'Interactive Components', 'Smart Animate', 'Variables & Design Tokens'],
      },
      {
        level: 'Phase 3: Design Systems & Hand-off',
        title: 'Scalable Pattern Libraries',
        description: 'Create multi-brand design systems, token architecture, and developer handoff specs.',
        topics: ['Atomic Design', 'Design Token Architecture', 'Accessibility Specs', 'Dev Mode Inspections'],
      },
      {
        level: 'Phase 4: Usability Testing & Portfolio',
        title: 'Evaluative Research & Case Studies',
        description: 'Conduct moderated usability testing, synthesize heatmaps, and write storytelling case studies.',
        topics: ['Unmoderated Testing', 'Usability Bug Severity Scoring', 'Portfolio Presentation', 'Whiteboard Challenges'],
      },
    ],
  },
  {
    id: 'embedded-iot',
    title: 'Embedded Systems & IoT Engineer',
    category: 'Hardware & Core Tech',
    salary: '₹5 - 14 LPA',
    growth: '+16% YoY',
    summary:
      'Program microcontrollers (STM32, ESP32, ARM Cortex), configure RTOS multi-threading, and build smart connected IoT edge devices.',
    icon: Cpu,
    skills: ['Embedded C / C++', 'ARM Cortex-M', 'FreeRTOS', 'SPI / I2C / UART', 'MQTT & BLE', 'PCB Layout (KiCad)'],
    certifications: ['ARM Accredited Engineer', 'Embedded Linux Software Development'],
    companies: ['Texas Instruments', 'Bosch India', 'Qualcomm', 'Tata Elxsi', 'Honeywell'],
    milestones: [
      {
        level: 'Phase 1: C Programming & Microcontrollers',
        title: 'Registers, Memory & Hardware Peripherals',
        description: 'Direct register manipulation on 8-bit / 32-bit MCUs (GPIO, Timers, Interrupts, ADC).',
        topics: ['Pointers & Bitwise Operations', 'Interrupt Service Routines (ISRs)', 'GPIO & Timers', 'Oscilloscopes & Logic Analyzers'],
      },
      {
        level: 'Phase 2: Serial Protocols & Drivers',
        title: 'Interfacing Sensors & Actuators',
        description: 'Write custom peripheral drivers from scratch for I2C OLEDs, SPI flash memory, and UART telemetry.',
        topics: ['UART Communication', 'I2C Bus Protocol', 'SPI Bus High Speed Transfers', 'DMA (Direct Memory Access)'],
      },
      {
        level: 'Phase 3: Real-Time Operating Systems (RTOS)',
        title: 'FreeRTOS & Multitasking',
        description: 'Manage deterministic task scheduling, semaphores, queues, and mutex synchronization.',
        topics: ['Task Priority & Context Switching', 'Queues & Message Passing', 'Deadlock & Priority Inversion', 'Memory Allocation'],
      },
      {
        level: 'Phase 4: IoT Edge & Wireless Connectivity',
        title: 'ESP32, BLE & Cloud Telemetry',
        description: 'Connect edge devices securely to AWS IoT Core using TLS certificates and MQTT queues.',
        topics: ['ESP-IDF Framework', 'MQTT over TLS', 'Bluetooth Low Energy (BLE)', 'Over-The-Air (OTA) Updates'],
      },
    ],
  },
  {
    id: 'competitive-exams',
    title: 'Competitive Exams (GATE, PSUs, CAT & UPSC)',
    category: 'Higher Studies & Public Sector',
    salary: '₹7 - 18 LPA (Plus Govt Benefits)',
    growth: 'High Stability & National Prestige',
    summary:
      'Structured curriculum roadmaps and strategy guides for national entrance examinations: GATE CS/IT, PSU recruitment, and civil services.',
    icon: Target,
    skills: ['Engineering Mathematics', 'Algorithms & Data Structures', 'Operating Systems & DBMS', 'General Aptitude', 'Reasoning & Verbal'],
    certifications: ['GATE Qualified Scorecard', 'UGC NET Junior Research Fellowship'],
    companies: ['ISRO', 'DRDO', 'ONGC', 'BHEL', 'BARC', 'IIT / IISc Masters'],
    milestones: [
      {
        level: 'Phase 1: Core Foundation & Mathematics',
        title: 'Discrete Math & Engineering Fundamentals',
        description: 'Set theory, combinatorics, graph theory, linear algebra, calculus, and probability.',
        topics: ['Discrete Mathematics', 'Calculus & Matrices', 'Boolean Algebra', 'Numerical Aptitude'],
      },
      {
        level: 'Phase 2: Core Computer Science Theory',
        title: 'Algorithms, OS & DBMS Depth',
        description: 'Time complexity asymptotic bounds, dynamic programming, virtual memory, and SQL normalization.',
        topics: ['DSA Complexity', 'Process Scheduling & Semaphores', 'SQL & B+ Trees', 'Computer Networks (TCP/IP)'],
      },
      {
        level: 'Phase 3: Theory of Computation & Compilers',
        title: 'Automata & Compiler Design',
        description: 'Regular expressions, DFAs/NFAs, Turing machines, parsing trees, and code generation.',
        topics: ['Chomsky Hierarchy', 'Turing Machines & Decidability', 'LR/LL Parsers', 'Intermediate Code'],
      },
      {
        level: 'Phase 4: Previous Year Questions & Mock Tests',
        title: 'Timed Test Series & Strategy',
        description: 'Solve 20+ years of previous papers, identify negative marking traps, and simulate 3-hour exams.',
        topics: ['PYQ Analysis (2000-2024)', 'Virtual Calculator Speed', 'Formula Revision Sheets', 'Full-Length Mock Tests'],
      },
    ],
  },
];

export const CareerExplorerView: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [selectedTrackId, setSelectedTrackId] = useState<string>('full-stack');
  const [goalSaved, setGoalSaved] = useState(false);

  const selectedTrack = CAREER_TRACKS.find((t) => t.id === selectedTrackId) || CAREER_TRACKS[0];
  const IconComponent = selectedTrack.icon;

  const handleSetAsGoal = async () => {
    if (!user) return;
    try {
      await updateProfile({
        interests: selectedTrack.title,
      });
      setGoalSaved(true);
      setTimeout(() => setGoalSaved(false), 3000);
    } catch (err) {
      console.error('Failed to set career goal:', err);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
          <Compass className="w-8 h-8 text-amber-500" />
          <span>Interactive Career Explorer &amp; Roadmaps</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Explore structured learning paths, salary standards, and required technical milestones for 10 high-growth tracks
        </p>
      </div>

      {/* Main Layout: Left Tracks List + Right Interactive Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Track Selector (4 Cols) */}
        <div className="lg:col-span-4 space-y-2">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 px-1 mb-2">
            Select a Career Track (10 Available)
          </h3>

          <div className="space-y-1.5 max-h-[750px] overflow-y-auto pr-1 scrollbar-thin">
            {CAREER_TRACKS.map((track) => {
              const Icon = track.icon;
              const isSelected = track.id === selectedTrackId;
              return (
                <div
                  key={track.id}
                  onClick={() => setSelectedTrackId(track.id)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-400 dark:border-blue-600 shadow-sm'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p
                      className={`font-bold text-xs truncate ${
                        isSelected
                          ? 'text-blue-900 dark:text-blue-100'
                          : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {track.title}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">{track.category}</p>
                  </div>

                  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
                    {track.salary.split('-')[0]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Track Deep-Dive (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Header Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
                  <IconComponent className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    {selectedTrack.category}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                    {selectedTrack.title}
                  </h2>
                </div>
              </div>

              <button
                onClick={handleSetAsGoal}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
                  goalSaved
                    ? 'bg-emerald-600 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                }`}
              >
                {goalSaved ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Saved as Career Goal!</span>
                  </>
                ) : (
                  <>
                    <Target className="w-4 h-4" />
                    <span>Set as Active Career Goal</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {selectedTrack.summary}
            </p>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Fresher Package</span>
                <p className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {selectedTrack.salary}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Demand Trend</span>
                <p className="font-bold text-xs text-slate-900 dark:text-white mt-0.5">
                  {selectedTrack.growth}
                </p>
              </div>
              <div className="col-span-2 sm:col-span-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Target Employers</span>
                <p className="font-semibold text-[11px] text-slate-700 dark:text-slate-300 truncate mt-0.5">
                  {selectedTrack.companies.slice(0, 3).join(', ')}
                </p>
              </div>
            </div>
          </div>

          {/* Essential Stack & Certifications */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-blue-500" /> Core Tech Stack &amp; Skills
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {selectedTrack.skills.map((s, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-semibold border border-blue-100 dark:border-blue-900"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-500" /> Recognized Certifications
              </h4>
              <ul className="space-y-1.5">
                {selectedTrack.certifications.map((c, idx) => (
                  <li
                    key={idx}
                    className="text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 4-Phase Step-by-Step Learning Tree */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Step-by-Step Roadmap &amp; Milestones
              </h3>
              <p className="text-xs text-slate-500">
                Follow this sequential sequence from fundamental concepts to production deployment
              </p>
            </div>

            <div className="space-y-4 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
              {selectedTrack.milestones.map((m, idx) => (
                <div key={idx} className="relative pl-9 space-y-1.5">
                  {/* Step Bubble */}
                  <div className="absolute left-1.5 top-0.5 w-4 h-4 rounded-full bg-blue-600 border-2 border-white dark:border-slate-900 shadow-xs" />

                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    {m.level}
                  </span>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">{m.title}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {m.description}
                  </p>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {m.topics.map((top, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-700 dark:text-slate-300 font-mono"
                      >
                        ✓ {top}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
