import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Company from '../models/Company';
import JobRole from '../models/JobRole';
import Skill from '../models/Skill';
import InterviewQuestion from '../models/InterviewQuestion';

dotenv.config();

const companiesData = [
  'TCS', 'Infosys', 'Wipro', 'Accenture', 'Cognizant', 
  'Capgemini', 'Deloitte', 'IBM', 'Microsoft', 'Amazon', 
  'Google', 'Oracle', 'Cisco', 'HCLTech', 'Tech Mahindra'
];

const rolesData = [
  'Software Developer', 'Software Engineer', 'Full Stack Developer', 'Frontend Developer',
  'Backend Developer', 'MERN Stack Developer', 'Java Developer', 'Python Developer',
  'Data Analyst', 'Data Scientist', 'Machine Learning Engineer', 'DevOps Engineer',
  'Cloud Engineer', 'Cybersecurity Analyst', 'Database Developer'
];

const skillsData = [
  'React', 'Node.js', 'Express.js', 'MongoDB', 'Python', 'Java', 'C++', 'JavaScript',
  'SQL', 'DSA', 'DBMS', 'OOP', 'Computer Networks', 'Operating Systems', 'System Design',
  'Machine Learning', 'Data Science', 'Cloud Computing', 'AWS', 'Docker', 'Cybersecurity'
];

const hrQuestions = [
  { q: "Tell me about yourself.", keywords: ["background", "education", "projects", "skills", "passion"] },
  { q: "Why should we hire you?", keywords: ["skills", "fit", "value", "hardworking", "dedicated", "project"] },
  { q: "What is your greatest weakness?", keywords: ["improve", "learning", "overcome", "weakness"] },
  { q: "Where do you see yourself in five years?", keywords: ["growth", "leadership", "senior", "learning", "contributing"] },
  { q: "Tell me about a difficult situation you handled.", keywords: ["challenge", "solution", "teamwork", "communication", "resolved"] }
];

