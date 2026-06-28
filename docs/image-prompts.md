# astro-haze — Image generation prompts

ChatGPT / DALL·E 用の画像生成プロンプト集です。各画像は **指定のパス・寸法・フォーマット**で `public/images/...` に書き出してください（`public/` が無ければ作成）。

## 共通アートディレクション（全プロンプトの先頭に付ける）

```
Style: premium glassmorphism UI, frosted translucent panels with soft gaussian
blur, layered aurora-gradient background (violet, electric blue, magenta, mint
green), faint film grain, thin light highlight on the top edge of each glass
panel, soft ambient shadows, clean geometric sans-serif typography, generous
whitespace, calm and high-end product design aesthetic, dark theme.
High detail, crisp, realistic interface, no logos, no watermarks, no gibberish
text, legible short labels only.
```

> ライト版が必要なら "dark theme" を "light airy theme, near-white frosted glass" に置換。
> 出力後、フォーマットは下表に合わせて変換してください（projects=WebP / blog=JPG / og=PNG）。

---

## プロジェクト（ポートフォリオ）

### Northstar Civic Platform — 自治体サービス検索（Astro / Contentful）
落ち着いた・アクセシブルな行政サービスハブ。

| パス | 寸法 | 内容プロンプト |
|---|---|---|
| `public/images/projects/northstar-cover.webp` | 1600×1000 | `A civic service-finder web app shown on a desktop screen next to a phone, both floating on glass. A large friendly search field reads "Find local support", below it soft category cards (Housing, Health, Family, Benefits). Calm, accessible, lots of breathing room.` |
| `public/images/projects/northstar-search.webp` | 1600×1200 | `Close-up of an accessible search results screen on a glass panel: a prominent search bar, clear result cards each with a short title and one-line description, large tap targets, strong text contrast.` |
| `public/images/projects/northstar-mobile.webp` | 1600×1200 | `A single mobile phone mockup on aurora glass showing the civic service finder: stacked result cards, a sticky bottom action bar, clean accessible typography.` |
| `public/images/projects/northstar-directory.webp` | 1600×1200 | `A directory / category overview screen: a grid of frosted glass tiles for local services with simple line icons and short labels, organized and uncluttered.` |

### Fieldnote Research Library — 研究アーカイブ（Next.js / Meilisearch）
何年分ものインタビュー・観察を横断検索できる研究ライブラリ。

| パス | 寸法 | 内容プロンプト |
|---|---|---|
| `public/images/projects/fieldnote-cover.webp` | 1600×1000 | `A research knowledge-base interface on glass: a left sidebar of saved studies, a central document with several highlighted observation snippets, a search bar with instant filtered results. Scholarly but modern.` |
| `public/images/projects/fieldnote-library.webp` | 1600×1200 | `A library view of research entries as frosted cards in a grid, each with a tag chip and a short excerpt, a faceted filter rail on the left.` |
| `public/images/projects/fieldnote-evidence.webp` | 1600×1200 | `A document detail view where key sentences are highlighted as "evidence", with margin annotations connected by thin lines to a side panel.` |
| `public/images/projects/fieldnote-timeline.webp` | 1600×1200 | `A horizontal research timeline on glass: milestones and interview events plotted along a line, each node a small frosted card with a date and short label.` |

### Interval Health Companion — 在宅リハビリ伴走（React / Supabase）
臨床プランを家庭で続けられるリズムに変える、プライベートな回復アプリ。

| パス | 寸法 | 内容プロンプト |
|---|---|---|
| `public/images/projects/interval-cover.webp` | 1600×1000 | `A calm health-recovery mobile app on aurora glass showing today's rehabilitation plan: a short list of exercises with checkboxes, a gentle progress ring, reassuring tone. Soft, private, medical-grade clarity.` |
| `public/images/projects/interval-plan.webp` | 1600×1200 | `A daily plan screen: exercise cards each with a small illustration, sets/reps, and the clinician's written note preserved beneath, clear reduced-motion friendly layout.` |
| `public/images/projects/interval-checkin.webp` | 1600×1200 | `A friendly daily check-in screen with a simple how-do-you-feel scale, large accessible buttons, and a private notes field.` |
| `public/images/projects/interval-progress.webp` | 1600×1200 | `A recovery progress screen: a multi-week streak/calendar and a soft trend chart, encouraging and low-pressure, on frosted glass.` |

