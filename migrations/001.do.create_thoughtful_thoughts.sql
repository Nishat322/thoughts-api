CREATE TABLE thoughtful_thoughts (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    thought_name TEXT NOT NULL,
    date_added TIMESTAMPTZ DEFAULT now() NOT NULL
);