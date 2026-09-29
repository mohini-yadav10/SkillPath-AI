import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import StudentProfile from '../models/StudentProfile';
import JobRole from '../models/JobRole';
import Skill from '../models/Skill';
import SkillGapAnalysis from '../models/SkillGapAnalysis';
import LearningPath from '../models/LearningPath';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || '');
    console.log('MongoDB Connected for Seeding...');

    const email = 'judge@hackportal.com';
    const user = await User.findOne({ email });

    if (!user) {
      console.log('User not found. Please register first.');
      process.exit(1);
    }

    // Cleanup old data
    await JobRole.deleteMany({});
    await Skill.deleteMany({});
    await SkillGapAnalysis.deleteMany({});
    await LearningPath.deleteMany({});

    // Create Job Role
    const aiRole = await JobRole.create({
      title: 'Senior Full Stack AI Engineer',
      description: 'Architecting and building AI-driven web applications.',
    });

    // Create Skills
    const skillsToCreate = [
      { name: 'React', category: 'TECHNICAL' },
      { name: 'Node.js', category: 'TECHNICAL' },
      { name: 'Python', category: 'TECHNICAL' },
      { name: 'Machine Learning', category: 'TECHNICAL' },
      { name: 'Docker', category: 'TECHNICAL' },
      { name: 'AWS', category: 'TECHNICAL' },
    ];

    const insertedSkills = await Skill.insertMany(skillsToCreate);
    
    // Map Skills
    const reactId = insertedSkills[0]._id;
    const nodeId = insertedSkills[1]._id;
    const pythonId = insertedSkills[2]._id;
    const mlId = insertedSkills[3]._id;
    const dockerId = insertedSkills[4]._id;
    const awsId = insertedSkills[5]._id;

    // Update Profile
    const profile = await StudentProfile.findOneAndUpdate(
      { userId: user._id },
      {
        targetRole: aiRole._id,
        careerReadinessScore: 68,
        skills: [
          { skillId: reactId, proficiency: 85, confidenceScore: 90, source: 'VERIFIED' },
          { skillId: nodeId, proficiency: 75, confidenceScore: 85, source: 'ASSESSMENT' },
          { skillId: pythonId, proficiency: 60, confidenceScore: 70, source: 'RESUME' },
          { skillId: mlId, proficiency: 20, confidenceScore: 40, source: 'SELF_DECLARED' },
        ]
      },
      { upsert: true, new: true }
    );

    // Create Skill Gap Analysis
    await SkillGapAnalysis.create({
      studentId: profile._id,
      roleId: aiRole._id,
      readinessScore: 68,
      criticalGapsCount: 2,
      matchedSkillsCount: 2,
      totalRequiredSkills: 6,
      gaps: [
        {
          skillId: mlId,
          skillName: 'Machine Learning',
          currentProficiency: 20,
          requiredProficiency: 80,
          gapSize: 60,
          classification: 'CRITICAL',
          importance: 'HIGH'
        },
        {
          skillId: dockerId,
          skillName: 'Docker',
          currentProficiency: 0,
          requiredProficiency: 70,
          gapSize: 70,
          classification: 'CRITICAL',
          importance: 'HIGH'
        },
        {
          skillId: awsId,
          skillName: 'AWS',
          currentProficiency: 0,
          requiredProficiency: 60,
          gapSize: 60,
          classification: 'MAJOR',
          importance: 'MEDIUM'
        },
        {
          skillId: pythonId,
          skillName: 'Python',
          currentProficiency: 60,
          requiredProficiency: 85,
          gapSize: 25,
          classification: 'MODERATE',
          importance: 'HIGH'
        }
      ]
    });

    // Create Learning Path
    await LearningPath.create({
      studentId: profile._id,
      targetRoleId: aiRole._id,
      status: 'ACTIVE',
      progress: 35,
      items: [
        {
          skillId: mlId,
          skillName: 'Machine Learning',
          title: 'Deep Learning Foundation',
          type: 'COURSE',
          url: 'https://coursera.org/ml',
          estimatedHours: 40,
          status: 'IN_PROGRESS',
          order: 1
        },
        {
          skillId: dockerId,
          skillName: 'Docker',
          title: 'Docker for Beginners',
          type: 'PROJECT',
          url: 'https://youtube.com/docker',
          estimatedHours: 10,
          status: 'PENDING',
          order: 2
        },
        {
          skillId: awsId,
          skillName: 'AWS',
          title: 'AWS Cloud Practitioner',
          type: 'ARTICLE',
          url: 'https://aws.amazon.com',
          estimatedHours: 20,
          status: 'PENDING',
          order: 3
        }
      ]
    });

    console.log('Seeding Complete! Demo data successfully injected.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedData();
