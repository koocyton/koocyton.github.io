import { getAllTags } from "@/lib/posts";
import HeroBanner from "@/components/HeroBanner";
import Link from "next/link";

export const metadata = {
  title: "标签 - 一洼绿地",
};

export default function TagsPage() {
  const tags = getAllTags();

  return (
    <>
      <HeroBanner
        title="标签"
        subtitle={`共 ${tags.length} 个标签`}
        backgroundImage="/img/header_img/tag_bg.jpg"
      />
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="flex flex-wrap gap-3">
          {tags.map(({ tag, count }) => (
            <Link
              key={tag}
              href={`/tags/${encodeURIComponent(tag)}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] hover:border-[var(--color-accent)] transition-colors"
            >
              <span>{tag}</span>
              <span className="text-xs bg-[var(--color-border)] px-2 py-0.5 rounded-full">
                {count}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
