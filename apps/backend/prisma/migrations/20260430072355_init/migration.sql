-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "chunks" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "ragDocumentId" TEXT,
ADD COLUMN     "sizeBytes" INTEGER,
ADD COLUMN     "url" TEXT;

-- CreateIndex
CREATE INDEX "Document_status_idx" ON "Document"("status");

-- CreateIndex
CREATE INDEX "Document_type_idx" ON "Document"("type");

-- CreateIndex
CREATE INDEX "Document_source_idx" ON "Document"("source");

-- CreateIndex
CREATE INDEX "Document_ragDocumentId_idx" ON "Document"("ragDocumentId");
