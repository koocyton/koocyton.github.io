"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { taxonomyTree, findNode, getNodePath } from "@/lib/medical-guides/taxonomy";
import { guidelines, searchGuidelines } from "@/lib/medical-guides/guidelines";
import type { TaxonomyNode } from "@/lib/medical-guides/types";

function TreeItem({
  node,
  depth,
  selectedId,
  expanded,
  onToggle,
  onSelect,
  query,
}: {
  node: TaxonomyNode;
  depth: number;
  selectedId: string;
  expanded: Set<string>;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
  query: string;
}) {
  const hasChildren = Boolean(node.children?.length);
  const isOpen = expanded.has(node.id);
  const isSelected = selectedId === node.id;
  const q = query.trim().toLowerCase();
  const labelMatch = !q || node.label.toLowerCase().includes(q);

  if (node.id === "root") {
    return (
      <>
        {node.children?.map((child) => (
          <TreeItem
            key={child.id}
            node={child}
            depth={0}
            selectedId={selectedId}
            expanded={expanded}
            onToggle={onToggle}
            onSelect={onSelect}
            query={query}
          />
        ))}
      </>
    );
  }

  return (
    <div>
      <div
        className={`flex items-center gap-1 rounded px-1.5 py-1 cursor-pointer text-[13px] leading-snug transition-colors ${
          isSelected
            ? "bg-[var(--color-text)] text-[var(--color-bg)]"
            : "text-[var(--color-text)] hover:bg-[var(--color-code-bg)]"
        }`}
        style={{ paddingLeft: `${depth * 12 + 6}px` }}
        onClick={() => onSelect(node.id)}
      >
        {hasChildren ? (
          <button
            type="button"
            aria-label={isOpen ? "折叠" : "展开"}
            className={`shrink-0 w-4 h-4 flex items-center justify-center text-[10px] ${
              isSelected ? "text-[var(--color-bg)]" : "text-[var(--color-text-tertiary)]"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onToggle(node.id);
            }}
          >
            {isOpen ? "▾" : "▸"}
          </button>
        ) : (
          <span className="w-4 shrink-0" />
        )}
        <span className={!labelMatch && q ? "opacity-45" : undefined}>{node.label}</span>
      </div>
      {hasChildren && isOpen && (
        <div>
          {node.children!.map((child) => (
            <TreeItem
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedId={selectedId}
              expanded={expanded}
              onToggle={onToggle}
              onSelect={onSelect}
              query={query}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const DEFAULT_EXPANDED = new Set([
  "disease",
  "icd10",
  "domestic",
  "international",
  "cma",
  "aha",
  "esc",
  "nccn",
]);

export default function MedicalGuidesApp() {
  const [query, setQuery] = useState("");
  const [selectedNodeId, setSelectedNodeId] = useState("root");
  const [selectedGuideId, setSelectedGuideId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(DEFAULT_EXPANDED);
  const [mobilePane, setMobilePane] = useState<"tree" | "list" | "content">("list");

  const filtered = useMemo(
    () => searchGuidelines(query, selectedNodeId === "root" ? null : selectedNodeId),
    [query, selectedNodeId]
  );

  useEffect(() => {
    if (!filtered.length) {
      setSelectedGuideId(null);
      return;
    }
    if (!selectedGuideId || !filtered.some((g) => g.id === selectedGuideId)) {
      setSelectedGuideId(filtered[0].id);
    }
  }, [filtered, selectedGuideId]);

  const selectedGuide = guidelines.find((g) => g.id === selectedGuideId) ?? null;
  const pathLabels = getNodePath(taxonomyTree, selectedNodeId) ?? ["全部"];
  const selectedNode = findNode(taxonomyTree, selectedNodeId);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectNode = (id: string) => {
    setSelectedNodeId(id);
    const node = findNode(taxonomyTree, id);
    if (node?.children?.length) {
      setExpanded((prev) => new Set(prev).add(id));
    }
    setMobilePane("list");
  };

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 3rem)" }}>
      {/* 顶栏工具条 */}
      <div className="shrink-0 border-b border-[var(--color-border)] bg-[var(--color-bg)]">
        <div className="px-4 py-2.5 flex flex-wrap items-center gap-3">
          <div className="min-w-0">
            <h1 className="font-mono text-sm font-semibold text-[var(--color-text)] truncate">
              医疗指南检索
              <span className="text-[var(--color-text-tertiary)] font-normal">（AI 整理版）</span>
            </h1>
            <p className="text-[11px] text-[var(--color-text-tertiary)] mt-0.5 truncate">
              {pathLabels.filter((l) => l !== "疾病与指南").join(" / ") || "全部"} · {filtered.length} 条
            </p>
          </div>
          <div className="flex-1 min-w-[180px] max-w-md ml-auto">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索疾病、指南、机构、编码、标签…"
              className="w-full text-sm px-3 py-1.5 rounded border border-[var(--color-border)] bg-white text-[var(--color-text)] placeholder:text-[var(--color-text-tertiary)] outline-none focus:border-[var(--color-link)]"
            />
          </div>
          <Link
            href="/"
            className="text-xs font-mono text-[var(--color-text-tertiary)] hover:text-[var(--color-link)] transition-colors shrink-0"
          >
            ← 返回
          </Link>
        </div>

        {/* 移动端分栏切换 */}
        <div className="flex lg:hidden border-t border-[var(--color-border)]">
          {(
            [
              ["tree", "分类"],
              ["list", "目录"],
              ["content", "内容"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setMobilePane(key)}
              className={`flex-1 py-2 text-xs font-mono transition-colors ${
                mobilePane === key
                  ? "text-[var(--color-text)] border-b-2 border-[var(--color-text)]"
                  : "text-[var(--color-text-tertiary)]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 三栏 */}
      <div className="flex-1 min-h-0 flex">
        {/* 左：分类树 */}
        <aside
          className={`w-full lg:w-56 xl:w-64 shrink-0 border-r border-[var(--color-border)] overflow-y-auto bg-white ${
            mobilePane === "tree" ? "block" : "hidden lg:block"
          }`}
        >
          <div className="px-2 py-2 sticky top-0 bg-white border-b border-[var(--color-border)] z-10">
            <button
              type="button"
              onClick={() => selectNode("root")}
              className={`w-full text-left text-xs font-mono px-2 py-1.5 rounded transition-colors ${
                selectedNodeId === "root"
                  ? "bg-[var(--color-text)] text-[var(--color-bg)]"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-code-bg)]"
              }`}
            >
              全部指南
            </button>
          </div>
          <div className="py-1 px-1">
            <TreeItem
              node={taxonomyTree}
              depth={0}
              selectedId={selectedNodeId}
              expanded={expanded}
              onToggle={toggleExpand}
              onSelect={selectNode}
              query={query}
            />
          </div>
        </aside>

        {/* 中：指南目录 */}
        <section
          className={`w-full lg:w-72 xl:w-80 shrink-0 border-r border-[var(--color-border)] overflow-y-auto bg-[var(--color-bg)] ${
            mobilePane === "list" ? "block" : "hidden lg:block"
          }`}
        >
          <div className="px-3 py-2 border-b border-[var(--color-border)] sticky top-0 bg-[var(--color-bg)] z-10">
            <div className="font-mono text-xs font-semibold text-[var(--color-text)]">指南目录</div>
            <div className="text-[11px] text-[var(--color-text-tertiary)] mt-0.5">
              {selectedNode && selectedNodeId !== "root" ? selectedNode.label : "全部"} · 共 {filtered.length} 篇
            </div>
          </div>
          {filtered.length === 0 ? (
            <p className="px-4 py-8 text-sm text-[var(--color-text-tertiary)]">无匹配结果</p>
          ) : (
            <ul>
              {filtered.map((g) => {
                const active = g.id === selectedGuideId;
                return (
                  <li key={g.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedGuideId(g.id);
                        setMobilePane("content");
                      }}
                      className={`w-full text-left px-3 py-2.5 border-b border-[var(--color-border)] transition-colors ${
                        active
                          ? "bg-white border-l-2 border-l-[var(--color-link)]"
                          : "hover:bg-white/80 border-l-2 border-l-transparent"
                      }`}
                    >
                      <div
                        className={`text-[13px] leading-snug ${
                          active ? "text-[var(--color-text)] font-medium" : "text-[var(--color-text)]"
                        }`}
                      >
                        {g.title}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] font-mono text-[var(--color-text-tertiary)]">
                        <span>{g.year}</span>
                        <span>·</span>
                        <span className="truncate">{g.org}</span>
                      </div>
                      <div className="mt-1 text-[11px] text-[var(--color-text-secondary)] truncate">
                        {g.disease}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* 右：iframe 内容 */}
        <section
          className={`flex-1 min-w-0 flex flex-col bg-white ${
            mobilePane === "content" ? "flex" : "hidden lg:flex"
          }`}
        >
          {selectedGuide ? (
            <>
              <div className="shrink-0 px-4 py-2 border-b border-[var(--color-border)] flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-mono text-[var(--color-text-secondary)] truncate">
                    {selectedGuide.org} · {selectedGuide.year}
                  </div>
                  <div className="text-sm font-medium text-[var(--color-text)] truncate">
                    {selectedGuide.title}
                  </div>
                </div>
                {selectedGuide.sourceUrl && (
                  <a
                    href={selectedGuide.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[var(--color-link)] hover:underline shrink-0"
                  >
                    原站
                  </a>
                )}
                <a
                  href={selectedGuide.contentPath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-link)] shrink-0"
                >
                  新窗口
                </a>
              </div>
              <iframe
                key={selectedGuide.id}
                title={selectedGuide.title}
                src={selectedGuide.contentPath}
                className="flex-1 w-full border-0 bg-white"
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-sm text-[var(--color-text-tertiary)]">
              从中间目录选择一篇指南
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
