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
    const root=document.documentElement;
    root.dataset.routeDirection=direction;
    const startViewTransition=(document as Document&{startViewTransition?:(update:()=>Promise<void>)=>{finished:Promise<void>}}).startViewTransition;
    if(startViewTransition){
      const transition=startViewTransition.call(document,()=>new Promise<void>(resolve=>{
        const previousPath=window.location.pathname;
        router.push(href);
        const started=performance.now();
        const waitForRoute=()=>{
          if(window.location.pathname!==previousPath||performance.now()-started>900){window.requestAnimationFrame(()=>resolve());return}
          window.requestAnimationFrame(waitForRoute);
        };
        window.requestAnimationFrame(waitForRoute);
      }));
      transition.finished.finally(()=>{delete root.dataset.routeDirection});
      return;
    }
    root.classList.add("routeLeaving");
    window.setTimeout(()=>{router.push(href);root.classList.remove("routeLeaving");delete root.dataset.routeDirection},220);
  };
  return <a href={href} className={className} data-direction={direction} onClick={navigate}>{children}</a>;
}
