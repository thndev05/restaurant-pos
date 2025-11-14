import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from './strategies/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  private get db() {
    return this.prismaService.user;
  }

  async register(registerDto: RegisterDto) {
    const { name, username, password } = registerDto;

    // Check if username already exists
    const existingUser = await this.db.findUnique({
      where: { username },
    });

    if (existingUser) {
      throw new BadRequestException('Username already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    // Get default role (assuming role with name 'user' exists)
    const defaultRole = await this.prismaService.role.findFirst({
      where: { name: 'staff' },
    });

    if (!defaultRole) {
      throw new BadRequestException('Default role not found');
    }

    // Create new user
    const newUser = await this.db.create({
      data: {
        name,
        username,
        password: hashedPassword,
        roleId: defaultRole.id,
      },
      include: { role: true },
    });

    return {
      code: 200,
      message: 'User registered successfully',
      data: {
        id: newUser.id,
        name: newUser.name,
        username: newUser.username,
        role: newUser.role.name,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;

    // Find user by username
    const user = await this.db.findUnique({
      where: { username },
      include: { role: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid username or password');
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid username or password');
    }

    // Generate JWT token
    const payload: JwtPayload = { username };
    const accessToken = this.jwtService.sign(payload);

    return {
      code: 200,
      message: 'Login successful',
      data: {
        accessToken
      },
    };
  }
}
