import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1700000000000 implements MigrationInterface {
  name = 'InitialSchema1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create users table
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "email" character varying,
        "phone" character varying NOT NULL,
        "password_hash" character varying NOT NULL,
        "role" character varying NOT NULL DEFAULT 'HOUSEHOLD',
        "is_active" boolean NOT NULL DEFAULT true,
        "is_verified" boolean NOT NULL DEFAULT false,
        "refresh_token_hash" character varying,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "UQ_users_phone" UNIQUE ("phone"),
        CONSTRAINT "PK_users" PRIMARY KEY ("id")
      )
    `);

    // Create household_profiles table
    await queryRunner.query(`
      CREATE TABLE "household_profiles" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "household_size" integer,
        "preferred_pickup_days" text,
        "subscription_status" character varying,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "REL_household_profiles_user" UNIQUE ("user_id"),
        CONSTRAINT "PK_household_profiles" PRIMARY KEY ("id")
      )
    `);

    // Create pickup_agent_profiles table
    await queryRunner.query(`
      CREATE TABLE "pickup_agent_profiles" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "id_document_url" character varying,
        "vehicle_type" character varying,
        "vehicle_registration" character varying,
        "kyc_status" character varying NOT NULL DEFAULT 'PENDING',
        "average_rating" numeric(3,2) DEFAULT 0,
        "total_completed_pickups" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "REL_pickup_agent_profiles_user" UNIQUE ("user_id"),
        CONSTRAINT "PK_pickup_agent_profiles" PRIMARY KEY ("id")
      )
    `);

    // Create community_bins table
    await queryRunner.query(`
      CREATE TABLE "community_bins" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "location_name" character varying NOT NULL,
        "gps_lat" numeric(10,8) NOT NULL,
        "gps_lng" numeric(11,8) NOT NULL,
        "capacity_level" character varying NOT NULL DEFAULT 'LOW',
        "last_emptied_at" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_community_bins" PRIMARY KEY ("id")
      )
    `);

    // Create pickup_requests table
    await queryRunner.query(`
      CREATE TABLE "pickup_requests" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "household_id" uuid NOT NULL,
        "agent_id" uuid,
        "bin_id" uuid,
        "status" character varying NOT NULL DEFAULT 'REQUESTED',
        "scheduled_date" date NOT NULL,
        "time_window" character varying,
        "waste_type" character varying,
        "notes" text,
        "photo_proof_url" character varying,
        "tracking_label" character varying,
        "accepted_at" TIMESTAMP,
        "started_at" TIMESTAMP,
        "completed_at" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_pickup_requests" PRIMARY KEY ("id")
      )
    `);

    // Create ratings table
    await queryRunner.query(`
      CREATE TABLE "ratings" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "pickup_request_id" uuid NOT NULL,
        "household_id" uuid NOT NULL,
        "agent_id" uuid NOT NULL,
        "rating" integer NOT NULL,
        "comment" text,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "REL_ratings_pickup_request" UNIQUE ("pickup_request_id"),
        CONSTRAINT "PK_ratings" PRIMARY KEY ("id")
      )
    `);

    // Create alerts table
    await queryRunner.query(`
      CREATE TABLE "alerts" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "type" character varying NOT NULL,
        "status" character varying NOT NULL DEFAULT 'OPEN',
        "description" text NOT NULL,
        "photo_url" character varying,
        "gps_lat" numeric(10,8),
        "gps_lng" numeric(11,8),
        "created_by_id" uuid NOT NULL,
        "bin_id" uuid,
        "pickup_request_id" uuid,
        "resolved_by_id" uuid,
        "resolution_notes" text,
        "resolved_at" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_alerts" PRIMARY KEY ("id")
      )
    `);

    // Create subscriptions table
    await queryRunner.query(`
      CREATE TABLE "subscriptions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "household_id" uuid NOT NULL,
        "plan_type" character varying NOT NULL,
        "status" character varying NOT NULL DEFAULT 'ACTIVE',
        "start_date" date NOT NULL,
        "end_date" date,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_subscriptions" PRIMARY KEY ("id")
      )
    `);

    // Create educational_content table
    await queryRunner.query(`
      CREATE TABLE "educational_content" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" character varying NOT NULL,
        "content_type" character varying NOT NULL,
        "body" text,
        "content_url" character varying,
        "language" character varying NOT NULL DEFAULT 'EN',
        "target_audience" character varying NOT NULL DEFAULT 'GENERAL',
        "is_published" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_educational_content" PRIMARY KEY ("id")
      )
    `);

    // Create surveys table
    await queryRunner.query(`
      CREATE TABLE "surveys" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" character varying NOT NULL,
        "target_group" character varying,
        "questions" jsonb NOT NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_surveys" PRIMARY KEY ("id")
      )
    `);

    // Create survey_responses table
    await queryRunner.query(`
      CREATE TABLE "survey_responses" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "survey_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "answers" jsonb NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_survey_responses" PRIMARY KEY ("id")
      )
    `);

    // Add foreign keys
    await queryRunner.query(`
      ALTER TABLE "household_profiles" 
      ADD CONSTRAINT "FK_household_profiles_user" 
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "pickup_agent_profiles" 
      ADD CONSTRAINT "FK_pickup_agent_profiles_user" 
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "pickup_requests" 
      ADD CONSTRAINT "FK_pickup_requests_household" 
      FOREIGN KEY ("household_id") REFERENCES "household_profiles"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "pickup_requests" 
      ADD CONSTRAINT "FK_pickup_requests_agent" 
      FOREIGN KEY ("agent_id") REFERENCES "pickup_agent_profiles"("id") ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "pickup_requests" 
      ADD CONSTRAINT "FK_pickup_requests_bin" 
      FOREIGN KEY ("bin_id") REFERENCES "community_bins"("id") ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "ratings" 
      ADD CONSTRAINT "FK_ratings_pickup_request" 
      FOREIGN KEY ("pickup_request_id") REFERENCES "pickup_requests"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "ratings" 
      ADD CONSTRAINT "FK_ratings_household" 
      FOREIGN KEY ("household_id") REFERENCES "household_profiles"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "ratings" 
      ADD CONSTRAINT "FK_ratings_agent" 
      FOREIGN KEY ("agent_id") REFERENCES "pickup_agent_profiles"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "alerts" 
      ADD CONSTRAINT "FK_alerts_created_by" 
      FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "alerts" 
      ADD CONSTRAINT "FK_alerts_bin" 
      FOREIGN KEY ("bin_id") REFERENCES "community_bins"("id") ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "alerts" 
      ADD CONSTRAINT "FK_alerts_pickup_request" 
      FOREIGN KEY ("pickup_request_id") REFERENCES "pickup_requests"("id") ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "alerts" 
      ADD CONSTRAINT "FK_alerts_resolved_by" 
      FOREIGN KEY ("resolved_by_id") REFERENCES "users"("id") ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "subscriptions" 
      ADD CONSTRAINT "FK_subscriptions_household" 
      FOREIGN KEY ("household_id") REFERENCES "household_profiles"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "survey_responses" 
      ADD CONSTRAINT "FK_survey_responses_survey" 
      FOREIGN KEY ("survey_id") REFERENCES "surveys"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "survey_responses" 
      ADD CONSTRAINT "FK_survey_responses_user" 
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
    `);

    // Create indexes for better performance
    await queryRunner.query(`CREATE INDEX "IDX_users_phone" ON "users" ("phone")`);
    await queryRunner.query(`CREATE INDEX "IDX_users_email" ON "users" ("email")`);
    await queryRunner.query(`CREATE INDEX "IDX_users_role" ON "users" ("role")`);
    await queryRunner.query(`CREATE INDEX "IDX_pickup_requests_status" ON "pickup_requests" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_pickup_requests_scheduled_date" ON "pickup_requests" ("scheduled_date")`);
    await queryRunner.query(`CREATE INDEX "IDX_alerts_status" ON "alerts" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_alerts_type" ON "alerts" ("type")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_alerts_type"`);
    await queryRunner.query(`DROP INDEX "IDX_alerts_status"`);
    await queryRunner.query(`DROP INDEX "IDX_pickup_requests_scheduled_date"`);
    await queryRunner.query(`DROP INDEX "IDX_pickup_requests_status"`);
    await queryRunner.query(`DROP INDEX "IDX_users_role"`);
    await queryRunner.query(`DROP INDEX "IDX_users_email"`);
    await queryRunner.query(`DROP INDEX "IDX_users_phone"`);

    // Drop foreign keys
    await queryRunner.query(`ALTER TABLE "survey_responses" DROP CONSTRAINT "FK_survey_responses_user"`);
    await queryRunner.query(`ALTER TABLE "survey_responses" DROP CONSTRAINT "FK_survey_responses_survey"`);
    await queryRunner.query(`ALTER TABLE "subscriptions" DROP CONSTRAINT "FK_subscriptions_household"`);
    await queryRunner.query(`ALTER TABLE "alerts" DROP CONSTRAINT "FK_alerts_resolved_by"`);
    await queryRunner.query(`ALTER TABLE "alerts" DROP CONSTRAINT "FK_alerts_pickup_request"`);
    await queryRunner.query(`ALTER TABLE "alerts" DROP CONSTRAINT "FK_alerts_bin"`);
    await queryRunner.query(`ALTER TABLE "alerts" DROP CONSTRAINT "FK_alerts_created_by"`);
    await queryRunner.query(`ALTER TABLE "ratings" DROP CONSTRAINT "FK_ratings_agent"`);
    await queryRunner.query(`ALTER TABLE "ratings" DROP CONSTRAINT "FK_ratings_household"`);
    await queryRunner.query(`ALTER TABLE "ratings" DROP CONSTRAINT "FK_ratings_pickup_request"`);
    await queryRunner.query(`ALTER TABLE "pickup_requests" DROP CONSTRAINT "FK_pickup_requests_bin"`);
    await queryRunner.query(`ALTER TABLE "pickup_requests" DROP CONSTRAINT "FK_pickup_requests_agent"`);
    await queryRunner.query(`ALTER TABLE "pickup_requests" DROP CONSTRAINT "FK_pickup_requests_household"`);
    await queryRunner.query(`ALTER TABLE "pickup_agent_profiles" DROP CONSTRAINT "FK_pickup_agent_profiles_user"`);
    await queryRunner.query(`ALTER TABLE "household_profiles" DROP CONSTRAINT "FK_household_profiles_user"`);

    // Drop tables
    await queryRunner.query(`DROP TABLE "survey_responses"`);
    await queryRunner.query(`DROP TABLE "surveys"`);
    await queryRunner.query(`DROP TABLE "educational_content"`);
    await queryRunner.query(`DROP TABLE "subscriptions"`);
    await queryRunner.query(`DROP TABLE "alerts"`);
    await queryRunner.query(`DROP TABLE "ratings"`);
    await queryRunner.query(`DROP TABLE "pickup_requests"`);
    await queryRunner.query(`DROP TABLE "community_bins"`);
    await queryRunner.query(`DROP TABLE "pickup_agent_profiles"`);
    await queryRunner.query(`DROP TABLE "household_profiles"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
