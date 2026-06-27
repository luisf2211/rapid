/*
  Seed inicial para Supabase (PostgreSQL).
  Crea el usuario administrador de plataforma si no existe.

  Ejecutar después de: npx prisma db push
    node scripts/supabase-seed.mjs
*/

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const PLATFORM_ADMIN_EMAIL =
  process.env.PLATFORM_ADMIN_EMAIL ?? "admin@rapid.local";
const PLATFORM_ADMIN_PASSWORD =
  process.env.PLATFORM_ADMIN_PASSWORD ?? "123";

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.user.findUnique({
    where: { email: PLATFORM_ADMIN_EMAIL },
  });

  if (existing) {
    console.log(`Usuario admin ya existe: ${PLATFORM_ADMIN_EMAIL}`);
    return;
  }

  const passwordHash = await bcrypt.hash(PLATFORM_ADMIN_PASSWORD, 10);
  await prisma.user.create({
    data: {
      email: PLATFORM_ADMIN_EMAIL,
      passwordHash,
      fullName: "Administrador plataforma",
      role: "PLATFORM_ADMIN",
      companyId: null,
      isActive: true,
    },
  });

  console.log("Seed completado.");
  console.log(`  Correo: admin  o  ${PLATFORM_ADMIN_EMAIL}`);
  console.log(`  Contraseña: ${PLATFORM_ADMIN_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
