import mongoose from 'mongoose';
import dotenv from 'dotenv';
import InterviewQuestion from '../models/InterviewQuestion';

dotenv.config();

const questions = [
  {
    questionText: "Explain the virtual DOM in React and why it provides a performance advantage.",
    type: "TECHNICAL",
    difficulty: "EASY",
    expectedKeywords: ["virtual dom", "diffing", "reconciliation", "memory", "performance", "state", "updates"]
  },
  {
    questionText: "How do you handle asynchronous operations and side effects in a React application?",
    type: "TECHNICAL",
    difficulty: "MEDIUM",
    expectedKeywords: ["useeffect", "async", "await", "promises", "fetch", "axios", "state"]
  },
  {
    questionText: "Describe a time you had a conflict with a team member and how you resolved it.",
    type: "HR",
    difficulty: "MEDIUM",
    expectedKeywords: ["communication", "compromise", "understanding", "perspective", "resolution", "teamwork"]
  },
  {
    questionText: "What is the difference between SQL and NoSQL databases, and when would you choose MongoDB?",
    type: "TECHNICAL",
    difficulty: "MEDIUM",
    expectedKeywords: ["relational", "document", "schema", "flexible", "nosql", "collections", "json"]
  },
  {
    questionText: "Explain how JWT (JSON Web Tokens) work for authentication.",
    type: "TECHNICAL",
    difficulty: "HARD",
    expectedKeywords: ["header", "payload", "signature", "stateless", "auth", "token", "secret"]
  }
];

const seedQuestions = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || '');
    console.log('MongoDB Connected.');
    
    await InterviewQuestion.deleteMany({});
    await InterviewQuestion.insertMany(questions);
    
    console.log('Interview Questions Seeded Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding questions:', error);
    process.exit(1);
  }
};

seedQuestions();
