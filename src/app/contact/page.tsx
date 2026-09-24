'use client';

import { useState } from 'react';
import { Mail, Send, CheckCircle } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-md space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight">Contact Us</h1>
        <p className="text-xs text-muted-foreground">Have questions or feedback about the AI platform?</p>
      </div>

      {submitted ? (
        <div className="rounded-xl border bg-card p-8 text-center space-y-3">
          <CheckCircle className="mx-auto h-10 w-10 text-emerald-500" />
          <h3 className="font-bold text-base">Message Sent</h3>
          <p className="text-xs text-muted-foreground">Thank you for reaching out. We will get back to you shortly.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="rounded-xl border bg-card p-6 space-y-4 shadow-sm">
          <div>
            <label className="text-xs font-semibold">Your Name</label>
            <input type="text" required placeholder="Alex Mercer" className="mt-1 w-full rounded-lg border bg-background p-2 text-xs" />
          </div>

          <div>
            <label className="text-xs font-semibold">Email Address</label>
            <input type="email" required placeholder="alex@aipulse.com" className="mt-1 w-full rounded-lg border bg-background p-2 text-xs" />
          </div>

          <div>
            <label className="text-xs font-semibold">Message</label>
            <textarea rows={4} required placeholder="Your message..." className="mt-1 w-full rounded-lg border bg-background p-2 text-xs" />
          </div>

          <button type="submit" className="w-full rounded-xl bg-purple-600 py-2.5 text-xs font-semibold text-white shadow hover:opacity-90">
            Send Message
          </button>
        </form>
      )}
    </div>
  );
}
