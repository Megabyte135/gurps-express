export function Portrait({ portraitUrl, alt }: { portraitUrl: string | null; alt: string }) {
  if (portraitUrl !== null) {
    return <img className="portrait" src={portraitUrl} alt={alt} />;
  }

  return (
    <svg className="portrait portrait-placeholder" viewBox="0 0 120 160" role="img" aria-label={alt}>
      <rect width="120" height="160" fill="var(--surface-sunken)" />
      <g fill="var(--text-faint)" opacity="0.5">
        <circle cx="60" cy="58" r="21" />
        <path d="M22 160c0-24 17-40 38-40s38 16 38 40z" />
      </g>
      <rect x="6" y="6" width="108" height="148" fill="none" stroke="var(--border-strong)" />
    </svg>
  );
}
