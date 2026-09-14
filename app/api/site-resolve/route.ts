import { NextRequest, NextResponse } from 'next/server';
export async function POST(req: NextRequest) {
 const b=await req.json(); const lat=Number(b.lat),lon=Number(b.lon),width=Number(b.width),depth=Number(b.depth);
 if(!Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)>90||Math.abs(lon)>180)return NextResponse.json({error:'Valid latitude and longitude are required.'},{status:400});
 const delhi=lat>=28.40&&lat<=28.90&&lon>=76.80&&lon<=77.35, gurugram=lat>=28.20&&lat<=28.55&&lon>=76.85&&lon<=77.30;
 return NextResponse.json({jurisdiction:{authority:delhi?'DDA / Delhi planning context':gurugram?'GMDA / Haryana TCP planning context':'Unresolved — authority lookup required',confidence:delhi||gurugram?'B — spatial jurisdiction hint':'E — unresolved inference'},plot:width>0&&depth>0?{area_sqm:Number((width*depth).toFixed(2))}:null,regulatory_status:'No regulatory values activated without verified source rules.',provenance:{engine:'Build Ai Site Resolver v0.3',source_required:true}});
}
