import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { AiChatDrawer } from '@/components/ai-chat-drawer';

export const metadata: Metadata = {
  title: 'AI Pulse - Production AI-Powered Blogging Platform',
  description: 'Full-stack AI blogging platform built with Next.js, PostgreSQL, pgvector, RAG, and LangGraph Agents.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground flex flex-col antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <AiChatDrawer />
        </ThemeProvider>
      </body>
    </html>
  );
}
