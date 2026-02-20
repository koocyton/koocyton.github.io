import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-[var(--color-text)] mb-4">404</h1>
        <p className="text-xl text-[var(--color-text-secondary)] mb-8">
          页面不存在
        </p>
        <Link
          href="/"
          className="px-6 py-3 rounded-lg bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-colors"
        >
          返回首页
        </Link>
      </div>
    </div>
  );
}
