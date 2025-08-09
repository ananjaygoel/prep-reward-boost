CREATE TABLE "public"."notes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "study_plan_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "content" "text",
    "subject" "text",
    "topic" "text",
    "tags" "text"[],
    "is_important" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."notes" OWNER TO "postgres";

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION "public"."trigger_set_timestamp"()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at on row update
CREATE TRIGGER "set_notes_timestamp"
BEFORE UPDATE ON "public"."notes"
FOR EACH ROW
EXECUTE PROCEDURE "public"."trigger_set_timestamp"();


ALTER TABLE ONLY "public"."notes"
    ADD CONSTRAINT "notes_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."notes"
    ADD CONSTRAINT "notes_study_plan_id_fkey" FOREIGN KEY ("study_plan_id") REFERENCES "public"."study_plans"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."notes"
    ADD CONSTRAINT "notes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

-- Enable Row Level Security
ALTER TABLE "public"."notes" ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for authenticated users" ON "public"."notes"
AS PERMISSIVE FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Enable insert for users based on user_id" ON "public"."notes"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update for users based on user_id" ON "public"."notes"
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable delete for users based on user_id" ON "public"."notes"
AS PERMISSIVE FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
