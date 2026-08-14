export type CityTone="concepts"|"models"|"history"|"organizations"|"issues"|"frontiers";
export type BuildingKind="institute"|"towers"|"station"|"office"|"plaza"|"observatory"|"library"|"lab"|"archive"|"block";

export type CityNode={
  id:string;
  label:string;
  kicker:string;
  summary:string;
  tone:CityTone;
  building:BuildingKind;
  href?:string;
  children?:CityNode[];
};

export type CameraSnapshot={position:[number,number,number];target:[number,number,number]};
export type CityHistoryState={path:string[];camera:CameraSnapshot};

