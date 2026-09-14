export type BuildingObjectKind = "site" | "building" | "floor" | "room" | "wall" | "opening";

export type BuildingObject = {
  id: string;
  kind: BuildingObjectKind;
  name: string;
  floor: number;
  x: number;
  y: number;
  width: number;
  depth: number;
  height: number;
  area: number;
  source: "architecture-engine" | "user" | "derived";
  version: number;
};

export type BuildingModel = {
  modelId: string;
  version: number;
  units: "m";
  status: "draft" | "verified" | "unresolved";
  objects: BuildingObject[];
};

export function createBuildingModel(rooms: Array<{id:string;name:string;area:number;x:number;y:number;w:number;h:number;floor:number}>): BuildingModel {
  return {
    modelId: "bm-local-v1",
    version: 1,
    units: "m",
    status: "unresolved",
    objects: rooms.map((room) => ({
      id: room.id,
      kind: "room",
      name: room.name,
      floor: room.floor,
      x: room.x,
      y: room.y,
      width: room.w,
      depth: room.h,
      height: 3.0,
      area: room.area,
      source: "architecture-engine",
      version: 1,
    })),
  };
}
