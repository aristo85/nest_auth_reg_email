import * as mongoose from 'mongoose';

export const InactiveUserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  gender: { type: String, required: true },
  activationCode: { type: Number, required: true },
  updatedAt: { type: Number, required: true },
});

export interface InactiveUser {
  name: string;
  email: string;
  password: string;
  gender: string;
  activationCode: number;
  updatedAt: number;
}
