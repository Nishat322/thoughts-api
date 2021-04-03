CREATE TABLE thoughtful_users (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    fullname TEXT NOT NULL,
    username TEXT NOT NULL UNIQUE,
    password TEXT,
    nickname TEXT,
    date_created TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE thoughtful_thoughts
    ADD COLUMN
        thought_user INTEGER REFERENCES thoughtful_users(id)
        ON DELETE SET NULL;