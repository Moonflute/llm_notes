import {existsSync,readdirSync,readFileSync,statSync} from "node:fs";
import {gzipSync} from "node:zlib";
import {join,relative} from "node:path";
const root=join(process.cwd(),"out");
if(!existsSync(root))throw new Error("Static output is missing. Run npm run build first.");
function files(dir:string):string[]{return readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?files(join(dir,entry.name)):[join(dir,entry.name)])}
const problems:string[]=[];const html=files(root).filter(file=>file.endsWith(".html"));
for(const file of html){const body=readFileSync(file,"utf8");const name=relative(root,file);if(!body.includes('<html lang="ko"'))problems.push(`${name}: missing Korean document language`);const mainCount=(body.match(/<main\b/g)??[]).length;const hasStreamingFallback=mainCount===2&&body.includes("<div hidden id=");if(mainCount!==1&&!hasStreamingFallback)problems.push(`${name}: expected exactly one exposed main landmark`);if(!body.includes('본문으로 건너뛰기'))problems.push(`${name}: missing skip link`);for(const image of body.matchAll(/<img\b[^>]*>/g)){if(!/\balt=/.test(image[0]))problems.push(`${name}: image without alt text`)}const compressed=gzipSync(body).byteLength;if(compressed>55_000)problems.push(`${name}: compressed HTML exceeds 55 KB (${compressed})`)}
const rootHtml=join(root,"index.html");const rootSize=statSync(rootHtml).size;console.log(`Checked ${html.length} HTML pages; home HTML ${rootSize} bytes.`);if(problems.length){console.error(problems.join("\n"));process.exit(1)}console.log("Static accessibility and HTML budget check passed.");