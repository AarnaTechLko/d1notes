import Head from 'next/head';

export default function Maintenance() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Head>
        <title>Site Under Maintenance</title>
      </Head>
      <div className="text-center p-8 rounded-lg shadow-md bg-white max-w-md">
        <img src="/logo.png" alt="Logo" className="mx-auto mb-6" />
        <h1 className="text-4xl font-extrabold text-black mb-4">We’ll be back soon!</h1>
        
        <a 
          href="/contact" 
          className="inline-block px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 transition-colors duration-200"
        >
          Contact Us
        </a>
      </div>
    </div>
  );
}
