import { ForbiddenException, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { UserEntity } from '../user/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../user/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByCond({
      email,
      password,
    });
    if (user && user.password === password) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  generateJwtToken(data: { id: number; email: string }) {
    const payload = { email: data.email, id: data.id };
    return this.jwtService.sign(payload);
  }

  async login(user: UserEntity) {
    try {
      const { password, ...userData } = user;
      const payload = { email: user.email, sub: user.id };
      return {
        ...userData,
        token: this.generateJwtToken(userData),
      };
    } catch (e) {
      throw new ForbiddenException('Ошибка при Авторизации');
    }
  }

  async register(dto: CreateUserDto) {
    try {
      const { password, ...userData } = await this.usersService.create({
        email: dto.email,
        fullName: dto.fullName,
        password: dto.password,
      });
      return {
        ...userData,
        token: this.generateJwtToken(userData),
      };
    } catch (e) {
      throw new ForbiddenException('Ошибка при регистрации');
    }
  }
}
