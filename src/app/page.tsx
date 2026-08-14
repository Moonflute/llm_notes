import {getKnowledgeCityData} from "@/components/home/knowledge-city-data";
import {KnowledgeCityShell} from "@/components/home/knowledge-city-shell";

export default function Home() {
  return <main id="main-content" className="knowledgeCityHome"><KnowledgeCityShell data={getKnowledgeCityData()}/></main>;
}
