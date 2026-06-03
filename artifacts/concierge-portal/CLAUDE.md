# CLAUDE.md — Concierge Portal

This file is the single source of truth for all AI-assisted work on this project.
Read it fully before touching any file. Follow every rule without exception.

---

## Commands

```bash
npm run dev        # Start dev server at http://localhost:3000
npm run build      # Production build (must pass before any PR)
npm run lint       # ESLint check
npx tsc --noEmit   # TypeScript check (must pass — zero errors allowed)
```

Always run `npx tsc --noEmit && npm run build` after completing any task.
Never report a task as done if either fails.

---

## Stack — exact versions, do not upgrade without asking

| Layer | Package | Version |
|---|---|---|
| Framework | next | 14.2.15 |
| Runtime | react / react-dom | ^18 (NOT React 19) |
| Auth + DB | @supabase/supabase-js | ^2.45.4 |
| SSR cookies | @supabase/ssr | ^0.5.1 |
| Validation | zod | ^3.23.8 |
| Forms | react-hook-form + @hookform/resolvers | ^7 |
| Sanitization | isomorphic-dompurify | ^2.16.0 |
| Icons | lucide-react | ^0.454.0 |
| Styling | tailwindcss | ^3.4.1 |
| JWT | jose | ^5.9.3 |

**React 18 constraints:**
- Use `useFormState` / `useFormStatus` from `react-dom` — NOT `useActionState` (that is React 19).
- No React 19 APIs. No `use()` hook for promises in client components.

---

## Project Structure

```
concierge_portal/
├── middleware.ts                       # Edge auth guard — do not inline logic here
├── supabase/migrations/               # One file per feature, numbered 001_, 002_…
├── src/
│   ├── app/
│   │   ├── (auth)/                    # Public pages: login, signup
│   │   │   ├── layout.tsx             # Split-panel auth shell
│   │   │   ├── login/page.tsx
│   │   │   └── signup/page.tsx
│   │   ├── (dashboard)/               # All protected pages
│   │   │   ├── layout.tsx             # Sidebar + TopBar shell (server, auth-gated)
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── supply-market/page.tsx
│   │   │   ├── admin/users/page.tsx
│   │   │   ├── admin/roles/page.tsx
│   │   │   ├── reports/page.tsx
│   │   │   └── settings/page.tsx
│   │   ├── api/auth/callback/route.ts # Supabase OAuth callback
│   │   ├── globals.css
│   │   ├── layout.tsx                 # Root layout
│   │   ├── not-found.tsx
│   │   └── page.tsx                   # Redirects to /dashboard
│   ├── components/
│   │   ├── ui/                        # Shared primitives only
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Select.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   ├── navigation/
│   │   │   ├── Sidebar.tsx            # Collapsible, permission-filtered
│   │   │   └── TopBar.tsx
│   │   ├── supply-market/
│   │   │   └── SupplyMarketClient.tsx # 'use client' CRUD table
│   │   └── admin/
│   │       └── UserManagementClient.tsx
│   ├── constants/
│   │   ├── navigation.ts              # NAV_SECTIONS — add nav items here
│   │   ├── roles.ts                   # ROLES, PERMISSIONS constants
│   │   └── routes.ts                  # ROUTES — all href strings live here
│   ├── hooks/
│   │   ├── useAuth.ts                 # Client hook: current User + signOut
│   │   └── usePermissions.ts          # Client hook: roles + permissions map
│   ├── lib/
│   │   ├── auth/
│   │   │   ├── actions.ts             # 'use server' actions: login, signup, logout, createUser
│   │   │   └── helpers.ts             # getAuthUser(), hasPermission(), isAdmin()
│   │   ├── supabase/
│   │   │   ├── client.ts              # Browser client (typed with Database)
│   │   │   └── server.ts              # Server client + service-role client
│   │   └── utils/
│   │       ├── cn.ts                  # clsx + tailwind-merge
│   │       └── sanitize.ts            # sanitizeString, sanitizeEmail, sanitizeObject
│   └── types/
│       ├── auth.ts                    # AuthUser, LoginSchema, SignupSchema, RoleName
│       ├── database.ts                # Full DB type map + Row/Insert/Update aliases
│       └── navigation.ts              # NavItem, NavSection
```

### Rules about structure
- Every new feature gets its own folder under `src/components/your-feature/` and `src/app/(dashboard)/your-feature/`.
- Never put feature logic directly in `page.tsx` — fetch in the server page, render in a client component.
- Do not create files outside `src/` except migrations and root config files.
- Do not add new config files (jest, vitest, etc.) without explicit instruction.

---

## Adding a New Feature (weekly checklist — follow in order)

