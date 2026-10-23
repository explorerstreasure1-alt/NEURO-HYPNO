import { phrasesOf } from './phrases';

export type CEFR = 'A1'|'A2'|'B1'|'B2'|'C1';

export interface RhymeSet {
  level: CEFR;
  lines: string[]; // 4 satır
  gloss: string[];
}

// Basit 4’lü kafiye üretici: her çalıştırdığında farklı set
export function generateRhymeSet(langId: string, level: CEFR, seed?: number): RhymeSet {
  const phrases = phrasesOf(langId);
  if (!phrases.length) return { level, lines: ['...'], gloss:['...'] };
  
  // Seed ile deterministik karışık seçim
  const rnd = mulberry32(seed ?? Date.now());
  const pick = (arr: any[]) => arr[Math.floor(rnd()*arr.length)];
  
  const four = Array.from({length:4}, () => pick(phrases));
  const lines = four.map(p => p.pattern.replace('___','usta'));
  const gloss = four.map(p => p.gloss.replace('___','usta'));
  return { level, lines, gloss };
}

// Mini PRNG
function mulberry32(a:number){ return function(){ let t=a+=0x6D2B79F5; t=Math.imul(t^t>>>15,t^t>>>7); t^=t+Math.imul(t^t>>>15,t^t>>>7); return ((t^t>>>16)/4294967296); } }

export const CEFR_ORDER: CEFR[] = ['A1','A2','B1','B2','C1'];
