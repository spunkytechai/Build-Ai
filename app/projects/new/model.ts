export type Room={id:string;name:string;floor:number;x:number;y:number;w:number;h:number;area:number};
export type BuildingModel={modelId:string;version:number;status:"draft"|"unresolved";units:"m";plot:{width:number;depth:number};rooms:Room[]};
export const MODEL_KEY="build-ai:building-model:v3";
export const DEFAULT_PLOT={width:12,depth:10};
export function roomArea(w:number,h:number){return Math.round(w*h*100)/100;}
export function normalizeRoom(r:Room,plot=DEFAULT_PLOT):Room{const w=Math.min(plot.width,Math.max(.5,r.w));const h=Math.min(plot.depth,Math.max(.5,r.h));const x=Math.max(0,Math.min(plot.width-w,r.x));const y=Math.max(0,Math.min(plot.depth-h,r.y));return {...r,w,h,x,y,area:roomArea(w,h)};}
export function createModel(rooms:Room[],version=1):BuildingModel{return{modelId:"bm-local-v3",version,status:"unresolved",units:"m",plot:DEFAULT_PLOT,rooms:rooms.map(r=>normalizeRoom(r))};}
export function applyModelChange(model:BuildingModel,id:string,patch:Partial<Pick<Room,"x"|"y"|"w"|"h">>):BuildingModel{const rooms=model.rooms.map(r=>r.id===id?normalizeRoom({...r,...patch},model.plot):r);return{...model,version:model.version+1,rooms};}
function overlaps(a:Room,b:Room){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;}
export function hasOverlap(rooms:Room[]){return rooms.some((a,i)=>rooms.some((b,j)=>i<j&&a.floor===b.floor&&overlaps(a,b)));}
export function boundaryViolations(model:BuildingModel){return model.rooms.filter(r=>r.x<0||r.y<0||r.x+r.w>model.plot.width||r.y+r.h>model.plot.depth).map(r=>r.id);}
export function validateModel(model:BuildingModel){const boundary=boundaryViolations(model);const overlap=hasOverlap(model.rooms);return{overlap,boundary,valid:!overlap&&boundary.length===0};}
export function loadModel(fallback:BuildingModel){try{const raw=localStorage.getItem(MODEL_KEY);if(!raw)return fallback;const parsed=JSON.parse(raw) as BuildingModel;if(parsed?.plot?.width&&parsed?.plot?.depth&&Array.isArray(parsed.rooms))return{...parsed,rooms:parsed.rooms.map(r=>normalizeRoom(r,parsed.plot))};}catch{}return fallback;}
export function saveModel(model:BuildingModel){try{localStorage.setItem(MODEL_KEY,JSON.stringify({...model,rooms:model.rooms.map(r=>normalizeRoom(r,model.plot))}));}catch{}}
export function commitModel(current:BuildingModel,id:string,patch:Partial<Pick<Room,"x"|"y"|"w"|"h">>){const next=applyModelChange(current,id,patch);saveModel(next);return next;}
