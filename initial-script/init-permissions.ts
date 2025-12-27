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

  const availablePermissions: {
    name: string;
    path: string;
    method: HTTPMethod;
  }[] = router.stack
    .map((layer) => {
      if (layer.route) {
        const path = layer.route?.path;
        const method = layer.route?.stack[0].method.toUpperCase() as HTTPMethod;

        return {
          name: `${method}: ${path}`,
          path,
          method,
        };
      }
    })
    .filter((item) => item !== undefined);

  // ----------------------------------------------------------------------------------------------------

  const prisma = new PrismaService();

  const permissionsInDb = await prisma.permission.findMany({
    where: {
      deletedAt: null,
    },
  });

  // Lọc ra các quyền cần thêm mới và các quyền cần loại bỏ
  const permissionsToAdd = availablePermissions.filter((ap) => {
    return !permissionsInDb.some(
      (pd) => pd.path === ap.path && pd.method === ap.method,
    );
  });

  const permissionsToRemove = permissionsInDb.filter((pd) => {
    return !availablePermissions.some(
      (ap) => ap.path === pd.path && ap.method === pd.method,
    );
  });

  let addedCount = 0;
  let removedCount = 0;

  // Thêm các quyền mới
  if (permissionsToAdd.length > 0) {
    const result = await prisma.permission.createMany({
      data: permissionsToAdd,
      skipDuplicates: true,
    });

    addedCount = result.count;
  }

  // Xoá các quyền không còn sử dụng
  if (permissionsToRemove.length > 0) {
    const idsToRemove = permissionsToRemove.map((p) => p.id);

    const result = await prisma.permission.deleteMany({
      where: {
        id: {
          in: idsToRemove,
        },
      },
    });

    removedCount = result.count;
  }

  return {
    addedCount,
    removedCount,
  };
}

void (async () => {
  try {
    const { addedCount, removedCount } = await main();

    console.log(
      `Quá trình khởi tạo quyền hoàn tất. Đã thêm: ${addedCount}, Đã xoá: ${removedCount}`,
    );

    process.exit(0);
  } catch (error) {
    console.error('Lỗi trong quá trình khởi tạo quyền:', error);

    process.exit(1);
  }
})();
