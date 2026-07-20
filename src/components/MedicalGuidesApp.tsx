"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  taxonomyTree,
  findNode,
  getNodePath,
  filterGuidelines,
  uniqueValues,
} from "@/lib/medical-guides";
import type { Guideline, SortKey, TaxonomyNode } from "@/lib/medical-guides";

const FAVORITES_KEY = "cgn-favorites";

function TreeItem({
  node,
  depth,
  selectedId,
  expanded,
  onToggle,
  onSelect,
  treeQuery,
}: {
  node: TaxonomyNode;
  depth: number;
  selectedId: string;
  expanded: Set<string>;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
  treeQuery: string;
}) {
  const hasChildren = Boolean(node.children?.length);
  const isOpen = expanded.has(node.id);
  const isSelected = selectedId === node.id;
  const q = treeQuery.trim().toLowerCase();

  const selfMatch = !q || node.label.toLowerCase().includes(q) || (node.labelEn || "").toLowerCase().includes(q);
  const childMatch = (n: TaxonomyNode): boolean => {
    if (!q) return true;
    if (n.label.toLowerCase().includes(q) || (n.labelEn || "").toLowerCase().includes(q)) return true;
    return (n.children || []).some(childMatch);
  };
  const visible = !q || selfMatch || childMatch(node);

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
            treeQuery={treeQuery}
          />
        ))}
      </>
    );
  }

  if (!visible) return null;

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
        <span className="truncate">
          {node.label}
          {node.labelEn && (
            <span className={`ml-1 text-[10px] ${isSelected ? "opacity-70" : "text-[var(--color-text-tertiary)]"}`}>
              {node.labelEn}
            </span>
          )}
        </span>
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
              treeQuery={treeQuery}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const DEFAULT_EXPANDED = new Set(["cv", "resp", "endo", "onco"]);

