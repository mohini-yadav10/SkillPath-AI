import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import StudentProfile from '../models/StudentProfile';
import JobRole from '../models/JobRole';
import Skill from '../models/Skill';
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
      passwordHash: 'demo123', // Will be hashed by the pre-save hook in User model
      role: 'STUDENT'
    });

    const alumni = await User.create({
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

    const admin = await User.create({
      firstName: 'College',
      lastName: 'Admin',
      email: 'admin@abc.edu',
      passwordHash: 'demo123',
      role: 'ADMIN',
    });

    // 2. Create Target Role
    const role = await JobRole.create({
      title: 'Full Stack Developer',
      description: 'DEMO DATA: Full Stack Developer at ExampleTech',
    });

    // 3. Create Skills
    const skillsData = [
      { name: 'HTML/CSS', req: 90, curr: 85 },
      { name: 'JavaScript', req: 85, curr: 62 },
      { name: 'React', req: 80, curr: 55 },
      { name: 'Node.js', req: 75, curr: 48 },
      { name: 'Express.js', req: 70, curr: 45 },
      { name: 'MongoDB', req: 75, curr: 52 },
      { name: 'Git/GitHub', req: 80, curr: 70 },
      { name: 'Data Structures', req: 70, curr: 40 },
      { name: 'SQL', req: 70, curr: 58 }
    ];

    const insertedSkills = await Promise.all(
      skillsData.map(s => Skill.findOneAndUpdate(
        { name: s.name },
        { name: s.name, category: 'TECHNICAL' },
        { upsert: true, new: true }
      ))
    );

    // 4. Create Profile
    const profileSkills = insertedSkills.map((dbSkill, index) => ({
      skillId: dbSkill._id,
      proficiency: skillsData[index].curr,
      confidenceScore: skillsData[index].curr + 5,
      source: 'VERIFIED'
    }));

    const profile = await StudentProfile.create({
      userId: user._id,
      targetRole: role._id,
      careerReadinessScore: 74, // Pre-calculated realistic score
      skills: profileSkills
    });

    // 5. Create Skill Gap Analysis
    const gaps = insertedSkills.map((dbSkill, index) => {
      const data = skillsData[index];
      const gapSize = Math.max(0, data.req - data.curr);
      
      let classification = 'MASTERED';
      if (gapSize > 25) classification = 'CRITICAL';
      else if (gapSize > 15) classification = 'MAJOR';
      else if (gapSize > 5) classification = 'MODERATE';
      else if (gapSize > 0) classification = 'MINOR';

      return {
        skillId: dbSkill._id,
        skillName: dbSkill.name,
        currentProficiency: data.curr,
        requiredProficiency: data.req,
        gapSize,
        classification,
        importance: data.req >= 80 ? 'HIGH' : 'MEDIUM'
      };
    });

    await SkillGapAnalysis.create({
      studentId: profile._id,
      roleId: role._id,
      readinessScore: 74,
      criticalGapsCount: gaps.filter(g => g.classification === 'CRITICAL').length,
      matchedSkillsCount: gaps.filter(g => g.gapSize === 0).length,
      totalRequiredSkills: skillsData.length,
      gaps
    });

    // 6. Create Learning Curriculum
    await LearningPath.create({
      studentId: profile._id,
      targetRoleId: role._id,
      status: 'ACTIVE',
      progress: 45,
      items: [
        {
          skillId: insertedSkills[0]._id, // HTML/CSS
          skillName: 'HTML/CSS',
          title: 'Advanced CSS Layouts',
          type: 'COURSE',
          url: 'https://demo.com/css',
          estimatedHours: 10,
          status: 'COMPLETED',
          order: 1
        },
        {
          skillId: insertedSkills[1]._id, // JavaScript
          skillName: 'JavaScript',
          title: 'ES6+ and Async JavaScript',
          type: 'COURSE',
          url: 'https://demo.com/js',
          estimatedHours: 25,
          status: 'IN_PROGRESS',
          order: 2
        },
        {
          skillId: insertedSkills[7]._id, // Data Structures
          skillName: 'Data Structures',
          title: 'Data Structures Crash Course',
          type: 'COURSE',
          url: 'https://demo.com/dsa',
          estimatedHours: 40,
          status: 'PENDING',
          order: 3
        },
        {
          skillId: insertedSkills[2]._id, // React
          skillName: 'React',
          title: 'Build a Full Stack App',
          type: 'PROJECT',
          url: 'https://demo.com/react-project',
          estimatedHours: 50,
          status: 'PENDING',
          order: 4
        }
      ]
    });

    console.log('✅ DEMO DATA SEEDED: Aarav Sharma profile successfully generated.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedAarav();
