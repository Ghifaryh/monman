-- initial schema
CREATE TABLE accounts (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
name TEXT NOT NULL,
type TEXT NOT NULL,
balance BIGINT NOT NULL DEFAULT 0,
created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);


CREATE TABLE categories (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
name TEXT NOT NULL,
type TEXT NOT NULL,
created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);


CREATE TABLE transactions (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
category_id UUID REFERENCES categories(id),
amount BIGINT NOT NULL,
note TEXT,
created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);


-- extension for gen_random_uuid (Postgres 13+)
CREATE EXTENSION IF NOT EXISTS pgcrypto;