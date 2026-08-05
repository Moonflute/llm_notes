import {existsSync,readdirSync,readFileSync} from "node:fs";
import {join,relative} from "node:path";
const root=join(process.cwd(),"out");
if(!existsSync(root))throw new Error("Static output is missing. Run npm run build first.");
function htmlFiles(dir:string):string[]{return readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?htmlFiles(join(dir,entry.name)):entry.name.endsWith(".html")?[join(dir,entry.name)]:[])}
const problems:string[]=[];
for(const file of htmlFiles(root)){const html=readFileSync(file,"utf8");const links=[...html.matchAll(/href="([^"]+)"/g)].map(match=>match[1]);for(const href of links){if(!href.startsWith("/")||href.startsWith("//")||href.startsWith("/_next/")||href.startsWith("/favicon"))continue;const path=href.split(/[?#]/)[0];const target=path==="/"?join(root,"index.html"):join(root,path.replace(/^\//,""),"index.html");if(!existsSync(target))problems.push(`${relative(root,file)} -> ${href}`)}}
if(problems.length){console.error(`Broken internal links:\n${problems.join("\n")}`);process.exit(1)}
console.log("Static internal-link check passed.");