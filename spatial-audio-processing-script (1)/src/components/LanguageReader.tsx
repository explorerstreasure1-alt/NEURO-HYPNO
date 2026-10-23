import { useState } from 'react';
import { engine } from '../audio/engine';
import { phrasesOf } from '../data/phrases';

const LANG_MAP: Record<string,string> = {
  ES:'es-ES', FR:'fr-FR', EN:'en-US', DE:'de-DE', IT:'it-IT', JP:'ja-JP'
};

export function LanguageReader({ langId='EN' }:{ langId:string }){
  const [idx,setIdx]=useState(0);
  const list = phrasesOf(langId);
  const phrase = list[idx];

  const speak = ()=>{
    const text = phrase.pattern.replace('___','usta');
    engine.speakLightWhisper?.(text, LANG_MAP[langId]||'en-US');
  };

  return (
    <div className="p-4 rounded-xl border border-white/10 bg-white/5">
      <div className="font-mono text-xs text-white/60">Kelime / Cümle Okuyucu · {langId}</div>
      <div className="mt-2 text-white">{phrase.pattern}</div>
      <div className="text-white/50 text-sm">{phrase.gloss}</div>
      <div className="text-white/40 text-xs mt-1">{phrase.note}</div>
      <button onClick={()=>{ setIdx((i)=>(i+1)%list.length); }} className="mt-3 mr-2 px-3 py-1 rounded bg-indigo-600">Sonraki</button>
      <button onClick={speak} className="mt-3 px-3 py-1 rounded bg-fuchsia-600">Oku · Yankılı</button>
    </div>
  );
}
