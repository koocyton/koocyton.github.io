"use client";

import { useEffect, useState } from "react";

export type PostLocaleView = {
  locale: "zh" | "en";
  title: string;
  contentHtml: string;
  readingTime: string;
};

type Props = {
  views: PostLocaleView[];
  defaultLocale?: "zh" | "en";
};

const STORAGE_KEY = "post-locale";

export default function PostLanguageSwitcher({
  views,
  defaultLocale = "zh",
}: Props) {
  const [locale, setLocale] = useState<"zh" | "en">(defaultLocale);

  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored === "zh" || stored === "en") {
      const hasStored = views.some((v) => v.locale === stored);
      if (hasStored) setLocale(stored);
    }
  }, [views]);

  function select(next: "zh" | "en") {
    setLocale(next);
    sessionStorage.setItem(STORAGE_KEY, next);
  }

  const active = views.find((v) => v.locale === locale) ?? views[0];

  return (
    <>
      <div className="flex items-center gap-2 mb-6 font-mono text-xs">
        <span className="text-[var(--color-text-tertiary)]">Language</span>
        {views.map((view) => (
          <button
            key={view.locale}
            type="button"
            onClick={() => select(view.locale)}
            className={
              locale === view.locale
                ? "px-2 py-0.5 rounded bg-[var(--color-text)] text-[var(--color-bg)]"
                : "px-2 py-0.5 rounded text-[var(--color-link)] hover:underline"
            }
            aria-pressed={locale === view.locale}
          >
            {view.locale === "zh" ? "中文" : "English"}
          </button>
        ))}
      </div>
      <div className="mb-8">
        <h1 className="font-mono text-xl font-semibold text-[var(--color-text)] leading-tight">
          {active.title}
        </h1>
        <div className="flex items-center gap-3 mt-2 text-xs text-[var(--color-text-tertiary)] font-mono">
          <span>{active.readingTime}</span>
        </div>
      </div>
      {views.map((view) => (
        <div
          key={view.locale}
          className="prose"
          hidden={locale !== view.locale}
          dangerouslySetInnerHTML={{ __html: view.contentHtml }}
        />
      ))}
    </>
  );
}
