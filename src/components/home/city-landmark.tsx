import type {CSSProperties} from "react";

export type LandmarkKind="library"|"tower"|"boulevard"|"quarter"|"square"|"hill"|"hall"|"lab"|"station"|"hub"|"studio"|"house"|"works"|"archive"|"block";

export function CityLandmark({kind,className=""}:{kind:LandmarkKind;className?:string}){
  const common={fill:"none",stroke:"currentColor",strokeWidth:1.15,strokeLinecap:"round" as const,strokeLinejoin:"round" as const,vectorEffect:"non-scaling-stroke" as const};
  return <svg className={`cityLandmark ${className}`} viewBox="0 0 64 52" aria-hidden="true" style={{"--sketch-offset":"0px"} as CSSProperties}>
    {kind==="library"?<><path {...common} d="M8 43h48M12 40h40M15 19h34v21H15zM12 19l20-10 20 10M20 23v13M28 23v13M36 23v13M44 23v13"/><path {...common} opacity=".45" d="M10 45h44"/></>:null}
    {kind==="tower"?<><path {...common} d="M17 44h31M21 44V14h22v30M25 14V8h14v6M27 20h4M35 20h4M27 27h4M35 27h4M27 34h4M35 34h4M30 44v-5h5v5"/><path {...common} opacity=".42" d="M18 47h29"/></>:null}
    {kind==="boulevard"?<><path {...common} d="M4 35c13-7 23-8 56-5M5 43c17-8 34-8 55-5M14 29v-8M25 27v-7M39 27v-9M51 28v-7M10 21h8M35 18h8M47 21h8"/><path {...common} opacity=".45" d="M10 39h7M25 35h8M43 34h9"/></>:null}
    {kind==="quarter"?<><path {...common} d="M7 44h50M10 44V26h14v18M26 44V14h17v30M45 44V22h10v22M14 31h5M14 36h5M31 20h7M31 26h7M31 32h7M48 28h4M48 34h4"/></>:null}
    {kind==="square"?<><path {...common} d="M7 42h50M14 39h36M20 35c0-8 24-8 24 0M24 35v4M40 35v4M29 23h6v8h-6zM32 23V12M28 15c4 3 8 3 12 0"/><path {...common} opacity=".45" d="M10 46h44"/></>:null}
    {kind==="hill"?<><path {...common} d="M5 43c10-12 18-15 28-10 9-11 18-8 26 10M27 32V16h10v18M24 16h16l-8-8zM30 22h4M30 27h4"/><path {...common} opacity=".45" d="M10 46c18-5 33-4 46 0"/></>:null}
    {kind==="hall"?<><path {...common} d="M8 44h48M12 40h40V20H12zM9 20h46L32 9zM19 25v11M27 25v11M37 25v11M45 25v11"/></>:null}
    {kind==="lab"?<><path {...common} d="M11 44h42M18 40h28M23 40l6-15V12M41 40l-6-15V12M26 12h12M24 30h16M27 35h10M16 21h8M40 18h8"/></>:null}
    {kind==="station"?<><path {...common} d="M8 43h48M13 39V20h38v19M18 20l5-9h18l5 9M20 25h24M22 31h8M35 31h8M27 39v-5h10v5"/><path {...common} opacity=".45" d="M15 46h34"/></>:null}
    {kind==="hub"?<><path {...common} d="M8 43h48M14 40V23h36v17M19 23V14h10v9M35 23V10h10v13M20 29h7M37 29h7M20 35h7M37 35h7M29 40v-6h6v6"/></>:null}
    {kind==="studio"?<><path {...common} d="M9 43h46M14 40V19h36v21M14 19l18-10 18 10M20 25h8v8h-8zM35 23h9v12h-9zM29 40v-5h5v5"/></>:null}
    {kind==="house"?<><path {...common} d="M10 44h44M15 41V23l17-12 17 12v18M23 27h7v7h-7zM36 27h7v7h-7zM29 41v-6h7v6"/></>:null}
    {kind==="works"?<><path {...common} d="M7 44h50M11 41V24l12 6v-9l13 7V17l16 9v15M17 35h5M28 35h5M40 33h6M45 24V10h5v14"/></>:null}
    {kind==="archive"?<><path {...common} d="M9 44h46M14 40V17h36v23M18 21h28M18 27h28M18 33h28M24 17V11h16v6M27 40v-4h10v4"/></>:null}
    {kind==="block"?<><path {...common} d="M9 44h46M14 40V20h16v20M32 40V13h18v27M19 25h6M19 31h6M37 19h8M37 25h8M37 31h8"/></>:null}
  </svg>;
}
