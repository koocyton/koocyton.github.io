"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function AppRedirect({
  href,
  title,
}: {
  href: string;
  title: string;
}) {
  useEffect(() => {
    window.location.replace(href);
  }, [href]);

  return (
    <div className="max-w-2xl mx-auto px-5 py-16 text-center">
      <h1 className="font-mono text-lg font-semibold text-[var(--color-text)] mb-3">{title}</h1>
      <p className="text-sm text-[var(--color-text-secondary)] mb-6">正在打开交互界面…</p>
      <Link href={href} className="text-sm text-[var(--color-link)] hover:underline">
        若未自动跳转，请点击进入 &rarr;
      </Link>
    </div>
  );
}
