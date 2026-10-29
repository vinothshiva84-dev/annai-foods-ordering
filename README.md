# Annai Foods ordering app

A mobile-friendly customer ordering website with Supabase order storage, WhatsApp order handoff, and a password-protected admin dashboard.

## Included

- Customer menu and quantity selector (prices in South African rand)
- Customer name, phone, collection/delivery, requested date/time, delivery address, special requests
- Saves orders to Supabase
- Opens WhatsApp to `065 118 8768` with the order summary after the database save succeeds
- Admin sign-in, order list, customer/order details, and order status updates
- Supabase Row Level Security policies

## 1. Create the app environment

This project needs a computer or cloud development environment to run and deploy. Supabase is the database/backend; it does not itself host this Next.js website.

1. Download and unzip the project.
2. Install Node.js (20.9 or newer).
3. Open a terminal in the unzipped `annai-foods-app` folder.
4. Run `npm install`.
5. Copy `.env.example` to `.env.local`.
6. Fill in the two values:
   - `NEXT_PUBLIC_SUPABASE_URL`: your Supabase Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: your Supabase publishable key (the `sb_publishable_...` value)
7. Run `npm run dev` and open `http://localhost:3000`.

Do not put a `service_role` or secret key in this project. The browser uses only the publishable key and database security policies.

## 2. Set up the Supabase database

1. Open your Supabase project.
2. Open **SQL Editor** and create a new query.
3. Copy and run the complete contents of `supabase/setup.sql`.
4. Confirm the `orders` and `admin_users` tables exist under **Table Editor**.

## 3. Create your admin login

1. In Supabase, open **Authentication → Users**.
2. Add a user with the admin email address and a strong password.
3. Copy that user's UUID.
4. Open **SQL Editor** and run this statement, replacing the UUID with the user UUID:

```sql
insert into public.admin_users (user_id)
values ('PASTE-ADMIN-USER-UUID-HERE');
```

Only users listed in `admin_users` can read or update customer orders. Do not make the orders table publicly readable.

## 4. Deploy the website

Deploy the folder to a Next.js hosting provider such as Vercel:
1. Create a Vercel account and import this project from a Git repository, or upload/push the project to a Git provider first.
2. In the hosting project's Environment Variables, add the same `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Deploy. The hosting provider will give you a public website URL.
4. Open `/admin` on that URL to manage orders.

## Notes

- WhatsApp handoff opens a prefilled message to the South African number `+27 65 118 8768`. The customer must tap Send in WhatsApp.
- The database save happens before WhatsApp opens. Customers cannot read other orders; only allow-listed admin accounts can view or update them.
- The current menu and prices are based on the previously confirmed Annai Foods menu. Please check the menu labels against the original flyer before publishing.
- Delivery fees are not included because no delivery fee was specified.
