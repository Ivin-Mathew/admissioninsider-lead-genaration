

# Admission Insider Lead Generation App

This is a Next.js application with Supabase authentication and database integration.

## Getting Started

### Prerequisites

1. Node.js 18+ installed
2. A Supabase account and project
3. Environment variables set up

### Setting up Supabase

1. Create a new Supabase project at [https://supabase.com](https://supabase.com)
2. Run the schema SQL in the Supabase SQL editor:
   - Navigate to the SQL Editor in your Supabase dashboard
   - Copy and paste the contents of `supabase/schema.sql`
   - Run the SQL to create the necessary tables and types
3. Set up the triggers for user creation:
   - Navigate to the SQL Editor in your Supabase dashboard
   - Copy and paste the contents of `supabase/triggers.sql`
   - Run the SQL to create the necessary triggers and policies
4. Configure Simple Authentication:
   - Go to Authentication > Providers
   - Make sure Email provider is enabled
   - **Disable** the "Confirm email" option
   - See `docs/supabase-setup.md` for detailed instructions

### Environment Setup

Create a `.env.local` file in the root directory with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Running the Application

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
