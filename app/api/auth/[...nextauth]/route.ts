import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }: any) {
      if (account && profile) {
        // New Google sign-in: sync with backend to get OUR JWT, not Google's token
        try {
          const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
          const res = await fetch(`${backendUrl}/api/auth/sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              googleId: profile.sub,
              email: profile.email,
              name: profile.name,
              avatarUrl: profile.picture,
            }),
          });
          if (res.ok) {
            const data = await res.json();
            token.accessToken = data.token; // backend JWT, replaces Google's token
            token.googleId = profile.sub;
          } else {
            console.error('Backend auth sync failed:', res.status);
          }
        } catch (err) {
          console.error('Backend auth sync error:', err);
        }
      }
      return token;
    },
    async session({ session, token }: any) {
      // Add Google ID and access token to session
      session.user.googleId = token.googleId;
      session.accessToken = token.accessToken;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
    error: '/login', // Error code passed in query string as ?error=
  },
});

export { handler as GET, handler as POST };