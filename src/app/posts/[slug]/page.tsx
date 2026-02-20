import { getAllPosts, getPostBySlug } from "@/lib/posts";
import HeroBanner from "@/components/HeroBanner";
import Link from "next/link";

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  return {
    title: `${post.title} - 一洼绿地`,
    description: post.subtitle || post.title,
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  return (
    <>
      <HeroBanner
        title={post.title}
        subtitle={post.subtitle}
        backgroundImage={post.headerImg}
      />
      <article className="max-w-3xl mx-auto px-6 py-12">
        <div className="flex items-center gap-4 text-sm text-[var(--color-text-secondary)] mb-8 pb-6 border-b border-[var(--color-border)]">
          <time dateTime={post.date}>{post.date}</time>
          <span>&middot;</span>
          <span>{post.readingTime}</span>
          {post.tags.length > 0 && (
            <>
              <span>&middot;</span>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/tags/${encodeURIComponent(tag)}`}
                    className="text-xs px-2.5 py-1 rounded-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] hover:text-[var(--color-accent)] transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
        <div
          className="prose"
          dangerouslySetInnerHTML={{ __html: post.contentHtml }}
        />
        <div className="mt-16 pt-6 border-t border-[var(--color-border)]">
          <Link
            href="/"
            className="text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-colors text-sm"
          >
            &larr; 返回首页
          </Link>
        </div>
      </article>
    </>
  );
}
