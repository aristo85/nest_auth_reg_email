import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  sendConfirmationEmail,
  sendForgotPasswordEmail,
} from 'src/core/config/nodemailer.config';
import { InactiveUser } from './models/inactiveUser.model';
import { User } from './models/user.model';
import { ForgotPasswordUser } from './models/forgotPasswordUser.model';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<User>,
    @InjectModel('InactiveUser')
    private readonly inactiveUserModel: Model<InactiveUser>,
    @InjectModel('ForgotPasswordUser')
    private readonly forgotPasswordUserModel: Model<ForgotPasswordUser>,
  ) {}

  async createInactiveUser(inactiveUser: InactiveUser) {
    // create random code
    const randomCode = Math.floor(Math.random() * 10000);
    let date = new Date().getTime();
    return await this.inactiveUserModel.findOneAndUpdate(
      { email: inactiveUser.email },
      { ...inactiveUser, activationCode: randomCode, updatedAt: date },
      {
        new: true,
        upsert: true, // Make this update into an upsert
      },
    );
  }

  async create(inactiveUser): Promise<User> {
    const { name, email, password, gender, updatedAt } = inactiveUser;
    // activate account
    const newUser = new this.userModel({
      name,
      email,
      password,
      gender,
      updatedAt,
    });
    return await newUser.save();
  }

  async createForgotPasswordRequest(email: string) {
    // create random code
    const randomCode = Math.floor(Math.random() * 10000);
    let date = new Date().getTime();
    return await this.forgotPasswordUserModel.findOneAndUpdate(
      { email },
      { email, resetCode: randomCode, updatedAt: date },
      {
        new: true,
        upsert: true, // Make this update into an upsert
      },
    );
  }

  async updateForgotPassword(email: string, password: string) {
    let date = new Date().getTime();
    return await this.userModel.findOneAndUpdate(
      { email },
      { email, password, updatedAt: date },
      { new: true },
    );
  }

  async findOneByEmail(email: string): Promise<User> {
    return await this.userModel.findOne({ email: email }).exec();
  }

  async findOneById(id: number): Promise<User> {
    return await this.userModel.findById(id).exec();
  }

  async findInactiveUserByCode(activationCode: number): Promise<InactiveUser> {
    return await this.inactiveUserModel.findOne({ activationCode }).exec();
  }

  async findForgotPasswordUserByCode(
    resetCode: number,
  ): Promise<ForgotPasswordUser> {
    return await this.forgotPasswordUserModel.findOne({ resetCode }).exec();
  }

  async findForgotPasswordUserByCodeAndEmail(
    resetCode: number,
    email: string,
  ): Promise<ForgotPasswordUser> {
    return await this.forgotPasswordUserModel
      .findOne({ resetCode, email })
      .exec();
  }

  async deleteInactiveUser(activationCode: number): Promise<InactiveUser> {
    return await this.inactiveUserModel
      .findOneAndRemove({ activationCode })
      .exec();
  }

  async clearExpireInactiveUser() {
    const currentDate = new Date().getTime() - 900000;
    return await this.inactiveUserModel.deleteMany({
      updatedAt: { $lt: currentDate },
    });
  }
}