1. **Database**: Create `supabase/migrations/00N_feature_name.sql`
   - Enable RLS on every new table.
   - Write RLS policies for each role that needs access.
   - Add trigger for `updated_at` if the table has that column.
   - Seed any lookup/enum data needed.

2. **Types**: Add Row/Insert/Update types to `src/types/database.ts`.
   Export a named alias (`export type MyThing = Database['public']['Tables']['my_thing']['Row']`).

3. **Route**: Add the path to `src/constants/routes.ts` under `ROUTES`.

4. **Nav item**: Add to `src/constants/navigation.ts` under the correct `NAV_SECTIONS` group.
   Set `requiredPermission: 'resource:action'` if the item is role-gated.

5. **Server page**: Create `src/app/(dashboard)/your-feature/page.tsx`
   - Mark `export const dynamic = 'force-dynamic'` on pages that read DB data.
   - Call `getAuthUser()` and `hasPermission()` for access control at page level.
   - Fetch all server data here, pass as props to the client component.
   - Export `metadata` for the page title.

6. **Client component**: Create `src/components/your-feature/YourFeatureClient.tsx`
   - Mark `'use client'` at the top.
   - Receive server-fetched data as props — do not fetch in client on mount unless necessary.
   - Use `useTransition` for Supabase mutations, not `useState` loading flags alone.
   - Use `(supabase as any)` for complex join queries where TypeScript infers `never`.

7. **Server actions** (if form submissions needed): Add to `src/lib/auth/actions.ts` or create `src/lib/auth/your-feature-actions.ts`.
   - Mark `'use server'`.
   - Validate with Zod before any DB write.
   - Sanitize all string inputs with `sanitizeString` / `sanitizeEmail`.
   - Return `ActionState` (`{ error?: string; success?: string }`).

8. **Permissions**: Update `supabase/migrations/00N_...sql` to add the new resource/action to the relevant role `permissions` JSONB column.
   Update `src/constants/roles.ts` PERMISSIONS constant to match.

9. **Verify**: `npx tsc --noEmit && npm run build` — zero errors, zero warnings you introduced.

---

## Supabase Client Rules

### Which client to use — never mix them up

| Context | Import | Use for |
|---|---|---|
| Server Component / Server Action | `createClient()` from `@/lib/supabase/server` | Reading data with user's permissions |
| Admin operations (create users, bypass RLS) | `createServiceClient()` from `@/lib/supabase/server` | Admin-only mutations only |
| Client Component | `createClient()` from `@/lib/supabase/client` | Real-time, client-side queries |
| Middleware | Inline `createServerClient` from `@supabase/ssr` | Session refresh only |

**Never** import the browser client in a Server Component or Server Action.
**Never** use the service-role client in a client component — it would expose the service key.
**Never** call `supabase.auth.getSession()` for auth checks — always use `supabase.auth.getUser()` (session is unverified client data).

### Cookie security
All cookie setters must include:
```ts
httpOnly: true,
secure: process.env.NODE_ENV === 'production',
sameSite: 'lax',
```
Do not remove these. Do not set `httpOnly: false`.

---

## Security Rules — Non-Negotiable

### Input sanitization
Every string value arriving from `FormData`, query params, or user input must pass through sanitization before being written to the database or returned in a response.

```ts
// Correct
const name = sanitizeString(formData.get('name'))
const email = sanitizeEmail(formData.get('email'))

// Wrong — never do this
const name = String(formData.get('name'))
const email = formData.get('email') as string
```

Passwords are never sanitized (sanitizing changes the value) — only validate length and pattern with Zod.

### Zod validation
Every Server Action must define a Zod schema and call `.safeParse()` before any DB write.
Never skip validation for "simple" fields.
Return the first error message to the client: `parsed.error.errors[0].message`.

### Authorization — double guard
Auth is enforced at two layers:

1. **Middleware** (`middleware.ts`): redirects unauthenticated users and checks admin role for `/admin/*` routes.
2. **Page level** (`page.tsx`): call `getAuthUser()` + `isAdmin()` or `hasPermission()` — never rely on middleware alone.

Pattern for admin pages:
```ts
const user = await getAuthUser()
if (!isAdmin(user)) redirect('/dashboard')
```

Pattern for permission-gated pages:
```ts
const user = await getAuthUser()
if (!hasPermission(user, 'resource', 'action')) redirect('/dashboard')
```

### Row-Level Security
Every new Supabase table must have RLS enabled and explicit policies.
Never disable RLS on a table.
Never use `{ count: 'exact' }` with the service-role client on user-facing endpoints.

### No secrets in client code
`SUPABASE_SERVICE_ROLE_KEY` must never appear in any file under `src/components/` or any `'use client'` file.
Only `NEXT_PUBLIC_*` variables are safe in client code.

