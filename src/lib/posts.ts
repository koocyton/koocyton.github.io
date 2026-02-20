import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeHighlight from "rehype-highlight";
import rehypeStringify from "rehype-stringify";
import readingTime from "reading-time";

const postsDirectory = path.join(process.cwd(), "content/posts");

export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  subtitle?: string;
  catalog?: string;
  tags: string[];
  categories: string[];
  headerImg: string;
  readingTime: string;
}

export interface Post extends PostMeta {
  contentHtml: string;
}

function normalizeSlug(filename: string): string {
  return filename.replace(/\.md$/, "");
}

export function getAllPosts(): PostMeta[] {
  const files = fs.readdirSync(postsDirectory).filter((f) => f.endsWith(".md"));

  const posts = files.map((filename) => {
    const slug = normalizeSlug(filename);
    const fullPath = path.join(postsDirectory, filename);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);
    const stats = readingTime(content);

    return {
      slug,
      title: data.title || slug,
      date: data.date
        ? new Date(data.date).toISOString().split("T")[0]
        : "1970-01-01",
      subtitle: data.subtitle || "",
      catalog: data.catalog || "",
      tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
      categories: Array.isArray(data.categories) ? data.categories.map(String) : [],
      headerImg: data["header-img"] || "/img/header_img/newhome_bg.jpg",
      readingTime: stats.text,
    };
  });

  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export async function getPostBySlug(slug: string): Promise<Post> {
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);
  const stats = readingTime(content);

  const processedContent = await remark()
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeHighlight, { detect: true })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(content);

  return {
    slug,
    title: data.title || slug,
    date: data.date
      ? new Date(data.date).toISOString().split("T")[0]
      : "1970-01-01",
    subtitle: data.subtitle || "",
    catalog: data.catalog || "",
    tags: Array.isArray(data.tags) ? data.tags : [],
    categories: Array.isArray(data.categories) ? data.categories : [],
    headerImg: data["header-img"] || "/img/header_img/newhome_bg.jpg",
    readingTime: stats.text,
    contentHtml: processedContent.toString(),
  };
}

export function getAllTags(): { tag: string; count: number }[] {
  const posts = getAllPosts();
  const tagMap = new Map<string, number>();

  posts.forEach((post) => {
    post.tags.forEach((tag) => {
      tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
    });
  });

  return Array.from(tagMap.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}

export function getPostsByTag(tag: string): PostMeta[] {
  return getAllPosts().filter((post) =>
    post.tags.map((t) => t.toLowerCase()).includes(tag.toLowerCase())
  );
}
