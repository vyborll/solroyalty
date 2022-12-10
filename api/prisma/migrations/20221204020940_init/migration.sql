-- CreateTable
CREATE TABLE "collection" (
    "id" TEXT NOT NULL,
    "track" BOOLEAN NOT NULL DEFAULT false,
    "backfilled" BOOLEAN NOT NULL DEFAULT false,
    "symbol" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "update_authority" TEXT,
    "description" TEXT,
    "image" TEXT,
    "discord" TEXT,
    "twitter" TEXT,
    "website" TEXT,
    "royalty_fee" INTEGER,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "collection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "token" (
    "id" TEXT NOT NULL,
    "mint" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT,
    "symbol" TEXT NOT NULL,
    "collection_symbol" TEXT NOT NULL,
    "seller_fee_basis_points" INTEGER NOT NULL,
    "uri" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sale" (
    "id" TEXT NOT NULL,
    "signature" TEXT NOT NULL,
    "mint" TEXT NOT NULL,
    "price" BIGINT NOT NULL,
    "sol" DOUBLE PRECISION NOT NULL,
    "market_fee" DOUBLE PRECISION NOT NULL,
    "royalty_fee" DOUBLE PRECISION NOT NULL,
    "marketplace" TEXT NOT NULL,
    "buyer" TEXT NOT NULL,
    "seller" TEXT NOT NULL,
    "time" TIMESTAMP(3) NOT NULL,
    "symbol" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sale_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "collection_symbol_key" ON "collection"("symbol");

-- CreateIndex
CREATE UNIQUE INDEX "token_mint_key" ON "token"("mint");

-- CreateIndex
CREATE UNIQUE INDEX "sale_signature_mint_key" ON "sale"("signature", "mint");

-- AddForeignKey
ALTER TABLE "token" ADD CONSTRAINT "token_symbol_fkey" FOREIGN KEY ("symbol") REFERENCES "collection"("symbol") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale" ADD CONSTRAINT "sale_mint_fkey" FOREIGN KEY ("mint") REFERENCES "token"("mint") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale" ADD CONSTRAINT "sale_symbol_fkey" FOREIGN KEY ("symbol") REFERENCES "collection"("symbol") ON DELETE RESTRICT ON UPDATE CASCADE;
