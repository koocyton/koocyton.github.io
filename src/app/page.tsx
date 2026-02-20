import { getAllPosts } from "@/lib/posts";
import HeroBanner from "@/components/HeroBanner";
import PostCard from "@/components/PostCard";
import Link from "next/link";

const POSTS_PER_PAGE = 10;

export default function HomePage() {
  const allPosts = getAllPosts();
  const posts = allPosts.slice(0, POSTS_PER_PAGE);
  const totalPages = Math.ceil(allPosts.length / POSTS_PER_PAGE);

  return (
    <>
      <HeroBanner
        title="一洼绿地"
        subtitle="那么 ... 好吧 ..."
        backgroundImage="/img/header_img/newhome_bg.jpg"
      />
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="space-y-0">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
        {totalPages > 1 && (
          <div className="flex justify-center mt-12">
            <Link
              href="/archives"
              className="px-6 py-3 text-sm font-medium rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] transition-colors"
            >
              查看全部文章 ({allPosts.length})
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
