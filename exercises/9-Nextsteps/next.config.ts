import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'books.google.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'books.google.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'books.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'books.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
