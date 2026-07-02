import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const blog = await getCollection("blog");
  return rss({
    title: 'topfuelbread.com',
    description: 'this is where i do i things',
    site: context.site,
    items: blog.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      link: `/blog/${post.id}/`,
    })),
    customData: `<language>en-us</language>`,
  })
}

// https://docs.astro.build/en/recipes/rss