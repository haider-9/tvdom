import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const name = url.searchParams.get('name')?.trim();
	const after = url.searchParams.get('after') ?? ''; // Reddit pagination cursor

	if (!name) return json({ images: [], after: null });

	try {
		const query = encodeURIComponent(`${name} anime`);
		const afterParam = after ? `&after=${after}` : '';
		const redditUrl = `https://www.reddit.com/r/anime+animefanart+AnimeART/search.json?q=${query}&restrict_sr=1&sort=top&t=all&limit=25&type=link${afterParam}`;

		const res = await fetch(redditUrl, {
			headers: { 'User-Agent': 'TVDom/1.0 (character gallery)' },
		});

		if (!res.ok) return json({ images: [], after: null });

		const data = await res.json();
		const posts: any[] = data?.data?.children ?? [];
		const nextAfter: string | null = data?.data?.after ?? null;

		const images: string[] = [];
		for (const post of posts) {
			const d = post.data;
			// Direct i.redd.it images
			if (d.url?.startsWith('https://i.redd.it/')) {
				images.push(d.url);
				continue;
			}
			// Direct image URLs
			if (d.url && /\.(jpg|jpeg|png|webp)(\?.*)?$/i.test(d.url)) {
				images.push(d.url);
				continue;
			}
			// Preview fallback
			const preview = d.preview?.images?.[0]?.source?.url;
			if (preview) {
				images.push(preview.replace(/&amp;/g, '&'));
			}
		}

		return json({ images: [...new Set(images)], after: nextAfter });
	} catch (e) {
		console.error('Reddit image fetch error:', e);
		return json({ images: [], after: null });
	}
};
