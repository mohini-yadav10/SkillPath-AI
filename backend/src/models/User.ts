import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  role: 'STUDENT' | 'ALUMNI' | 'ADMIN';
  firstName: string;
  lastName: string;
  currentCompany?: string;
  currentJobTitle?: string;
  bio?: string;
  matchPassword(enteredPassword: string): Promise<boolean>;
}

const userSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['STUDENT', 'ALUMNI', 'ADMIN'],
      default: 'STUDENT',
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    currentCompany: { type: String },
    currentJobTitle: { type: String },
    bio: { type: String },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.matchPassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

// Encrypt password before saving
userSchema.pre('save', async function(this: any) {
  if (!this.isModified('passwordHash')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
});

const User = mongoose.model<IUser>('User', userSchema);

export default User;
