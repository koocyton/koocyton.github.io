import Link from "next/link";
import { PostMeta } from "@/lib/posts";

export default function PostCard({ post }: { post: PostMeta }) {
  return (
    <article className="group border-b border-[var(--color-border)] py-8 first:pt-0 last:border-b-0">
      <Link href={`/posts/${post.slug}`} className="block">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3 text-sm text-[var(--color-text-secondary)]">
            <time dateTime={post.date}>{post.date}</time>
            <span>&middot;</span>
            <span>{post.readingTime}</span>
          </div>
          <h2 className="text-xl md:text-2xl font-semibold text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors">
            {post.title}
          </h2>
          {post.subtitle && (
            <p className="text-[var(--color-text-secondary)] line-clamp-2">
              {post.subtitle}
            </p>
          )}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-1">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2.5 py-1 rounded-full bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] border border-[var(--color-border)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
    </article>
  );
}
