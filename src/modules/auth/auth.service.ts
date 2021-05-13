import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
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
    const newUser = await this.userService.createInactiveUser({
      ...user,
      password: pass,
    });

    // return the user and the token
    return { user: newUser };
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
