export type Room={id:string;name:string;area:number;x:number;y:number;w:number;h:number;floor:number};
export type ModelChange={id:string;kind:"move"|"resize";x?:number;y?:number;w?:number;h?:number};
export type BuildingModel={modelId:string;version:number;status:"draft"|"unresolved";rooms:Room[]};
export function applyModelChange(model:BuildingModel,change:ModelChange):BuildingModel{
 const rooms=model.rooms.map(r=>r.id!==change.id?r:{...r,x:change.x??r.x,y:change.y??r.y,w:Math.max(.05,change.w??r.w),h:Math.max(.05,change.h??r.h),area:Math.round((change.w??r.w)*(change.h??r.h)*120)/10});
 return {...model,version:model.version+1,rooms};
}
export function hasOverlap(rooms:Room[]):boolean{return rooms.some((a,i)=>rooms.some((b,j)=>i<j&&a.x<a.x+a.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y));}
