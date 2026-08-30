# Mixture Separation Process Lab Design System

## Purpose

This is a light-mode, learner-first system for Korean learners in grades 5–6. Every screen answers three questions in order: where am I, what am I noticing, and what should I do next? The deterministic domain, simulation, and local-only state contracts remain unchanged.

## Tokens

The canonical CSS tokens live in `src/styles/tokens.css` and use the following names:

- Color: `--page`, `--surface`, `--surface-raised`, `--ink`, `--ink-soft`, `--muted`, `--accent`, `--accent-strong`, `--accent-soft`, `--border`, `--focus`, `--warning-surface`, `--warning-border`, `--danger`.
- Spacing: `--space-1` through `--space-7`, in quarter-rem increments.
- Radius: `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-pill`.
- Surface: `--shadow-card`, `--shadow-dialog`.

`--muted: #5a6f7f` is selected against `--page: #f3f7fa` to maintain at least 4.5:1 text contrast for supporting labels.

Material token colors and patterns are semantic data visualisation and must not be removed or communicated by color alone.

## Component rules

- `LearningProgress` is a static ordered list. The current item has `aria-current="step"`; completed and locked items expose text and `data-state`.
- `StageHeader` renders eyebrow, one clear heading, and one short instruction. Safety copy is not repeated inside it.
- `LearningCallout` uses `question`, `hint`, `success`, or `warning` tones and an appropriate `role`.
- Callouts and safety notices use a 1px semantic outline with a restrained top inset accent; no thick side-tab borders.
- Each screen has at most one learner CTA with `data-attention="true"` and `gi-pulse`. Secondary actions use neutral borders.
- `PrimaryAction` is at least 44px tall. `:focus-visible` uses a 3px outline and 3px offset.

## Responsive and motion rules

- 375px is the required narrow viewport; content must remain within the viewport width.
- At 560px, tables and cards flow vertically; at 768px, process content may use two columns; at 1100px, the shell may use the wide layout.
- No dark-mode override is provided. No remote fonts, images, analytics, or network calls are allowed.
- Under `prefers-reduced-motion: reduce`, pulse and token movement animations are disabled while before/after scenes, arrows, and status text remain visible.

## Content and safety

Use short Korean sentences and concrete verbs. Never expose stored IDs in learner-facing copy. The app is a virtual model: do not provide real quantities, temperatures, durations, dangerous procedures, personal-data fields, or voice features.
