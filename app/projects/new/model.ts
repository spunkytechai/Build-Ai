export type Room={id:string;name:string;floor:number;x:number;y:number;w:number;h:number;area:number};
export type BuildingModel={modelId:string;version:number;status:"draft"|"unresolved";units:"m";plot:{width:number;depth:number};rooms:Room[]};
export const MODEL_KEY="build-ai:building-model:v3";
export const DEFAULT_PLOT={width:12,depth:10};

function storageKey(projectId?:string){return projectId?`build-ai:building-model:${projectId}:v1`:MODEL_KEY;}
export function roomArea(w:number,h:number){return Math.round(w*h*100)/100;}
export function normalizeRoom(r:Room,plot=DEFAULT_PLOT):Room{const w=Math.min(plot.width,Math.max(.5,r.w));const h=Math.min(plot.depth,Math.max(.5,r.h));const x=Math.max(0,Math.min(plot.width-w,r.x));const y=Math.max(0,Math.min(plot.depth-h,r.y));return {...r,w,h,x,y,area:roomArea(w,h)};}
export function createModel(rooms:Room[],version=1,projectId?:string):BuildingModel{return{modelId:projectId?`bm-${projectId}-v1`:"bm-local-v3",version,status:"unresolved",units:"m",plot:DEFAULT_PLOT,rooms:rooms.map(r=>normalizeRoom(r))};}
export function applyModelChange(model:BuildingModel,id:string,patch:Partial<Pick<Room,"x"|"y"|"w"|"h">>):BuildingModel{const rooms=model.rooms.map(r=>r.id===id?normalizeRoom({...r,...patch},model.plot):r);return{...model,version:model.version+1,rooms};}
function overlaps(a:Room,b:Room){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;}
export function hasOverlap(rooms:Room[]){return rooms.some((a,i)=>rooms.some((b,j)=>i<j&&a.floor===b.floor&&overlaps(a,b)));}
export function boundaryViolations(model:BuildingModel){return model.rooms.filter(r=>r.x<0||r.y<0||r.w<=0||r.h<=0||r.x+r.w>model.plot.width||r.y+r.h>model.plot.depth).map(r=>r.id);}
export function overlapPairs(rooms:Room[]){const pairs:[string,string][]=[];for(let i=0;i<rooms.length;i++)for(let j=i+1;j<rooms.length;j++){const a=rooms[i],b=rooms[j];if(a.floor===b.floor&&overlaps(a,b))pairs.push([a.id,b.id]);}return pairs;}
export function validateModel(model:BuildingModel){const boundary=boundaryViolations(model);const overlaps=overlapPairs(model.rooms);return{overlap:overlaps.length>0,boundary,overlaps,valid:overlaps.length===0&&boundary.length===0};}
export function loadModel(projectId:string|undefined,fallback:BuildingModel){try{const key=storageKey(projectId);let raw=localStorage.getItem(key);if(!raw&&projectId)raw=localStorage.getItem(MODEL_KEY);if(!raw)return fallback;const parsed=JSON.parse(raw) as BuildingModel;if(parsed?.plot?.width&&parsed?.plot?.depth&&Array.isArray(parsed.rooms)){const model={...parsed,modelId:projectId?`bm-${projectId}-v1`:parsed.modelId,rooms:parsed.rooms.map(r=>normalizeRoom(r,parsed.plot))};if(projectId&&!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(model));return model;}}catch{}return fallback;}
export function saveModel(projectId:string|undefined,model:BuildingModel){try{localStorage.setItem(storageKey(projectId),JSON.stringify({...model,rooms:model.rooms.map(r=>normalizeRoom(r,model.plot))}));}catch{}}
export function commitModel(projectId:string|undefined,current:BuildingModel,id:string,patch:Partial<Pick<Room,"x"|"y"|"w"|"h">>){const next=applyModelChange(current,id,patch);saveModel(projectId,next);return next;}
