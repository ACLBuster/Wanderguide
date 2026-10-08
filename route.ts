import {coordinatesSchema} from '@/lib/types';
import {guard,readLimitedJson} from '@/lib/server/guard';
import {distanceMeters} from '@/lib/geo';
import {z} from 'zod';
export const maxDuration=30;
export async function POST(request:Request){try{
 const blocked=await guard(request);if(blocked)return blocked;
 const parsed=coordinatesSchema.extend({attraction:z.string().max(200).optional(),context:z.string().max(500).optional()}).safeParse(await readLimitedJson(request,1200));
 if(!parsed.success)return Response.json({error:'A location is needed to find nearby places.'},{status:400});
 const center=parsed.data;
 const params=new URLSearchParams({action:'query',format:'json',generator:'geosearch',ggscoord:`${center.lat}|${center.lng}`,ggsradius:'3000',ggslimit:'15',prop:'coordinates|extracts|info',inprop:'url',exintro:'1',explaintext:'1',exsentences:'2',colimit:'max'});
 const response=await fetch(`https://en.wikipedia.org/w/api.php?${params}`,{headers:{'User-Agent':'WanderGuide/1.0 (travel discovery app)'},signal:AbortSignal.timeout(15000)});
 if(!response.ok)throw new Error();
 const data=await response.json();
 const normalized=(name:string)=>name.toLowerCase().replace(/^the\s+/,'').trim();
 const themes=(center.context||'').toLowerCase().match(/roman|ancient|medieval|buddhist|hindu|islamic|christian|renaissance|baroque|gothic|byzantine|ottoman|colonial/g)||[];
 const relevance=(s:string)=>{const text=s.toLowerCase();return (/museum|temple|church|monument|historic|palace|archaeolog|ancient|mosque|cathedral|gallery|memorial/i.test(text)?1:0)+themes.filter(t=>text.includes(t)).length;};
 const places=Object.values(data.query?.pages||{}).flatMap((raw)=>{const p=raw as {title:string;extract?:string;fullurl:string;coordinates?:{lat:number;lon:number}[]};const c=p.coordinates?.[0];if(!c||!p.extract)return [];return [{title:p.title,lat:c.lat,lng:c.lon,distance:distanceMeters(center,{lat:c.lat,lng:c.lon}),description:p.extract.slice(0,600),url:p.fullurl}];}).filter(p=>p.distance>60&&normalized(p.title)!==normalized(center.attraction||'')).sort((a,b)=>relevance(b.description)-relevance(a.description)||a.distance-b.distance).slice(0,4);
 return Response.json({places},{headers:{'Cache-Control':'no-store'}});
}catch{return Response.json({error:'Nearby discoveries are unavailable right now. Please try again.'},{status:502});}}