const generateQuestions = (skillsList: any[], rolesList: any[], companiesList: any[]) => {
  const questions: any[] = [];

  // 1. HR & Behavioral (Applicable to all roles/companies)
  hrQuestions.forEach((hq, i) => {
    ['EASY', 'MEDIUM', 'HARD'].forEach(diff => {
      questions.push({
        questionText: hq.q,
        type: 'HR',
        difficulty: diff,
        roles: rolesList.map(r => r.title),
        companies: companiesList.map(c => c.name),
        expectedKeywords: hq.keywords
      });
    });
  });

  // 2. Specific Technical Questions per Skill
  const technicalTemplates = [
    { text: "Explain the core concepts and real-world application of {skill}.", diff: "EASY" },
    { text: "What are the limitations or common pitfalls when working with {skill}?", diff: "MEDIUM" },
    { text: "How would you optimize performance in a highly scaled system using {skill}?", diff: "HARD" },
    { text: "Compare {skill} to its primary alternatives. When would you NOT use {skill}?", diff: "MEDIUM" },
    { text: "Describe a complex bug you might encounter in {skill} and how you would debug it.", diff: "HARD" }
  ];

  skillsList.forEach(skill => {
    technicalTemplates.forEach(template => {
      questions.push({
        questionText: template.text.replace(/{skill}/g, skill.name),
        type: 'TECHNICAL',
        difficulty: template.diff,
        relatedSkill: skill._id,
        roles: rolesList.filter(r => r.title.includes('Developer') || r.title.includes('Engineer')).map(r => r.title),
        companies: ['TCS', 'Infosys', 'Amazon', 'Microsoft', 'Google', 'IBM'],
        expectedKeywords: [skill.name.toLowerCase(), "performance", "optimize", "architecture", "scale", "debug"]
      });
    });
  });

  // 3. DSA & Problem Solving (Highly requested by Amazon/Google/Microsoft)
  const dsaQuestions = [
    { text: "Explain the difference between an Array and a Linked List. When to use which?", diff: "EASY" },
    { text: "How do you detect a cycle in a Directed Graph?", diff: "MEDIUM" },
    { text: "Explain Dijkstra's Algorithm and its time complexity.", diff: "HARD" },
    { text: "How would you implement an LRU Cache?", diff: "HARD" },
    { text: "Given an array of integers, find the longest subarray with sum K.", diff: "MEDIUM" }
  ];

  const dsaSkill = skillsList.find(s => s.name === 'DSA') || skillsList[0];
  dsaQuestions.forEach(dq => {
    questions.push({
      questionText: dq.text,
      type: 'TECHNICAL',
      difficulty: dq.diff,
      relatedSkill: dsaSkill._id,
      roles: ['Software Engineer', 'Software Developer', 'Backend Developer'],
      companies: ['Amazon', 'Google', 'Microsoft', 'Oracle', 'TCS'],
      expectedKeywords: ["array", "pointer", "complexity", "time", "space", "cache", "node", "graph"]
    });
  });

  // 4. College/Alumni/Placement Style
  const placementQuestions = [
    { text: "Explain your final year project and your specific contribution.", diff: "EASY" },
    { text: "What problems did you face during your minor project development?", diff: "MEDIUM" },
    { text: "What happens if your application receives 10,000 concurrent users?", diff: "HARD" },
    { text: "Which new technology are you currently learning and why?", diff: "EASY" }
  ];

  placementQuestions.forEach(pq => {
    questions.push({
      questionText: pq.text,
      type: 'MIXED',
      difficulty: pq.diff,
      roles: rolesList.map(r => r.title),
      companies: companiesList.map(c => c.name),
      expectedKeywords: ["project", "contribution", "architecture", "scaling", "learning", "database"]
    });
  });

  // Generate some random company specific mixes to reach volume
  for(let i=0; i<50; i++) {
    const randomSkill = skillsList[Math.floor(Math.random() * skillsList.length)];
    const randomCompany = companiesList[Math.floor(Math.random() * companiesList.length)];
    const randomRole = rolesList[Math.floor(Math.random() * rolesList.length)];
    
    questions.push({
      questionText: `During a project at ${randomCompany.name} as a ${randomRole.title}, how would you implement a robust solution using ${randomSkill.name}?`,
      type: 'TECHNICAL',
      difficulty: ['EASY', 'MEDIUM', 'HARD'][Math.floor(Math.random() * 3)],
      relatedSkill: randomSkill._id,
      roles: [randomRole.title],
      companies: [randomCompany.name],
      expectedKeywords: ["implementation", "best practices", "robust", "testing", randomSkill.name.toLowerCase()]
    });
  }

  return questions;
};

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || '');
    
    // 1. Ensure Companies
    for (const cName of companiesData) {
      await Company.findOneAndUpdate({ name: cName }, { name: cName, industry: 'Technology' }, { upsert: true });
    }
    const dbCompanies = await Company.find({});

    // 2. Ensure Roles
    for (const rTitle of rolesData) {
      await JobRole.findOneAndUpdate({ title: rTitle }, { title: rTitle }, { upsert: true });
    }
    const dbRoles = await JobRole.find({});

    // 3. Ensure Skills
    for (const sName of skillsData) {
      await Skill.findOneAndUpdate({ name: sName }, { name: sName, category: 'Technical' }, { upsert: true });
    }
    const dbSkills = await Skill.find({});

    // 4. Generate & Insert Questions
    const questionsToInsert = generateQuestions(dbSkills, dbRoles, dbCompanies);
    
    // Remove existing interview questions to avoid bloat
    await InterviewQuestion.deleteMany({});
    
    await InterviewQuestion.insertMany(questionsToInsert);

    // 5. Statistics
    const totalQ = await InterviewQuestion.countDocuments();
    const techQ = await InterviewQuestion.countDocuments({ type: 'TECHNICAL' });
    const hrQ = await InterviewQuestion.countDocuments({ type: 'HR' });
    const mixedQ = await InterviewQuestion.countDocuments({ type: 'MIXED' });

    console.log('\n==================================================');
    console.log('Interview database seeded successfully.');
    console.log('==================================================');
    console.log(`Companies: ${dbCompanies.length}`);
    console.log(`Roles: ${dbRoles.length}`);
    console.log(`Skills mapped: ${dbSkills.length}`);
    console.log(`Questions inserted: ${totalQ}`);
    console.log(`Technical: ${techQ}`);
    console.log(`HR/Behavioral: ${hrQ}`);
    console.log(`Mixed/Company/Placement: ${mixedQ}`);
    console.log('==================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding interview database:', error);
    process.exit(1);
  }
};

seedDatabase();
