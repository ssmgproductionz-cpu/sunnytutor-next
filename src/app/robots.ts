// src/app/robots.ts
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sunnytutor-next1.vercel.app';
  return {
    rules: [
      { userAgent: '*', allow: '/' },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
