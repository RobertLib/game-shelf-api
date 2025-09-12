import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserConnection } from './entities/user.entity';
import { UserCreateInput } from './inputs/user-create.input';
import { UserUpdateInput } from './inputs/user-update.input';
import { UserDestroyInput } from './inputs/user-destroy.input';
import { UsersArgs } from './args/users.args';
import { UserRole } from './enums/user-role.enum';
import { PaginationService } from '../common/pagination';

const SALT_ROUNDS = 10;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private paginationService: PaginationService,
  ) {}

  async createUser(
    createUserInput: UserCreateInput,
    role?: UserRole,
  ): Promise<User> {
    const { email, password } = createUserInput;

    // Use role from input if available, otherwise use provided role, default to USER
    const userRole =
      'role' in createUserInput && createUserInput.role
        ? createUserInput.role
        : role || UserRole.USER;

    // Check if user already exists
    const existingUser = await this.usersRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create new user
    const user = this.usersRepository.create({
      email,
      password: hashedPassword,
      role: userRole,
      isVerified: createUserInput.isVerified ?? false,
      verificationToken: createUserInput.verificationToken ?? null,
    });

    return await this.usersRepository.save(user);
  }

  async findOne(id: string): Promise<User> {
    const numericId = parseInt(id, 10);

    if (!id || isNaN(numericId) || numericId <= 0) {
      throw new NotFoundException('Invalid user ID');
    }

    const user = await this.usersRepository.findOne({
      where: { id: numericId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.usersRepository.findOne({
      where: { email },
    });
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    return await bcrypt.compare(password, user.password);
  }

  async findAll(args: UsersArgs): Promise<UserConnection> {
    const { filter, sort } = args;

    let queryBuilder = this.usersRepository.createQueryBuilder('entity');

    // Apply email filter if provided
    if (filter?.email) {
      queryBuilder = queryBuilder.where('entity.email ILIKE :email', {
        email: `%${filter.email}%`,
      });
    }

    // Apply email sorting if specified
    if (sort?.email) {
      queryBuilder = queryBuilder.orderBy('entity.email', sort.email);
      queryBuilder = queryBuilder.addOrderBy('entity.id', 'ASC');
    }

    // Create filter function for total count
    const filterConditions = filter?.email
      ? (qb: SelectQueryBuilder<User>) =>
          qb.where('entity.email ILIKE :email', {
            email: `%${filter.email}%`,
          })
      : undefined;

    const result = await this.paginationService.paginate(
      queryBuilder,
      args,
      this.usersRepository,
      filterConditions,
    );

    return {
      edges: result.edges.map((edge) => ({
        node: edge.node,
        cursor: edge.cursor,
      })),
      nodes: result.nodes,
      pageInfo: result.pageInfo,
      totalCount: result.totalCount,
    };
  }

  async updateUser(id: number, updateData: Partial<User>): Promise<User>;
  async updateUser(input: UserUpdateInput): Promise<User>;
  async updateUser(
    idOrInput: number | UserUpdateInput,
    updateData?: Partial<User>,
  ): Promise<User> {
    if (typeof idOrInput === 'number') {
      // Direct update with id and data
      const user = await this.usersRepository.findOne({
        where: { id: idOrInput },
      });
      if (!user) {
        throw new NotFoundException(`User with ID ${idOrInput} not found`);
      }

      Object.assign(user, updateData);
      return await this.usersRepository.save(user);
    } else {
      // GraphQL input style
      const input = idOrInput;
      const {
        id,
        email,
        password,
        role,
        isVerified,
        verificationToken,
        resetPasswordToken,
        resetPasswordExpires,
      } = input;

      const user = await this.findOne(id);

      if (email) {
        // Check if email is already taken by another user
        const existingUser = await this.usersRepository.findOne({
          where: { email },
        });

        if (existingUser && existingUser.id !== parseInt(id, 10)) {
          throw new ConflictException('User with this email already exists');
        }
        user.email = email;
      }

      if (password) {
        user.password = await bcrypt.hash(password, SALT_ROUNDS);
      }

      if (role) {
        user.role = role;
      }

      if (typeof isVerified === 'boolean') {
        user.isVerified = isVerified;
      }

      if (verificationToken !== undefined) {
        user.verificationToken = verificationToken;
      }

      if (resetPasswordToken !== undefined) {
        user.resetPasswordToken = resetPasswordToken;
      }

      if (resetPasswordExpires !== undefined) {
        user.resetPasswordExpires = resetPasswordExpires;
      }

      return await this.usersRepository.save(user);
    }
  }

  async findByResetToken(token: string): Promise<User | null> {
    return await this.usersRepository.findOne({
      where: { resetPasswordToken: token },
    });
  }

  async findByVerificationToken(token: string): Promise<User | null> {
    return await this.usersRepository.findOne({
      where: { verificationToken: token },
    });
  }

  async destroy(input: UserDestroyInput): Promise<User> {
    const user = await this.findOne(input.id);
    await this.usersRepository.remove(user);
    return user;
  }
}
