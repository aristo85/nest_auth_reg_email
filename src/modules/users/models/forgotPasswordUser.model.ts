import * as mongoose from 'mongoose';

export const ForgotPasswordUserSchema = new mongoose.Schema({
  email: { type: String, required: true },
  resetCode: { type: Number, required: true },
  updatedAt: { type: Number, required: true },
});

export interface ForgotPasswordUser {
  email: string;
  resetCode: number;
  updatedAt: number;
}
