CREATE TABLE IF NOT EXISTS "Post" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "platform" TEXT NOT NULL DEFAULT 'INSTAGRAM',
  "caption" TEXT NOT NULL,
  "hashtags" TEXT,
  "mediaPath" TEXT,
  "scheduledAt" TIMESTAMP(3),
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Template" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "captionTemplate" TEXT NOT NULL,
  "hashtagsTemplate" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Template_pkey" PRIMARY KEY ("id")
);
