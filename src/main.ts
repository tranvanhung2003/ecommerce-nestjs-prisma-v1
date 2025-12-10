import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import envConfig from './shared/config';
import { CustomUnprocessableEntityException } from './shared/helpers/helpers';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors) => {
        return new CustomUnprocessableEntityException(
          errors.map((error) => ({
            field: error.property,
            error: Object.values(error.constraints || {}).join(', '),
          })),
        );
      },
    }),
  );

  await app.listen(envConfig.PORT ?? 3000);
}
void bootstrap();
