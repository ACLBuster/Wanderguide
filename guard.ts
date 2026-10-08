import 'server-only';
const buckets = new Map<string,{count:number;until:number}>();
export async function guard(request:Request) {
 const origin=request.headers.get('origin');
 // Next may normalize the URL hostname internally. Preserve the original
 // request Host while still requiring an exact scheme/host/port origin match.
 const requestUrl=new URL(request.url);
 const expectedOrigin=new URL(`${requestUrl.protocol}//${request.headers.get('host')||requestUrl.host}`).origin;
 if(origin && origin!==expectedOrigin) return Response.json({error:'Request not allowed.'},{status:403});
 const ip=request.headers.get('x-forwarded-for')?.split(',')[0]||'local';
 const now=Date.now();
 const url=process.env.UPSTASH_REDIS_REST_URL,token=process.env.UPSTASH_REDIS_REST_TOKEN;
 if(url&&token){
  const key=`wg:${ip}:${Math.floor(now/60000)}`;
  const r=await fetch(`${url}/pipeline`,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify([['INCR',key],['EXPIRE',key,120]]),signal:AbortSignal.timeout(5000)});
  if(!r.ok) return Response.json({error:'Please try again shortly.'},{status:503});
  const results=await r.json();
  if(results[0]?.error||typeof results[0]?.result!=='number')return Response.json({error:'Please try again shortly.'},{status:503});
  if(results[0]?.result>12) return Response.json({error:'Take a little breather. Please try again in a minute.'},{status:429});
 }else{
  for(const [key,v] of buckets) if(v.until<now) buckets.delete(key);
  const b=buckets.get(ip)||{count:0,until:now+60000};b.count++;buckets.set(ip,b);
  if(b.count>12) return Response.json({error:'Please try again in a minute.'},{status:429});
 }
}
export async function readLimitedJson(request:Request,max=3_200_000){
 const reader=request.body?.getReader();if(!reader) throw new Error('INVALID');
 const chunks:Uint8Array[]=[];let size=0;
 while(true){const {value,done}=await reader.read();if(done)break;size+=value.length;if(size>max){await reader.cancel();throw new Error('TOO_LARGE');}chunks.push(value);}
 return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}
