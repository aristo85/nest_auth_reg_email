import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import {
  sendConfirmationEmail,
  sendForgotPasswordEmail,
} from 'src/core/config/nodemailer.config';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { ForgotPasswordDto } from '../users/dto/forgotPassword.user.dto';
import { PassUpdateUserDto } from '../users/dto/passUpdate-user.dto';
import { User } from '../users/models/user.model';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string) {
    // find if user exist with this email
    const user = await this.userService.findOneByEmail(email);
    if (!user) {
      return null;
    }

    // find if user password match
    const match = await this.comparePassword(pass, user.password);
    if (!match) {
      return null;
    }

    // tslint:disable-next-line: no-string-literal
    const { password, ...result } = user['_doc'];
    return result;
  }

  public async login(user) {
    const token = await this.generateToken(user);
    return { user, token };
  }

  public async createInactiveUser(user) {
    // hash the password
    const pass = await this.hashPassword(user.password);
    // create the user
    let doc = await this.userService.createInactiveUser({
      ...user,
      password: pass,
    });
    if (!doc) {
      throw new NotFoundException('something went wrong');
    }
    sendConfirmationEmail(doc.name, doc.email, doc.activationCode);
    return { success: true };
  }

  public async create(activationCode: number) {
    let dateNow = new Date().getTime();
    const inactiveUser = await this.userService.findInactiveUserByCode(
      activationCode,
    );
    if (!inactiveUser) {
      throw new NotFoundException('this inactive user doesnt exist');
    }
    // check the update time +15minutes
    if (dateNow > inactiveUser.updatedAt + 900000) {
      throw new ForbiddenException('activation code is expired');
    }
    // create the user
    const newUser = await this.userService.create(inactiveUser);
    // check if created then delete inactiveUser
    if (newUser) {
      await this.userService.deleteInactiveUser(inactiveUser.activationCode);
    }

    // tslint:disable-next-line: no-string-literal
    const { password, ...result } = newUser['_doc'];

    // generate token
    const token = await this.generateToken(result);

    // return the user and the token
    return { user: result, token };
  }

  public async createUserFromFacebook(userData: CreateUserDto) {
    const foundUser = await this.userService.findOneByEmail(userData.email);
    if (!foundUser) {
      let updatedAt = new Date().getTime();
      // create the user
      const newUser = await this.userService.create({ ...userData, updatedAt });

      // tslint:disable-next-line: no-string-literal
      const { password, ...result } = newUser['_doc'];

      // generate token
      const token = await this.generateToken(result);

      // return the user and the token
      return { user: result, token };
    } else {
      // create the user
      const updateUser = await this.userService.updateUserWithFB({
        email: foundUser.email,
        facebookData: userData.facebookData,
      });

      // tslint:disable-next-line: no-string-literal
      const { password, ...result } = updateUser['_doc'];

      // generate token
      const token = await this.generateToken(result);

      // return the user and the token
      return { user: result, token };
    }
  }

  public async forgotPassword(email: string) {
    // chek email
    const user = await this.userService.findOneByEmail(email);
    if (!user) {
      throw new NotFoundException("This user doesn't exist");
    }

    // return the updated app
    let doc = await this.userService.createForgotPasswordRequest(email);
    if (!doc) {
      throw new NotFoundException('something went wrong');
    }
    sendForgotPasswordEmail(doc.email, doc.resetCode);
    return { success: true };
  }

  public async confirmResetForgotPassword(resetCode: number) {
    let dateNow = new Date().getTime();
    const forgotPassUser = await this.userService.findForgotPasswordUserByCode(
      resetCode,
    );
    if (!forgotPassUser) {
      throw new NotFoundException('No user matches this reset code');
    }
    // check the update time +15minutes
    if (dateNow > forgotPassUser.updatedAt + 900000) {
      throw new ForbiddenException('reset code is expired');
    }
    return {
      success: true,
      email: forgotPassUser.email,
      resetCode: forgotPassUser.resetCode,
    };
  }

  public async resetForgotPassword(body: ForgotPasswordDto) {
    const { resetCode, email, newPassword } = body;
    const forgorPasswordUser =
      await this.userService.findForgotPasswordUserByCodeAndEmail(
        resetCode,
        email,
      );
    if (!forgorPasswordUser) {
      throw new ForbiddenException('reset code is expired');
    }
    // hash the password
    const pass = await this.hashPassword(newPassword);
    const updatedUser = await this.userService.updateForgotPassword(
      email,
      pass,
    );
    if (!updatedUser) {
      throw new NotFoundException('something went wrong');
    }
    // console.log(updatedUser)
    // return updatedUser
    // tslint:disable-next-line: no-string-literal
    const { password, ...result } = updatedUser['_doc'];

    // generate token
    const token = await this.generateToken(result);

    return { user: result, token };
  }

  public async updatePassword(user: User, pass: PassUpdateUserDto) {
    const foundUser = await this.userService.findOneById(user._id);
    // check old password
    const match = await this.comparePassword(
      pass.oldPassword,
      foundUser.password,
    );
    if (!match) {
      throw new ForbiddenException('wrong password');
    }
    // check new password
    const isNewTheSame = await this.comparePassword(
      pass.newPassword,
      foundUser.password,
    );
    if (isNewTheSame) {
      throw new ForbiddenException('New password is the old one!');
    }
    // hash the new password
    const hash = await this.hashPassword(pass.newPassword);
    const updatedUser = this.userService.updateForgotPassword(user.email, hash);
    if (!updatedUser) {
      throw new NotFoundException('something went wrong');
    }

    return updatedUser;
  }

  private async generateToken(user) {
    const token = await this.jwtService.signAsync(user);
    return token;
  }

  private async hashPassword(password) {
    const hash = await bcrypt.hash(password, 10);
    return hash;
  }

  private async comparePassword(enteredPassword, dbPassword) {
    const match = await bcrypt.compare(enteredPassword, dbPassword);
    return match;
  }
}
