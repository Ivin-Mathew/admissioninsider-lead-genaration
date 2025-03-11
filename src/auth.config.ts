// filepath: auth.config.ts
import { Account, NextAuthOptions, Profile, User } from 'next-auth';
import { AdapterUser } from 'next-auth/adapters';

export const authConfig: NextAuthOptions = {
  providers: [], // Add providers here
  callbacks: {
    signIn({ user, account, profile, email, credentials }: { user: User | AdapterUser, account: Account | null, profile?: Profile, email?: { verificationRequest?: boolean }, credentials?: Record<string, unknown> }) {
      const isLoggedIn = !!user;
      const isOnDashboard = profile && 'url' in profile && typeof profile.url === 'string' && profile.url.startsWith('/dashboard');
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return '/login'; // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        return '/dashboard';
      }
      return true;
    },
  },
  pages: {
    signIn: '/login',
  },
};