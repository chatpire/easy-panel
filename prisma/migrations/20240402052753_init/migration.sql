-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "ResourceUnit" AS ENUM ('TOKEN', 'INPUT_CHAR', 'CREDITS');

-- CreateEnum
CREATE TYPE "RefreshPeriod" AS ENUM ('DAILY', 'MONTHLY', 'YEARLY', 'NEVER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "image" TEXT,
    "comment" TEXT,
    "validUntil" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "hashedPassword" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "currentIp" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceInstance" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceInstance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserInstanceToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "instanceId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserInstanceToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserEventLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "type" TEXT NOT NULL,
    "detail" TEXT,
    "resultType" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserEventLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserResourceUsageLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "instanceId" TEXT,
    "resourceType" TEXT NOT NULL,
    "openaiTeamId" TEXT,
    "unit" "ResourceUnit" NOT NULL,
    "amount" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserResourceUsageLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceInstance_name_key" ON "ServiceInstance"("name");

-- CreateIndex
CREATE UNIQUE INDEX "UserInstanceToken_token_key" ON "UserInstanceToken"("token");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserInstanceToken" ADD CONSTRAINT "UserInstanceToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserInstanceToken" ADD CONSTRAINT "UserInstanceToken_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "ServiceInstance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserEventLog" ADD CONSTRAINT "UserEventLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserResourceUsageLog" ADD CONSTRAINT "UserResourceUsageLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserResourceUsageLog" ADD CONSTRAINT "UserResourceUsageLog_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "ServiceInstance"("id") ON DELETE SET NULL ON UPDATE CASCADE;
