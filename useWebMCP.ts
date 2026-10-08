'use client';
import {useEffect,useRef} from 'react';
import type {Visit} from './types';
type Tool={name:string;description:string;inputSchema:object;annotations:{readOnlyHint:boolean;untrustedContentHint:boolean};execute:(input:unknown)=>unknown};
export function useWebMCP(visits:Visit[]){
 const current=useRef(visits);current.current=visits;
 useEffect(()=>{const context=(document as Document&{modelContext?:{registerTool:(tool:Tool,options:{signal:AbortSignal})=>void|Promise<void>}}).modelContext;if(!context?.registerTool)return;const controller=new AbortController();try{Promise.resolve(context.registerTool({name:'read_wanderguide_journey',description:'Read the places already present in the traveler’s current journey. Returns landmark names and visit dates, never photos, coordinates, or conversations.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:true},execute(input){if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).length)throw new Error('Expected an empty object.');return {visits:current.current.map(v=>({name:v.attraction.name,location:v.attraction.location,visitedAt:v.visitedAt,sample:!!v.sample}))};}},{signal:controller.signal})).catch(()=>{});}catch{}return ()=>controller.abort();},[]);
}
