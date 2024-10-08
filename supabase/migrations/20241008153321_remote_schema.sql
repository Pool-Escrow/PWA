

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."poolRoles" AS ENUM (
    'mainHost',
    'coHost',
    'participant'
);


ALTER TYPE "public"."poolRoles" OWNER TO "postgres";


CREATE TYPE "public"."poolStatus" AS ENUM (
    'draft',
    'unconfirmed',
    'inactive',
    'depositsEnabled',
    'started',
    'paused',
    'ended',
    'deleted'
);


ALTER TYPE "public"."poolStatus" OWNER TO "postgres";


CREATE TYPE "public"."roles" AS ENUM (
    'user',
    'admin'
);


ALTER TYPE "public"."roles" OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."accounts" (
    "userId" integer NOT NULL,
    "type" "text" NOT NULL,
    "provider" "text" NOT NULL,
    "providerAccountId" "text" NOT NULL,
    "refresh_token" "text",
    "access_token" "text",
    "expires_at" integer,
    "token_type" "text",
    "scope" "text",
    "id_token" "text",
    "session_state" "text"
);


ALTER TABLE "public"."accounts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."pool_participants" (
    "user_id" integer NOT NULL,
    "pool_id" integer NOT NULL,
    "poolRole" "public"."poolRoles" NOT NULL,
    "createdAt" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."pool_participants" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."pools" (
    "internal_id" integer NOT NULL,
    "contract_id" integer,
    "name" "text" NOT NULL,
    "description" "text" NOT NULL,
    "bannerImage" "text" NOT NULL,
    "termsURL" "text" NOT NULL,
    "softCap" numeric NOT NULL,
    "createdAt" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT "now"() NOT NULL,
    "startDate" timestamp with time zone NOT NULL,
    "endDate" timestamp with time zone NOT NULL,
    "price" numeric NOT NULL,
    "tokenAddress" character varying(42) NOT NULL,
    "status" "public"."poolStatus" DEFAULT 'draft'::"public"."poolStatus" NOT NULL,
    CONSTRAINT "check_dates" CHECK (("startDate" < "endDate")),
    CONSTRAINT "check_start_date" CHECK (("startDate" > "now"())),
    CONSTRAINT "pools_price_check" CHECK (("price" >= (0)::numeric)),
    CONSTRAINT "pools_softCap_check" CHECK (("softCap" > (0)::numeric))
);


ALTER TABLE "public"."pools" OWNER TO "postgres";


COMMENT ON COLUMN "public"."pools"."tokenAddress" IS 'Token address from the smart contract. Cannot be null.';



