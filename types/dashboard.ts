export type ArticleStatus =
  | "planned"
  | "researching"
  | "writing"
  | "reviewing"
  | "approved"
  | "published";

export type IntentType = "informational" | "navigational" | "commercial" | "transactional";

export type Article = {
  id: string;
  title: string;
  status: ArticleStatus;
  target_word_count: number;
  actual_word_count: number;
  seo_score: number;
  created_at: string;
  keyword_id: string | null;
};
