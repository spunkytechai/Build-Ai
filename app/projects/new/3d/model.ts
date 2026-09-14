export type Room={id:string;name:string;area:number;x:number;y:number;w:number;h:number;floor:number};
export type ModelChange={id:string;kind:"move"|"resize";x?:number;y?:number;w?:number;h?:number};
export type BuildingModel={modelId:string;version:number;status:"draft"|"unresolved";units:"m";rooms:Room[]};
export const MODEL_KEY="build-ai:model-v2";
export function roomArea(w:number,h:number){return Math.round(w*h*100)/100;}
export function normalizeRoom(r:Room):Room{return {...r,w:Math.max(.05,r.w),h:Math.max(.05,r.h),x:Math.max(0,Math.min(1-r.w,r.x)),y:Math.max(0,Math.min(1-r.h,r.y)),area:roomArea(r.w,r.h)};}
export function applyModelChange(model:BuildingModel,change:ModelChange):BuildingModel{
 const rooms=model.rooms.map(r=>r.id!==change.id?r:normalizeRoom({...r,x:change.x??r.x,y:change.y??r.y,w:change.w??r.w,h:change.h??r.h}));
 return {...model,version:model.version+1,rooms};
}
function overlaps(a:Room,b:Room){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;}
export function hasOverlap(rooms:Room[]){return rooms.some((a,i)=>rooms.some((b,j)=>i<j&&a.floor===b.floor&&overlaps(a,b)));}
export function createModel(rooms:Room[],version=1):BuildingModel{return{modelId:"bm-local-v2",version,status:"unresolved",units:"m",rooms:rooms.map(normalizeRoom)}}