export default function MedicalGuidesApp() {
  const [treeQuery, setTreeQuery] = useState("");
  const [listQuery, setListQuery] = useState("");
  const [selectedNodeId, setSelectedNodeId] = useState("root");
  const [selectedGuideId, setSelectedGuideId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(DEFAULT_EXPANDED);
  const [country, setCountry] = useState("all");
  const [organization, setOrganization] = useState("all");
  const [sort, setSort] = useState<SortKey>("year-desc");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showEmbed, setShowEmbed] = useState(false);
  const [mobilePane, setMobilePane] = useState<"tree" | "list" | "detail">("list");
  const [extensionTab, setExtensionTab] = useState<"overview" | "ai" | "compare" | "structured">("overview");

  const countries = useMemo(() => uniqueValues("country"), []);
  const orgs = useMemo(() => uniqueValues("organization"), []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(FAVORITES_KEY);
      if (raw) setFavorites(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  const persistFavorites = (next: string[]) => {
    setFavorites(next);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
  };

  const filtered = useMemo(() => {
    let list = filterGuidelines({
      query: listQuery,
      nodeId: selectedNodeId,
      country,
      organization,
      sort,
    });
    if (showFavoritesOnly) {
      list = list.filter((g) => favorites.includes(g.id));
    }
    return list;
  }, [listQuery, selectedNodeId, country, organization, sort, showFavoritesOnly, favorites]);

  useEffect(() => {
    if (!filtered.length) {
      setSelectedGuideId(null);
      return;
    }
    if (!selectedGuideId || !filtered.some((g) => g.id === selectedGuideId)) {
      setSelectedGuideId(filtered[0].id);
    }
  }, [filtered, selectedGuideId]);

  useEffect(() => {
    setShowEmbed(false);
    setExtensionTab("overview");
  }, [selectedGuideId]);

  const selectedGuide: Guideline | null =
    filtered.find((g) => g.id === selectedGuideId) ||
    null;

  const pathLabels = getNodePath(taxonomyTree, selectedNodeId) ?? ["疾病"];
  const isFav = selectedGuide ? favorites.includes(selectedGuide.id) : false;

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

  const toggleFavorite = () => {
    if (!selectedGuide) return;
    const next = isFav
      ? favorites.filter((id) => id !== selectedGuide.id)
      : [...favorites, selectedGuide.id];
    persistFavorites(next);
  };

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 3rem)" }}>
      {/* 顶栏 */}
      <div className="shrink-0 border-b border-[var(--color-border)] bg-[var(--color-bg)]">
        <div className="px-4 py-2.5 flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="min-w-0">
            <h1 className="font-mono text-sm font-semibold text-[var(--color-text)] leading-tight">
              临床指南导航系统
            </h1>
            <p className="text-[11px] text-[var(--color-text-tertiary)] font-mono mt-0.5">
              Clinical Guideline Navigator · 仅索引官方链接，不镜像正文
            </p>
          </div>
          <div className="flex-1 min-w-[200px] max-w-lg ml-auto">
            <input
              type="search"
              value={listQuery}
              onChange={(e) => setListQuery(e.target.value)}
              placeholder="搜索标题、疾病、机构、标签…"
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

        <div className="flex lg:hidden border-t border-[var(--color-border)]">
          {(
            [
              ["tree", "分类"],
              ["list", "结果"],
              ["detail", "详情"],
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

      <div className="flex-1 min-h-0 flex">
        {/* 左：分类树 */}
        <aside
          className={`w-full lg:w-56 xl:w-64 shrink-0 border-r border-[var(--color-border)] overflow-y-auto bg-white ${
            mobilePane === "tree" ? "block" : "hidden lg:block"
          }`}
        >
          <div className="px-2 py-2 sticky top-0 bg-white border-b border-[var(--color-border)] z-10 space-y-2">
            <input
              type="search"
              value={treeQuery}
              onChange={(e) => setTreeQuery(e.target.value)}
              placeholder="筛选分类…"
              className="w-full text-xs px-2 py-1.5 rounded border border-[var(--color-border)] outline-none focus:border-[var(--color-link)]"
            />
            <button
              type="button"
              onClick={() => selectNode("root")}
              className={`w-full text-left text-xs font-mono px-2 py-1.5 rounded transition-colors ${
                selectedNodeId === "root"
                  ? "bg-[var(--color-text)] text-[var(--color-bg)]"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-code-bg)]"
              }`}
            >
              全部疾病
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
              treeQuery={treeQuery}
            />
          </div>
        </aside>

        {/* 中：结果列表 */}
        <section
          className={`w-full lg:w-[22rem] xl:w-[26rem] shrink-0 border-r border-[var(--color-border)] overflow-y-auto bg-[var(--color-bg)] ${
            mobilePane === "list" ? "block" : "hidden lg:block"
          }`}
        >
          <div className="px-3 py-2 border-b border-[var(--color-border)] sticky top-0 bg-[var(--color-bg)] z-10 space-y-2">
            <div className="flex items-baseline justify-between gap-2">
              <div>
                <div className="font-mono text-xs font-semibold text-[var(--color-text)]">指南检索结果</div>
                <div className="text-[11px] text-[var(--color-text-tertiary)] mt-0.5">
                  {pathLabels.join(" / ")} · {filtered.length} 条
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowFavoritesOnly((v) => !v)}
                className={`text-[11px] font-mono px-2 py-0.5 rounded border transition-colors ${
                  showFavoritesOnly
                    ? "border-[var(--color-text)] text-[var(--color-text)]"
                    : "border-[var(--color-border)] text-[var(--color-text-tertiary)]"
                }`}
              >
                收藏
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="text-[11px] font-mono px-1.5 py-1 rounded border border-[var(--color-border)] bg-white max-w-[7.5rem]"
              >
                <option value="all">国家/地区</option>
                {countries.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <select
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                className="text-[11px] font-mono px-1.5 py-1 rounded border border-[var(--color-border)] bg-white max-w-[9rem]"
              >
                <option value="all">发布机构</option>
                {orgs.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="text-[11px] font-mono px-1.5 py-1 rounded border border-[var(--color-border)] bg-white"
              >
                <option value="year-desc">年份 ↓</option>
                <option value="year-asc">年份 ↑</option>
                <option value="title">标题</option>
              </select>
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
                        setMobilePane("detail");
                      }}
                      className={`w-full text-left px-3 py-2.5 border-b border-[var(--color-border)] transition-colors ${
                        active
                          ? "bg-white border-l-2 border-l-[var(--color-link)]"
                          : "hover:bg-white/80 border-l-2 border-l-transparent"
                      }`}
                    >
                      <div className="text-[13px] leading-snug text-[var(--color-text)] font-medium">
                        {g.title}
                        {favorites.includes(g.id) && (
                          <span className="ml-1 text-[10px] text-[var(--color-text-tertiary)]">★</span>
                        )}
                      </div>
                      <div className="mt-1 grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5 text-[11px] font-mono text-[var(--color-text-tertiary)]">
                        <span>机构</span>
                        <span className="text-[var(--color-text-secondary)] truncate">{g.organization}</span>
                        <span>国家</span>
                        <span className="text-[var(--color-text-secondary)]">{g.country}</span>
                        <span>年份</span>
                        <span className="text-[var(--color-text-secondary)]">{g.year}</span>
                        <span>类型</span>
                        <span className="text-[var(--color-text-secondary)] truncate">{g.type}</span>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* 右：说明 / 链接 / 可选 iframe */}
        <section
          className={`flex-1 min-w-0 flex flex-col bg-white ${
            mobilePane === "detail" ? "flex" : "hidden lg:flex"
          }`}
        >
          {selectedGuide ? (
            <>
              <div className="shrink-0 px-4 py-2.5 border-b border-[var(--color-border)] flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMobilePane("list")}
                  className="lg:hidden text-xs font-mono text-[var(--color-link)]"
                >
                  ← 返回列表
                </button>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-mono text-[var(--color-text-secondary)] truncate">
                    {selectedGuide.organization} · {selectedGuide.country} · {selectedGuide.year} ·{" "}
                    {selectedGuide.language.toUpperCase()}
                  </div>
                  <div className="text-sm font-medium text-[var(--color-text)] leading-snug">
                    {selectedGuide.title}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={toggleFavorite}
                  className={`text-xs font-mono px-2 py-1 rounded border transition-colors ${
                    isFav
                      ? "border-[var(--color-text)] text-[var(--color-text)]"
                      : "border-[var(--color-border)] text-[var(--color-text-tertiary)] hover:text-[var(--color-text)]"
                  }`}
                >
                  {isFav ? "已收藏" : "收藏"}
                </button>
                <a
                  href={selectedGuide.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-mono px-2 py-1 rounded bg-[var(--color-text)] text-[var(--color-bg)] hover:opacity-90"
                >
                  打开官方页面
                </a>
                <button
                  type="button"
                  onClick={() => setShowEmbed((v) => !v)}
                  className="text-xs font-mono px-2 py-1 rounded border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
                >
                  {showEmbed ? "关闭预览" : "尝试嵌入"}
                </button>
              </div>

              <div className="shrink-0 px-4 border-b border-[var(--color-border)] flex gap-4 overflow-x-auto">
                {(
                  [
                    ["overview", "说明"],
                    ["ai", "AI 摘要"],
                    ["compare", "版本比较"],
                    ["structured", "结构化推荐"],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setExtensionTab(id)}
                    className={`py-2 text-xs font-mono whitespace-nowrap border-b-2 transition-colors ${
                      extensionTab === id
                        ? "border-[var(--color-text)] text-[var(--color-text)]"
                        : "border-transparent text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"
                    }`}
                  >
                    {label}
                    {id !== "overview" && (
                      <span className="ml-1 text-[10px] opacity-60">预留</span>
                    )}
                  </button>
                ))}
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto">
                {extensionTab === "overview" && !showEmbed && (
                  <div className="px-5 py-5 max-w-2xl">
                    <div className="border-l-3 border-[var(--color-border)] pl-3 py-2 mb-5 bg-[var(--color-code-bg)]/50 rounded-r text-[13px] text-[var(--color-text-secondary)] leading-relaxed"
                      style={{ borderLeftWidth: 3 }}
                    >
                      <strong className="text-[var(--color-text)] font-medium">免责提示：</strong>
                      本系统仅为指南目录与官方链接导航工具，不提供、不复制、不替代任何医疗指南正文，也不构成诊疗建议。临床决策请以最新官方原文、当地法规及执业规范为准。
                    </div>

                    <h2 className="font-mono text-sm font-semibold text-[var(--color-text)] mb-2">内容概括</h2>
                    <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-5">
                      {selectedGuide.summary}
                    </p>

                    <h2 className="font-mono text-sm font-semibold text-[var(--color-text)] mb-2">条目信息</h2>
                    <table className="w-full text-sm mb-5 border-collapse">
                      <tbody>
                        {(
                          [
                            ["疾病", selectedGuide.disease],
                            ["分类", selectedGuide.category],
                            ["发布机构", selectedGuide.organization],
                            ["国家/地区", selectedGuide.country],
                            ["年份", String(selectedGuide.year)],
                            ["指南类型", selectedGuide.type],
                            ["语言", selectedGuide.language],
                            ["标签", selectedGuide.tags.join(" · ")],
                          ] as const
                        ).map(([k, v]) => (
                          <tr key={k} className="border-b border-[var(--color-border)]">
                            <th className="text-left py-2 pr-4 font-mono text-xs text-[var(--color-text-tertiary)] w-24 align-top">
                              {k}
                            </th>
                            <td className="py-2 text-[var(--color-text)]">{v}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <h2 className="font-mono text-sm font-semibold text-[var(--color-text)] mb-2">原文链接</h2>
                    <p className="text-sm mb-4 break-all">
                      <a
                        href={selectedGuide.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--color-link)] hover:underline"
                      >
                        {selectedGuide.url}
                      </a>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <a
                        href={selectedGuide.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm px-3 py-2 rounded bg-[var(--color-text)] text-[var(--color-bg)] hover:opacity-90"
                      >
                        打开官方页面 ↗
                      </a>
                      <button
                        type="button"
                        onClick={() => setShowEmbed(true)}
                        className="inline-flex items-center text-sm px-3 py-2 rounded border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
                      >
                        尝试 iframe 预览
                      </button>
                    </div>
                    <p className="mt-3 text-[11px] text-[var(--color-text-tertiary)] leading-relaxed">
                      多数指南官网设置了 X-Frame-Options / CSP，嵌入预览常会失败；请优先使用「打开官方页面」。
                    </p>
                  </div>
                )}

                {extensionTab === "overview" && showEmbed && (
                  <div className="h-full flex flex-col">
                    <div className="shrink-0 px-4 py-2 bg-[var(--color-code-bg)] text-[11px] text-[var(--color-text-secondary)] flex items-center justify-between gap-2">
                      <span>若下方空白或报错，说明目标站禁止嵌入。</span>
                      <a
                        href={selectedGuide.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--color-link)] hover:underline shrink-0"
                      >
                        打开官方页面
                      </a>
                    </div>
                    <iframe
                      title={selectedGuide.title}
                      src={selectedGuide.url}
                      className="flex-1 w-full border-0 bg-white"
                      sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}

                {extensionTab === "ai" && (
                  <div className="px-5 py-8 max-w-xl">
                    <h2 className="font-mono text-sm font-semibold mb-2">AI 摘要模块（预留）</h2>
                    <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                      未来可对接仅基于<strong>用户已获授权的官方全文</strong>或公开元数据的摘要服务。当前版本不抓取、不存储指南正文。
                    </p>
                    <div className="mt-4 text-xs font-mono text-[var(--color-text-tertiary)] border border-dashed border-[var(--color-border)] rounded p-4">
                      extension: ai-summary · status: planned
                    </div>
                  </div>
                )}

                {extensionTab === "compare" && (
                  <div className="px-5 py-8 max-w-xl">
                    <h2 className="font-mono text-sm font-semibold mb-2">指南版本比较（预留）</h2>
                    <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                      预留同一疾病多年版本 / 多机构指南的差异对照视图。当前仅提供目录级年份与机构字段。
                    </p>
                    <div className="mt-4 text-xs font-mono text-[var(--color-text-tertiary)] border border-dashed border-[var(--color-border)] rounded p-4">
                      extension: version-compare · status: planned
                    </div>
                  </div>
                )}

                {extensionTab === "structured" && (
                  <div className="px-5 py-8 max-w-xl">
                    <h2 className="font-mono text-sm font-semibold mb-2">推荐意见结构化数据库（预留）</h2>
                    <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                      预留推荐意见、证据等级、适用人群等结构化字段接口。本站现阶段只维护导航元数据。
                    </p>
                    <div className="mt-4 text-xs font-mono text-[var(--color-text-tertiary)] border border-dashed border-[var(--color-border)] rounded p-4">
                      extension: structured-recs · status: planned
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-sm text-[var(--color-text-tertiary)]">
              从中间结果选择一条指南
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
