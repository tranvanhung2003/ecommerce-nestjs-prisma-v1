import envConfig from 'src/shared/config';
import { RoleName } from 'src/shared/constants/role.constant';
import { HashingService } from 'src/shared/services/hashing.service';
import { PrismaService } from 'src/shared/services/prisma.service';

const main = async () => {
  const prisma = new PrismaService();
  const roleCount = await prisma.role.count();

  if (roleCount > 0) {
    throw new Error('Roles already exist in the database. Seeding aborted.');
  }

  const roles = await prisma.role.createMany({
    data: [
      {
        name: RoleName.ADMIN,
        description: 'Admin role',
      },
      {
        name: RoleName.CLIENT,
        description: 'Client role',
      },
      {
        name: RoleName.SELLER,
        description: 'Seller role',
      },
    ],
  });

  const adminRole = await prisma.role.findFirstOrThrow({
    where: {
      name: RoleName.ADMIN,
    },
  });

  const hashingService = new HashingService();
  const hashedPassword = await hashingService.hash(envConfig.ADMIN_PASSWORD);

  const adminUser = await prisma.user.create({
    data: {
      email: envConfig.ADMIN_EMAIL,
      password: hashedPassword,
      name: envConfig.ADMIN_NAME,
      phoneNumber: envConfig.ADMIN_PHONE_NUMBER,
      roleId: adminRole.id,
    },
  });

  return {
    createdRoleCount: roles.count,
    adminUser,
  };
};

void (async () => {
  try {
    const { createdRoleCount, adminUser } = await main();
    console.log(`Successfully created ${createdRoleCount} roles.`);
    console.log(`Admin user created with email: ${adminUser.email}`);
    process.exit(0);
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
})();
