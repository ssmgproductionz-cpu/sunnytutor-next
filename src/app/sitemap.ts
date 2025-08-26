// src/app/sitemap.ts
import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sunnytutor-next1.vercel.app';
  return [
    { url: `${base}/`,            priority: 1.0 },
    { url: `${base}/parent`,      priority: 0.8 },
    { url: `${base}/parent/login`,priority: 0.8 },
  ];
}
