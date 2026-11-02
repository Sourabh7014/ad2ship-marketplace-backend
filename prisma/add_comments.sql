DO $$
DECLARE
  tbl text;
BEGIN
  FOR tbl IN
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
  LOOP
    EXECUTE format('COMMENT ON COLUMN %I.status IS %L', tbl, '0: active, 1: inactive');
    EXECUTE format('COMMENT ON COLUMN %I.soft_delete IS %L', tbl, '0: false, 1: true');
  END LOOP;
  COMMENT ON COLUMN sellers.onboarding_status IS '1: DRAFT, 2: SUBMITTED, 3: UNDER_REVIEW, 4: NEEDS_CORRECTION, 5: APPROVED, 6: REJECTED';
END $$;

