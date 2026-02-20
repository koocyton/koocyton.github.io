import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-5 py-20 text-center">
      <h1 className="font-mono text-4xl font-semibold text-[var(--color-text)] mb-2">404</h1>
      <p className="text-sm text-[var(--color-text-tertiary)] mb-6">页面不存在</p>
      <Link href="/" className="text-sm text-[var(--color-link)] hover:underline">
        &larr; 返回首页
      </Link>
    </div>
  );
}
