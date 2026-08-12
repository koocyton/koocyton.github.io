import type { TimelineDoc, TimelineEra, TimelineEvent, EventKind } from "./types";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[（(].*?[）)]/g, "")
    .replace(/[^a-z0-9\u4e00-\u9fff]+/gi, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

function cleanPara(s: string): string {
  return s.replace(/^[\u3000\s]+/, "").replace(/\s+$/, "");
}

function shortEraTitle(title: string): string {
  const cut = title.split(/[（(]/)[0]?.trim() || title;
  if (cut.length <= 10) return cut;
  return cut.slice(0, 8) + "…";
}

/** 从星球大战编年史 markdown 正文解析结构化时间轴 */
export function parseStarWarHistory(markdown: string): TimelineDoc {
  const body = markdown.replace(/^---[\s\S]*?---\n/, "");
  const lines = body.split(/\r?\n/);

  const eras: TimelineEra[] = [];
  const guide: string[] = [];
  const markers: string[] = [];

  let currentEra: TimelineEra | null = null;
  let currentEvent: TimelineEvent | null = null;
  let inGuide = false;
  let inMarkers = false;
  let paraBuf: string[] = [];
  let pendingKind: EventKind | null = null;
  let pendingLabel = "";
  let pendingSubtitle = "";
  let eventCounter = 0;

  const flushParas = () => {
    if (!currentEvent || paraBuf.length === 0) {
      paraBuf = [];
      return;
    }
    for (const p of paraBuf) {
      const t = cleanPara(p);
      if (t) currentEvent.paragraphs.push(t);
    }
    paraBuf = [];
  };

  const pushEvent = () => {
    flushParas();
    if (currentEra && currentEvent && (currentEvent.paragraphs.length > 0 || currentEvent.kind === "episode")) {
      currentEra.events.push(currentEvent);
    }
    currentEvent = null;
  };

  const startEvent = (kind: EventKind, label: string, subtitle?: string) => {
    pushEvent();
    eventCounter += 1;
    currentEvent = {
      id: `e-${eventCounter}-${slugify(label) || "item"}`,
      kind,
      label: label.trim(),
      subtitle,
      paragraphs: [],
    };
  };

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.trimEnd();
    const trimmed = line.trim();

    if (!trimmed) {
      if (paraBuf.length) {
        flushParas();
      }
      continue;
    }

    // images / hr
    if (trimmed.startsWith("![") || trimmed === "---") continue;

    if (trimmed.startsWith("## ")) {
      pushEvent();
      const title = trimmed.slice(3).trim();
      inGuide = title.startsWith("阅读指南");
      inMarkers = title.startsWith("时间标记");
      if (inGuide || inMarkers) {
        currentEra = null;
        continue;
      }
      currentEra = {
        id: `era-${eras.length + 1}-${slugify(title)}`,
        title,
        shortTitle: shortEraTitle(title),
        events: [],
      };
      eras.push(currentEra);
      continue;
    }

    if (inGuide) {
      if (trimmed.startsWith("*") || trimmed.startsWith("-") || !trimmed.startsWith("#")) {
        const t = cleanPara(trimmed.replace(/^[*->]\s*/, ""));
        if (t && !t.startsWith("#")) guide.push(t);
      }
      continue;
    }

    if (inMarkers) {
      if (trimmed.startsWith("*") || trimmed.startsWith("-") || trimmed.startsWith(">")) {
        markers.push(cleanPara(trimmed.replace(/^[*->]\s*/, "")));
      } else if (!trimmed.startsWith("#")) {
        markers.push(cleanPara(trimmed));
      }
      continue;
    }

    if (!currentEra) continue;

    if (trimmed.startsWith(">")) {
      const note = cleanPara(trimmed.replace(/^>\s*/, ""));
      if (note) {
        if (!currentEra.intro) currentEra.intro = note;
        else currentEra.intro += " " + note;
      }
      continue;
    }

    if (trimmed.startsWith("#### ")) {
      const label = trimmed.slice(5).trim();
      const isEpisode = /EPISODE/i.test(label);
      startEvent(isEpisode ? "episode" : "subsection", label);
      continue;
    }

    if (trimmed.startsWith("### ")) {
      const label = trimmed.slice(4).trim();
      startEvent("subsection", label);
      continue;
    }

    if (trimmed.startsWith("##### ")) {
      startEvent("year", trimmed.slice(6).trim());
      continue;
    }

    // bare year-like heading without hashes: "32 BBY" / "25 ABY" / "Year 0"
    if (
      /^(Year\s+\d+|\d{1,3}(?:\,\d{3})*(?:\.\d+)?(?:~\-?\d+)?\s*(?:BBY|ABY|ASW\d*)|[+]?\d+\s*ASW\d*|\d{1,5}\s*ABY\s*\(\d{4}\s*A\.D\.\))$/i.test(
        trimmed
      ) ||
      /^\d{1,3}(?:,\d{3})*\s*BBY$/i.test(trimmed) ||
      /^\d{1,4}\s*ABY$/i.test(trimmed) ||
      /^\d{1,2}\s*ABY$/i.test(trimmed)
    ) {
      startEvent("year", trimmed);
      continue;
    }

    // "新绝地武士团..." style plain section titles inside an era
    if (
      !trimmed.startsWith("　") &&
      !trimmed.startsWith("（") &&
      trimmed.length < 40 &&
      /^(新绝地|传奇的延续|趣味)/.test(trimmed)
    ) {
      startEvent("subsection", trimmed);
      continue;
    }

    // body text
    if (!currentEvent) {
      startEvent("note", "概要");
    }
    paraBuf.push(trimmed);
  }

  pushEvent();

  // drop empty eras
  return {
    eras: eras.filter((e) => e.events.length > 0),
    guide: guide.length ? guide : undefined,
    markers: markers.length ? markers : undefined,
  };
}
