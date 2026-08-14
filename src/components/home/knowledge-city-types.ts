export type CityTone="concepts"|"models"|"history"|"organizations"|"issues"|"frontiers";
export type BuildingKind="institute"|"towers"|"station"|"office"|"plaza"|"observatory"|"library"|"lab"|"archive"|"block";
export type SemanticForm="campus"|"library"|"institute"|"workshop"|"refinery"|"operations"|"archive-bridge"|"multiwing"|"checkpoint"|"modular-stack"|"attention-hub"|"router-wings"|"memory-warehouse"|"compression-steps"|"lineage"|"generation"|"headquarters"|"rail-axis"|"forum"|"open-structure"|"dual-system"|"branch-control"|"observatory";

export type CityNode={
  id:string;
  label:string;
  kicker:string;
  summary:string;
  tone:CityTone;
  building:BuildingKind;
  semanticForm?:SemanticForm;
  href?:string;
  children?:CityNode[];
};

export type CameraSnapshot={position:[number,number,number];target:[number,number,number]};
export type CityHistoryState={path:string[];camera:CameraSnapshot};
