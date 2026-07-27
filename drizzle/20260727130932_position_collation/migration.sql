-- Custom SQL migration file, put your code below! --
ALTER TABLE pages ALTER COLUMN position TYPE text COLLATE "C";
ALTER TABLE pages ALTER COLUMN favorite_position TYPE text COLLATE "C";