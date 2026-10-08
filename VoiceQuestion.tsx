'use client';
import {useEffect,useRef,useState} from 'react';
import {Mic,Square} from 'lucide-react';
type Recognition = {lang:string;interimResults:boolean;onresult:((event:{results:{transcript:string}[][]})=>void)|null;onerror:((event:{error:string})=>void)|null;onend:(()=>void)|null;start:()=>void;stop:()=>void;abort:()=>void};
export function VoiceQuestion({onText,onError,disabled=false}:{onText:(text:string)=>void;onError:(error:string)=>void;disabled?:boolean}){
 const [supported,setSupported]=useState(false);const [active,setActive]=useState(false);const ref=useRef<Recognition|null>(null);
 useEffect(()=>{const w=window as unknown as {SpeechRecognition?:new()=>Recognition;webkitSpeechRecognition?:new()=>Recognition};setSupported(!!(w.SpeechRecognition||w.webkitSpeechRecognition));return ()=>ref.current?.abort();},[]);
 function start(){if(active){ref.current?.stop();return;}const w=window as unknown as {SpeechRecognition?:new()=>Recognition;webkitSpeechRecognition?:new()=>Recognition};const Constructor=w.SpeechRecognition||w.webkitSpeechRecognition;if(!Constructor)return;const r=new Constructor();ref.current=r;r.lang='en-US';r.interimResults=false;r.onresult=e=>onText(e.results[0][0].transcript);r.onerror=e=>{setActive(false);onError(e.error==='not-allowed'?'Microphone access is off. You can type your question instead.':'We couldn’t hear that. Please try again or type your question.');};r.onend=()=>setActive(false);try{r.start();setActive(true);}catch{onError('Voice questions aren’t available here. Please type your question.');}}
 if(!supported)return null;
 return <button type="button" className={`icon-button ${active?'recording':''}`} aria-label={active?'Stop recording':'Dictate a question'} disabled={disabled} onClick={start}>{active?<Square size={19}/>:<Mic size={20}/>}</button>;
}
