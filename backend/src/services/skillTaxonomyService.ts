import mongoose from 'mongoose';
import Skill, { ISkill } from '../models/Skill';

// Canonical Skill Dictionary mapping common variations, aliases, and acronyms
export interface CanonicalSkillDefinition {
  canonicalName: string;
  category: 'TECHNICAL' | 'SOFT' | 'FRAMEWORK' | 'DATABASE' | 'DEVOPS';
  level: 'FOUNDATIONAL' | 'INTERMEDIATE' | 'ADVANCED';
  domain: string;
  aliases: string[];
}

export const CANONICAL_MERN_TAXONOMY: CanonicalSkillDefinition[] = [
  // Frontend
  {
    canonicalName: 'HTML',
    category: 'TECHNICAL',
    level: 'FOUNDATIONAL',
    domain: 'Frontend',
    aliases: ['html5', 'html', 'semantic markup', 'dom']
  },
  {
    canonicalName: 'CSS',
    category: 'TECHNICAL',
    level: 'FOUNDATIONAL',
    domain: 'Frontend',
    aliases: ['css3', 'css', 'flexbox', 'grid', 'tailwind']
  },
  {
    canonicalName: 'JavaScript',
    category: 'TECHNICAL',
    level: 'INTERMEDIATE',
    domain: 'Frontend',
    aliases: ['javascript', 'js', 'es6', 'ecmascript', 'event loop', 'promises']
  },
  {
    canonicalName: 'TypeScript',
    category: 'TECHNICAL',
    level: 'INTERMEDIATE',
    domain: 'Frontend',
    aliases: ['typescript', 'ts', 'generics', 'type system']
  },
  {
    canonicalName: 'React',
    category: 'TECHNICAL',
    level: 'ADVANCED',
    domain: 'Frontend',
    aliases: ['react', 'react.js', 'reactjs', 'virtual dom', 'jsx']
  },
  {
    canonicalName: 'React Hooks',
    category: 'TECHNICAL',
    level: 'ADVANCED',
    domain: 'Frontend',
    aliases: ['react hooks', 'useeffect', 'usestate', 'usememo', 'usecallback', 'custom hooks']
  },
  {
    canonicalName: 'State Management',
    category: 'TECHNICAL',
    level: 'ADVANCED',
    domain: 'Frontend',
    aliases: ['state management', 'redux', 'context api', 'zustand', 'recoil']
  },
  {
    canonicalName: 'Responsive Design',
    category: 'TECHNICAL',
    level: 'FOUNDATIONAL',
    domain: 'Frontend',
    aliases: ['responsive design', 'media queries', 'mobile first']
  },
  {
    canonicalName: 'Accessibility',
    category: 'TECHNICAL',
    level: 'INTERMEDIATE',
    domain: 'Frontend',
    aliases: ['accessibility', 'a11y', 'aria', 'screen reader']
  },

  // Backend
  {
    canonicalName: 'Node.js',
    category: 'TECHNICAL',
    level: 'INTERMEDIATE',
    domain: 'Backend',
    aliases: ['node.js', 'nodejs', 'node', 'npm', 'event emitter']
  },
  {
    canonicalName: 'Express.js',
    category: 'TECHNICAL',
    level: 'INTERMEDIATE',
    domain: 'Backend',
    aliases: ['express.js', 'express', 'express router', 'next parameter']
  },
  {
    canonicalName: 'REST APIs',
    category: 'TECHNICAL',
    level: 'INTERMEDIATE',
    domain: 'Backend',
    aliases: ['rest apis', 'restful', 'http methods', 'status codes', 'endpoints']
  },
  {
    canonicalName: 'Authentication',
    category: 'TECHNICAL',
    level: 'ADVANCED',
    domain: 'Backend',
    aliases: ['authentication', 'auth', 'oauth', 'sessions', 'passwords', 'bcrypt']
  },
  {
    canonicalName: 'Authorization',
    category: 'TECHNICAL',
    level: 'ADVANCED',
    domain: 'Backend',
    aliases: ['authorization', 'rbac', 'permissions', 'access control']
  },
  {
    canonicalName: 'JWT',
    category: 'TECHNICAL',
    level: 'INTERMEDIATE',
    domain: 'Backend',
    aliases: ['jwt', 'json web tokens', 'bearer token', 'token verification']
  },
  {
    canonicalName: 'Middleware',
    category: 'TECHNICAL',
    level: 'INTERMEDIATE',
    domain: 'Backend',
    aliases: ['middleware', 'cors', 'body-parser', 'error handler']
  },
  {
    canonicalName: 'Error Handling',
    category: 'TECHNICAL',
    level: 'INTERMEDIATE',
    domain: 'Backend',
    aliases: ['error handling', 'try catch', 'exception', 'logging', 'async errors']
  },

  // Database
  {
    canonicalName: 'MongoDB',
    category: 'TECHNICAL',
    level: 'INTERMEDIATE',
    domain: 'Database',
    aliases: ['mongodb', 'mongo', 'nosql', 'bson', 'document database']
  },
  {
    canonicalName: 'Mongoose',
    category: 'TECHNICAL',
    level: 'INTERMEDIATE',
    domain: 'Database',
    aliases: ['mongoose', 'schemas', 'aggregation pipeline', 'populate']
  },
  {
    canonicalName: 'Data Modeling',
    category: 'TECHNICAL',
    level: 'ADVANCED',
    domain: 'Database',
    aliases: ['data modeling', 'schema design', 'normalization', 'embedding vs referencing']
  },
  {
    canonicalName: 'Indexing',
    category: 'TECHNICAL',
    level: 'ADVANCED',
    domain: 'Database',
    aliases: ['indexing', 'compound index', 'b-tree', 'query optimization']
  },
  {
    canonicalName: 'SQL',
    category: 'TECHNICAL',
    level: 'INTERMEDIATE',
    domain: 'Database',
    aliases: ['sql', 'mysql', 'postgresql', 'relational database', 'joins', 'acid']
  },

  // Engineering
  {
    canonicalName: 'Git',
    category: 'TECHNICAL',
    level: 'FOUNDATIONAL',
    domain: 'Engineering',
    aliases: ['git', 'version control', 'github', 'branching', 'merge conflicts']
  },
  {
    canonicalName: 'Testing',
    category: 'TECHNICAL',
    level: 'INTERMEDIATE',
    domain: 'Engineering',
    aliases: ['testing', 'unit testing', 'jest', 'vitest', 'integration tests']
  },
  {
    canonicalName: 'Debugging',
    category: 'TECHNICAL',
    level: 'INTERMEDIATE',
    domain: 'Engineering',
    aliases: ['debugging', 'profiling', 'devtools', 'troubleshooting']
  },
  {
    canonicalName: 'Security',
    category: 'TECHNICAL',
    level: 'ADVANCED',
    domain: 'Engineering',
    aliases: ['security', 'xss', 'csrf', 'sql injection', 'cors', 'helmet']
  },
  {
    canonicalName: 'Performance Optimization',
    category: 'TECHNICAL',
    level: 'ADVANCED',
    domain: 'Engineering',
    aliases: ['performance optimization', 'caching', 'memoization', 'lazy loading', 'cdn']
  },
  {
    canonicalName: 'System Design',
    category: 'TECHNICAL',
    level: 'ADVANCED',
    domain: 'Engineering',
    aliases: ['system design', 'microservices', 'load balancer', 'scalability', 'message queue']
  },

  // Computer Science
  {
    canonicalName: 'Data Structures',
    category: 'TECHNICAL',
    level: 'INTERMEDIATE',
    domain: 'Computer Science',
    aliases: ['data structures', 'dsa', 'arrays', 'trees', 'linked lists', 'hash maps']
  },
  {
    canonicalName: 'Algorithms',
    category: 'TECHNICAL',
    level: 'INTERMEDIATE',
    domain: 'Computer Science',
    aliases: ['algorithms', 'sorting', 'binary search', 'dynamic programming', 'recursion']
  },
  {
    canonicalName: 'Object-Oriented Programming',
    category: 'TECHNICAL',
    level: 'INTERMEDIATE',
    domain: 'Computer Science',
    aliases: ['oop', 'object-oriented', 'polymorphism', 'inheritance', 'encapsulation']
  },
  {
    canonicalName: 'Operating Systems',
    category: 'TECHNICAL',
    level: 'INTERMEDIATE',
    domain: 'Computer Science',
    aliases: ['operating systems', 'processes', 'threads', 'concurrency', 'memory management']
  },
  {
    canonicalName: 'Computer Networks',
    category: 'TECHNICAL',
    level: 'INTERMEDIATE',
    domain: 'Computer Science',
    aliases: ['computer networks', 'tcp/ip', 'http', 'https', 'dns', 'websockets']
  },
  {
    canonicalName: 'Database Management Systems',
    category: 'TECHNICAL',
    level: 'INTERMEDIATE',
    domain: 'Computer Science',
    aliases: ['dbms', 'transactions', 'concurrency control', 'two-phase commit']
  }
];

