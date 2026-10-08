export function isSupportedImageData(value:string){
 const match=value.match(/^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/]+=*)$/);
 if(!match)return false;
 const bytes=Buffer.from(match[2],'base64');
 if(bytes.length<12||bytes.length>2_200_000)return false;
 if(match[1]==='jpeg')return bytes[0]===0xff&&bytes[1]===0xd8&&bytes[2]===0xff;
 if(match[1]==='png')return bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
 return bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WEBP';
}
