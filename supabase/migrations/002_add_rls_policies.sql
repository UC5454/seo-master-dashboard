-- 002: RLSポリシー追加（既存DBへの適用用）
-- 認証済みユーザーにフルアクセスを許可（初期は千葉さん1ユーザー運用）

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'strategies', 'keywords', 'keyword_clusters', 'competitors',
    'articles', 'article_revisions', 'rank_history',
    'analytics_snapshots', 'aio_citations', 'api_configs'
  ])
  LOOP
    EXECUTE format('CREATE POLICY IF NOT EXISTS "authenticated_select" ON %I FOR SELECT TO authenticated USING (true)', tbl);
    EXECUTE format('CREATE POLICY IF NOT EXISTS "authenticated_insert" ON %I FOR INSERT TO authenticated WITH CHECK (true)', tbl);
    EXECUTE format('CREATE POLICY IF NOT EXISTS "authenticated_update" ON %I FOR UPDATE TO authenticated USING (true) WITH CHECK (true)', tbl);
    EXECUTE format('CREATE POLICY IF NOT EXISTS "authenticated_delete" ON %I FOR DELETE TO authenticated USING (true)', tbl);
  END LOOP;
END $$;

-- audit_logs: 読み取り+挿入のみ（削除・更新は不可）
CREATE POLICY IF NOT EXISTS "authenticated_select" ON audit_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY IF NOT EXISTS "authenticated_insert" ON audit_logs FOR INSERT TO authenticated WITH CHECK (true);
