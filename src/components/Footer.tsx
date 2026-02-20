export default function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] py-6">
      <div className="max-w-2xl mx-auto px-5 text-xs text-[var(--color-text-tertiary)]">
        &copy; {new Date().getFullYear()} koocyton
      </div>
    </footer>
  );
}
