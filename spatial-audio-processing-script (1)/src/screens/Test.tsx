import { useState } from 'react';
import { engine } from '../audio/engine';
import { phrasesOf } from '../data/phrases';

const LANG_MAP: Record<string,string> = {
  ES:'es-ES', FR:'fr-FR', EN:'en-US', DE:'de-DE', IT:'it-IT', JP:'ja-JP'
};

export default function Test(){
  const [lang,setLang]=useState('EN');
  const [idx,setIdx]=useState(0);
  const list = phrasesOf(lang);
  const phrase = list[idx];

  const speak = ()=>{
    const text = phrase.pattern.replace('___','usta');
    engine.speakLightWhisper(text, LANG_MAP[lang]||'en-US');
  };

  return (
    <div className="min-h-screen bg-[#07031c] text-white p-6">
      <h1 className="text-2xl font-bold mb-4">TEST BÖLÜMÜ</h1>
      <p className="text-white/60 mb-4">24 dk beklemeden doğrudan dinle</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {Object.keys(LANG_MAP).map(k=> (
          <button key={k} onClick={()=>setLang(k)} className={`px-3 py-1 rounded ${lang===k?'bg-fuchsia-600':'bg-white/10'}`}>{k}</button>
        ))}
      </div>
      <div className="border border-white/10 rounded-xl p-4 bg-white/5">
        <div className="text-lg">{phrase.pattern}</div>
        <div className="text-white/50">{phrase.gloss}</div>
        <div className="text-white/40 text-xs mt-1">{phrase.note}</div>
        <div className="mt-3 flex gap-2">
          <button onClick={()=>setIdx((i)=>(i+1)%list.length)} className="px-3 py-1 bg-indigo-600 rounded">Sonraki</button>
          <button onClick={speak} className="px-3 py-1 bg-fuchsia-600 rounded">Hemen Oku · Yankılı</button>
        </div>
      </div>
    </div>
  );
}
