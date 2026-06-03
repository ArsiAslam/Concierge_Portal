# Concierge Portal

Modern Next.js 14 concierge management portal with Supabase, JWT authentication, and role-based access control.

## Tech Stack

- **Framework**: Next.js 14 (App Router, Server Actions)
- **Database & Auth**: Supabase (PostgreSQL + GoTrue JWT)
- **Styling**: Tailwind CSS (white + navy blue theme)
- **Validation**: Zod + React Hook Form
- **Security**: DOMPurify sanitization, httpOnly cookies, CSP headers, RLS policies

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment variables
```bash
cp .env.local.example .env.local
# Fill in your Supabase credentials
```

### 3. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run the migration in **Supabase → SQL Editor**:
   - Copy contents of `supabase/migrations/001_initial_schema.sql`
   - Execute it
3. In **Supabase → Authentication → Settings**:
   - Set Site URL to `http://localhost:3000`
   - Add `http://localhost:3000/auth/callback` to Redirect URLs

### 4. Create the first admin user

In the Supabase SQL Editor, run:
```sql
-- After signing up via the app, promote your user to admin:
INSERT INTO public.user_roles (user_id, role_id)
SELECT p.id, r.id
FROM public.profiles p, public.roles r
WHERE p.email = 'your@email.com' AND r.name = 'admin';
```

### 5. Start development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login, Signup pages
│   ├── (dashboard)/     # Protected pages with sidebar nav
│   │   ├── dashboard/   # Overview stats
│   │   ├── supply-market/
│   │   ├── admin/users/
│   │   ├── admin/roles/
│   │   ├── reports/
│   │   └── settings/
│   └── api/auth/        # Auth callback handler
├── components/
│   ├── ui/              # Button, Input, Card, Badge, Modal...
│   ├── navigation/      # Sidebar, TopBar
│   ├── supply-market/   # Supply CRUD table
│   └── admin/           # User management
├── lib/
│   ├── auth/            # Server actions + helpers
│   ├── supabase/        # Client, server, service clients
│   └── utils/           # cn(), sanitize()
├── hooks/               # useAuth, usePermissions
├── types/               # database.ts, auth.ts, navigation.ts
└── constants/           # routes, roles, navigation config
```

## Roles

| Role    | Permissions |
|---------|-------------|
| admin   | Full access — users, supply market, reports, admin panel |
| manager | Supply market (create/read/update), reports |
| staff   | Supply market (read only) |

## Adding New Features (Weekly)

1. Add DB table in a new migration file `supabase/migrations/00N_feature.sql`
2. Add types to `src/types/database.ts`
3. Add route to `src/constants/routes.ts`
4. Add nav item to `src/constants/navigation.ts` (with `requiredPermission` if needed)
5. Create page at `src/app/(dashboard)/your-feature/page.tsx`
6. Create client component at `src/components/your-feature/`
7. Add RLS policies for the new table

## Security

- All inputs sanitized with DOMPurify before DB writes
- Zod schema validation on all server actions
- JWT tokens in httpOnly, Secure, SameSite=Lax cookies
- Row Level Security on all Supabase tables
- Admin route protection in both middleware and page level
- CSP, X-Frame-Options, X-Content-Type-Options headers
