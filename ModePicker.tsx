import {Sparkles} from 'lucide-react';
import {modes,type Mode} from '@/lib/types';
export function ModePicker({mode,busy,onChange}:{mode:Mode;busy:boolean;onChange:(mode:Mode)=>void}){return <div className="mode-picker" aria-label="Guide mode">{modes.map(m=><button key={m} disabled={busy} className={mode===m?'selected':''} aria-pressed={mode===m} onClick={()=>onChange(m)}>{m===mode&&<Sparkles size={13}/>} {m}</button>)}</div>;}
