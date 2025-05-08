// /** @type {import('next').NextConfig} */
// const nextConfig = { reactStrictMode: true,
//     images: {
//       domains: [
//         'fcpuyl3posiztzia.public.blob.vercel-storage.com', // Add the domain here
//         // Other domains...
//         'tjcflen0aawylolt.public.blob.vercel-storage.com', // ← add this one!

//       ],
//     },}

// module.exports = nextConfig
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'fcpuyl3posiztzia.public.blob.vercel-storage.com',
      'tjcflen0aawylolt.public.blob.vercel-storage.com',
      // Add any additional domains here
    ],
  },
};

module.exports = nextConfig;
