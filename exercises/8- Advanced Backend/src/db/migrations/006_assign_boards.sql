UPDATE "boards"
SET "created_by" = (
  SELECT "id"
  FROM "users"
  WHERE "email" = 'eljuampimorales@gmail.com'
)
WHERE "created_by" IS NULL;