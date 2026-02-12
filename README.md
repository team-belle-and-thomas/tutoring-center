# Private Tutor / Learning Center Manager

**Industry:** Private Education / Tutoring

**The expensive problem:** Churn and revenue leakage — parents leave when they don’t see progress, and centers lose money on untracked sessions.

**The solution (MVP):** Inventory of time. Parents buy “Credit Blocks” (e.g., 10 hours). The system auto-deducts credits per session.

- **ROI dashboard** — Visual progress tracker (grades/goals) so parents see the value.
- **Session continuity notes** — Tutors log notes so the next tutor knows exactly where to pick up.
- **Business value** — Increases customer LTV and prevents unbilled hours.

---

This repo is a minimal **Next.js 15 App Router + TypeScript** app with enforced **linting** and **Husky** hooks.

## Linting

- **ESLint** — Runs the Next.js config (core-web-vitals, TypeScript) plus Prettier compatibility. Catches bugs, accessibility issues, and style problems. Rule `no-console` is set to `warn`.
- **Prettier** — Enforces consistent formatting (quotes, semicolons, line length, import order). Use `prettier:check` to verify and `prettier:fix` to fix.

Both run in CI and locally via the scripts below.

## Husky

[Husky](https://typicode.github.io/husky/) runs Git hooks for this repo. When you run `git commit`, Husky runs scripts at specific times so only valid, lint-clean code gets committed.

**When each hook runs:**

1. **`pre-commit`** — Runs **before** the commit is created. It runs `npm run lint` and `npm run prettier:check`. If either fails, the commit is cancelled and nothing is committed.
2. **`commit-msg`** — Runs **after** you write the message (e.g. in your editor). It runs Commitlint against that message. If the message doesn’t follow the rules below, the commit is rejected and you’re asked to amend the message.

So: staged code must pass lint and Prettier, and the commit message must follow the Conventional Commits format.

**Commit message structure (Commitlint)**

Every commit message must follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<optional scope>): <subject>

<optional body>

<optional footer>
```

- **Type** (required) — One of: `feat`, `fix`, `chore`, `docs`, `style`, `refactor`, `revert`, `build`, `ci`.
- **Scope** (optional) — Short context, e.g. `auth`, `api`, `ui`.
- **Subject** (required) — Short summary in imperative mood. No period at the end.
- **Body** (optional) — Longer description; line length max 200.
- **Footer** (optional) — e.g. `BREAKING CHANGE:`, `Refs: TICKET-123`; line length max 200.

**Length limits:** Header (first line) max **120** characters. Body and footer lines max **200** characters each.

**Examples of valid commit messages:**

```text
feat: add credit block purchase flow
fix(api): correct session credit deduction
chore: update dependencies
docs: document ROI dashboard API
feat(auth): add login form

fix: prevent double deduction on session end

Refs: TUTOR-42
```

**Examples that would be rejected:**

- `Added new feature` — missing type and colon.
- `feat: Add new feature` — subject should be imperative (“add”, not “added”); capital A is allowed but lowercase is preferred.
- `FEAT: add feature` — type must be lowercase.

Run `npm run prepare` after clone so Husky installs these hooks into `.git/hooks`.

## Setup

```bash
cp .env.example .env
npm install
npm run prepare
```

## Scripts

- `npm run dev` — dev server
- `npm run build` — production build
- `npm run start` — production server
- `npm run lint` — ESLint
- `npm run prettier:check` / `npm run prettier:fix` — Prettier
