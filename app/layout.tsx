"use client";
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from './components/Header';
import Footer from './components/Footer';
import Head from 'next/head';
import { SessionProvider } from 'next-auth/react';

import Toastr from './components/Toastr';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <Head>
        <title>{'My Next App'}</title>
        <meta name="description" content="This is my Next.js application." />
      </Head>
      <body className={inter.className}>
        <SessionProvider>
          <Header />
          <Toastr/>
          {children}
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
