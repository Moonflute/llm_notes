"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
const tabs=[['/timeline/','타임라인'],['/models/','모델'],['/concepts/','개념'],['/issues/','쟁점'],['/frontiers/','프런티어'],['/paths/','학습 경로'],['/sources/','출처']];
export function SiteHeader(){const pathname=usePathname();if(pathname==='/')return null;const active=(href:string)=>href==='/'?pathname==='/':pathname===href||pathname.startsWith(href);return <header className="siteHeader"><div className="siteHeaderInner"><Link href="/" className="siteBrand">LLM <i>History</i></Link><nav aria-label="주요 메뉴">{tabs.map(([href,label])=><Link key={href} href={href} aria-current={active(href)?'page':undefined}>{label}</Link>)}</nav><Link className="homeLink" href="/">홈</Link></div></header>}
