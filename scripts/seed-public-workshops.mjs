/*
  Seed de talleres públicos para el portal de clientes (/cotizar).
  Crea/actualiza las empresas visibles en el selector de talleres.
  Bear Jack queda destacado de primero (publicRank = 1).

  Cada empresa creada incluye un usuario administrador de taller para
  que el dueño pueda entrar al portal de negocios y ver las solicitudes.

  Ejecutar después de: npx prisma db push
    node scripts/seed-public-workshops.mjs
*/

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEFAULT_PASSWORD = process.env.WORKSHOP_SEED_PASSWORD ?? "123";

const WORKSHOPS = [
  {
    name: "Bear Jack",
    slug: "bear-jack",
    publicRank: 1,
    publicCity: "Santo Domingo",
    publicTagline: "Pintura automotriz y detailing premium",
    publicPhone: "829-508-2211",
    logoUrl: null,
    adminEmail: "taller@bearjack.do",
  },
  {
    name: "AutoColor RD",
    slug: "autocolor-rd",
    publicRank: 10,
    publicCity: "Santiago",
    publicTagline: "Latonería y pintura con garantía",
    publicPhone: "809-000-0000",
    logoUrl: null,
    adminEmail: "taller@autocolor.do",
  },
  {
    name: "Detailing Pro",
    slug: "detailing-pro",
    publicRank: 20,
    publicCity: "Santo Domingo Este",
    publicTagline: "Car detailing y protección de pintura",
    publicPhone: "809-111-1111",
    logoUrl: null,
    adminEmail: "taller@detailingpro.do",
  },
];

async function upsertWorkshop(w) {
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  const company = await prisma.company.upsert({
    where: { slug: w.slug },
    update: {
      name: w.name,
      isActive: true,
      isPublicForQuotes: true,
      publicRank: w.publicRank,
      publicCity: w.publicCity,
      publicTagline: w.publicTagline,
      publicPhone: w.publicPhone,
      logoUrl: w.logoUrl,
    },
    create: {
      name: w.name,
      slug: w.slug,
      isActive: true,
      isPublicForQuotes: true,
      publicRank: w.publicRank,
      publicCity: w.publicCity,
      publicTagline: w.publicTagline,
      publicPhone: w.publicPhone,
      logoUrl: w.logoUrl,
    },
  });

  const existingUser = await prisma.user.findUnique({
    where: { email: w.adminEmail },
  });

  if (!existingUser) {
    await prisma.user.create({
      data: {
        email: w.adminEmail,
        passwordHash,
        fullName: `Admin ${w.name}`,
        role: "COMPANY_ADMIN",
        companyId: company.id,
        isActive: true,
      },
    });
  }

  console.log(
    `✔ ${w.name.padEnd(16)} slug=${w.slug.padEnd(16)} rank=${w.publicRank}  admin=${w.adminEmail}`,
  );
}

async function main() {
  console.log("Sembrando talleres públicos...\n");
  for (const w of WORKSHOPS) {
    await upsertWorkshop(w);
  }
  console.log(`\nListo. Contraseña de los admins de taller: ${DEFAULT_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
