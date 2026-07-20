import {
  getAllPosts,
  getPostBySlug,
  getPostLocales,
  type PostLocale,
} from "@/lib/posts";
import Link from "next/link";
import Comments from "@/components/Comments";
import PostLanguageSwitcher from "@/components/PostLanguageSwitcher";
import AppRedirect from "@/components/AppRedirect";

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug, "zh");
  return {
    title: `${post.title} - 一洼绿地`,
    description: post.subtitle || post.title,
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const locales = getPostLocales(slug);
  const hasSwitcher = locales.length > 1;

  const postsByLocale = await Promise.all(
    locales.map(async (locale) => {
      const post = await getPostBySlug(slug, locale);
      return { locale, post };
    })
  );

  const primary = postsByLocale.find((p) => p.locale === "zh")?.post ?? postsByLocale[0].post;

  if (primary.appPath) {
    return <AppRedirect href={primary.appPath} title={primary.title} />;
  }

  return (
    <article className="max-w-2xl mx-auto px-5 py-10">
      <header className="mb-8">
        {!hasSwitcher && (
          <>
            <h1 className="font-mono text-xl font-semibold text-[var(--color-text)] leading-tight">
              {primary.title}
            </h1>
            <div className="flex items-center gap-3 mt-2 text-xs text-[var(--color-text-tertiary)] font-mono">
              <time dateTime={primary.date}>{primary.date}</time>
              <span>&middot;</span>
              <span>{primary.readingTime}</span>
            </div>
          </>
        )}
        {hasSwitcher && (
          <div className="flex items-center gap-3 mb-2 text-xs text-[var(--color-text-tertiary)] font-mono">
            <time dateTime={primary.date}>{primary.date}</time>
          </div>
        )}
        {primary.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {primary.tags.map((tag) => (
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

      {hasSwitcher ? (
        <PostLanguageSwitcher
          idPrefix={`post-lang-${slug.replace(/[^a-zA-Z0-9-]/g, "-")}`}
          views={postsByLocale.map(({ locale, post }) => ({
            locale: locale as PostLocale,
            title: post.title,
            contentHtml: post.contentHtml,
            readingTime: post.readingTime,
          }))}
        />
      ) : (
        <div
          className="prose"
          dangerouslySetInnerHTML={{ __html: primary.contentHtml }}
        />
      )}

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
