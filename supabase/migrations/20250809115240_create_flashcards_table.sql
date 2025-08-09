CREATE TABLE "public"."flashcards" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "study_plan_id" "uuid" NOT NULL,
    "front" "text" NOT NULL,
    "back" "text" NOT NULL,
    "subject" "text",
    "topic" "text",
    "difficulty" "text" CHECK (("difficulty" = ANY (ARRAY['easy'::"text", 'medium'::"text", 'hard'::"text"]))) NOT NULL,
    "last_reviewed_at" timestamp with time zone,
    "next_review_at" timestamp with time zone NOT NULL,
    "repetitions" integer DEFAULT 0 NOT NULL,
    "ease_factor" real DEFAULT 2.5 NOT NULL,
    "interval" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."flashcards" OWNER TO "postgres";

ALTER TABLE ONLY "public"."flashcards"
    ADD CONSTRAINT "flashcards_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."flashcards"
    ADD CONSTRAINT "flashcards_study_plan_id_fkey" FOREIGN KEY ("study_plan_id") REFERENCES "public"."study_plans"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."flashcards"
    ADD CONSTRAINT "flashcards_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

-- Enable Row Level Security
ALTER TABLE "public"."flashcards" ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for authenticated users" ON "public"."flashcards"
AS PERMISSIVE FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Enable insert for users based on user_id" ON "public"."flashcards"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update for users based on user_id" ON "public"."flashcards"
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable delete for users based on user_id" ON "public"."flashcards"
AS PERMISSIVE FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
