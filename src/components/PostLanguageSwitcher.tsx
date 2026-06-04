export type PostLocaleView = {
  locale: "zh" | "en";
  title: string;
  contentHtml: string;
  readingTime: string;
};

type Props = {
  views: PostLocaleView[];
  /** Unique id prefix so radio groups do not clash */
  idPrefix: string;
};

export default function PostLanguageSwitcher({ views, idPrefix }: Props) {
  const zh = views.find((v) => v.locale === "zh");
  const en = views.find((v) => v.locale === "en");
  if (!zh || !en) return null;

  const inputZh = `${idPrefix}-zh`;
  const inputEn = `${idPrefix}-en`;

  return (
    <div className="post-locale">
      <input
        type="radio"
        name={idPrefix}
        id={inputZh}
        defaultChecked
        className="post-locale-input"
      />
      <input type="radio" name={idPrefix} id={inputEn} className="post-locale-input" />

      <div className="post-locale-tabs" role="tablist" aria-label="Language">
        <span className="post-locale-tabs-label">Language</span>
        <label htmlFor={inputZh} className="post-locale-tab post-locale-tab-zh">
          中文
        </label>
        <label htmlFor={inputEn} className="post-locale-tab post-locale-tab-en">
          English
        </label>
      </div>

      <div className="post-locale-title post-locale-title-zh">
        <h1 className="font-mono text-xl font-semibold text-[var(--color-text)] leading-tight">
          {zh.title}
        </h1>
        <div className="flex items-center gap-3 mt-2 text-xs text-[var(--color-text-tertiary)] font-mono">
          <span>{zh.readingTime}</span>
        </div>
      </div>

      <div className="post-locale-title post-locale-title-en">
        <h1 className="font-mono text-xl font-semibold text-[var(--color-text)] leading-tight">
          {en.title}
        </h1>
        <div className="flex items-center gap-3 mt-2 text-xs text-[var(--color-text-tertiary)] font-mono">
          <span>{en.readingTime}</span>
        </div>
      </div>

      <div
        className="prose post-locale-body post-locale-body-zh"
        dangerouslySetInnerHTML={{ __html: zh.contentHtml }}
      />
      <div
        className="prose post-locale-body post-locale-body-en"
        dangerouslySetInnerHTML={{ __html: en.contentHtml }}
      />
    </div>
  );
}