### Afterlight Cultural Archive — 文化アーカイブ（Astro / Sanity / MapLibre）
口承史・物・場所の関係性を保ったまま探索できる、雰囲気のあるデジタルアーカイブ。

| パス | 寸法 | 内容プロンプト |
|---|---|---|
| `public/images/projects/afterlight-cover.webp` | 1600×1000 | `An atmospheric cultural-archive interface on glass: an oral-history audio player with a transcript on the left, beside elegant collection photography of artifacts on the right, moody and reverent.` |
| `public/images/projects/afterlight-story.webp` | 1600×1200 | `An immersive oral-history story page: a waveform audio player, flowing transcript text, and small related artifact thumbnails, dark and cinematic.` |
| `public/images/projects/afterlight-map.webp` | 1600×1200 | `An interactive map view (MapLibre style) on dark glass with glowing location pins connecting places to archive entries, thin connecting lines showing relationships.` |
| `public/images/projects/afterlight-collection.webp` | 1600×1200 | `A gallery of archived objects as frosted cards with museum-quality photography, subtle metadata captions, refined grid.` |

---

## ブログ（記事ヒーロー）

| パス | 寸法 | 内容プロンプト |
|---|---|---|
| `public/images/blog/getting-started.jpg` | 1600×900 | `An abstract hero illustration: floating translucent glass UI panels and a code-editor-like card assembling together over an aurora gradient, conveying "getting started / setup". Clean, optimistic.` |
| `public/images/blog/design-principles.jpg` | 1600×900 | `An abstract hero about design principles: layered frosted glass cards, a soft type-scale ramp, color tokens as glowing chips, and a blurred aurora backdrop. Editorial and elegant.` |

---

## OG 画像（SNS シェア）

| パス | 寸法 | 内容プロンプト |
|---|---|---|
| `public/og-image.png` | 1200×630 | `A social share banner for a web theme called "Astro Haze": a large frosted glass card centered over a vivid aurora gradient, with empty space for a title. Minimal, premium, glassmorphism. (Leave the center clean — text is added separately.)` |

> タイトル文字は別途重ねる前提で、中央を空けておくと使い回しやすいです。

---

## ランディング画像（任意 — 現在は Unsplash リモート）

`src/content/landing/demo.json` は現在 Unsplash のリモート画像を参照しています。**ローカル同梱に差し替えたい場合**は以下を生成し、demo.json の URL をローカルパスへ書き換えてください（書き換えは私が対応します）。

| 想定パス | 寸法 | 内容プロンプト |
|---|---|---|
| `public/images/landing/hero.webp` | 1200×1500（縦） | `A flagship product hero visual: a stack of frosted glass UI panels floating at an angle over a rich aurora gradient, premium SaaS landing aesthetic, portrait orientation.` |
| `public/images/landing/gallery-1.webp` | 1400×1000 | `Editorial campaign image of a glassmorphism product interface in context, warm aurora lighting.` |
| `public/images/landing/gallery-2.webp` | 1200×1000 | `A clean studio shot of layered frosted UI cards, cool blue-violet palette.` |
| `public/images/landing/gallery-3.webp` | 1200×1000 | `An abstract close-up of frosted glass texture with aurora light refraction, used as a mood image.` |

---

## メモ
- 生成後、`public/images/...` に配置すれば各ページに自動反映されます（パスは既にコンテンツ側で参照済み）。
- AVIF/WebP 最適化は、画像を `src/assets/` に移して import すれば Astro `<Image>` が自動変換します（さらに高速）。現状の `public/` 直参照でも表示は問題ありません。
- favicon は別途ベクターで用意します（AI生成不要）。
