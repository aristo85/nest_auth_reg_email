import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { sendConfirmationEmail } from 'src/core/config/nodemailer.config';
import { CreateUserDto } from './dto/create-user.dto';
import { InactiveUserDto } from './dto/inactive-user.dto';
import { InactiveUser } from './models/inactiveUser.model';
import { User } from './models/user.model';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<User>,
    @InjectModel('InactiveUser')
    private readonly inactiveUserModel: Model<InactiveUser>,
  ) {}

  async createInactiveUser(inactiveUser: InactiveUserDto) {
    // create random code
    const randomCode = Math.floor(Math.random() * 10000);
    let date = new Date().getTime();

    let doc = await this.inactiveUserModel.findOneAndUpdate(
      { email: inactiveUser.email },
      { ...inactiveUser, activationCode: randomCode, updatedAt: date },
      {
        new: true,
        upsert: true, // Make this update into an upsert
      },
    );
    if (!doc) {
      throw new NotFoundException('something went wrong');
    }
    sendConfirmationEmail(doc.name, doc.email, doc.activationCode);

    return doc;
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

  async findOneByEmail(email: string): Promise<User> {
    return await this.userModel.findOne({ email: email }).exec();
  }

  async findOneById(id: number): Promise<User> {
    return await this.userModel.findById(id).exec();
  }

  async findInactiveUserByCode(activationCode: number): Promise<InactiveUser> {
    return await this.inactiveUserModel.findOne({ activationCode }).exec();
  }

  async deleteInactiveUser(activationCode: number): Promise<InactiveUser> {
    return await this.inactiveUserModel
      .findOneAndRemove({ activationCode })
      .exec();
  }
}
