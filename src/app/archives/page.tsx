import { getAllPosts } from "@/lib/posts";
import Link from "next/link";

export const metadata = { title: "归档 - 一洼绿地" };

export default function ArchivesPage() {
  const posts = getAllPosts();

  const grouped = posts.reduce<Record<string, typeof posts>>((acc, post) => {
    const year = post.date.split("-")[0];
    if (!acc[year]) acc[year] = [];
    acc[year].push(post);
    return acc;
  }, {});

  const years = Object.keys(grouped).sort((a, b) => Number(b) - Number(a));

  return (
    <div className="max-w-2xl mx-auto px-5 py-10">
      <h1 className="font-mono text-lg font-semibold text-[var(--color-text)] mb-1">归档</h1>
      <p className="text-xs text-[var(--color-text-tertiary)] mb-8">共 {posts.length} 篇</p>
      {years.map((year) => (
        <section key={year} className="mb-8">
          <h2 className="font-mono text-sm font-semibold text-[var(--color-text)] mb-3">{year}</h2>
          <ul className="space-y-2">
            {grouped[year].map((post) => (
              <li key={post.slug} className="flex items-baseline gap-3">
                <time className="text-xs text-[var(--color-text-tertiary)] font-mono shrink-0 tabular-nums">
                  {post.date.slice(5)}
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
        </section>
      ))}
    </div>
  );
}