export class SkillTaxonomyService {
  private static cache: Map<string, ISkill> = new Map();

  /**
   * Ensure the canonical skills exist in the database and return them as a map
   */
  public static async ensureCanonicalTaxonomy(): Promise<Map<string, ISkill>> {
    const existing = await Skill.find();
    const map = new Map<string, ISkill>();

    existing.forEach(s => {
      map.set(s.name.toLowerCase(), s);
    });

    for (const def of CANONICAL_MERN_TAXONOMY) {
      const lower = def.canonicalName.toLowerCase();
      if (!map.has(lower)) {
        const created = await Skill.create({
          name: def.canonicalName,
          category: def.category,
          level: def.level,
          domain: def.domain,
          prerequisites: []
        });
        map.set(lower, created);
      }
    }

    this.cache = map;
    return map;
  }

  /**
   * Find a canonical skill doc by exact name or alias.
   * Accurately prevents confusing related skills (e.g. JavaScript is not Java).
   */
  public static async findCanonicalSkill(text: string): Promise<ISkill | null> {
    const query = (text || '').trim().toLowerCase();
    if (!query) return null;

    if (this.cache.size === 0) {
      await this.ensureCanonicalTaxonomy();
    }

    // Direct match
    if (this.cache.has(query)) {
      return this.cache.get(query)!;
    }

    // Guard: Java vs JavaScript disambiguation
    if (query === 'java' || query.startsWith('java ')) {
      // Return null or Java skill if exists, but do NOT return JavaScript!
      const javaMatch = this.cache.get('java');
      return javaMatch || null;
    }

    // Search aliases
    for (const def of CANONICAL_MERN_TAXONOMY) {
      if (def.aliases.includes(query)) {
        const canonicalDoc = this.cache.get(def.canonicalName.toLowerCase());
        if (canonicalDoc) return canonicalDoc;
      }
    }

    // Database lookup fallback
    const dbSkill = await Skill.findOne({
      $or: [
        { name: new RegExp(`^${query}$`, 'i') },
        { domain: new RegExp(`^${query}$`, 'i') }
      ]
    });

    if (dbSkill) {
      this.cache.set(dbSkill.name.toLowerCase(), dbSkill);
      return dbSkill;
    }

    return null;
  }