### SQL injection
Never construct raw SQL strings with user input. Always use Supabase's query builder.
Never use `.rpc()` with string-interpolated arguments.

### XSS
Never use `dangerouslySetInnerHTML`. If it is ever needed, sanitize with DOMPurify first and document exactly why.

---

## TypeScript Rules

- Strict mode is enabled (`"strict": true` in tsconfig). Zero `any` without a documented reason.
- The only accepted uses of `as any` are:
  - Supabase join queries that return `never` due to the typed client not understanding relational selects (e.g., `select('roles(name)')`). Cast the entire client: `(supabase as any).from(...)`.
  - Explicit type narrowing after a runtime check where TypeScript still complains.
- Never use `// @ts-ignore` or `// @ts-expect-error`.
- All exported functions must have explicit return types.
- All `async` server functions that hit the DB must have explicit return type annotations.
- `unknown` is preferred over `any` for external data boundaries (e.g., raw API responses).

---

## Design & Styling Rules

### Color palette — do not invent new colors
| Token | Hex | Use |
|---|---|---|
| `bg-navy-800` | `#0f1f3d` | Sidebar background |
| `bg-navy-900` | `#0a1628` | Sidebar footer / hover |
| `bg-brand-700` | `#1d4ed8` | Primary buttons, active nav, avatar |
| `bg-brand-600` | `#2563eb` | Logo icon, notification dot |
| `text-brand-600` | `#2563eb` | Links, icon accents |
| `bg-surface` | `#f8faff` | Page background |
| `bg-white` | `#ffffff` | Cards, modals, top bar |
| `border-slate-200` | system | Default card/input borders |
| `text-slate-900` | system | Primary body text |
| `text-slate-500` | system | Secondary/helper text |

### Component rules
- Always use the shared UI primitives in `src/components/ui/` — never write one-off button or input HTML inline in a feature component.
- `Button` variants: `primary` (default), `secondary`, `danger`, `ghost`. Do not add variants without adding them to `Button.tsx` properly.
- `Badge` variants: `default`, `primary`, `success`, `warning`, `danger`, `admin`, `manager`, `staff`. Match role names to badge variants.
- `Card` is always `rounded-xl border border-slate-200 bg-white shadow-card`. Do not override these with arbitrary shadows or borders.
- `Modal` handles scroll-lock and Escape key. Do not re-implement this elsewhere.

### Layout
- The dashboard shell is: `flex h-screen overflow-hidden` → sidebar (fixed width) + main column (`flex flex-col overflow-hidden`).
- Do not add a second scrollable container inside the main area — `main` already scrolls with `overflow-y-auto`.
- Sidebar width: `w-64` (expanded) / `w-16` (collapsed). Do not change these values.
- Page content padding: `p-6`. Do not increase or decrease this default.
- Section gaps between page elements: `space-y-6`. Maintain this vertical rhythm.

### Typography
- Page heading (h2): `text-xl font-semibold text-slate-900`
- Page subheading (p): `text-sm text-slate-500`
- Card section title: `text-base font-semibold text-slate-900` (via `CardTitle`)
- Table header cells: `text-xs font-semibold uppercase tracking-wide text-slate-500`
- Table body cells: `text-sm text-slate-900` (primary) / `text-slate-600` (secondary) / `text-slate-500` (tertiary)

### Icons
All icons come from `lucide-react`. Do not install any other icon library.
Standard icon sizes: `h-4 w-4` (inline/nav), `h-5 w-5` (topbar), `h-6 w-6` (stat cards).

### No emojis in code
Do not add emojis to component text, labels, or headings. The existing greeting emoji (`👋`) in dashboard is the single exception.

---

## Navigation

Adding a nav item:
```ts
// src/constants/navigation.ts — add to the correct NAV_SECTIONS group
{
  label: 'My Feature',
  href:  ROUTES.MY_FEATURE,   // defined in routes.ts
  icon:  SomeLucideIcon,
  requiredPermission: 'my_feature:read',  // omit if visible to all roles
}
```

The Sidebar reads `NAV_SECTIONS` and automatically filters items by the user's permissions. You do not touch `Sidebar.tsx` to add nav items.

---

## Server Actions Pattern

```ts
'use server'
// src/lib/auth/actions.ts or src/lib/your-feature-actions.ts

const mySchema = z.object({
  name: z.string().min(1).max(200),
  // ...
})

export async function myAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  // 1. Sanitize
  const raw = {
    name: sanitizeString(formData.get('name')),
  }
  // 2. Validate
  const parsed = mySchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.errors[0].message }

  // 3. Auth check
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

  // 4. DB write
  const { error } = await supabase.from('my_table').insert(parsed.data)
  if (error) return { error: error.message }

  return { success: 'Done.' }
}
```

