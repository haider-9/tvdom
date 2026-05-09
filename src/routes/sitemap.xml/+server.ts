import type { RequestHandler } from '@sveltejs/kit';

const BASE_URL = 'https://tvdom.vercel.app';

// Static routes with their SEO priority and change frequency
const staticRoutes = [
	{ path: '/',           changefreq: 'daily',   priority: '1.0' },
	{ path: '/movies',     changefreq: 'daily',   priority: '0.9' },
	{ path: '/tv',         changefreq: 'daily',   priority: '0.9' },
	{ path: '/people',     changefreq: 'weekly',  priority: '0.8' },
	{ path: '/characters', changefreq: 'weekly',  priority: '0.7' },
	{ path: '/community',  changefreq: 'hourly',  priority: '0.7' },
	{ path: '/users',      changefreq: 'daily',   priority: '0.6' },
	{ path: '/search',     changefreq: 'monthly', priority: '0.5' },
	{ path: '/about',      changefreq: 'monthly', priority: '0.5' },
	{ path: '/privacy',    changefreq: 'yearly',  priority: '0.3' },
	{ path: '/login',      changefreq: 'yearly',  priority: '0.3' },
	{ path: '/signup',     changefreq: 'yearly',  priority: '0.3' },
];

function buildSitemap(urls: { loc: string; lastmod?: string; changefreq: string; priority: string }[]): string {
	const today = new Date().toISOString().split('T')[0];

	const urlEntries = urls
		.map(
			({ loc, lastmod, changefreq, priority }) => `
  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod ?? today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
		)
		.join('');

	return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
          http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urlEntries}
</urlset>`;
}

export const GET: RequestHandler = async () => {
	const urls = staticRoutes.map(({ path, changefreq, priority }) => ({
		loc: `${BASE_URL}${path}`,
		changefreq,
		priority,
	}));

	const sitemap = buildSitemap(urls);

	return new Response(sitemap, {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8',
			'Cache-Control': 'public, max-age=3600, s-maxage=3600',
		},
	});
};
