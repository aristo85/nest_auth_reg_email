import * as mongoose from 'mongoose';

export const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  gender: { type: String, required: true },
  updatedAt: { type: Number, required: true },
});

export interface User {
  _id: number;
  name: string;
  email: string;
  password: string;
  gender: string;
  updatedAt: number;
}
