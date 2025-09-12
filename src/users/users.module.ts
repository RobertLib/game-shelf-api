import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersResolver } from './resolvers/users.resolver';
import { UsersPublicResolver } from './resolvers/users-public.resolver';
import { UsersAuthorizationResolver } from './resolvers/users-authorization.resolver';
import { User } from './entities/user.entity';
import { AuthModule } from '../auth/auth.module';
import { PaginationService } from '../common/pagination';
import { PoliciesModule } from '../policies/policies.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    forwardRef(() => AuthModule),
    PoliciesModule,
  ],
  providers: [
    UsersService,
    UsersResolver,
    UsersPublicResolver,
    UsersAuthorizationResolver,
    PaginationService,
  ],
  exports: [UsersService],
})
export class UsersModule {}
