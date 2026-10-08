import {z} from 'zod';
export const modes = ['Highlights','History Buff','Architecture','Local Stories','Family'] as const;
export type Mode = typeof modes[number];
export const coordinatesSchema = z.object({lat:z.number().min(-90).max(90),lng:z.number().min(-180).max(180)});
export type Coordinates = z.infer<typeof coordinatesSchema>;
export const attractionSchema = z.object({
 name:z.string().max(200),location:z.string().max(200),description:z.string().max(500),
 confidence:z.enum(['high','medium','low']),imageQuality:z.enum(['clear','blurry','unsuitable']),
 uncertainty:z.string().max(1000),alternatives:z.array(z.string().max(200)).max(3),
 introduction:z.string().max(5000),facts:z.array(z.object({label:z.string().max(80),value:z.string().max(300)})).max(6),
 stories:z.array(z.object({title:z.string().max(200),kind:z.enum(['History','Legend','Disputed','Culture']),text:z.string().max(2000)})).max(4),
 coordinates:coordinatesSchema.nullable(),constructionYear:z.number().int().nullable(),
});
export type Attraction = z.infer<typeof attractionSchema>;
export type Message = {role:'user'|'assistant';content:string};
export type Visit = {id:string;photo:string;attraction:Attraction;visitedAt:string;mode:Mode;messages:Message[];sample?:boolean};
export type NearbyPlace = {title:string;lat:number;lng:number;distance:number;description:string;url:string};
export const messageSchema = z.object({role:z.enum(['user','assistant']),content:z.string().min(1).max(6000)});
export const requestSchema = z.object({action:z.enum(['identify','chat','narrate']),image:z.string().max(2_900_000).regex(/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$/),mode:z.enum(modes),location:coordinatesSchema.optional(),attraction:attractionSchema.optional(),messages:z.array(messageSchema).max(30).default([]),journey:z.array(z.object({name:z.string().max(200),location:z.string().max(200),visitedAt:z.string().max(60),constructionYear:z.number().nullable()})).max(30).default([])});
