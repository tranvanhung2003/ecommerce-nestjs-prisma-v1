import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from 'src/app.module';
import { HTTPMethod } from 'src/generated/prisma/enums';
import { PrismaService } from 'src/shared/services/prisma.service';

async function main() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  await app.listen(3010);
  const server = app.getHttpAdapter().getInstance();
  const router = server.router;

  const availableRoutes: { name: string; path: string; method: HTTPMethod }[] =
    router.stack
      .map((layer) => {
        if (layer.route) {
          const path = layer.route?.path;
          const method =
            layer.route?.stack[0].method.toUpperCase() as HTTPMethod;

          return {
            name: `${method}: ${path}`,
            path,
            method,
          };
        }
      })
      .filter((item) => item !== undefined);

  const prisma = new PrismaService();

  const result = await prisma.permission.createMany({
    data: availableRoutes,
    skipDuplicates: true,
  });

  return {
    createdPermissionCount: result.count,
  };
}

void (async () => {
  try {
    const { createdPermissionCount } = await main();

    console.log(`Tạo thành công ${createdPermissionCount} quyền.`);

    process.exit(0);
  } catch (error) {
    console.error('Lỗi trong quá trình khởi tạo quyền:', error);

    process.exit(1);
  }
})();
