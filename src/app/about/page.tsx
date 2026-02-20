export const metadata = { title: "关于 - 一洼绿地" };

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto px-5 py-10">
      <h1 className="font-mono text-lg font-semibold text-[var(--color-text)] mb-6">关于</h1>
      <div className="prose">
        <p>koocyton &mdash; 我不是肥仔</p>
        <blockquote>
          <p>Because of passion</p>
        </blockquote>
        <p>
          Email: <a href="mailto:henry@5163.xyz">henry@5163.xyz</a>
          <br />
          GitHub: <a href="https://github.com/koocyton" target="_blank" rel="noopener noreferrer">github.com/koocyton</a>
        </p>
      </div>
    </div>
  );
}
