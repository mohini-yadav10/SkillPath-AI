import { describe, it, expect } from 'vitest';
import mongoose from 'mongoose';
import User from '../models/User';
import Skill from '../models/Skill';

describe('Database Models', () => {
  it('should create a User model instance', () => {
    const user = new User({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      passwordHash: 'password123',
      role: 'STUDENT'
    });
    
    expect(user.firstName).toBe('John');
    expect(user.email).toBe('john@example.com');
    expect(user.role).toBe('STUDENT');
  });

  it('should create a Skill model instance', () => {
    const skill = new Skill({
      name: 'React',
      category: 'TECHNICAL',
      description: 'Frontend framework'
    });
    
    expect(skill.name).toBe('React');
    expect(skill.category).toBe('TECHNICAL');
  });
});
