-- Rename "createAt" -> "createdAt" (typo fix) without losing existing data.
-- Prisma's auto-generated diff would drop and re-add the columns; RENAME COLUMN keeps the values.
ALTER TABLE "User" RENAME COLUMN "createAt" TO "createdAt";
ALTER TABLE "Post" RENAME COLUMN "createAt" TO "createdAt";
