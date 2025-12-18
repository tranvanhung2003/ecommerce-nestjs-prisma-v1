import { ClassProvider, Global, Module, Type } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ZodSerializerInterceptor } from 'nestjs-zod';
import { CatchEverythingFilter } from './filters/catch-everything.filter';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { AccessTokenGuard } from './guards/access-token.guard';
import { ApiKeyGuard } from './guards/api-key.guard';
import { AuthenticationGuard } from './guards/authentication.guard';
import { TransformInterceptor } from './interceptors/transform.interceptor';
import { CustomZodValidationPipe } from './pipes/custom-zod-validation.pipe';
import { SharedUserRepository } from './repositories/shared-user.repository';
import { EmailService } from './services/email.service';
import { HashingService } from './services/hashing.service';
import { PrismaService } from './services/prisma.service';
import { TokenService } from './services/token.service';

// Shared services to be exported
const sharedServices: Type[] = [
  PrismaService,
  HashingService,
  TokenService,
  SharedUserRepository,
  EmailService,
];

// Services provided but not exported
const provideOnlyServices: Type[] = [AccessTokenGuard, ApiKeyGuard];

// Global guards
const sharedAppGuards: Type[] = [AuthenticationGuard];

// Global interceptors
const sharedAppInterceptors: Type[] = [
  TransformInterceptor,
  ZodSerializerInterceptor,
];

// Global pipes
const sharedAppPipes: Type[] = [CustomZodValidationPipe];

// Global filters
const sharedAppFilters: Type[] = [CatchEverythingFilter, HttpExceptionFilter];

//

//

//

//

//

// Register global guards
const appGuards: ClassProvider[] = sharedAppGuards.map((guard) => ({
  provide: APP_GUARD,
  useClass: guard,
}));

// Register global interceptors
const appInterceptors: ClassProvider[] = sharedAppInterceptors.map(
  (interceptor) => ({
    provide: APP_INTERCEPTOR,
    useClass: interceptor,
  }),
);

// Register global pipes
const appPipes: ClassProvider[] = sharedAppPipes.map((pipe) => ({
  provide: APP_PIPE,
  useClass: pipe,
}));

// Register global filters
const appFilters: ClassProvider[] = sharedAppFilters.map((filter) => ({
  provide: APP_FILTER,
  useClass: filter,
}));

@Global()
@Module({
  imports: [JwtModule],
  providers: [
    ...sharedServices,
    ...provideOnlyServices,
    ...appGuards,
    ...appInterceptors,
    ...appPipes,
    ...appFilters,
  ],
  exports: [...sharedServices],
})
export class SharedModule {}
