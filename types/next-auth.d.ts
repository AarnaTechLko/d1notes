// types/next-auth.d.ts
import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string; // Add custom `id` field
      type: string; // Add custom `type` field (coach or player)
      name?: string | null;
      email?: string | null;
      image?: string | null;
      package_id?: string | null;
    };
  }
}
