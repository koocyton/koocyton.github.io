import { getAllPosts } from "@/lib/posts";
import HeroBanner from "@/components/HeroBanner";
import Link from "next/link";

export const metadata = {
  title: "归档 - 一洼绿地",
};

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
    <>
      <HeroBanner
        title="归档"
        subtitle={`共 ${posts.length} 篇文章`}
        backgroundImage="/img/header_img/archive_bg2.jpg"
      />
      <div className="max-w-3xl mx-auto px-6 py-12">
        {years.map((year) => (
          <div key={year} className="mb-12">
            <h2 className="text-2xl font-bold text-[var(--color-text)] mb-6 flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-[var(--color-accent)]" />
              {year}
              <span className="text-sm font-normal text-[var(--color-text-secondary)]">
                ({grouped[year].length} 篇)
              </span>
            </h2>
            <div className="ml-6 border-l-2 border-[var(--color-border)] pl-6 space-y-4">
              {grouped[year].map((post) => (
                <div key={post.slug} className="relative">
                  <div className="absolute -left-[31px] top-2 w-2.5 h-2.5 rounded-full bg-[var(--color-border)]" />
                  <Link
                    href={`/posts/${post.slug}`}
                    className="group flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4"
                  >
                    <time className="text-sm text-[var(--color-text-secondary)] shrink-0">
                      {post.date}
                    </time>
                    <span className="text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors">
                      {post.title}
                    </span>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
