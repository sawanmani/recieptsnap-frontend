import NextAuth from 'next-auth';

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user?: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      googleId?: string;
    };
    accessToken?: string;
  }

  interface Profile {
    googleId?: string;
  }
}

declare module '@auth/core/jwt' {
  /** Returned by the `jwt` callback */
  interface JWT {
    googleId?: string;
    accessToken?: string;
  }
}