import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FolderKanban, Github, ExternalLink, Zap, Target, Clock, Star, Code2, Database, Globe, Shield, Brain, Layers } from 'lucide-react';
import { useCareerTarget } from '../context/CareerContext';
import { useNavigate } from 'react-router-dom';

interface ProjectIdea {
  title: string;
  description: string;
  techStack: string[];
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  estimatedHours: number;
  impact: string;
  githubSearch: string;
  skills: string[];
  icon: React.ElementType;
}

// Role-specific project recommendation database
const PROJECT_DATABASE: Record<string, ProjectIdea[]> = {
  'Data Scientist': [
    {
      title: 'Customer Churn Predictor',
      description: 'Build an end-to-end ML pipeline predicting customer churn using classification algorithms. Deploy with a REST API and dashboard.',
      techStack: ['Python', 'Scikit-learn', 'Pandas', 'FastAPI', 'Streamlit'],
      difficulty: 'INTERMEDIATE',
      estimatedHours: 40,
      impact: 'Demonstrates full ML lifecycle and business value delivery',
      githubSearch: 'customer-churn-prediction',
      skills: ['Machine Learning', 'Python', 'Data Analysis'],
      icon: Brain
    },
    {
      title: 'Real-time Sentiment Dashboard',
      description: 'Stream Twitter/Reddit data, apply NLP sentiment analysis, and visualize trends in a live dashboard.',
      techStack: ['Python', 'Kafka', 'SpaCy', 'Plotly Dash', 'MongoDB'],
      difficulty: 'ADVANCED',
      estimatedHours: 60,
      impact: 'Shows real-time data engineering and NLP capabilities',
      githubSearch: 'real-time-sentiment-analysis',
      skills: ['NLP', 'Python', 'SQL'],
      icon: Database
    },
    {
      title: 'House Price Regression Model',
      description: 'Comprehensive regression project with EDA, feature engineering, and model comparison. Deployed as interactive web app.',
      techStack: ['Python', 'XGBoost', 'Pandas', 'Numpy', 'Streamlit'],
      difficulty: 'BEGINNER',
      estimatedHours: 20,
      impact: 'Great portfolio piece demonstrating statistical reasoning',
      githubSearch: 'house-price-prediction-ml',
      skills: ['Python', 'Statistics', 'Data Analysis'],
      icon: Layers
    }
  ],
  'Machine Learning Engineer': [
    {
      title: 'MLOps Pipeline with CI/CD',
      description: 'Build an automated ML training and deployment pipeline using MLflow, DVC, and GitHub Actions with model monitoring.',
      techStack: ['Python', 'MLflow', 'Docker', 'GitHub Actions', 'FastAPI'],
      difficulty: 'ADVANCED',
      estimatedHours: 80,
      impact: 'Highly valued by top ML engineering teams',
      githubSearch: 'mlops-pipeline-github-actions',
      skills: ['Machine Learning', 'Python', 'Docker'],
      icon: Layers
    },
    {
      title: 'Custom Transformer Fine-tuning',
      description: 'Fine-tune a BERT/LLaMA model on a domain-specific dataset. Serve via Hugging Face Spaces or REST API.',
      techStack: ['Python', 'PyTorch', 'Transformers', 'CUDA', 'Hugging Face'],
      difficulty: 'ADVANCED',
      estimatedHours: 60,
      impact: 'Demonstrates deep NLP and LLM engineering skills',
      githubSearch: 'bert-fine-tuning-classification',
      skills: ['Machine Learning', 'Python', 'Deep Learning'],
      icon: Brain
    }
  ],
  'Full Stack Developer': [
    {
      title: 'Real-time Collaborative Editor',
      description: 'Build a Google Docs-like collaborative editor using operational transforms or CRDTs with WebSocket.',
      techStack: ['React', 'Node.js', 'Socket.io', 'MongoDB', 'Redis'],
      difficulty: 'ADVANCED',
      estimatedHours: 70,
      impact: 'Demonstrates mastery of real-time systems and complex state management',
      githubSearch: 'collaborative-text-editor-websocket',
      skills: ['React', 'Node.js', 'WebSockets'],
      icon: Globe
    },
    {
      title: 'E-commerce Microservices Platform',
      description: 'Decompose a monolith into microservices: user auth, product catalog, orders, payments, with API gateway.',
      techStack: ['React', 'Node.js', 'Docker', 'RabbitMQ', 'PostgreSQL'],
      difficulty: 'ADVANCED',
      estimatedHours: 100,
      impact: 'Shows system design capability and production-level architecture',
      githubSearch: 'nodejs-microservices-ecommerce',
      skills: ['Node.js', 'React', 'System Design'],
      icon: Layers
    },
    {
      title: 'Progressive Web App (PWA)',
      description: 'Build a full-featured PWA with offline support, push notifications, and app-like mobile experience.',
      techStack: ['React', 'Service Workers', 'IndexedDB', 'Web Push API'],
      difficulty: 'INTERMEDIATE',
      estimatedHours: 35,
      impact: 'Demonstrates modern web standards and mobile-first thinking',
      githubSearch: 'react-progressive-web-app',
      skills: ['React', 'JavaScript', 'Performance'],
      icon: Globe
    }
  ],
  'Backend Developer': [
    {
      title: 'Distributed Task Queue System',
      description: 'Build a Redis/RabbitMQ-based job queue with workers, retries, and a monitoring dashboard.',
      techStack: ['Node.js', 'Redis', 'Bull', 'Express', 'PostgreSQL'],
      difficulty: 'ADVANCED',
      estimatedHours: 55,
      impact: 'Shows deep understanding of async systems and reliability',
      githubSearch: 'nodejs-job-queue-redis',
      skills: ['Node.js', 'Databases', 'System Design'],
      icon: Database
    },
    {
      title: 'GraphQL API with Subscriptions',
      description: 'Design and implement a GraphQL API with real-time subscriptions, DataLoader for N+1 prevention, and JWT auth.',
      techStack: ['Node.js', 'Apollo Server', 'PostgreSQL', 'Prisma', 'JWT'],
      difficulty: 'INTERMEDIATE',
      estimatedHours: 40,
      impact: 'Demonstrates modern API design and database optimization',
      githubSearch: 'graphql-api-subscriptions-nodejs',
      skills: ['Node.js', 'APIs', 'Authentication'],
      icon: Code2
    }
  ],
  'Frontend Developer': [
    {
      title: 'Accessible Design System',
      description: 'Build a reusable component library with WCAG 2.1 compliance, Storybook docs, and automated a11y testing.',
      techStack: ['React', 'TypeScript', 'Storybook', 'Jest', 'CSS Custom Properties'],
      difficulty: 'ADVANCED',
      estimatedHours: 80,
      impact: 'Highly valued — shows design thinking and professional-grade engineering',
      githubSearch: 'react-accessible-design-system',
      skills: ['React', 'CSS', 'Accessibility'],
      icon: Globe
    },
    {
      title: 'State Management From Scratch',
      description: 'Implement a Redux-like state management library using React context and useReducer. Add devtools and persistence.',
      techStack: ['React', 'TypeScript', 'IndexedDB', 'Jest'],
      difficulty: 'INTERMEDIATE',
      estimatedHours: 30,
      impact: 'Demonstrates deep React understanding beyond just using libraries',
      githubSearch: 'custom-state-management-react',
      skills: ['React', 'JavaScript', 'TypeScript'],
      icon: Layers
    }
  ],
  'Cyber Security Analyst': [
    {
      title: 'Honeypot & Threat Intelligence Dashboard',
      description: 'Deploy a low-interaction honeypot and visualize attack patterns, geolocation, and IOC correlations in real time.',
      techStack: ['Python', 'Docker', 'Elasticsearch', 'Kibana', 'GeoIP'],
      difficulty: 'ADVANCED',
      estimatedHours: 65,
      impact: 'Directly demonstrates defensive security and threat intelligence skills',
      githubSearch: 'honeypot-threat-intelligence',
      skills: ['Networking', 'Linux', 'Security'],
      icon: Shield
    },
    {
      title: 'Vulnerability Scanner Tool',
      description: 'CLI tool for scanning common web vulnerabilities (XSS, SQLi, CSRF) with a report generator.',
      techStack: ['Python', 'Requests', 'BeautifulSoup', 'Click', 'Jinja2'],
      difficulty: 'INTERMEDIATE',
      estimatedHours: 35,
      impact: 'Shows hands-on offensive security knowledge',
      githubSearch: 'python-web-vulnerability-scanner',
      skills: ['Web Security', 'Python', 'Security'],
      icon: Shield
    }
  ],
  'Cloud Engineer': [
    {
      title: 'Multi-cloud Cost Optimizer',
      description: 'Tool that analyzes cloud billing data across AWS/GCP and recommends cost-saving actions with projected savings.',
      techStack: ['Python', 'AWS SDK', 'Terraform', 'FastAPI', 'React'],
      difficulty: 'ADVANCED',
      estimatedHours: 70,
      impact: 'High business value — shows cloud cost management expertise',
      githubSearch: 'aws-cost-optimization-tool',
      skills: ['AWS', 'Python', 'Infrastructure'],
      icon: Layers
    },
    {
      title: 'Kubernetes GitOps Pipeline',
      description: 'Deploy an app using ArgoCD, Helm charts, and GitHub Actions for fully automated GitOps workflow.',
      techStack: ['Kubernetes', 'ArgoCD', 'Helm', 'Docker', 'GitHub Actions'],
      difficulty: 'ADVANCED',
      estimatedHours: 50,
      impact: 'Demonstrates production-grade DevOps and K8s mastery',
      githubSearch: 'gitops-argocd-kubernetes',
      skills: ['Kubernetes', 'Docker', 'CI/CD'],
      icon: Code2
    }
  ]
};

