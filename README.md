# NEXMART — Full-Stack E-Commerce

## Stack
- **Frontend**: SvelteKit + TypeScript + Tailwind CSS v4 + Motion animations
- **Backend**: Express.js + TypeScript
- **Database**: NeonDB (PostgreSQL)
- **Auth**: JWT (customers + admin)

## Setup

### 1. Configure environment variables

**Backend** — copy `backend/.env.example` → `backend/.env` and fill in:
```
DATABASE_URL=postgresql://...@ep-xxx.neon.tech/neondb?sslmode=require
JWT_SECRET=your-secret-here
```

**Frontend** — copy `frontend/.env.example` → `frontend/.env` (defaults work for local dev)

### 2. Run the database schema

In your NeonDB console, run `backend/src/db/schema.sql` to create all tables and seed categories.

### 3. Create an admin user

After registering a normal account, run this SQL in NeonDB:
```sql
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

### 4. Install & run

```bash
npm install           # install root deps (concurrently)
npm run install:all   # install backend + frontend deps
npm run dev           # starts both servers
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001/api
- Admin dashboard: http://localhost:5173/admin

## Routes

| Path | Description |
|------|-------------|
| `/` | Home — hero, categories, featured products |
| `/products` | Product listing with filters & pagination |
| `/products/:id` | Product detail with reviews |
| `/cart` | Shopping cart |
| `/auth/login` | Customer login |
| `/auth/register` | Customer register |
| `/admin` | Dashboard overview |
| `/admin/products` | CRUD products |
| `/admin/orders` | View & update order status |
| `/admin/users` | Manage users / promote admin |
| `/admin/categories` | CRUD categories |
| `/admin/login` | Admin login |
