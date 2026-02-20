import { getAllTags } from "@/lib/posts";
import Link from "next/link";

export const metadata = { title: "标签 - 一洼绿地" };

export default function TagsPage() {
  const tags = getAllTags();

  return (
    <div className="max-w-2xl mx-auto px-5 py-10">
      <h1 className="font-mono text-lg font-semibold text-[var(--color-text)] mb-1">标签</h1>
      <p className="text-xs text-[var(--color-text-tertiary)] mb-8">共 {tags.length} 个</p>
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {tags.map(({ tag, count }) => (
          <Link
            key={tag}
            href={`/tags/${encodeURIComponent(tag)}`}
            className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-link)] transition-colors"
          >
            <span className="font-mono">#{tag}</span>
            <span className="text-xs text-[var(--color-text-tertiary)] ml-1">({count})</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