const DEFAULT_PROJECTS: ProjectIdea[] = [
  {
    title: 'Personal Portfolio with CMS',
    description: 'Build a dynamic portfolio site with a headless CMS, project showcase, and blog — fully deployed.',
    techStack: ['React', 'Next.js', 'Contentful', 'Vercel'],
    difficulty: 'BEGINNER',
    estimatedHours: 20,
    impact: 'Professional online presence for recruiters',
    githubSearch: 'nextjs-portfolio-cms',
    skills: ['React', 'JavaScript', 'CSS'],
    icon: Globe
  },
  {
    title: 'CLI Productivity Tool',
    description: 'A command-line tool solving a real workflow problem. Published to npm/PyPI.',
    techStack: ['Node.js', 'TypeScript', 'Commander.js', 'Chalk'],
    difficulty: 'BEGINNER',
    estimatedHours: 15,
    impact: 'Shows ability to build useful tools people use',
    githubSearch: 'nodejs-cli-tool-typescript',
    skills: ['Node.js', 'JavaScript', 'TypeScript'],
    icon: Code2
  }
];

const DIFFICULTY_STYLES: Record<string, string> = {
  BEGINNER: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  INTERMEDIATE: 'bg-amber-100 text-amber-800 border-amber-300',
  ADVANCED: 'bg-rose-100 text-rose-800 border-rose-300'
};

