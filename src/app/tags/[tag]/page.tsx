import { getAllTags, getPostsByTag } from "@/lib/posts";
import Link from "next/link";

export async function generateStaticParams() {
  return getAllTags().map(({ tag }) => ({ tag: encodeURIComponent(tag) }));
}

export async function generateMetadata({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = await params;
  return { title: `#${decodeURIComponent(tag)} - 一洼绿地` };
}

export default async function TagPage({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);
  const posts = getPostsByTag(decodedTag);

  return (
    <div className="max-w-2xl mx-auto px-5 py-10">
      <h1 className="font-mono text-lg font-semibold text-[var(--color-text)] mb-1">#{decodedTag}</h1>
      <p className="text-xs text-[var(--color-text-tertiary)] mb-8">共 {posts.length} 篇</p>
      <ul className="space-y-3">
        {posts.map((post) => (
          <li key={post.slug} className="flex items-baseline gap-3">
            <time className="text-xs text-[var(--color-text-tertiary)] font-mono shrink-0 tabular-nums">
              {post.date}
            </time>
            <Link
              href={`/posts/${post.slug}`}
              className="text-sm text-[var(--color-text)] hover:text-[var(--color-link)] transition-colors"
            >
              {post.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
