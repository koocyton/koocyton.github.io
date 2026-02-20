"use client";

import Giscus from "@giscus/react";

export default function Comments() {
  return (
    <div className="mt-12 pt-6 border-t border-[var(--color-border)]">
      <Giscus
        repo="koocyton/koocyton.github.io"
        repoId="MDEwOlJlcG9zaXRvcnkxNDY5NTUzMzQ="
        category="General"
        categoryId="DIC_kwDOCMJcRs4C225y"
        mapping="pathname"
        strict="0"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="top"
        theme="light"
        lang="zh-CN"
        loading="lazy"
      />
    </div>
  );
}
