/** @type {import('next').NextConfig} */
const nextConfig = { reactStrictMode: true,
    images: {
      domains: [
        'f99fmwunzb6eq4s0.public.blob.vercel-storage.com', // Add the domain here
        // Other domains...
      ],
    },}

module.exports = nextConfig
