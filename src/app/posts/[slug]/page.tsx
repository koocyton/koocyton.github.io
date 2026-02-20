import { getAllPosts, getPostBySlug } from "@/lib/posts";
import Link from "next/link";
import Comments from "@/components/Comments";

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
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
    <article className="max-w-2xl mx-auto px-5 py-10">
      <header className="mb-8">
        <h1 className="font-mono text-xl font-semibold text-[var(--color-text)] leading-tight">
          {post.title}
        </h1>
        <div className="flex items-center gap-3 mt-2 text-xs text-[var(--color-text-tertiary)] font-mono">
          <time dateTime={post.date}>{post.date}</time>
          <span>&middot;</span>
          <span>{post.readingTime}</span>
        </div>
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {post.tags.map((tag) => (
              <Link
                key={tag}
                href={`/tags/${encodeURIComponent(tag)}`}
                className="text-xs font-mono text-[var(--color-text-tertiary)] hover:text-[var(--color-link)] transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}
      </header>
      <div
        className="prose"
        dangerouslySetInnerHTML={{ __html: post.contentHtml }}
      />
      <Comments />
      <footer className="mt-8 pt-4 border-t border-[var(--color-border)]">
        <Link
          href="/"
          className="text-sm text-[var(--color-link)] hover:underline"
        >
          &larr; 返回
        </Link>
      </footer>
    </article>
  );
}
