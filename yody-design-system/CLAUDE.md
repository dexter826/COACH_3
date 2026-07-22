# Working with the YODY Design System

You are implementing UI with the **YODY Design System** — a Tailwind v4, shadcn-standard
token foundation + component library for YODY (Vietnamese fashion retail). One token
system serves four surfaces: **marketing · application · portal · store**.

Read **`DESIGN.md`** for the full reference; **`SKILL.md`** is the invocable skill. This file
is the short contract: follow it on every task.

## Install / consume

The registry ships **47 open-code React components** (`@yody/<name>`, 1:1 with
`registry/ui/*.tsx`), the **theme** (role tokens + `.dark`), **utils** (`cn`), a
**use-mobile** hook, and **4 composite kits**. `public/r/*.json` is the built,
installable registry (file contents + npm deps inlined); `public/r/registry.json` is
the served index.

### React (Vite / Next + Tailwind v4) — preferred

```bash
# 1 · Tailwind v4 + theme. Copy colors_and_type.css + tailwind/globals.css into the app,
#     import globals.css from your entry (main.tsx / app.css). globals.css aliases the
#     shadcn role tokens onto YODY tokens + ships .dark.
cd my-app && npm i tailwindcss @tailwindcss/vite tw-animate-css

# 2 · Point shadcn at this registry. In components.json add the @yody namespace:
#       "registries": { "@yody": "https://YOUR_HOST/r/{name}.json" }
npx shadcn@latest init            # reuse the existing components.json shape

# 3 · Install components — three interchangeable flows:
npx shadcn@latest add @yody/button @yody/select @yody/calendar   # by namespace (preferred)
npx shadcn@latest add https://YOUR_HOST/r/dialog.json            # by URL (any static host of public/r/)
npx shadcn@latest add tooltip popover                            # upstream fallback — auto-branded by the theme
```

Every item is open-code: edit after install for YODY specifics (pill radius, gold/status
variants), exactly as `registry/ui/button.tsx` customizes the stock button. No host? Just
copy `registry/ui/*.tsx` + `registry/lib/utils.ts` + `registry/hooks/use-mobile.ts` in
directly. Heavy components pull their lib on install (recharts, vaul, embla,
react-day-picker, cmdk, react-hook-form…) — listed in each `public/r/*.json` `dependencies`.

### Non-React (server-rendered, plain HTML, Vue…)

Load `colors_and_type.css` + the Tailwind layer (**build:** `tailwind/yody.tailwind.css`;
**no-build CDN:** Tailwind v4 browser script + inline `tailwind/yody.components.css`), add
`ui_kits/*` as needed, and use the semantic classes (`.btn`, `.tag`, `.field`, `.avatar`…)
or role/utility classes directly.

> The shadcn CLI is a **Node tool** — run it in a real React repo's terminal, not in this
> HTML preview. The in-browser preview can't resolve npm, so `registry/ui/*.tsx` only bundle
> with their deps via `shadcn build` / `/design-sync`; that warning is expected, not a defect.

- Mirror real product assembly from `preview/components/*` (one specimen per component) and
  `preview/blocks/*` / `examples/*` (full screens) — don't reinvent patterns the DS ships.
- Start a new screen from a **starting point** (picker): App shell, data-table, dashboard
  (App), fashion product (Store) — tagged `@startingPoint` in `preview/blocks/*`.

## Non-negotiable rules

- **Set `data-surface`** (`marketing | app | portal | store`) on `<body>` or a container.
  Omitting it = portal scale. Components never hard-code type sizes or gutters — they read
  surface-resolved tokens.
- **Use tokens, never raw hex.** Brand via `bg-primary`/`bg-brand`, text via
  `text-foreground`/`text-muted-foreground`/`text-fg-2`, etc. Compose accents from
  `--brand · --iris · --gold · --mint · --rose · --gap` (+ tint/deep). Don't invent colors.
- **Type scale is tokenized** — use `text-h1 / text-body / text-eyebrow / text-label`, never
  arbitrary `text-[Npx]`.
- **Gold is decoration only** (logo, one climax moment per page). Never gold text or buttons.
- **No emoji.** Status = tag pills (`LIVE / BUILD / GAP / PLAN`), not 🟢🔴.
- **Sentence case**, no exclamation marks, no marketing fluff. VN-first copy; keep generic
  tech terms in English (KPI, ROI, SKU, API).
- **A11y floor:** visible focus ring, tap target ≥ 44px (56–72px on store),
  honor `prefers-reduced-motion`.
- **Light is default;** dark mode is opt-in via the `.dark` class (build mode).
- **Portal narrative discipline** (claim→evidence→`Kết luận`, Roman numerals, Playfair
  italic) applies ONLY to `data-surface="portal"`. Never on app/marketing/store.

## Where things live

- `colors_and_type.css` — tokens + 4 surface adapters (source of truth)
- `tailwind/globals.css` — canonical theme (role tokens, `.dark`, `@layer base`)
- `tailwind/yody.tailwind.css` / `yody.components.css` — `@apply` component layer
- `registry/ui/*.tsx` + `registry.json` + `public/r/` — React components + installable registry
- `ui_kits/yody-{app,ai,collab,fashion}/` — composite blocks
- `preview/` — living specimens · `examples/` — products that consume the DS (reference only)

Keep brand cohesion: one token system, YODY navy `#2a2b86` + the accent palette, four fonts
(Be Vietnam Pro · Montserrat · Playfair Display · JetBrains Mono). When unsure which surface
or pattern, check `DESIGN.md` or ask.
