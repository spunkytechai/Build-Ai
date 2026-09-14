import { NextResponse } from "next/server";
import { getRegulationContext } from "../../lib/regulations";

export async function POST(req:Request){
 const body=await req.json();
 const jurisdiction=String(body.jurisdiction||"");
 return NextResponse.json(getRegulationContext(jurisdiction));
}
