-- Co-found Database Schema
-- Complete schema for production initialization

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- Profiles table
CREATE TABLE IF NOT EXISTS "profiles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "full_name" TEXT,
    "avatar_url" TEXT,
    "role" TEXT,
    "viloyat" TEXT,
    "bio" TEXT,
    "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "looking_for" TEXT,
    "available" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- Projects table
CREATE TABLE IF NOT EXISTS "projects" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "viloyat" TEXT NOT NULL,
    "looking_for" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "recommended" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "work_type" TEXT NOT NULL DEFAULT 'office',
    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- Private Messages table
CREATE TABLE IF NOT EXISTS "private_messages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "sender_id" UUID NOT NULL,
    "receiver_id" UUID NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMPTZ(6),
    "delivered" BOOLEAN NOT NULL DEFAULT false,
    "delivered_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "private_messages_pkey" PRIMARY KEY ("id")
);

-- Project Messages table
CREATE TABLE IF NOT EXISTS "project_messages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "project_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "message" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "project_messages_pkey" PRIMARY KEY ("id")
);

-- Join Requests table
CREATE TABLE IF NOT EXISTS "join_requests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "project_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "message" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "join_requests_pkey" PRIMARY KEY ("id")
);

-- Create unique indexes
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "profiles_user_id_key" ON "profiles"("user_id");
CREATE UNIQUE INDEX IF NOT EXISTS "join_requests_project_id_user_id_key" ON "join_requests"("project_id", "user_id");

-- Add foreign key constraints
ALTER TABLE "profiles" DROP CONSTRAINT IF EXISTS "profiles_user_id_fkey";
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_fkey" 
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "projects" DROP CONSTRAINT IF EXISTS "projects_user_id_fkey";
ALTER TABLE "projects" ADD CONSTRAINT "projects_user_id_fkey" 
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "private_messages" DROP CONSTRAINT IF EXISTS "private_messages_sender_id_fkey";
ALTER TABLE "private_messages" ADD CONSTRAINT "private_messages_sender_id_fkey" 
    FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "private_messages" DROP CONSTRAINT IF EXISTS "private_messages_receiver_id_fkey";
ALTER TABLE "private_messages" ADD CONSTRAINT "private_messages_receiver_id_fkey" 
    FOREIGN KEY ("receiver_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "project_messages" DROP CONSTRAINT IF EXISTS "project_messages_project_id_fkey";
ALTER TABLE "project_messages" ADD CONSTRAINT "project_messages_project_id_fkey" 
    FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "project_messages" DROP CONSTRAINT IF EXISTS "project_messages_user_id_fkey";
ALTER TABLE "project_messages" ADD CONSTRAINT "project_messages_user_id_fkey" 
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "join_requests" DROP CONSTRAINT IF EXISTS "join_requests_project_id_fkey";
ALTER TABLE "join_requests" ADD CONSTRAINT "join_requests_project_id_fkey" 
    FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "join_requests" DROP CONSTRAINT IF EXISTS "join_requests_user_id_fkey";
ALTER TABLE "join_requests" ADD CONSTRAINT "join_requests_user_id_fkey" 
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "idx_private_messages_sender_id" ON "private_messages"("sender_id");
CREATE INDEX IF NOT EXISTS "idx_private_messages_receiver_id" ON "private_messages"("receiver_id");
CREATE INDEX IF NOT EXISTS "idx_private_messages_created_at" ON "private_messages"("created_at");
CREATE INDEX IF NOT EXISTS "idx_project_messages_project_id" ON "project_messages"("project_id");
CREATE INDEX IF NOT EXISTS "idx_project_messages_created_at" ON "project_messages"("created_at");
CREATE INDEX IF NOT EXISTS "idx_join_requests_project_id" ON "join_requests"("project_id");
CREATE INDEX IF NOT EXISTS "idx_join_requests_user_id" ON "join_requests"("user_id");
CREATE INDEX IF NOT EXISTS "idx_join_requests_status" ON "join_requests"("status");