ALTER TABLE "public"."pools" ALTER COLUMN "internal_id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."pools_internal_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."sessions" (
    "sessionToken" "text" NOT NULL,
    "userId" integer NOT NULL,
    "expires" timestamp with time zone NOT NULL,
    "createdAt" timestamp with time zone DEFAULT "now"(),
    "updatedAt" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."sessions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" integer NOT NULL,
    "displayName" "text",
    "avatar" "text",
    "role" "public"."roles" DEFAULT 'user'::"public"."roles" NOT NULL,
    "privyId" "text" NOT NULL,
    "walletAddress" character varying(42) NOT NULL,
    "createdAt" timestamp with time zone DEFAULT "now"(),
    "updatedAt" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."users" OWNER TO "postgres";


ALTER TABLE "public"."users" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."users_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE ONLY "public"."accounts"
    ADD CONSTRAINT "accounts_pkey" PRIMARY KEY ("provider", "providerAccountId");



ALTER TABLE ONLY "public"."pool_participants"
    ADD CONSTRAINT "pool_participants_pkey" PRIMARY KEY ("user_id", "pool_id");



ALTER TABLE ONLY "public"."pools"
    ADD CONSTRAINT "pools_contract_id_key" UNIQUE ("contract_id");



ALTER TABLE ONLY "public"."pools"
    ADD CONSTRAINT "pools_pkey" PRIMARY KEY ("internal_id");



ALTER TABLE ONLY "public"."sessions"
    ADD CONSTRAINT "sessions_pkey" PRIMARY KEY ("sessionToken");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_privyId_key" UNIQUE ("privyId");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_walletAddress_key" UNIQUE ("walletAddress");



CREATE INDEX "idx_pool_contract_id" ON "public"."pools" USING "btree" ("contract_id");



CREATE INDEX "idx_pool_participants" ON "public"."pool_participants" USING "btree" ("pool_id", "poolRole");



CREATE INDEX "idx_pool_status" ON "public"."pools" USING "btree" ("status");



CREATE INDEX "idx_pools_tokenaddress" ON "public"."pools" USING "btree" ("tokenAddress");



ALTER TABLE ONLY "public"."accounts"
    ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."pool_participants"
    ADD CONSTRAINT "pool_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sessions"
    ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Allow admins to create pools" ON "public"."pools" FOR INSERT WITH CHECK (((("current_setting"('request.jwt.claims'::"text", true))::"json" ->> 'role'::"text") = 'admin'::"text"));



CREATE POLICY "Allow admins to update pools" ON "public"."pools" FOR UPDATE USING (((("current_setting"('request.jwt.claims'::"text", true))::"json" ->> 'role'::"text") = 'admin'::"text"));



CREATE POLICY "Allow user to terminate own sessions" ON "public"."sessions" FOR DELETE USING (((("current_setting"('request.jwt.claims'::"text", true))::"json" ->> 'sub'::"text") = ("userId")::"text"));



CREATE POLICY "Allow user to update own accounts" ON "public"."accounts" FOR UPDATE USING (((("current_setting"('request.jwt.claims'::"text", true))::"json" ->> 'sub'::"text") = ("userId")::"text"));



CREATE POLICY "Allow user to update own data" ON "public"."users" FOR UPDATE USING (((("current_setting"('request.jwt.claims'::"text", true))::"json" ->> 'sub'::"text") = ("id")::"text"));



CREATE POLICY "Allow user to view own accounts" ON "public"."accounts" FOR SELECT USING (((("current_setting"('request.jwt.claims'::"text", true))::"json" ->> 'sub'::"text") = ("userId")::"text"));



CREATE POLICY "Allow user to view own data" ON "public"."users" FOR SELECT USING (true);



CREATE POLICY "Allow user to view own sessions" ON "public"."sessions" FOR SELECT USING (((("current_setting"('request.jwt.claims'::"text", true))::"json" ->> 'sub'::"text") = ("userId")::"text"));



CREATE POLICY "Allow users to participate in pools" ON "public"."pool_participants" FOR INSERT WITH CHECK (true);



CREATE POLICY "Allow users to view pools" ON "public"."pools" FOR SELECT USING (true);



ALTER TABLE "public"."accounts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."pool_participants" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."pools" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sessions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



































































































































































































GRANT ALL ON TABLE "public"."accounts" TO "anon";
GRANT ALL ON TABLE "public"."accounts" TO "authenticated";
GRANT ALL ON TABLE "public"."accounts" TO "service_role";



GRANT ALL ON TABLE "public"."pool_participants" TO "anon";
GRANT ALL ON TABLE "public"."pool_participants" TO "authenticated";
GRANT ALL ON TABLE "public"."pool_participants" TO "service_role";



GRANT ALL ON TABLE "public"."pools" TO "anon";
GRANT ALL ON TABLE "public"."pools" TO "authenticated";
GRANT ALL ON TABLE "public"."pools" TO "service_role";



GRANT ALL ON SEQUENCE "public"."pools_internal_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."pools_internal_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."pools_internal_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."sessions" TO "anon";
GRANT ALL ON TABLE "public"."sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."sessions" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";



GRANT ALL ON SEQUENCE "public"."users_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."users_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."users_id_seq" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
