import type { Guideline, SortKey } from "./types";
import guidelinesJson from "./guidelines.json";

export const guidelines = guidelinesJson as Guideline[];

export function getGuidelineById(id: string): Guideline | undefined {
  return guidelines.find((g) => g.id === id);
}

export function uniqueValues(field: "country" | "organization" | "year"): string[] {
  const set = new Set(guidelines.map((g) => String(g[field])));
  return Array.from(set).sort((a, b) => {
    if (field === "year") return Number(b) - Number(a);
    return a.localeCompare(b, "zh");
  });
}

export interface GuideFilter {
  query?: string;
  nodeId?: string | null;
  country?: string;
  organization?: string;
  sort?: SortKey;
}

export function filterGuidelines(opts: GuideFilter): Guideline[] {
  const q = (opts.query || "").trim().toLowerCase();
  const nodeId = opts.nodeId && opts.nodeId !== "root" ? opts.nodeId : null;

  let list = guidelines.filter((g) => {
    if (nodeId && !g.nodeIds.includes(nodeId)) return false;
    if (opts.country && opts.country !== "all" && g.country !== opts.country) return false;
    if (opts.organization && opts.organization !== "all" && g.organization !== opts.organization)
      return false;
    if (!q) return true;
    const hay = [
      g.title,
      g.organization,
      g.country,
      g.disease,
      g.category,
      g.type,
      g.language,
      g.summary,
      ...g.tags,
      String(g.year),
    ]
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  });

  const sort = opts.sort || "year-desc";
  list = [...list].sort((a, b) => {
    if (sort === "year-asc") return a.year - b.year || a.title.localeCompare(b.title, "zh");
    if (sort === "title") return a.title.localeCompare(b.title, "zh");
    return b.year - a.year || a.title.localeCompare(b.title, "zh");
  });

  return list;
}
