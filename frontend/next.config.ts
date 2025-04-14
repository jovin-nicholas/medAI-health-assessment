import type { NextConfig } from 'next';

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  // serverExternalPackages: ['sharp', 'onnxruntime-node'],
  // webpack: (config) => {
  //   // Required for Transformers.js to work properly
  //   config.resolve.alias = {
  //     ...config.resolve.alias,
  //     "sharp$": false,
  //     "onnxruntime-node$": false,
  //   };
  //   return config;
  // },
  
  // async rewrites(): Promise<any> {
  //   return [
  //     {
  //       source: '/api/:path*',
  //       destination: 'http://localhost:8000/api/:path*'
  //     }
  //   ]
  // },

  logging: {
    fetches: {
      hmrRefreshes: true,
      fullUrl: true,
    }
  },
  
  experimental: {
    ppr: true,
  },
  images: {
    remotePatterns: [
      {
        hostname: 'avatar.vercel.sh',
      },
    ],
  },
  output: "standalone"
};

export default nextConfig;
