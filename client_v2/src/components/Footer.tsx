import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full border-t border-gray-200 bg-white py-12">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center md:items-start gap-2">
          <span className="text-xl font-bold text-foreground tracking-tight">ChakriLagbe</span>
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Chakri Lagbe. Made with ❤️ to help you find your dream job.
          </p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-6 text-sm font-medium text-gray-600">
          <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
          <Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link>
          <Link href="/faq" className="hover:text-primary transition-colors">FAQ</Link>
        </div>
      </div>
    </footer>
  );
}
