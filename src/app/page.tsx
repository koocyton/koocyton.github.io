import { getAllPosts } from "@/lib/posts";
import Link from "next/link";

export default function HomePage() {
  const posts = getAllPosts();

  return (
    <div className="max-w-2xl mx-auto px-5 py-10">
      <div className="mb-8">
        <h1 className="font-mono text-lg font-semibold text-[var(--color-text)]">一洼绿地</h1>
        <p className="text-sm text-[var(--color-text-tertiary)] mt-1">那么 ... 好吧 ...</p>
      </div>
      <ul className="space-y-3">
        {posts.map((post) => (
          <li key={post.slug} className="flex items-baseline gap-3">
            <time className="text-xs text-[var(--color-text-tertiary)] font-mono shrink-0 tabular-nums">
              {post.date}
            </time>
            <Link
              href={`/posts/${post.slug}`}
              className="text-sm text-[var(--color-text)] hover:text-[var(--color-link)] transition-colors truncate"
            >
              {post.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
