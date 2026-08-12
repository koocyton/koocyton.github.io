import fs from "fs";
import path from "path";
import { parseStarWarHistory } from "./parse";
import type { TimelineDoc } from "./types";

export type { TimelineDoc, TimelineEra, TimelineEvent, EventKind } from "./types";
export { parseStarWarHistory } from "./parse";

const SOURCE = path.join(
  process.cwd(),
  "content/posts/6.star-war-history.md"
);

export function loadStarWarHistory(): TimelineDoc {
  const raw = fs.readFileSync(SOURCE, "utf8");
  return parseStarWarHistory(raw);
}
