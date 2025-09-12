import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyAccountDto } from './dto/verify-account.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { User } from '../users/entities/user.entity';
import { JwtPayload } from './strategies/jwt.strategy';
import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await this.usersService.validatePassword(user, password))) {
      return user;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isVerified) {
      throw new UnauthorizedException('Please verify your account first');
    }

    const payload: JwtPayload = { sub: user.id.toString(), email: user.email };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    try {
      // Generate verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');

      // Convert RegisterDto to UserCreateInput format
      const createUserInput = {
        email: registerDto.email,
        password: registerDto.password,
        isVerified: false,
        verificationToken,
        // No role specified for registration, will default to USER
      };
      const user = await this.usersService.createUser(createUserInput);

      // TODO: Send verification email here
      console.log(`Verification token for ${user.email}: ${verificationToken}`);

      return {
        message:
          'Registration successful. Please check your email to verify your account.',
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      };
    } catch (error) {
      // Re-throw ConflictException and other known NestJS exceptions
      if (
        error instanceof ConflictException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }

      // Check for TypeORM and validation errors by name
      if (error && typeof error === 'object' && 'name' in error) {
        const errorName = (error as { name: string }).name;
        if (
          errorName === 'ValidationError' ||
          errorName === 'QueryFailedError'
        ) {
          throw error;
        }
      }

      // For truly unknown errors, log them and throw a generic message to avoid leaking sensitive info
      console.error('Unexpected error during registration:', error);
      throw new UnauthorizedException('Registration failed');
    }
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.usersService.findByEmail(forgotPasswordDto.email);
    if (!user) {
      // Don't reveal if the email exists or not for security reasons
      return { message: 'If the email exists, a reset link has been sent.' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour from now

    await this.usersService.updateUser(user.id, {
      resetPasswordToken: resetToken,
      resetPasswordExpires: resetExpires,
    });

    // TODO: Send reset password email here
    console.log(`Reset token for ${user.email}: ${resetToken}`);

    return { message: 'If the email exists, a reset link has been sent.' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const user = await this.usersService.findByResetToken(resetPasswordDto.key);
    if (
      !user ||
      !user.resetPasswordExpires ||
      user.resetPasswordExpires < new Date()
    ) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(resetPasswordDto.password, 10);

    await this.usersService.updateUser(user.id, {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });

    return { message: 'Password has been reset successfully' };
  }

  async verifyAccount(verifyAccountDto: VerifyAccountDto) {
    const user = await this.usersService.findByVerificationToken(
      verifyAccountDto.key,
    );
    if (!user) {
      throw new BadRequestException('Invalid verification token');
    }

    const hashedPassword = await bcrypt.hash(verifyAccountDto.password, 10);

    await this.usersService.updateUser(user.id, {
      password: hashedPassword,
      isVerified: true,
      verificationToken: null,
    });

    return { message: 'Account has been verified successfully' };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    try {
      const decoded = this.jwtService.verify<{ email?: string }>(
        refreshTokenDto.refreshToken,
      );

      // Type guard to ensure payload has required properties
      if (
        !decoded ||
        typeof decoded !== 'object' ||
        !('email' in decoded) ||
        typeof decoded.email !== 'string'
      ) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const user = await this.usersService.findByEmail(decoded.email);

      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const newPayload: JwtPayload = {
        sub: user.id.toString(),
        email: user.email,
      };
      const accessToken = this.jwtService.sign(newPayload);
      const refreshToken = this.jwtService.sign(newPayload, {
        expiresIn: '7d',
      });

      return {
        accessToken,
        refreshToken,
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  logout() {
    // For stateless JWT, logout is handled on the client side
    // In a more complex setup, you might want to maintain a blacklist of tokens
    return { message: 'Logged out successfully' };
  }
}
