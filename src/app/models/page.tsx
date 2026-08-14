import Link from "next/link";
import { KineticRail } from "@/components/motion/kinetic-rail";
import { modelFamilies, organizationDocuments } from "@/lib/content";

export default function Models(){
  return <main id="main-content" className="directory modelsDirectory">
    <p className="sectionLabel">MODEL FAMILIES</p>
    <h1>모델 계보</h1>
    <p className="intro">가운데 모델 계열에 초점을 맞추고 좌우로 밀어 탐색하세요. 각 계열에서는 세대별 릴리스와 변화의 흐름으로 이어집니다.</p>
    <KineticRail label="모델 계열 탐색" itemLabel="모델 계열" className="modelFamilyRail">
      {modelFamilies.map(family=>{
        const organization=organizationDocuments.find(item=>item.slug===family.organizationSlug);
        return <Link className="modelFamilySlide" href={`/models/${family.slug}/`} key={family.slug}>
          <span>{organization?.titleKo??family.organizationSlug}</span>
          <h2>{family.titleKo}</h2>
          <p className="en">{family.titleEn}</p>
          <p>{family.summary}</p>
          <small>{family.releaseSlugs.length}개 릴리스 · 계보 열기 →</small>
        </Link>;
      })}
    </KineticRail>
    <p className="railHint">드래그 · 트랙패드 · 휠 · 방향키 · 화살표 버튼을 사용할 수 있습니다.</p>
  </main>;
}