  /**
   * Rule-based skill tagger from question text and keywords
   */
  public static async mapQuestionToSkills(
    questionText: string,
    keywords: string[] = []
  ): Promise<{
    primarySkillId?: mongoose.Types.ObjectId;
    secondarySkillIds: mongoose.Types.ObjectId[];
    skillTags: mongoose.Types.ObjectId[];
    mappingMethod: 'RULE_BASED';
  }> {
    if (this.cache.size === 0) {
      await this.ensureCanonicalTaxonomy();
    }

    const text = questionText.toLowerCase();
    const scoredSkills: { skill: ISkill; score: number }[] = [];
    const matchedIds = new Set<string>();

    for (const def of CANONICAL_MERN_TAXONOMY) {
      const canonicalDoc = this.cache.get(def.canonicalName.toLowerCase());
      if (!canonicalDoc) continue;

      let score = 0;

      // Disambiguate JavaScript from Java
      if (def.canonicalName === 'JavaScript') {
        if (/\bjavascript\b|\bjs\b|\bes6\b|\bclosure\b|\bevent loop\b/i.test(text)) {
          score += 5;
        }
      } else {
        // Test primary canonical name with word boundary
        const boundaryRegex = new RegExp(`\\b${def.canonicalName.toLowerCase()}\\b`, 'i');
        if (boundaryRegex.test(text)) {
          score += 5;
        }
      }

      // Test aliases
      for (const alias of def.aliases) {
        const aliasRegex = new RegExp(`\\b${alias.toLowerCase()}\\b`, 'i');
        if (aliasRegex.test(text)) {
          score += 3;
        }
      }

      // Check keywords
      for (const kw of keywords) {
        const lowerKw = kw.toLowerCase().trim();
        if (def.canonicalName.toLowerCase() === lowerKw || def.aliases.includes(lowerKw)) {
          score += 4;
        }
      }

      if (score > 0 && !matchedIds.has(canonicalDoc._id.toString())) {
        matchedIds.add(canonicalDoc._id.toString());
        scoredSkills.push({ skill: canonicalDoc, score });
      }
    }

    // Sort by score descending
    scoredSkills.sort((a, b) => b.score - a.score);

    if (scoredSkills.length === 0) {
      return {
        secondarySkillIds: [],
        skillTags: [],
        mappingMethod: 'RULE_BASED'
      };
    }

    const primarySkillId = scoredSkills[0].skill._id as mongoose.Types.ObjectId;
    const secondarySkillIds = scoredSkills.slice(1, 4).map(s => s.skill._id as mongoose.Types.ObjectId);
    const skillTags = scoredSkills.slice(0, 5).map(s => s.skill._id as mongoose.Types.ObjectId);

    return {
      primarySkillId,
      secondarySkillIds,
      skillTags,
      mappingMethod: 'RULE_BASED'
    };
  }
}
