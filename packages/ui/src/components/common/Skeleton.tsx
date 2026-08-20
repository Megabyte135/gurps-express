import type { CSSProperties } from "react";

export function Skeleton({
  className,
  style,
}: {
  readonly className?: string;
  readonly style?: CSSProperties;
}) {
  return <div className={`skeleton ${className ?? ""}`} style={style} />;
}

export function SheetSkeleton() {
  return (
    <div className="sheet-skeleton">
      <div className="skel-hero">
        <Skeleton className="skel-portrait" />
        <div className="skel-hero-lines">
          <Skeleton style={{ width: "55%", height: 30, marginBottom: 10 }} />
          <Skeleton style={{ width: "35%", height: 12, marginBottom: 16 }} />
          <Skeleton style={{ width: "100%", height: 12 }} />
          <Skeleton style={{ width: "90%", height: 12 }} />
        </div>
      </div>
      <div className="skel-trackers">
        <Skeleton style={{ height: 74 }} />
        <Skeleton style={{ height: 74 }} />
        <Skeleton style={{ height: 74 }} />
      </div>
      <Skeleton className="skel-section" style={{ height: 210 }} />
      <Skeleton className="skel-section" style={{ height: 150 }} />
    </div>
  );
}
