# Codex実装タスク — SEO Master Dashboard 全構築

全て実装してください。確認や質問は不要です。

## 概要
AGENTS.mdに記載の技術スタック・DBスキーマ・7モジュール仕様に基づき、プロジェクトを初期化し全画面を実装する。

## Step 1: プロジェクト初期化

```bash
npx create-next-app@latest . --typescript --tailwind --app --src-dir=false
npx shadcn@latest init
npm install recharts @supabase/supabase-js next-auth @hello-pangea/dnd
```

### 環境変数テンプレート
`.env.example`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
ANTHROPIC_API_KEY=
AHREFS_API_KEY=
SIMILARWEB_API_KEY=
```

## Step 2: Supabaseマイグレーション

`supabase/migrations/001_initial_schema.sql` にAGENTS.mdのスキーマを配置。

## Step 3: 基盤ファイル

### lib/supabase.ts
```typescript
import { createClient } from "@supabase/supabase-js";
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
```

### lib/claude.ts — Claude API wrapper
```typescript
import Anthropic from "@anthropic-ai/sdk";
const anthropic = new Anthropic();
export async function generateContent(prompt: string): Promise<string> { ... }
```

### lib/ahrefs.ts — Ahrefs API v3 wrapper
Bearer Token認証。keywords-explorer, site-explorer, content-explorer。

### lib/gsc.ts — Google Search Console API
OAuth 2.0。searchanalytics/query。

### lib/ga4.ts — GA4 Data API v1
OAuth 2.0。runReport。

### lib/similarweb.ts — SimilarWeb API
API Key認証。traffic、sources。

## Step 4: 認証

- `lib/auth.ts`: NextAuth + Supabase Auth adapter
- `app/api/auth/[...nextauth]/route.ts`
- `app/login/page.tsx`: メール/パスワードログイン
- デザイン: Navy背景 + 白カード（ad-dashboardのlogin/page.tsxと同じスタイル）

## Step 5: ダッシュボードレイアウト

`app/dashboard/layout.tsx`:
- 左サイドバー（240px, Navy背景）
- ヘッダー（白背景）
- サイドバーナビ:
  - Overview (/dashboard) 📊
  - 戦略 (/dashboard/strategy) 🎯
  - キーワード (/dashboard/keywords) 🔍
  - 競合分析 (/dashboard/competitors) 👥
  - コンテンツ (/dashboard/content) 📝
  - 順位 (/dashboard/rankings) 📈
  - 分析 (/dashboard/analytics) 📉
  - AIO (/dashboard/aio) 🤖
  - 設定 (/dashboard/settings) ⚙️

## Step 6: 各画面の実装

### 6.1 Overview（app/dashboard/page.tsx）
- KPIカード: 総記事数、月間PV、平均順位、AIO引用率
- 記事ステータス別 BarChart（Recharts）
- 最新アクティビティリスト
- **データはSupabaseから直接取得**（articles, rank_history, aio_citationsテーブル）

### 6.2 Content Pipeline（app/dashboard/content/page.tsx）
- 6ステージカンバン: planned → researching → writing → reviewing → approved → published
- 各ステージのカラムに記事カードをリスト表示
- カード: タイトル、キーワード、文字数、SEOスコア
- 「次のステージへ」ボタンでステータス変更
- 「新規記事」ボタン → モーダル
- API: `app/api/articles/route.ts`（GET: 一覧、POST: 作成）
- API: `app/api/articles/[id]/route.ts`（PATCH: ステータス変更、DELETE: 削除）

### 6.3 Keywords（app/dashboard/keywords/page.tsx）
- キーワード一覧テーブル: keyword, volume, KD, CPC, intent, cluster, status
- フィルター: intent, status, cluster
- ソート: volume, KD
- 「キーワード追加」モーダル（手動入力）
- 検索意図バッジ: informational=青, commercial=緑, transactional=紫, navigational=灰
- API: `app/api/keywords/route.ts`（GET, POST）

### 6.4 Competitors（app/dashboard/competitors/page.tsx）
- 競合ドメイン一覧テーブル: domain, metrics_json内のキー指標
- 「ドメイン追加」モーダル
- 横比較バーチャート（Recharts）
- API: `app/api/competitors/route.ts`（GET, POST）

### 6.5 Rankings（app/dashboard/rankings/page.tsx）
- キーワード順位推移 LineChart（Recharts）
- 期間セレクター
- GSCデータテーブル: keyword, position, impressions, clicks, CTR
- 順位変動ハイライト（5位以上変動で赤/緑バッジ）
- API: `app/api/rankings/route.ts`（GET）

### 6.6 Analytics（app/dashboard/analytics/page.tsx）
- トラフィック推移 LineChart
- 流入経路別 PieChart（Recharts PieChart）
- トップページテーブル: page_path, pageviews, sessions
- API: `app/api/analytics/route.ts`（GET）

### 6.7 AIO（app/dashboard/aio/page.tsx）
- AI引用率スコアカード
- サービス別テーブル: chatgpt, perplexity, gemini, claude の引用数・引用率
- キーワード別引用状況
- API: `app/api/aio/route.ts`（GET）

### 6.8 Strategy（app/dashboard/strategy/page.tsx）
- 戦略サマリーカード（現在のアクティブ戦略）
- コンテンツカレンダー（月間グリッド表示）
- テーマクラスターマップ（階層表示）
- 「新規戦略生成」ボタン（将来Claude APIで自動生成、今はモーダルで手動作成）
- API: `app/api/strategies/route.ts`（GET, POST）

### 6.9 Settings（app/dashboard/settings/page.tsx）
- API連携設定: Ahrefs, GSC, GA4, SimilarWeb のAPIキー登録フォーム
- 競合ドメイン登録
- トラッキングキーワード一括登録
- Google Docs出力先フォルダID設定
- API: `app/api/settings/route.ts`（GET, PUT）

## デザインシステム
- Navy(#1B2A4A) / Blue(#2C5282) / White / LightGray(#F7FAFC)
- shadcn/ui コンポーネントベース
- カード: rounded-xl border bg-card shadow-sm
- テーブル: stripe表示、ソート・フィルタ対応
- フォント: Inter

## 完了条件
- `npm run build` が成功する
- 全9画面がルーティングされる
- ダッシュボードレイアウト（サイドバー）が全画面共通
- 各APIルートが正しくSupabaseに接続する構造になっている
- TypeScriptエラーなし
