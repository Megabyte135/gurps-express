import type { ReactNode } from "react";
import { Icon } from "../icons/Icon";
import { useCollapsed } from "../../hooks/collapsed";
import "./section.css";

interface CollapsibleSectionProps {
  readonly id: string;
  readonly title: string;
  readonly meta?: ReactNode;
  readonly toolbar?: ReactNode;
  readonly defaultCollapsed?: boolean;
  readonly children: ReactNode;
}

export function CollapsibleSection({
  id,
  title,
  meta,
  toolbar,
  defaultCollapsed = false,
  children,
}: CollapsibleSectionProps) {
  const { isCollapsed, toggle } = useCollapsed();
  const collapsed = isCollapsed(id, defaultCollapsed);

  return (
    <section className={`section${collapsed ? " is-collapsed" : ""}`}>
      <div className="section-header">
        <button
          type="button"
          className="section-toggle"
          aria-expanded={!collapsed}
          onClick={() => toggle(id, defaultCollapsed)}
        >
          <Icon name="chevron" size={13} className="section-chevron" />
          <span className="section-title">{title}</span>
        </button>
        <div className="section-tools">
          {toolbar}
          {meta !== undefined && <span className="section-meta">{meta}</span>}
        </div>
      </div>
      <div className="section-body" aria-hidden={collapsed}>
        <div className="section-body-inner">{children}</div>
      </div>
    </section>
  );
}
