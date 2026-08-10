# cori.is/typing

Personal hub. Napkin-sketch site that routes people to the right room.

This repo is **dotis only**. Cutting Words and Hardly are separate repos with their own brainstorms and shipping cycles. Do not implement sister-site features here.

| Site | Repo | Domain | Planning |
|------|------|--------|----------|
| cori.is/typing | [dotis](https://github.com/corix/dotis) (this repo) | cori.is/typing | this file |
| Cutting Words | [cuttingwords](https://github.com/corix/cuttingwords) | cuttingwords.com | [brainstorm-cuttingwords.md](https://github.com/corix/cuttingwords/blob/main/brainstorm-cuttingwords.md) |
| Hardly | [hardly](https://github.com/corix/hardly) | hardly.consulting | [brainstorm-hardly.md](https://github.com/corix/hardly/blob/main/brainstorm-hardly.md) |

---

## This site

- `#about` — personal intro
- `#my-work` — teaser cards → cuttingwords.com, hardly.consulting
- `#etc` — audience routing (hiring manager → CW, campaign/nonprofit → Hardly)

**Tone:** napkin sketch, personal, witty. Visual reference: `site-sketch.png`.

**Backlog:** “secret third thing” — possible microblog + newsletter digest. Not committed.

---

## Outbound links (this repo)

Keep these live in `index.html`. Sister-site internals live in their repos.

| From | To |
|------|-----|
| Work panel left | https://cuttingwords.com |
| Work panel right | https://hardly.consulting |
| Etc → hiring manager | https://cuttingwords.com |
| Etc → campaign / nonprofit | https://hardly.consulting |

---

## Shared styles

Copy, don’t import. Each site owns its CSS; when you change a **shared** value, update this block and then the sister repos.

**Shared DNA**

```css
--paper: #faf8f5;
--ink: #1a1a1a;
--text: #0f0f0f;
--font: 'Overpass', sans-serif;
--font-mono: 'Overpass Mono', monospace;
```

- Dark mode: `data-theme="dark"` on `<html>`
- Theme storage: `localStorage` key `theme` (same key on all three sites)
- Theme flash snippet in `<head>` before paint
- Footer / eyebrow: each site links to the other two with audience-appropriate labels

**Per-site (do not unify)**

| Token / trait | dotis | Cutting Words | Hardly |
|---------------|-------|---------------|--------|
| `--accent` | `#e69138` | `#c45c26` | `#e69138` (same as dotis) |
| `--page-width` | `48rem` | `42rem` | `48rem` |
| Aesthetic | napkin sketch | polished portfolio | grassroots / civic |

Hardly may stay closer to this site visually. Cutting Words should not flatten toward napkin energy.

---

## Original notes (this site)

Simple: about and “work,” drawn on the back of a napkin. Work links out to Cutting Words (portfolio for hiring managers) and Hardly (consultancy for campaigns and nonprofits). Personality stays here; professional depth and civic ops live on the sister sites.
