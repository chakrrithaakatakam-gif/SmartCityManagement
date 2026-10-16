-- Run as a DBA account (for example SYSTEM) in the intended PDB/service.
-- Replace the example password before running this script.
CREATE USER URBANOS_APP IDENTIFIED BY "ChangeThisPassword_2026!";
GRANT CREATE SESSION, CREATE TABLE, CREATE VIEW, CREATE SEQUENCE TO URBANOS_APP;
ALTER USER URBANOS_APP QUOTA UNLIMITED ON USERS;
-- Then connect as URBANOS_APP and run schema.sql.
