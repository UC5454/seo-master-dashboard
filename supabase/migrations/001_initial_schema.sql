-- 戦略
CREATE TABLE strategies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  target_keywords JSONB DEFAULT '[]',
  content_calendar JSONB DEFAULT '{}',
  cluster_map JSONB DEFAULT '{}',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- キーワードクラスター
CREATE TABLE keyword_clusters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  strategy_id UUID REFERENCES strategies(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- キーワード
CREATE TABLE keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword TEXT NOT NULL,
  volume INTEGER DEFAULT 0,
  kd REAL DEFAULT 0,
  cpc REAL DEFAULT 0,
  intent TEXT CHECK (intent IN ('informational', 'navigational', 'commercial', 'transactional')),
  cluster_id UUID REFERENCES keyword_clusters(id),
  priority INTEGER DEFAULT 0,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'tracking', 'targeted', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 競合
CREATE TABLE competitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain TEXT NOT NULL UNIQUE,
  metrics_json JSONB DEFAULT '{}',
  last_analyzed TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 記事
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  keyword_id UUID REFERENCES keywords(id),
  strategy_id UUID REFERENCES strategies(id),
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'researching', 'writing', 'reviewing', 'approved', 'published')),
  content_md TEXT,
  meta_description TEXT,
  target_word_count INTEGER DEFAULT 3000,
  actual_word_count INTEGER DEFAULT 0,
  seo_score REAL DEFAULT 0,
  aio_score REAL DEFAULT 0,
  gdoc_id TEXT,
  reviewer_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- 記事リビジョン
CREATE TABLE article_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  content_md TEXT NOT NULL,
  revision_number INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 順位履歴
CREATE TABLE rank_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword_id UUID REFERENCES keywords(id),
  date DATE NOT NULL,
  position REAL,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  ctr REAL DEFAULT 0,
  UNIQUE(keyword_id, date)
);

-- アナリティクス
CREATE TABLE analytics_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  page_path TEXT NOT NULL,
  pageviews INTEGER DEFAULT 0,
  sessions INTEGER DEFAULT 0,
  users INTEGER DEFAULT 0,
  avg_engagement_time REAL DEFAULT 0,
  bounce_rate REAL DEFAULT 0,
  source_medium TEXT,
  UNIQUE(date, page_path, source_medium)
);

-- AIO引用
CREATE TABLE aio_citations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword_id UUID REFERENCES keywords(id),
  ai_service TEXT NOT NULL CHECK (ai_service IN ('chatgpt', 'perplexity', 'gemini', 'claude')),
  cited BOOLEAN DEFAULT FALSE,
  citation_text TEXT,
  checked_at TIMESTAMPTZ DEFAULT NOW()
);

-- API設定
CREATE TABLE api_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service TEXT NOT NULL UNIQUE,
  config_json JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 監査ログ
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: 全テーブルにRow Level Security適用
ALTER TABLE strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE keyword_clusters ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rank_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE aio_citations ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- インデックス
CREATE INDEX idx_keywords_cluster ON keywords(cluster_id);
CREATE INDEX idx_keywords_status ON keywords(status);
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_keyword ON articles(keyword_id);
CREATE INDEX idx_rank_history_keyword_date ON rank_history(keyword_id, date);
CREATE INDEX idx_analytics_date ON analytics_snapshots(date);
CREATE INDEX idx_aio_keyword ON aio_citations(keyword_id);
