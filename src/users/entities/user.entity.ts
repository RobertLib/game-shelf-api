import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ObjectType, Field, HideField } from '@nestjs/graphql';
import { Exclude } from 'class-transformer';
import { UserRole } from '../enums/user-role.enum';
import { createConnectionType, createEdgeType } from '../../common/pagination';

@ObjectType()
@Entity('users')
export class User {
  @Field(() => String)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ unique: true })
  email: string;

  @HideField()
  @Column()
  @Exclude()
  password: string;

  @Field(() => UserRole)
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Field()
  @Column({ default: false })
  isVerified: boolean;

  @HideField()
  @Column({ type: 'varchar', nullable: true })
  @Exclude()
  verificationToken: string | null;

  @HideField()
  @Column({ type: 'varchar', nullable: true })
  @Exclude()
  resetPasswordToken: string | null;

  @HideField()
  @Column({ type: 'timestamp', nullable: true })
  @Exclude()
  resetPasswordExpires: Date | null;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}

// Pagination types for GraphQL
export const UserEdge = createEdgeType(User);
export type UserEdge = InstanceType<typeof UserEdge>;

@ObjectType()
export class UserConnection extends createConnectionType(User) {}