export default function Projects() {
  const { target, hasTarget } = useCareerTarget();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'ALL' | 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'>('ALL');

  const projects = useMemo(() => {
    if (!target?.roleName) return DEFAULT_PROJECTS;
    
    // Try exact match first, then partial match
    const exactMatch = PROJECT_DATABASE[target.roleName];
    if (exactMatch) return exactMatch;
    
    // Fuzzy match
    const fuzzyKey = Object.keys(PROJECT_DATABASE).find(k =>
      target.roleName!.toLowerCase().includes(k.toLowerCase()) ||
      k.toLowerCase().includes(target.roleName!.toLowerCase())
    );
    
    return fuzzyKey ? PROJECT_DATABASE[fuzzyKey] : DEFAULT_PROJECTS;
  }, [target?.roleName]);

  const filtered = filter === 'ALL' ? projects : projects.filter(p => p.difficulty === filter);

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      {/* Header */}
      <div className="bg-white p-8 rounded-3xl border border-sage/30 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <FolderKanban size={160} />
        </div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-forest/10 border border-forest/20 text-forest font-bold text-xs mb-4">
            <Zap size={14} className="text-gold" /> AI-CURATED PROJECT IDEAS
          </div>
          <h1 className="text-3xl lg:text-4xl font-black text-forest tracking-tight">
            Portfolio Projects
          </h1>
          <p className="text-muted mt-2 font-medium text-lg">
            {hasTarget
              ? <>Personalized project ideas to master <strong className="text-forest">{target?.roleName}</strong> skills.</>
              : <>Set a target role to see role-specific project recommendations.</>}
          </p>
        </div>

        {!hasTarget && (
          <button
            onClick={() => navigate('/career')}
            className="mt-4 bg-forest text-cream px-6 py-3 rounded-2xl font-bold hover:bg-forest-dark transition shadow-md flex items-center gap-2"
          >
            <Target size={16} /> Set Target Role
          </button>
        )}
      </div>

      {/* Difficulty Filter */}
      <div className="flex flex-wrap gap-2">
        {(['ALL', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as const).map(d => (
          <button
            key={d}
            onClick={() => setFilter(d)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
              filter === d
                ? 'bg-forest text-cream border-forest shadow-sm'
                : 'bg-white text-muted border-sage/30 hover:border-forest hover:text-forest'
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Project Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filtered.map((project, index) => {
          const Icon = project.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="bg-white p-8 rounded-3xl border border-sage/30 shadow-sm hover:shadow-md hover:border-sage/60 transition-all flex flex-col"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-forest/10 rounded-2xl flex items-center justify-center text-forest shrink-0">
                    <Icon size={22} />
                  </div>
                  <div>
                    <h3 className="font-black text-forest text-lg leading-snug">{project.title}</h3>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${DIFFICULTY_STYLES[project.difficulty]}`}>
                        {project.difficulty}
                      </span>
                      <span className="text-[10px] font-bold text-muted flex items-center gap-1 bg-cream px-2 py-0.5 rounded-full border border-sage/30">
                        <Clock size={10} /> ~{project.estimatedHours}h
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-forest-dark/80 text-sm font-medium leading-relaxed mb-4 flex-1">
                {project.description}
              </p>

              <div className="bg-sage/10 p-3 rounded-xl border border-sage/20 mb-4">
                <p className="text-xs font-bold text-forest flex items-center gap-1.5 mb-1">
                  <Star size={12} className="text-gold" /> Impact
                </p>
                <p className="text-xs text-forest-dark font-medium">{project.impact}</p>
              </div>

              <div className="mb-5">
                <p className="text-xs font-bold text-muted uppercase tracking-wider mb-2">Tech Stack</p>
                <div className="flex flex-wrap gap-1.5">
                  {project.techStack.map((tech, i) => (
                    <span key={i} className="text-[11px] font-bold text-forest bg-cream border border-sage/30 px-2.5 py-1 rounded-lg">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 mt-auto">
                <a
                  href={`https://github.com/search?q=${encodeURIComponent(project.githubSearch)}&type=repositories`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 bg-forest text-cream font-bold px-4 py-3 rounded-xl hover:bg-forest-dark transition text-sm"
                >
                  <Github size={15} /> Browse Examples
                </a>
                <button
                  onClick={() => navigate('/learning')}
                  className="flex items-center justify-center gap-2 bg-cream border border-sage/40 text-forest font-bold px-4 py-3 rounded-xl hover:bg-sage/10 transition text-sm"
                >
                  <ExternalLink size={14} /> Learn Skills
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 bg-white rounded-3xl border border-sage/30">
          <p className="text-muted font-medium">No projects at this difficulty level. Try a different filter.</p>
        </div>
      )}
    </div>
  );
}
