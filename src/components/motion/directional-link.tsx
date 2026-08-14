"use client";

import { useRouter } from "next/navigation";
import type { MouseEvent, ReactNode } from "react";

export function DirectionalLink({href,direction,children,className=""}:{href:string;direction:"previous"|"next";children:ReactNode;className?:string}){
  const router=useRouter();
  const navigate=(event:MouseEvent<HTMLAnchorElement>)=>{
    if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||event.button!==0)return;
    event.preventDefault();
    const reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if(reduced){router.push(href);return}
    document.documentElement.dataset.routeDirection=direction;
    document.documentElement.classList.add("routeLeaving");
    window.setTimeout(()=>{router.push(href);document.documentElement.classList.remove("routeLeaving");delete document.documentElement.dataset.routeDirection},170);
  };
  return <a href={href} className={className} data-direction={direction} onClick={navigate}>{children}</a>;
}
