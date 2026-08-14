import {ConceptAtlas} from "@/components/concepts/concept-atlas";
import {conceptDocuments} from "@/lib/content";
import {getConceptContentState} from "@/lib/concept-study-guides";

export default function Concepts(){
  const concepts=conceptDocuments.map(concept=>{const {guide,contentDepth}=getConceptContentState(concept.slug);return {...concept,contentDepth,guideMinutes:guide?.estimatedMinutes,objectives:guide?.objectives.length,resources:guide?.resources.length}});
  return <main id="main-content" className="directory conceptsDirectory">
    <p className="sectionLabel">TECHNICAL REFERENCE</p><h1>개념 지도</h1>
    <p className="intro">동일한 카드 목록 대신 학습 영역을 먼저 선택하고, 그 안의 개념을 앞뒤 맥락과 함께 넘겨 보세요. 상세 문서는 움직임을 줄인 긴 기술 문서로 이어집니다.</p>
    <ConceptAtlas concepts={concepts}/>
  </main>;
}
