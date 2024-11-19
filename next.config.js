/** @type {import('next').NextConfig} */
const nextConfig = { reactStrictMode: true,
    images: {
      domains: [
        'fcpuyl3posiztzia.public.blob.vercel-storage.com', // Add the domain here
        // Other domains...
      ],
    },}

module.exports = nextConfig
