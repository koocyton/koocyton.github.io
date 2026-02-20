import { getAllTags, getPostsByTag } from "@/lib/posts";
import HeroBanner from "@/components/HeroBanner";
import PostCard from "@/components/PostCard";

export async function generateStaticParams() {
  const tags = getAllTags();
  return tags.map(({ tag }) => ({ tag: encodeURIComponent(tag) }));
}

export async function generateMetadata({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);
  return {
    title: `${decodedTag} - 标签 - 一洼绿地`,
  };
}

export default async function TagPage({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);
  const posts = getPostsByTag(decodedTag);

  return (
    <>
      <HeroBanner
        title={`# ${decodedTag}`}
        subtitle={`共 ${posts.length} 篇文章`}
        backgroundImage="/img/header_img/tag_bg.jpg"
      />
      <div className="max-w-3xl mx-auto px-6 py-12">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </>
  );
}
