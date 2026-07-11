/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed experimental.appDir as it's causing warnings
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  },
};

module.exports = nextConfig;