In client components, connect with `useFormState`:
```tsx
'use client'
import { useFormState, useFormStatus } from 'react-dom'

function SubmitButton() {
  const { pending } = useFormStatus()
  return <Button type="submit" loading={pending}>Save</Button>
}

export function MyForm() {
  const [state, action] = useFormState(myAction, {})
  return (
    <form action={action}>
      {state.error && <p className="text-red-600 text-sm">{state.error}</p>}
      <Input name="name" label="Name" required />
      <SubmitButton />
    </form>
  )
}
```

---

## Database Migration Pattern

```sql
-- supabase/migrations/002_my_feature.sql

create table public.my_things (
  id         uuid default uuid_generate_v4() primary key,
  name       text not null,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.my_things enable row level security;

create policy "Authenticated users can read"
  on public.my_things for select using (auth.role() = 'authenticated');

create policy "Owners can insert"
  on public.my_things for insert with check (user_id = auth.uid());

create policy "Owners can update"
  on public.my_things for update using (user_id = auth.uid());

create policy "Admins can delete"
  on public.my_things for delete using (
    exists (
      select 1 from public.user_roles ur
      join public.roles r on ur.role_id = r.id
      where ur.user_id = auth.uid() and r.name = 'admin'
    )
  );

create trigger my_things_updated_at before update on public.my_things
  for each row execute procedure public.handle_updated_at();
```

---

## Roles & Permissions

| Role | DB name | What it means |
|---|---|---|
| Admin | `admin` | Full access to everything. Bypass all permission checks in code via `isAdmin()`. |
| Manager | `manager` | Supply market create/read/update, reports read. No user management. |
| Staff | `staff` | Supply market read-only. |

Checking permissions in server code:
```ts
import { getAuthUser, hasPermission, isAdmin } from '@/lib/auth/helpers'

const user = await getAuthUser()
hasPermission(user, 'supply_market', 'create')  // true if admin OR has explicit permission
isAdmin(user)                                    // true only for admin role
```

Checking permissions in client components:
```ts
import { usePermissions } from '@/hooks/usePermissions'

const { isAdmin, permissions, roles } = usePermissions()
```

When adding a new resource, add its actions to the `permissions` JSONB in the `roles` table via a migration, and add the constants to `src/constants/roles.ts`.

---

## What NOT to Do

- Do not install `shadcn/ui`, `radix-ui`, `@headlessui/react`, or any other component library — the project has its own UI primitives.
- Do not install `axios` — use native `fetch` for any HTTP calls outside Supabase.
- Do not use `localStorage` or `sessionStorage` for auth tokens — cookies only.
- Do not write raw SQL strings with user data — use the Supabase query builder.
- Do not add `console.log` statements to committed code.
- Do not create a `utils.ts` dump file — add utilities to the appropriate file in `src/lib/utils/`.
- Do not create barrel `index.ts` files — import directly from the file.
- Do not use default exports for utility functions or hooks — named exports only. Default exports are only for page and layout components (Next.js requirement).
- Do not add error boundaries or `try/catch` around Supabase queries that should just fail fast — let Next.js error boundaries handle them.
- Do not use `getServerSideProps` or `getStaticProps` — this is App Router only.
- Do not put business logic in `middleware.ts` — it runs on every request at the edge and must stay minimal.
- Do not commit `.env.local` — it is gitignored.

---

## Environment Variables

| Variable | Where used | Required |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Browser + server | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser + server | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only (service client) | Yes |
| `NEXT_PUBLIC_APP_URL` | Auth redirects | Yes |

`NEXT_PUBLIC_*` variables are embedded in the client bundle — never put secrets in them.

## How JWT Works in This Project

This project does **not** use a custom JWT library. JWT is handled entirely by Supabase Auth.

Flow:
1. User logs in → `supabase.auth.signInWithPassword()` → Supabase GoTrue issues a signed JWT access token + refresh token.
2. `@supabase/ssr` stores both as **httpOnly, Secure, SameSite=Lax cookies** automatically (cookie name: `sb-[project-ref]-auth-token`).
3. On every request, `middleware.ts` calls `supabase.auth.getUser()` — this sends the JWT from the cookie to Supabase's auth server for cryptographic verification.
4. `@supabase/ssr` automatically refreshes the JWT before it expires.

**Do not install `jose` or any other JWT library.** If you need to verify Supabase JWTs without a network call (edge performance optimization), ask the project owner before adding local JWT verification — it requires `SUPABASE_JWT_SECRET` from the Supabase dashboard and must be kept in sync.

---

## Commit / PR Rules

- Run `npx tsc --noEmit && npm run build` before every commit. Both must succeed.
- One feature per PR. Do not bundle unrelated changes.
- Migration files are never edited after they have been run in any environment — create a new migration instead.
- Never force-push to `main`.
