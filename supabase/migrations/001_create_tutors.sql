-- 001_create_tutors_table.sql
create table if not exists tutors (
    id bigserial primary key,
    name text not null,
    subject text not null,
    years_experience integer,
    session_rate numeric
);