ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS age INT,
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS weight_kg NUMERIC(6, 2),
ADD COLUMN IF NOT EXISTS height_cm INT;

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_age_positive CHECK (
    age IS NULL
    OR age > 0
),
ADD CONSTRAINT profiles_weight_kg_positive CHECK (
    weight_kg IS NULL
    OR weight_kg > 0
),
ADD CONSTRAINT profiles_height_cm_positive CHECK (
    height_cm IS NULL
    OR height_cm > 0
);