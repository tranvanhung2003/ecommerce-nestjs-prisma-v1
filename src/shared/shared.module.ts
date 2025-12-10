import {
  ClassProvider,
  ClassSerializerInterceptor,
  Global,
  Module,
  Type,
} from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { AccessTokenGuard } from './guards/access-token.guard';
import { ApiKeyGuard } from './guards/api-key.guard';
import { AuthenticationGuard } from './guards/authentication.guard';
import { TransformInterceptor } from './interceptors/transform.interceptor';
import { HashingService } from './services/hashing.service';
import { PrismaService } from './services/prisma.service';
import { TokenService } from './services/token.service';

const sharedServices: Type[] = [PrismaService, HashingService, TokenService];

const provideOnlyServices: Type[] = [AccessTokenGuard, ApiKeyGuard];

const sharedAppGuards: Type[] = [AuthenticationGuard];

// ClassSerializerInterceptor must be last to ensure proper serialization
// ClassSerializerInterceptor phải nằm ở cuối cùng để đảm bảo việc tuần tự hóa đúng cách
const sharedAppInterceptors: Type[] = [
  TransformInterceptor,
  ClassSerializerInterceptor,
];

// Provide guards and interceptors as global providers
const appGuards: ClassProvider[] = sharedAppGuards.map((guard) => ({
  provide: APP_GUARD,
  useClass: guard,
}));

const appInterceptors: ClassProvider[] = sharedAppInterceptors.map(
  (interceptor) => ({
    provide: APP_INTERCEPTOR,
    useClass: interceptor,
  }),
);

@Global()
@Module({
  imports: [JwtModule],
  providers: [
    ...sharedServices,
    ...provideOnlyServices,
    ...appGuards,
    ...appInterceptors,
  ],
  exports: [...sharedServices],
})
export class SharedModule {}
