import { ClassProvider, Global, Module, Type } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ZodSerializerInterceptor } from 'nestjs-zod';
import { AccessTokenGuard } from './guards/access-token.guard';
import { ApiKeyGuard } from './guards/api-key.guard';
import { AuthenticationGuard } from './guards/authentication.guard';
import { TransformInterceptor } from './interceptors/transform.interceptor';
import { CustomZodValidationPipe } from './pipes/custom-zod-validation.pipe';
import { HashingService } from './services/hashing.service';
import { PrismaService } from './services/prisma.service';
import { TokenService } from './services/token.service';

// Shared services to be exported
const sharedServices: Type[] = [PrismaService, HashingService, TokenService];

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

@Global()
@Module({
  imports: [JwtModule],
  providers: [
    ...sharedServices,
    ...provideOnlyServices,
    ...appGuards,
    ...appInterceptors,
    ...appPipes,
  ],
  exports: [...sharedServices],
})
export class SharedModule {}
