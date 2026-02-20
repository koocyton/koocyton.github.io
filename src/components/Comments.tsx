"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function Comments() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.setAttribute("data-repo", "koocyton/koocyton.github.io");
    script.setAttribute("data-repo-id", "MDEwOlJlcG9zaXRvcnkxNDY5NTUzMzQ=");
    script.setAttribute("data-category", "Announcements");
    script.setAttribute("data-category-id", "DIC_kwDOCMJcRs4C225y");
    script.setAttribute("data-mapping", "pathname");
    script.setAttribute("data-strict", "0");
    script.setAttribute("data-reactions-enabled", "1");
    script.setAttribute("data-emit-metadata", "0");
    script.setAttribute("data-input-position", "top");
    script.setAttribute("data-theme", "light");
    script.setAttribute("data-lang", "zh-CN");
    script.setAttribute("data-loading", "lazy");
    script.crossOrigin = "anonymous";
    script.async = true;

    containerRef.current.appendChild(script);
  }, [pathname]);

  return (
    <div className="mt-12 pt-6 border-t border-[var(--color-border)]">
      <div ref={containerRef} />
    </div>
  );
}
