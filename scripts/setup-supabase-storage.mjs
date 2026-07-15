/*
  Configura el bucket `rapid` en Supabase Storage para firmas.

  Ejecutar una vez:
    node scripts/setup-supabase-storage.mjs
*/

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const statements = [
  `UPDATE storage.buckets SET public = true WHERE id = 'rapid'`,
  `DO $$ BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'storage' AND tablename = 'objects'
        AND policyname = 'rapid_public_read'
    ) THEN
      CREATE POLICY "rapid_public_read"
      ON storage.objects FOR SELECT
      TO public
      USING (bucket_id = 'rapid');
    END IF;
  END $$`,
  `DO $$ BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'storage' AND tablename = 'objects'
        AND policyname = 'rapid_public_insert'
    ) THEN
      CREATE POLICY "rapid_public_insert"
      ON storage.objects FOR INSERT
      TO public
      WITH CHECK (bucket_id = 'rapid');
    END IF;
  END $$`,
  `DO $$ BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'storage' AND tablename = 'objects'
        AND policyname = 'rapid_public_update'
    ) THEN
      CREATE POLICY "rapid_public_update"
      ON storage.objects FOR UPDATE
      TO public
      USING (bucket_id = 'rapid')
      WITH CHECK (bucket_id = 'rapid');
    END IF;
  END $$`,
  `DO $$ BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'storage' AND tablename = 'objects'
        AND policyname = 'rapid_public_delete'
    ) THEN
      CREATE POLICY "rapid_public_delete"
      ON storage.objects FOR DELETE
      TO public
      USING (bucket_id = 'rapid');
    END IF;
  END $$`,
];

async function main() {
  for (const sql of statements) {
    await prisma.$executeRawUnsafe(sql);
  }

  const buckets = await prisma.$queryRaw`
    SELECT id, name, public FROM storage.buckets WHERE id = 'rapid'
  `;
  console.log("Bucket rapid:", buckets);
  console.log("Políticas de Storage configuradas.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
