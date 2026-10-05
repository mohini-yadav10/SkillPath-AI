import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Question from '../models/Question';
import Skill from '../models/Skill';

dotenv.config();

const questionsToSeed = [
  {
    skillName: 'React',
    questionText: 'Which hook is used to perform side effects in a functional component?',
    options: ['useState', 'useEffect', 'useContext', 'useReducer'],
    correctOptionIndex: 1,
    difficulty: 'EASY',
    explanation: 'useEffect is the hook specifically designed for handling side effects like data fetching and subscriptions.'
  },
  {
    skillName: 'React',
    questionText: 'What does the Context API primarily solve?',
    options: ['Component state management', 'Prop drilling', 'Routing', 'Form validation'],
    correctOptionIndex: 1,
    difficulty: 'MEDIUM',
    explanation: 'Context provides a way to pass data through the component tree without having to pass props down manually at every level.'
  },
  {
    skillName: 'React',
    questionText: 'How does React\'s concurrent mode improve user experience?',
    options: ['By executing JavaScript on multiple threads', 'By rendering multiple UIs at once', 'By interrupting long-running renders to handle high-priority updates', 'By removing the Virtual DOM'],
    correctOptionIndex: 2,
    difficulty: 'HARD',
    explanation: 'Concurrent mode allows React to interrupt a long-running render to handle a high-priority event, like user input.'
  },
  {
    skillName: 'Node.js',
    questionText: 'What is the default package manager for Node.js?',
    options: ['Yarn', 'Bower', 'npm', 'pnpm'],
    correctOptionIndex: 2,
    difficulty: 'EASY',
    explanation: 'npm (Node Package Manager) is the default package manager included with Node.js installations.'
  },
  {
    skillName: 'Node.js',
    questionText: 'Which of the following is true about Node.js event loop?',
    options: ['It runs on multiple threads natively', 'It is single-threaded but highly scalable via asynchronous callbacks', 'It blocks I/O operations by default', 'It uses Web Workers under the hood'],
    correctOptionIndex: 1,
    difficulty: 'MEDIUM',
    explanation: 'Node.js operates on a single thread using non-blocking I/O calls, making it highly scalable for I/O-bound tasks.'
  },
  {
    skillName: 'DSA',
    questionText: 'What is the time complexity of searching in a perfectly balanced Binary Search Tree?',
    options: ['O(1)', 'O(n)', 'O(log n)', 'O(n^2)'],
    correctOptionIndex: 2,
    difficulty: 'MEDIUM',
    explanation: 'In a balanced BST, each step eliminates half the remaining elements, yielding logarithmic time.'
  }
];

const seedAssessments = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || '');
    
    // Ensure skills exist first
    const skillNames = [...new Set(questionsToSeed.map(q => q.skillName))];
    const skillMap: Record<string, string> = {};
    
    for (const name of skillNames) {
      let skill = await Skill.findOne({ name });
      if (!skill) {
        skill = await Skill.create({ name, category: 'Technical' });
      }
      skillMap[name] = skill._id as string;
    }

    const mappedQuestions = questionsToSeed.map(q => ({
      skillId: skillMap[q.skillName],
      questionText: q.questionText,
      options: q.options,
      correctOptionIndex: q.correctOptionIndex,
      difficulty: q.difficulty,
      explanation: q.explanation
    }));

    await Question.deleteMany({ skillId: { $in: Object.values(skillMap) } });
    await Question.insertMany(mappedQuestions);

    console.log(`Assessment questions seeded successfully!`);
    console.log(`Created ${mappedQuestions.length} multiple-choice questions across ${skillNames.length} skills.`);
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedAssessments();
