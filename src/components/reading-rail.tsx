"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type Heading = { id: string; label: string };

export function ReadingRail() {
  const pathname = usePathname();
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [active, setActive] = useState("");

  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>("main.detail section > h2"));
    const next = nodes.map((node, index) => {
      const id = node.id || `section-${index + 1}`;
      node.id = id;
      return { id, label: node.textContent?.trim() || `섹션 ${index + 1}` };
    });
    setHeadings(next);
    setActive(next[0]?.id || "");
    if (!nodes.length) return;
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (visible?.target.id) setActive(visible.target.id);
    }, { rootMargin: "-18% 0px -70%", threshold: 0 });
    nodes.forEach(node => observer.observe(node));
    return () => observer.disconnect();
  }, [pathname]);

  if (headings.length < 3) return null;
  return <aside className="readingRail" aria-label="이 페이지의 목차">
    <p>이 페이지에서</p>
    <ol>{headings.map((heading, index) => <li key={heading.id}><a className={active === heading.id ? "active" : ""} href={`#${heading.id}`}><span>{String(index + 1).padStart(2, "0")}</span>{heading.label}</a></li>)}</ol>
  </aside>;
}
