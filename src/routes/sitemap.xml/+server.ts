import type { RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async () => {
	// Basic sitemap structure
	// In production, you'd generate this dynamically based on your content
	const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
	<url>
		<loc>https://tvdom.vercel.app/</loc>
		<changefreq>daily</changefreq>
		<priority>1.0</priority>
	</url>
	<url>
		<loc>https://tvdom.vercel.app/movies</loc>
		<changefreq>daily</changefreq>
		<priority>0.9</priority>
	</url>
	<url>
		<loc>https://tvdom.vercel.app/tv</loc>
		<changefreq>daily</changefreq>
		<priority>0.9</priority>
	</url>
	<url>
		<loc>https://tvdom.vercel.app/people</loc>
		<changefreq>daily</changefreq>
		<priority>0.8</priority>
	</url>
	<url>
		<loc>https://tvdom.vercel.app/search</loc>
		<changefreq>monthly</changefreq>
		<priority>0.7</priority>
	</url>
	<url>
		<loc>https://tvdom.vercel.app/about</loc>
		<changefreq>monthly</changefreq>
		<priority>0.6</priority>
	</url>
	<url>
		<loc>https://tvdom.vercel.app/privacy</loc>
		<changefreq>monthly</changefreq>
		<priority>0.5</priority>
	</url>
</urlset>`;

	return new Response(sitemap, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'public, max-age=3600'
		}
	});
};

