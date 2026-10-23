import { engine } from './engine';
import { generateRhymeSet, CEFR } from '../data/rhymes';
import { rampToPhase } from './hypnagogic';

export type ImprintMode = 'words' | 'sentences' | 'both';

export async function startNeuroImprint({
  langId='EN',
  level='A1' as CEFR,
  mode='both' as ImprintMode,
  setIntervalMin=42
}={}){
  // 1. Bedeni uyut, beyni theta’da tut
  rampToPhase(engine, 'hypnagogic', 60);
  
  // 2. Net yankılı ses için parametreler
  engine.update({ wet:55, highCut:7000, whisperGain:35, binauralGain:40, masterGain:90 });

  let setCount = 0;
  const nextSet = async ()=>{
    setCount++;
    const seed = Date.now() + setCount*9999;
    const set = generateRhymeSet(langId, level, seed);
    const lines = mode==='sentences' ? set.lines : mode==='words' ? set.lines.slice(0,2) : set.lines;
    
    // Seti okuma: her satır 7 sn aralıkla
    for(const line of lines){
      engine.speakLightWhisper(line, langMap(langId), 0.9);
      await sleep(7000);
    }
    // 42 dk bekle, sonra yeni 4’lü sete geç
    await sleep(setIntervalMin*60*1000);
    await nextSet();
  };
  
  await nextSet();
}

function langMap(id:string){
  const m:{[k:string]:string}={ES:'es-ES',FR:'fr-FR',EN:'en-US',DE:'de-DE',IT:'it-IT',JP:'ja-JP'};
  return m[id]||'en-US';
}
const sleep = (ms:number)=>new Promise(r=>setTimeout(r,ms));
