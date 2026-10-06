-- CreateTable
CREATE TABLE "Source" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rssUrl" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "pollIntervalMinutes" INTEGER NOT NULL DEFAULT 30,
    "lastFetchedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Source_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RawItem" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "titleOriginal" TEXT NOT NULL,
    "summaryOriginal" TEXT NOT NULL,
    "sourceArticleUrl" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "groupId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RawItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArticleGroup" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArticleGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Article" (
    "id" TEXT NOT NULL,
    "rawItemId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "titleRewritten" TEXT NOT NULL,
    "bodyRewritten" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'ukraine-in-press',
    "sourceName" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RewriteLog" (
    "id" TEXT NOT NULL,
    "rawItemId" TEXT NOT NULL,
    "llmResponseRaw" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "failureReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RewriteLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Source_rssUrl_key" ON "Source"("rssUrl");

-- CreateIndex
CREATE UNIQUE INDEX "RawItem_sourceArticleUrl_key" ON "RawItem"("sourceArticleUrl");

-- CreateIndex
CREATE INDEX "RawItem_status_idx" ON "RawItem"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Article_rawItemId_key" ON "Article"("rawItemId");

-- CreateIndex
CREATE UNIQUE INDEX "Article_slug_key" ON "Article"("slug");

-- CreateIndex
CREATE INDEX "Article_status_publishedAt_idx" ON "Article"("status", "publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_username_key" ON "AdminUser"("username");

-- AddForeignKey
ALTER TABLE "RawItem" ADD CONSTRAINT "RawItem_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RawItem" ADD CONSTRAINT "RawItem_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "ArticleGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_rawItemId_fkey" FOREIGN KEY ("rawItemId") REFERENCES "RawItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "ArticleGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RewriteLog" ADD CONSTRAINT "RewriteLog_rawItemId_fkey" FOREIGN KEY ("rawItemId") REFERENCES "RawItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
