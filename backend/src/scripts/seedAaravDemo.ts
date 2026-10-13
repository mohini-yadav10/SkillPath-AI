import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import StudentProfile from '../models/StudentProfile';
import JobRole from '../models/JobRole';
import Skill from '../models/Skill';
import RoleSkillRequirement from '../models/RoleSkillRequirement';
import SkillGapAnalysis from '../models/SkillGapAnalysis';
import LearningPath from '../models/LearningPath';

dotenv.config();

const seedAarav = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || '');
    console.log('MongoDB Connected for Aarav Demo Seeding...');

    const email = 'aarav@abc.edu';
    
    // Clear old Aarav data if it exists
    const oldUser = await User.findOne({ email });
    if (oldUser) {
      const oldProfile = await StudentProfile.findOne({ userId: oldUser._id });
      if (oldProfile) {
        await SkillGapAnalysis.deleteMany({ studentId: oldProfile._id });
        await LearningPath.deleteMany({ studentId: oldProfile._id });
        await StudentProfile.deleteOne({ userId: oldUser._id });
      }
      await User.deleteOne({ email });
    }

    // Clear old Alumni if exists
    await User.deleteOne({ email: 'john@exampletech.com' });

    // 1. Create User
    const user = await User.create({
      firstName: 'Aarav',
      lastName: 'Sharma',
      email: email,
      passwordHash: 'demo123',
      role: 'STUDENT'
    });

    await User.create({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@exampletech.com',
      passwordHash: 'demo123',
      role: 'ALUMNI',
      currentCompany: 'ExampleTech',
      currentJobTitle: 'Senior Full Stack Developer',
      bio: 'Passionate about helping students transition into Full Stack roles at top tech companies. I specialize in React and Node.js.'
    });

    // Clear old Admin if exists
    await User.deleteOne({ email: 'admin@abc.edu' });

    await User.create({
      firstName: 'College',
      lastName: 'Admin',
      email: 'admin@abc.edu',
      passwordHash: 'demo123',
      role: 'ADMIN',
    });

    // 2. Create Target Role
    const role = await JobRole.create({
      title: 'Full Stack Developer',
      description: 'Full Stack Software Engineer proficient in React, Node.js, Express, MongoDB, and system architecture.',
    });

    // 3. Create Skills with Graph Dependencies
    const rawSkills = [
      { name: 'HTML/CSS', category: 'TECHNICAL' as const, level: 'FOUNDATIONAL' as const, domain: 'Frontend', req: 90, curr: 85 },
      { name: 'JavaScript', category: 'TECHNICAL' as const, level: 'FOUNDATIONAL' as const, domain: 'Frontend', req: 85, curr: 62 },
      { name: 'React', category: 'FRAMEWORK' as const, level: 'INTERMEDIATE' as const, domain: 'Frontend', req: 80, curr: 55 },
      { name: 'Node.js', category: 'TECHNICAL' as const, level: 'INTERMEDIATE' as const, domain: 'Backend', req: 75, curr: 48 },
      { name: 'Express.js', category: 'FRAMEWORK' as const, level: 'INTERMEDIATE' as const, domain: 'Backend', req: 70, curr: 45 },
      { name: 'MongoDB', category: 'DATABASE' as const, level: 'INTERMEDIATE' as const, domain: 'Database', req: 75, curr: 52 },
      { name: 'SQL', category: 'DATABASE' as const, level: 'FOUNDATIONAL' as const, domain: 'Database', req: 70, curr: 58 },
      { name: 'Git/GitHub', category: 'DEVOPS' as const, level: 'FOUNDATIONAL' as const, domain: 'DevOps', req: 80, curr: 70 },
      { name: 'Data Structures', category: 'TECHNICAL' as const, level: 'FOUNDATIONAL' as const, domain: 'Core', req: 70, curr: 40 }
    ];

    // Upsert skills first to get IDs
    const skillDocMap = new Map<string, any>();
    for (const item of rawSkills) {
      const doc = await Skill.findOneAndUpdate(
        { name: item.name },
        { 
          name: item.name, 
          category: item.category,
          level: item.level,
          domain: item.domain,
          prerequisites: []
        },
        { upsert: true, new: true }
      );
      skillDocMap.set(item.name, doc);
    }

    // Now establish graph prerequisites
    // JavaScript requires HTML/CSS
    await Skill.findByIdAndUpdate(skillDocMap.get('JavaScript')._id, {
      prerequisites: [skillDocMap.get('HTML/CSS')._id]
    });
    // React requires JavaScript
    await Skill.findByIdAndUpdate(skillDocMap.get('React')._id, {
      prerequisites: [skillDocMap.get('JavaScript')._id]
    });
    // Node.js requires JavaScript
    await Skill.findByIdAndUpdate(skillDocMap.get('Node.js')._id, {
      prerequisites: [skillDocMap.get('JavaScript')._id]
    });
    // Express.js requires Node.js
    await Skill.findByIdAndUpdate(skillDocMap.get('Express.js')._id, {
      prerequisites: [skillDocMap.get('Node.js')._id]
    });

    // 4. Create Role Skill Requirements
    await RoleSkillRequirement.deleteMany({ roleId: role._id });
    for (const item of rawSkills) {
      const doc = skillDocMap.get(item.name);
      await RoleSkillRequirement.create({
        roleId: role._id,
        skillId: doc._id,
        importance: item.req >= 80 ? 'CRITICAL' : (item.req >= 70 ? 'IMPORTANT' : 'MEDIUM'),
        minimumProficiency: item.req,
        weight: item.req >= 80 ? 3 : 2
      });
    }

    // 5. Create Profile with Career Twin Data
    const profileSkills = rawSkills.map(item => {
      const doc = skillDocMap.get(item.name);
      return {
        skillId: doc._id as mongoose.Types.ObjectId,
        proficiency: item.curr,
        confidenceScore: item.curr + 5,
        source: 'VERIFIED' as const
      };
    });

    const demoProjects = [
      {
        title: 'E-Commerce REST API',
        description: 'Scalable backend API built with Node.js, Express, MongoDB and JWT authentication with automated unit tests.',
        techStack: ['Node.js', 'Express.js', 'MongoDB', 'JWT'],
        githubUrl: 'https://github.com/aarav/ecommerce-api',
        verified: true,
        impactScore: 82
      },
      {
        title: 'TaskFlow Kanban UI',
        description: 'Interactive drag-and-drop task management interface built with React, Tailwind CSS, and Framer Motion.',
        techStack: ['React', 'JavaScript', 'Tailwind CSS', 'Framer Motion'],
        githubUrl: 'https://github.com/aarav/taskflow-ui',
        liveUrl: 'https://taskflow-demo.vercel.app',
        verified: true,
        impactScore: 88
      }
    ];

    const profile = await StudentProfile.create({
      userId: user._id,
      targetRole: role._id,
      careerReadinessScore: 74,
      skills: profileSkills,
      projects: demoProjects,
      interviewStats: {
        totalInterviews: 3,
        averageScore: 76,
        technicalRating: 72,
        communicationRating: 80
      },
      careerTwin: {
        archetype: 'Developing Full-Stack Engineer',
        marketReadinessIndex: 74,
        cognitiveScores: {
          technicalProficiency: 57,
          practicalApplication: 85,
          interviewReadiness: 76,
          consistencyStreak: 75
        },
        learningVelocity: 18,
        estimatedWeeksToHire: 6,
        aiDiagnosis: 'Strong foundational grasp of web technologies. Primary bottlenecks are asynchronous Node.js backend scalability and complex data structure problem-solving under interview constraints.',
        nextBestAction: 'Prioritize Node.js & React architecture to increase market readiness past the 80% benchmark.'
      },
      xp: 450,
      level: 4,
      learningStreak: 5,
      lastActivityDate: new Date()
    });

    // 6. Create Skill Gap Analysis with Priorities & Recommendations
    const gaps = rawSkills.map(item => {
      const doc = skillDocMap.get(item.name);
      const gapSize = Math.max(0, item.req - item.curr);
      
      let classification: 'MASTERED' | 'MINOR' | 'MODERATE' | 'MAJOR' | 'CRITICAL' = 'MASTERED';
      if (gapSize > 35) classification = 'CRITICAL';
      else if (gapSize > 20) classification = 'MAJOR';
      else if (gapSize > 10) classification = 'MODERATE';
      else if (gapSize > 0) classification = 'MINOR';

      let priority: 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM';
      if (gapSize > 20 || (item.req >= 80 && gapSize > 10)) priority = 'HIGH';
      else if (gapSize <= 5) priority = 'LOW';

      return {
        skillId: doc._id as mongoose.Types.ObjectId,
        skillName: doc.name,
        currentProficiency: item.curr,
        requiredProficiency: item.req,
        gapSize,
        classification,
        importance: item.req >= 80 ? 'CRITICAL' : 'IMPORTANT',
        priority,
        recommendation: gapSize > 0 
          ? `Elevate ${doc.name} through focused practice and targeted project implementation.`
          : `Verified mastery in ${doc.name}.`,
        estimatedHoursToClose: Math.max(4, Math.round(gapSize * 0.8)),
        isPrerequisiteMet: true
      };
    });

    await SkillGapAnalysis.create({
      studentId: profile._id,
      roleId: role._id,
      readinessScore: 74,
      criticalGapsCount: gaps.filter(g => g.priority === 'HIGH').length,
      matchedSkillsCount: gaps.filter(g => g.gapSize === 0).length,
      totalRequiredSkills: rawSkills.length,
      summaryDiagnosis: 'Identified 3 high-priority skills needing reinforcement. Prerequisite chain is solid.',
      gaps
    });

    // 7. Create Learning Curriculum
    await LearningPath.create({
      studentId: profile._id,
      targetRoleId: role._id,
      status: 'ACTIVE',
      progress: 45,
      items: [
        {
          skillId: skillDocMap.get('HTML/CSS')._id,
          skillName: 'HTML/CSS',
          title: 'Advanced CSS Layouts & Responsive Architecture',
          type: 'COURSE',
          url: 'https://demo.com/css',
          estimatedHours: 10,
          status: 'COMPLETED',
          order: 1
        },
        {
          skillId: skillDocMap.get('JavaScript')._id,
          skillName: 'JavaScript',
          title: 'ES6+, Event Loop, and Asynchronous JS Deep Dive',
          type: 'COURSE',
          url: 'https://demo.com/js',
          estimatedHours: 25,
          status: 'IN_PROGRESS',
          order: 2
        },
        {
          skillId: skillDocMap.get('Data Structures')._id,
          skillName: 'Data Structures',
          title: 'Algorithmic Problem Solving for Tech Interviews',
          type: 'COURSE',
          url: 'https://demo.com/dsa',
          estimatedHours: 40,
          status: 'PENDING',
          order: 3
        },
        {
          skillId: skillDocMap.get('React')._id,
          skillName: 'React',
          title: 'Production Full-Stack Application Integration',
          type: 'PROJECT',
          url: 'https://demo.com/react-project',
          estimatedHours: 50,
          status: 'PENDING',
          order: 4
        }
      ]
    });

    console.log('✅ DEMO DATA SEEDED: Aarav Sharma profile with Career Twin & Skill Graph successfully generated.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedAarav();
