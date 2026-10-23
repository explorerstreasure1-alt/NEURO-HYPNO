import { useState } from 'react';
import { startNeuroImprint } from '../audio/neuroImprint';
import { CEFR_ORDER } from '../data/rhymes';

const LANGUAGES = ['EN','ES','FR','DE','IT','JP'];

export default function NeuroImprint(){
  const [lang,setLang]=useState('EN');
  const [level,setLevel]=useState<CEFR>('A1');
  const [mode,setMode]=useState<'words'|'sentences'|'both'>('both');

  return (
    <div className="min-h-screen bg-[#07031c] text-white p-6">
      <h1 className="text-2xl font-bold mb-2">Nöro-İmprint</h1>
      <p className="text-white/60 mb-4">Beden uyur, beyin theta’da kalır. Net yankılı sesle hafızaya yükleme.</p>
      
      <div className="flex flex-wrap gap-2 mb-3">
        {LANGUAGES.map(l=>(
          <button key={l} onClick={()=>setLang(l)} className={`px-3 py-1 rounded ${lang===l?'bg-fuchsia-600':'bg-white/10'}`}>{l}</button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 mb-3">
        {CEFR_ORDER.map(c=>(
          <button key={c} onClick={()=>setLevel(c as any)} className={`px-3 py-1 rounded ${level===c?'bg-indigo-600':'bg-white/10'}`}>{c}</button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        {(['words','sentences','both'] as const).map(m=>(
          <button key={m} onClick={()=>setMode(m)} className={`px-3 py-1 rounded ${mode===m?'bg-emerald-600':'bg-white/10'}`}>{m}</button>
        ))}
      </div>
      <button onClick={()=>startNeuroImprint({langId:lang, level, mode})} className="px-4 py-2 bg-fuchsia-600 rounded">Başlat İmprint</button>
    </div>
  );
}
