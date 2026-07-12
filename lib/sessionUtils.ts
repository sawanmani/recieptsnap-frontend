import { Session } from 'next-auth';

/**
 * Safely extracts the access token from a session object
 * @param session The session object from useSession()
 * @returns The access token if it exists, otherwise undefined
 */
export const getAccessToken = (session: Session | null): string | undefined => {
  if (!session) {
    return undefined;
  }

  return session.accessToken;
};