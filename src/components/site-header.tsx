"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const tabs = [
  ["/timeline/", "타임라인"],
  ["/models/", "모델"],
  ["/organizations/", "조직"],
  ["/concepts/", "개념"],
  ["/issues/", "이슈"],
  ["/frontiers/", "프런티어"],
  ["/paths/", "학습"],
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const active = (href: string) => pathname === href || pathname.startsWith(href);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        router.push("/search/");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [router]);
  useEffect(() => {
    const saved = window.localStorage.getItem("theme");
    const initial = saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches) ? "dark" : "light";
    setTheme(initial);
    document.documentElement.dataset.theme = initial;
  }, []);
  useEffect(() => {
    document.body.dataset.menuOpen = open ? "true" : "false";
    return () => { delete document.body.dataset.menuOpen; };
  }, [open]);

  return <header className="siteHeader">
    <div className="siteHeaderInner">
      <Link href="/" className="siteBrand" aria-label="LLM History 홈">LLM <i>History</i></Link>
      <nav id="primary-navigation" className={open ? "primaryNav open" : "primaryNav"} aria-label="주요 메뉴">
        {tabs.map(([href, label]) => <Link key={href} href={href} aria-current={active(href) ? "page" : undefined}>{label}</Link>)}
        <Link className="mobileSearchLink" href="/search/">전체 검색</Link>
      </nav>
      <Link className="headerSearch" href="/search/" aria-label="전체 검색"><span aria-hidden="true">⌕</span><b>검색</b><kbd>⌘ K</kbd></Link>
      <button className="themeButton" type="button" aria-label={theme === "light" ? "다크 모드로 전환" : "라이트 모드로 전환"} onClick={() => { const next = theme === "light" ? "dark" : "light"; setTheme(next); document.documentElement.dataset.theme = next; window.localStorage.setItem("theme", next); }}><span aria-hidden="true">{theme === "light" ? "◐" : "☼"}</span></button>
      <button className="menuButton" type="button" aria-expanded={open} aria-controls="primary-navigation" aria-label={open ? "메뉴 닫기" : "메뉴 열기"} onClick={() => setOpen(value => !value)}><span /><span /></button>
    </div>
  </header>;
}
