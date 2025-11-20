import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { RegisterDto, LoginDto, RefreshTokenDto } from './dto';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from './strategies/jwt-payload.interface';
import { Logger } from '@nestjs/common';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
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
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Get default role (Waiter as default for new registrations)
    const defaultRole = await this.prismaService.role.findFirst({
      where: { name: 'WAITER' },
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
        isActive: true,
      },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    const permissions = newUser.role.permissions.map(
      (rp) => rp.permission.name,
    );

    return {
      code: 200,
      message: 'User registered successfully',
      data: {
        id: newUser.id,
        name: newUser.name,
        username: newUser.username,
        role: {
          name: newUser.role.name,
          displayName: newUser.role.displayName,
        },
        permissions,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;

    // Find user by username with role and permissions
    const user = await this.db.findUnique({
      where: { username },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid username or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is inactive');
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid username or password');
    }

    // Generate JWT tokens with user info
    const payload: JwtPayload = {
      userId: user.id,
      username: user.username,
      role: user.role.name,
    };
    const accessToken = this.jwtService.sign(payload);

    // Generate refresh token with longer expiry
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d', // Refresh token valid for 7 days
    });

    // Get user permissions
    const permissions = user.role.permissions.map((rp) => rp.permission.name);

    return {
      code: 200,
      message: 'Login successful',
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
          role: {
            name: user.role.name,
            displayName: user.role.displayName,
          },
          permissions,
        },
      },
    };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    const { refreshToken } = refreshTokenDto;

    try {
      // Verify the refresh token
      const decoded = this.jwtService.verify<JwtPayload>(refreshToken);

      // Find user to ensure they still exist and are active
      const user = await this.db.findUnique({
        where: { id: decoded.userId },
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('User not found or inactive');
      }

      // Generate new access token
      const payload: JwtPayload = {
        userId: user.id,
        username: user.username,
        role: user.role.name,
      };
      const newAccessToken = this.jwtService.sign(payload);

      return {
        code: 200,
        message: 'Token refreshed successfully',
        data: {
          accessToken: newAccessToken,
        },
      };
    } catch (error) {
      this.logger.error('Refresh token error:', error);
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }
}
