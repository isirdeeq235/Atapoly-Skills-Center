-- Add new hero section customization columns to homepage_content
ALTER TABLE public.homepage_content
ADD COLUMN hero_badge_text text NOT NULL DEFAULT 'Enrollment now open for 2026 cohorts',
ADD COLUMN hero_badge_visible boolean NOT NULL DEFAULT true,
ADD COLUMN hero_stat_1_value text NOT NULL DEFAULT '98%',
ADD COLUMN hero_stat_1_label text NOT NULL DEFAULT 'Completion Rate',
ADD COLUMN hero_stat_2_value text NOT NULL DEFAULT '15+',
ADD COLUMN hero_stat_2_label text NOT NULL DEFAULT 'Industry Partners',
ADD COLUMN hero_stat_3_value text NOT NULL DEFAULT '50+',
ADD COLUMN hero_stat_3_label text NOT NULL DEFAULT 'Programs',
ADD COLUMN hero_stats_visible boolean NOT NULL DEFAULT true,
ADD COLUMN hero_trust_rating text NOT NULL DEFAULT '4.9/5',
ADD COLUMN hero_trust_reviews_count text NOT NULL DEFAULT '2,000+',
ADD COLUMN hero_trust_graduates_text text NOT NULL DEFAULT 'Graduates worldwide',
ADD COLUMN hero_trust_visible boolean NOT NULL DEFAULT true,
ADD COLUMN hero_secondary_cta_text text NOT NULL DEFAULT 'Explore Programs',
ADD COLUMN hero_secondary_cta_link text NOT NULL DEFAULT '/programs';