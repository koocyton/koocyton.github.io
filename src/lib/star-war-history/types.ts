export type EventKind = "year" | "episode" | "note" | "subsection";

export interface TimelineEvent {
  id: string;
  kind: EventKind;
  /** 年份或时间标签，如 "32 BBY" / "EPISODE IV" */
  label: string;
  /** 可选英文副标 */
  subtitle?: string;
  /** 正文段落 */
  paragraphs: string[];
}

export interface TimelineEra {
  id: string;
  title: string;
  /** 用于侧栏的短名 */
  shortTitle: string;
  /** 时代说明（blockquote 等） */
  intro?: string;
  events: TimelineEvent[];
}

export interface TimelineDoc {
  eras: TimelineEra[];
  guide?: string[];
  markers?: string[];
}
