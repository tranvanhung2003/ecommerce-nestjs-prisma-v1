import { Permission } from 'src/generated/prisma/client';
import z from 'zod';

// model Permission {
//   id          Int        @id @default(autoincrement())
//   name        String     @db.VarChar(500)
//   description String     @default("")
//   path        String     @db.VarChar(1000)
//   method      HTTPMethod
//   roles       Role[]

//   createdById Int?
//   createdBy   User? @relation("PermissionCreatedBy", fields: [createdById], references: [id], onDelete: SetNull, onUpdate: NoAction)
//   updatedById Int?
//   updatedBy   User? @relation("PermissionUpdatedBy", fields: [updatedById], references: [id], onDelete: SetNull, onUpdate: NoAction)
//   deletedById Int?
//   deletedBy   User? @relation("PermissionDeletedBy", fields: [deletedById], references: [id], onDelete: SetNull, onUpdate: NoAction)

//   deletedAt DateTime?
//   createdAt DateTime  @default(now())
//   updatedAt DateTime  @updatedAt

//   @@index([deletedAt])
// }

// Permission
export const PermissionSchema = z.object({
  id: z.number(),
  name: z.string().max(500),
  description: z.string().optional(),
}) satisfies z.ZodType<Permission>;
