import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { engine, DEFAULT_PARAMS } from './audio/engine';
import type { EngineParams, OutputMode } from './audio/engine';
import { SESSIONS, PHASE_AUTO, presetOf, RHYMES } from './data/content';
import type { Session } from './data/content';
import { levelSession, INDUCTION, inductionPhaseAt, inductionPhaseLeft, langTr, entrainmentAt, sessionThetaAt } from './data/curriculum';
import { CRITICAL_WINDOW_RATIO, CRITICAL_WINDOW_MAX_SEC } from './data/science';
import { WHISPER_DELAY_SEC, WHISPER_RAMP_SEC, WHISPER_DELAY_MIN_TAIL_SEC } from './data/phrases';
import { stageIndexAt, stageTimeLeft, resolveStage, cycleLapsAt, STAGE_DURATION_SEC, STAGE_COUNT } from './data/stages';
import type { ResolvedStage } from './data/stages';
import { newSrsCard, reviewSrsCard, dueCards, srsKey } from './data/srs';
import type { SrsCard, SrsDeck } from './data/srs';
import { startWhisperSession, stopWhisperSession } from './audio/whisperSession';
import { getEndpoint } from './audio/ttsSettings';
import { startKeepAlive, stopKeepAlive, setKeepAliveHandlers, updateKeepAliveMeta } from './audio/keepAlive';
import type { CEFR } from './data/lexicon';

export type Tab = 'home' | 'explore' | 'stats' | 'profile' | 'imprint' | 'test';

export interface Toast { id: number; text: string; kind: 'info' | 'success' | 'theta' | 'warn' }
export interface JournalEntry { id: number; date: string; text: string; mood: string }
export interface Recap { xp: number; minutes: number; words: number; sessionTitle: string }
export interface QuizCard { word: string; gloss: string; langId: string }

export interface Settings {
  bedtime: string;
  reminders: boolean;
  haptics: boolean;
  fadeOut: boolean;
  autoplayNext: boolean;
  nightShield: boolean; // Dr. S. Aydemir (Kronobiyolog): akşam mavi ışık hijyeni
}

const LS_KEY = 'nhyp-v1';

export function buzz(pattern: number | number[] = 12) {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw && JSON.parse(raw).settings?.haptics === false) return;
    (navigator as any).vibrate?.(pattern);
  } catch { /* sessiz */ }
}

interface Persist {
  onboarded: boolean;
  xp: number; streak: number; nights: number; totalMin: number; words: number;
  lastNight: string;
  ritual: Record<string, boolean>; ritualDate: string;
  journal: JournalEntry[];
  settings: Settings;
  currentId: string;
  sleepTimerMin: number;
  smartWake: boolean;
  autoPhase: boolean;
  quizDoneDate: string;
  mastered: string[];
  outputMode: OutputMode;
  unlocked: Record<string, number>;
  speakerCalib: { weak: boolean; bestFreq: number; ts: number } | null;
  disclaimerAccepted: boolean;
  encodingDoneIds: string[];
  encodedStage: Record<string, number>; // session id -> uyanıkken kodlanan aşama indeksi
  srsDeck: SrsDeck; // Ebbinghaus aralıklı tekrar kartları
}

const DEFAULT_PERSIST: Persist = {
  onboarded: false,
  xp: 240, streak: 5, nights: 14, totalMin: 342, words: 64,
  lastNight: '',
  ritual: {}, ritualDate: '',
  journal: [
    { id: 1, date: 'Dün gece', text: 'Rüyamda ay ışığında "luna, fortuna" diye bir şarkı mırıldanıyordum. Sabah uyandığımda kelimeler hâlâ dilimdeydi.', mood: 'Berrak rüya' },
  ],
  settings: { bedtime: '23:30', reminders: true, haptics: true, fadeOut: true, autoplayNext: false, nightShield: true },
  currentId: 'lvl-EN-0-0', // varsayılan: İngilizce A1'den başla (hiçbir dil/seviye kilitli değil)
  sleepTimerMin: 20,
  smartWake: true,
  autoPhase: true,
  quizDoneDate: '',
  mastered: ['night', 'light'],
  outputMode: 'phones',
  // Not bir kilit değil, yalnızca "tamamlanan en yüksek seviye" ilerleme göstergesi.
  // Tüm diller ve tüm seviyeler (A1→C1) her zaman doğrudan çalınabilir.
  unlocked: { ES: 0, FR: 0, EN: 0, JP: 0, DE: 0, IT: 0 },
  speakerCalib: null,
  disclaimerAccepted: false,
  encodingDoneIds: [],
  encodedStage: {},
  srsDeck: {},
};

function loadPersist(): Persist {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return DEFAULT_PERSIST;
    const j = JSON.parse(raw);
    return {
      ...DEFAULT_PERSIST, ...j,
      settings: { ...DEFAULT_PERSIST.settings, ...j.settings },
      unlocked: { ...DEFAULT_PERSIST.unlocked, ...j.unlocked },
      encodedStage: { ...DEFAULT_PERSIST.encodedStage, ...j.encodedStage },
      srsDeck: { ...DEFAULT_PERSIST.srsDeck, ...j.srsDeck },
    };
  } catch {
    return DEFAULT_PERSIST;
  }
}

interface AppCtx {
  tab: Tab; setTab: (t: Tab) => void;
  playerOpen: boolean; setPlayerOpen: (v: boolean) => void;
  params: EngineParams; patch: (p: Partial<EngineParams>, silent?: boolean) => void;
  applyPreset: (presetId: string) => void;
  playing: boolean;
  current: Session;
  selectSession: (s: Session, autoplay?: boolean) => void;
  togglePlay: () => void;
  stopSession: () => void;
  elapsed: number; totalSecs: number; remaining: number; progress: number;
  whisperArmed: boolean; whisperDelaySec: number; whisperCountdown: number; whisperLiveIdx: number;
  whisperReading: string; whisperReal: boolean; startWhisperNow: () => void;
  whisperRampProgress: number; whisperLevelPct: number; whisperFullAtSec: number;
  stage: ResolvedStage; stageCount: number; stageDurationSec: number; stageTimeLeftSec: number; cycleLaps: number;
  stageIsManual: boolean; jumpToStage: (idx: number) => void; setStageAuto: () => void;
  sleepTimerMin: number; setSleepTimer: (m: number) => void;
  smartWake: boolean; setSmartWake: (v: boolean) => void;
  autoPhase: boolean; setAutoPhase: (v: boolean) => void;
  phaseIdx: number;
  liveWord: number;
  xp: number; level: number; levelPct: number; streak: number; nights: number; totalMin: number; words: number;
  ritual: Record<string, boolean>; toggleRitual: (id: string) => void; ritualDone: number;
  journal: JournalEntry[]; addJournal: (text: string, mood: string) => void;
  settings: Settings; updateSettings: (p: Partial<Settings>) => void;
  toasts: Toast[]; pushToast: (text: string, kind?: Toast['kind']) => void;
  onboarded: boolean; completeOnboarding: () => void;
  recap: Recap | null; closeRecap: () => void;
  quizOpen: boolean; quizCards: QuizCard[]; quizIdx: number; quizKnown: number; quizReveal: boolean;
  startQuiz: () => void; revealQuiz: () => void; answerQuiz: (known: boolean) => void; closeQuiz: () => void;
  encodingWords: string[]; encodingGlosses: string[]; reinforcementActive: boolean;
  srsDue: SrsCard[]; srsDueCount: number; startReviewQuiz: () => void; reviewMode: boolean;
  builderOpen: boolean; setBuilderOpen: (v: boolean) => void;
  bedtimeCountdown: string;
  mastered: string[];
  outputMode: OutputMode; setOutputMode: (m: OutputMode) => void;
  unlocked: Record<string, number>;
  speakerCalib: Persist['speakerCalib']; calibrating: boolean; calibLive: { freq: number; pct: number }[];
  runCalibration: () => Promise<void>;
  calibModalOpen: boolean; setCalibModalOpen: (v: boolean) => void;
  startLevel: (langId: string, idx: number) => void;
  currLang: string | null; setCurrLang: (id: string | null) => void;
  induction: boolean; indPhase: number; indPhaseLeft: number;
  indOpen: boolean; setIndOpen: (v: boolean) => void;
  startInduction: () => void;
  resetAll: () => void;
  // ── bilim & güvenlik (3 nörolog incelemesi) ──
  disclaimerAccepted: boolean; acceptDisclaimer: () => void;
  disclaimerOpen: boolean; setDisclaimerOpen: (v: boolean) => void;
  scienceOpen: boolean; setScienceOpen: (v: boolean) => void;
  encodingOpen: boolean; encodingIdx: number; encodingRevealed: boolean;
  startEncoding: () => void; revealEncoding: () => void; nextEncoding: () => void; closeEncoding: () => void; skipToSleep: () => void;
  encodingDoneForCurrent: boolean;
  requestPlay: () => void; // disclaimer kontrolünden geçirip gerçek togglePlay'i tetikler
  taperActive: boolean;
  liveTheta: number; // o an gerçekten çalan sürüklenme frekansı
  thetaDepth: number; // nabız belirginliği 0.5-1
  descentProgress: number; // 10 dakikalık inişin 0-1 ilerlemesi
}

const Ctx = createContext<AppCtx | null>(null);
export const useApp = () => useContext(Ctx)!;

let toastId = 1;

export function AppProvider({ children }: { children: ReactNode }) {
  const [saved] = useState<Persist>(loadPersist);
  const [tab, setTabState] = useState<Tab>('home');
  const [playerOpen, setPlayerOpen] = useState(false);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [params, setParams] = useState<EngineParams>(() => ({ ...DEFAULT_PARAMS }));
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState<Session>(() => {
    const found = SESSIONS.find((s) => s.id === saved.currentId);
    if (found) return found;
    if (saved.currentId.startsWith('lvl-')) {
      const [, langId, idxStr] = saved.currentId.split('-');
      const idx = parseInt(idxStr, 10);
      if (langId && !Number.isNaN(idx)) return levelSession(langId, idx, 0);
    }
    return levelSession('EN', 0); // güvenli varsayılan: İngilizce A1
  });
  const [audioReady, setAudioReady] = useState(false);

  const [sleepTimerMin, setSleepTimerMin] = useState(saved.sleepTimerMin);
  const [totalSecs, setTotalSecs] = useState(saved.sleepTimerMin * 60);
  const [elapsed, setElapsed] = useState(0);
  const [remaining, setRemaining] = useState(saved.sleepTimerMin * 60);
  const [smartWake, setSmartWake] = useState(saved.smartWake);
  const [autoPhase, setAutoPhase] = useState(saved.autoPhase);
  const [phaseIdx, setPhaseIdx] = useState(0);

  const [onboarded, setOnboarded] = useState(saved.onboarded);
  const [xp, setXp] = useState(saved.xp);
  const [streak, setStreak] = useState(saved.streak);
  const [nights, setNights] = useState(saved.nights);
  const [totalMin, setTotalMin] = useState(saved.totalMin);
  const [words, setWords] = useState(saved.words);
  const [lastNight, setLastNight] = useState(saved.lastNight);
  const [ritual, setRitual] = useState<Record<string, boolean>>(saved.ritualDate === todayKey() ? saved.ritual : {});
  const [journal, setJournal] = useState<JournalEntry[]>(saved.journal);
  const [settings, setSettings] = useState<Settings>(saved.settings);
  const [mastered, setMastered] = useState<string[]>(saved.mastered);
  const [quizDoneDate, setQuizDoneDate] = useState(saved.quizDoneDate);

  const [outputMode, setOutputModeState] = useState<OutputMode>(saved.outputMode);
  const [unlocked, setUnlocked] = useState<Record<string, number>>(saved.unlocked);
  const [speakerCalib, setSpeakerCalib] = useState<Persist['speakerCalib']>(saved.speakerCalib);
  const [calibrating, setCalibrating] = useState(false);
  const [calibLive, setCalibLive] = useState<{ freq: number; pct: number }[]>([]);
  const [calibModalOpen, setCalibModalOpen] = useState(false);
  const [currLang, setCurrLangState] = useState<string | null>(null);
  const [induction, setInduction] = useState(false);
  // 45dk otomatik zamanlayıcı da "kilitli" değil — istenirse anında başka aşamaya atlanabilir.
  const [stageManualIdx, setStageManualIdx] = useState<number | null>(null);
  const [indOpen, setIndOpenState] = useState(false);

  // ── bilim & güvenlik ──
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(saved.disclaimerAccepted);
  const [disclaimerOpen, setDisclaimerOpenState] = useState(false);
  const [scienceOpen, setScienceOpenState] = useState(false);
  const [encodingDoneIds, setEncodingDoneIds] = useState<string[]>(saved.encodingDoneIds);
  const [encodedStage, setEncodedStage] = useState<Record<string, number>>(saved.encodedStage);
  const [srsDeck, setSrsDeck] = useState<SrsDeck>(saved.srsDeck);
  const [reviewMode, setReviewMode] = useState(false);
  const [encodingOpen, setEncodingOpen] = useState(false);
  const [encodingIdx, setEncodingIdx] = useState(0);
  const [encodingRevealed, setEncodingRevealed] = useState(false);
  const [taperActive, setTaperActive] = useState(false);
  const pendingPlay = useRef(false);

  // ── gecikmeli fısıltı: yabancı dil cümle kalıpları 10dk sonra başlar ──
  const [whisperArmed, setWhisperArmed] = useState(false);
  const [whisperLiveIdx, setWhisperLiveIdx] = useState(0);
  const [whisperReading, setWhisperReading] = useState('');
  const [whisperReal, setWhisperReal] = useState(false);
  const whisperRampRef = useRef(1);
  const whisperForceRef = useRef(0);

  const [toasts, setToasts] = useState<Toast[]>([]);
  const [recap, setRecap] = useState<Recap | null>(null);

  const [quizOpen, setQuizOpen] = useState(false);
  const [quizCards, setQuizCards] = useState<QuizCard[]>([]);
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizKnown, setQuizKnown] = useState(0);
  const [quizReveal, setQuizReveal] = useState(false);

  const baseMaster = useRef(85);
  const finishing = useRef(false);
  const requestPlayRef = useRef<() => void>(() => {});

  function todayKey() {
    return new Date().toISOString().slice(0, 10);
  }

  // ── persist ──
  useEffect(() => {
    const p: Persist = {
      onboarded, xp, streak, nights, totalMin, words, lastNight,
      ritual, ritualDate: todayKey(), journal, settings,
      currentId: current.id, sleepTimerMin, smartWake, autoPhase, quizDoneDate, mastered,
      outputMode, unlocked, speakerCalib, disclaimerAccepted, encodingDoneIds, encodedStage, srsDeck,
    };
    try { localStorage.setItem(LS_KEY, JSON.stringify(p)); } catch { /* yok */ }
  }, [onboarded, xp, streak, nights, totalMin, words, lastNight, ritual, journal, settings, current.id, sleepTimerMin, smartWake, autoPhase, quizDoneDate, mastered, outputMode, unlocked, disclaimerAccepted, encodingDoneIds, encodedStage, srsDeck]);

  const pushToast = useCallback((text: string, kind: Toast['kind'] = 'info') => {
    const id = toastId++;
    setToasts((t) => [...t.slice(-2), { id, text, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  // ── engine ──
  const ensureAudio = useCallback(async () => {
    engine.setOutputMode(outputMode);
    if (speakerCalib) engine.setSpeakerProfile({ weak: speakerCalib.weak, bestFreq: speakerCalib.bestFreq, levels: [], baseDb: 0, bestDb: 0, ts: speakerCalib.ts });
    if (!audioReady) {
      await engine.ensure();
      engine.update({ ...params, binauralBeat: current.theta });
      engine.setDecay(params.decay);
      setAudioReady(true);
    } else {
      await engine.ensure();
    }
  }, [audioReady, params, current.theta, outputMode, speakerCalib]);

  const patch = useCallback((p: Partial<EngineParams>, silent = false) => {
    setParams((prev) => {
      const next = { ...prev, ...p };
      engine.update(p);
      if (p.decay !== undefined) engine.setDecay(p.decay);
      if (p.masterGain !== undefined && !silent) baseMaster.current = p.masterGain;
      return next;
    });
  }, []);

  const applyPreset = useCallback((presetId: string) => {
    const pr = presetOf({ presetId } as Session);
    patch({ ...pr.patch });
    buzz(15);
    pushToast(`${pr.name} mekânı yüklendi · ${pr.tag}`, 'theta');
  }, [patch, pushToast]);

  const runCalibration = useCallback(async () => {
    setCalibrating(true);
    setCalibLive([]);
    buzz(15);
    pushToast('Hoparlör kalibrasyonu başladı · sessiz ol', 'info');
    try {
      const result = await engine.calibrateSpeaker((f, i, total, levelPct) => {
        setCalibLive((l) => [...l, { freq: f, pct: Math.round(levelPct * 100) }]);
        pushToast(`Ton ${i + 1}/${total} · ${f.toFixed(1)} Hz ölçülüyor`, 'info');
      });
      setSpeakerCalib({ weak: result.weak, bestFreq: result.bestFreq, ts: result.ts });
      buzz([20, 40, 20]);
      pushToast(
        result.weak
          ? `Zayıf bas tespit edildi · harmonik takviye + thump güçlendirildi`
          : `Hoparlör güçlü · ${result.bestFreq.toFixed(0)} Hz net basıyor`,
        'success',
      );
    } catch (e) {
      pushToast('Mikrofon izni verilmedi · güvenli varsayılan profil kullanılacak', 'warn');
      setSpeakerCalib({ weak: true, bestFreq: 272.2, ts: Date.now() });
      engine.setSpeakerProfile(null);
    } finally {
      setCalibrating(false);
    }
  }, [pushToast]);

  // Hoparlör moduna geçildiğinde, hiç kalibrasyon yoksa otomatik olarak başlat.
  const setOutputMode = useCallback((m: OutputMode) => {
    buzz(15);
    setOutputModeState(m);
    engine.setOutputMode(m);
    pushToast(m === 'phones'
      ? 'Kulaklık modu · Binaural L200/R206'
      : 'Hoparlör modu · İzokronik 136.1 Hz + M/S', 'theta');
    if (m === 'speaker' && !speakerCalib) {
      setCalibModalOpen(true);
      setTimeout(() => { runCalibration(); }, 450); // mod geçiş animasyonu bitsin, sonra mikrofon izni istensin
    }
  }, [pushToast, speakerCalib, runCalibration]);

  const setCurrLang = useCallback((id: string | null) => {
    if (id) buzz(12);
    setCurrLangState(id);
  }, []);

  const setIndOpen = useCallback((v: boolean) => {
    if (v) buzz(12);
    setIndOpenState(v);
  }, []);

  // ── bilim & güvenlik: zorunlu onay, uyanıkken kodlama, akıllı söndürme ──
  const setDisclaimerOpen = useCallback((v: boolean) => setDisclaimerOpenState(v), []);
  const setScienceOpen = useCallback((v: boolean) => { if (v) buzz(10); setScienceOpenState(v); }, []);

  const acceptDisclaimer = useCallback(() => {
    setDisclaimerAccepted(true);
    setDisclaimerOpenState(false);
    buzz(15);
    pushToast('Güvenlik onayı kaydedildi · iyi geceler', 'success');
    if (pendingPlay.current) {
      pendingPlay.current = false;
      setTimeout(() => togglePlayRef.current(), 200);
    }
  }, [pushToast]);

  /** Her ses başlatma isteği buradan geçer: önce güvenlik onayı garanti edilir. */
  const requestPlay = useCallback(() => {
    if (!disclaimerAccepted) {
      pendingPlay.current = true;
      setDisclaimerOpenState(true);
      buzz(12);
      return;
    }
    togglePlayRef.current();
  }, [disclaimerAccepted]);
  requestPlayRef.current = requestPlay;

  // ── GECE DÖNGÜSÜ: 7 aşama × 45 dk, her aşamada 4 AAAA-kafiyeli kelime +
  // onlardan türeyen 4 AAAA-kafiyeli cümle kalıbı. 7. aşama bitince başa sarar.
  // Zamanlama da bir kilit değildir: istenen aşamaya elle anında atlanabilir.
  // NOT: bu blok, aşağıdaki "uyanıkken kodlama" fonksiyonlarının doğru
  // (o an çalınan) aşamanın kelimelerini kullanabilmesi için erken tanımlanır
  // — Dr. S. Aydemir (Kronobiyolog) bulgusu: ipucu/hedef tutarlılığı şart. ──
  const autoStageIdx = playing && !induction ? stageIndexAt(elapsed) : 0;
  const stageIdx = stageManualIdx !== null ? stageManualIdx : autoStageIdx;
  const stageTimeLeftSec = playing && !induction && stageManualIdx === null ? stageTimeLeft(elapsed) : STAGE_DURATION_SEC;
  const cycleLaps = playing && !induction ? cycleLapsAt(elapsed) : 0;
  const stage = useMemo(() => resolveStage(current.lang, stageIdx), [current.lang, stageIdx]);

  // Canlı frekans: İniş'te özel 10 dk eğrisi, normal seansta da ilk 10 dk
  // 10 Hz'den seansın hedef teta değerine yumuşak iniş uygulanır.
  const entrainment = induction ? entrainmentAt(elapsed) : sessionThetaAt(elapsed, current.theta);
  const liveTheta = playing ? entrainment.hz : params.binauralBeat;
  const thetaDepth = entrainment.depth;
  const descentProgress = Math.min(1, Math.max(0, elapsed / 600));

  const encodingDoneForCurrent = encodingDoneIds.includes(current.id);
  // Pekiştirme Doğruluğu (Cue-Consistency): yalnızca az önce uyanıkken
  // kodladığın aşama "tam pekiştirme" sesiyle çalar. Kodlanmamış aşamalar
  // dürüstçe "pasif tanışma" olarak işaretlenir ve ses seviyesi kısılır.
  const reinforcementActive = induction || encodedStage[current.id] === stage.idx;
  const encodingWords = induction ? current.words : stage.words;
  const encodingGlosses = induction ? current.gloss.split('·').map((g) => g.trim()) : stage.glosses;

  const startEncoding = useCallback(() => {
    setEncodingIdx(0);
    setEncodingRevealed(false);
    setEncodingOpen(true);
    buzz(12);
  }, []);
  const revealEncoding = useCallback(() => { buzz(8); setEncodingRevealed(true); }, []);
  const nextEncoding = useCallback(() => {
    if (encodingIdx + 1 >= encodingWords.length) {
      setEncodingDoneIds((d) => Array.from(new Set([...d, current.id])));
      // Pekiştirme Doğruluğu: hangi aşamayı kodladığını kaydet — gece sesi
      // yalnızca BU aşamadayken "tam pekiştirme" (TMR) sayılacak.
      setEncodedStage((m) => ({ ...m, [current.id]: stage.idx }));
      // Aynı zamanda kodlanan kelimeleri aralıklı tekrar destesine ekle (Ebbinghaus).
      setSrsDeck((deck) => {
        const next = { ...deck };
        encodingWords.forEach((w, i) => {
          const key = srsKey(current.lang, w);
          if (!next[key]) next[key] = newSrsCard(current.lang, w, encodingGlosses[i] ?? '', Date.now());
        });
        return next;
      });
      setXp((x) => x + 15);
      setEncodingOpen(false);
      buzz([15, 30, 15]);
      pushToast('Uyanıkken kodlama tamam · +15 XP · şimdi uykuda tam pekiştirme sırası', 'success');
      requestPlay();
    } else {
      setEncodingIdx((i) => i + 1);
      setEncodingRevealed(false);
      buzz(8);
    }
  }, [encodingIdx, encodingWords, encodingGlosses, current.id, current.lang, stage.idx, pushToast, requestPlay]);
  const closeEncoding = useCallback(() => setEncodingOpen(false), []);
  const skipToSleep = useCallback(() => {
    setEncodingOpen(false);
    requestPlay();
  }, [requestPlay]);

  const setTab = useCallback((t: Tab) => {
    buzz(8);
    setTabState(t);
  }, []);

  const selectSession = useCallback(async (s: Session, autoplay = false) => {
    const wasPlaying = playing;
    if (wasPlaying) {
      await engine.stopAll();
      setPlaying(false);
    }
    setCurrent(s);
    const pr = presetOf(s);
    setParams((prev) => {
      const next = { ...prev, ...pr.patch, binauralBeat: s.theta, masterGain: baseMaster.current };
      engine.update(next);
      if (next.decay !== undefined) engine.setDecay(next.decay);
      return next;
    });
    setSleepTimerMin(s.minutes);
    setTotalSecs(s.minutes * 60);
    setElapsed(0);
    setRemaining(s.minutes * 60);
    setPhaseIdx(0);
    setInduction(s.id.startsWith('induction-'));
    setWhisperArmed(false);
    setWhisperLiveIdx(0);
    stageIdxRef.current = 0;
    cycleLapsRef.current = 0;
    setStageManualIdx(null);
    engine.regenerateSentenceWhisper();
    finishing.current = false;
    buzz(15);
    const isInd = s.id.startsWith('induction-');
    pushToast(
      isInd
        ? `${s.title} hazır · ${s.minutes} dk · θ ${s.theta} Hz`
        : `${s.title} hazır · ${s.minutes} dk · ${s.langTr} fısıltısı 10 dk sonra yankılı başlayacak`,
      'success',
    );
    if (autoplay) {
      setTimeout(() => requestPlayRef.current(), 350);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing]);

  const startLevel = useCallback((langId: string, idx: number) => {
    const s = levelSession(langId, idx, 0);
    setCurrLangState(null);
    buzz(20);
    selectSession(s, true);
    setPlayerOpen(true);
  }, [selectSession]);

  const startInduction = useCallback(() => {
    const rhyme = RHYMES.find((r) => r.id === current.lang) ?? RHYMES[0];
    const custom: Session = {
      id: `induction-${Date.now()}`,
      title: 'Hipnagojik İniş · 10′',
      sub: 'Beden uyur · bilinç açık',
      lang: rhyme.id, langTr: rhyme.langTr,
      level: 'İniş', levelTr: 'Rehberli',
      minutes: 10,
      words: rhyme.words, gloss: rhyme.gloss,
      presetId: 'cathedral', theta: 8,
      plays: 'rehberli', rating: 5.0,
      accent: rhyme.color,
      gradient: 'from-indigo-500 via-violet-600 to-fuchsia-600',
      desc: 'İlk 10 dakikada yarı-uyanık rüya hâli: beden uykuya, bilinç açıklığa.',
      badge: '10′',
    };
    setIndOpenState(false);
    buzz(20);
    selectSession(custom, true);
    setPlayerOpen(true);
    pushToast('Hipnagojik iniş başladı · 5 faz × 2 dk', 'theta');
  }, [current.lang, selectSession, pushToast]);

  // Standart seanslarda yabancı dil fısıltısı 10 dk (600sn) sonra başlar;
  // çok kısa seanslarda en az 2 dk fısıltı payı kalacak şekilde ölçeklenir.
  // Hipnagojik İniş kendi 5 fazlı yapısında fısıltıyı baştan taşır (gecikme yok).
  const whisperDelaySec = induction ? 0 : Math.max(0, Math.min(WHISPER_DELAY_SEC, totalSecs - WHISPER_DELAY_MIN_TAIL_SEC));
  // Fısıltı 10. dakikada "yoktan" başlamaz: önce mikro seviyede duyulur,
  // 10 dakika boyunca algısal (üstel eğriyle) tam ritmik seviyeye çıkar.
  const whisperRampDurationSec = induction
    ? 120
    : Math.max(60, Math.min(WHISPER_RAMP_SEC, Math.max(60, totalSecs - whisperDelaySec)));
  const whisperFullAtSec = whisperDelaySec + whisperRampDurationSec;
  const whisperRampRaw = induction
    ? Math.min(1, Math.max(0, elapsed / whisperRampDurationSec))
    : whisperArmed
      ? Math.min(1, Math.max(0, (elapsed - whisperDelaySec) / whisperRampDurationSec))
      : 0;
  const whisperRampSmooth = whisperRampRaw * whisperRampRaw * (3 - 2 * whisperRampRaw);
  const whisperRampK = Math.pow(whisperRampSmooth, 1.2);
  const whisperRampProgress = whisperRampRaw;
  const whisperLevelPct = Math.round(whisperRampK * 100);

  const startAudio = useCallback(async () => {
    await ensureAudio();
    engine.update({ ...params, masterGain: baseMaster.current });
    const delay = induction ? 0 : Math.max(0, Math.min(WHISPER_DELAY_SEC, totalSecs - WHISPER_DELAY_MIN_TAIL_SEC));
    const alreadyPast = elapsed >= delay;
    await engine.startAll(!induction && !alreadyPast);
    // Ramp eğrisi ilk karede uygulanana kadar ani tam ses sıçramasını engelle.
    if (!induction) engine.update({ whisperGain: 0 });
    if (!induction && alreadyPast) setWhisperArmed(true);
    setPlaying(true);
    setPhaseIdx(0);
    finishing.current = false;
    if ('mediaSession' in navigator) {
      try {
        (navigator as any).mediaSession.metadata = new (window as any).MediaMetadata({
          title: current.title,
          artist: 'NEURO-HYPNO · ' + current.langTr,
          album: current.words.join(' · '),
        });
      } catch { /* yok */ }
    }
  }, [ensureAudio, params, current, induction, totalSecs, elapsed]);

  const togglePlay = useCallback(async () => {
    buzz(20);
    if (playing) {
      await engine.stopAll();
      setPlaying(false);
    } else {
      if (remaining <= 0) {
        setElapsed(0);
        setRemaining(totalSecs);
      }
      await startAudio();
      pushToast(`Seans başladı · ${induction ? INDUCTION[0].name : PHASE_AUTO[0].name} fazı`, 'theta');
    }
  }, [playing, remaining, totalSecs, startAudio, pushToast, induction]);

  const togglePlayRef = useRef(togglePlay);
  togglePlayRef.current = togglePlay;

  const stopSession = useCallback(async () => {
    await engine.stopAll();
    setPlaying(false);
    setWhisperArmed(false);
    engine.update({ masterGain: baseMaster.current });
  }, []);

  const setSleepTimer = useCallback((m: number) => {
    buzz(12);
    setSleepTimerMin(m);
    setTotalSecs(m * 60);
    setElapsed(0);
    setRemaining(m * 60);
    setPhaseIdx(0);
    setWhisperArmed(false);
    finishing.current = false;
    pushToast(`Uyku zamanlayıcı: ${m} dakika`, 'info');
  }, [pushToast]);

  // ── gecikmeli fısıltı tetikleyici: 10. dakikada (ya da ölçeklenmiş eşikte) ──
  useEffect(() => {
    if (!playing || induction || whisperArmed) return;
    if (elapsed >= whisperDelaySec) {
      engine.update({ whisperGain: 0 });
      whisperForceRef.current = 0;
      setWhisperArmed(true);
      // Prosedürel "fısıltı" (anlamsız gürültü) KAPALI — artık gerçek kelime okunuyor.
      engine.setWhisperOn(false);
      buzz([20, 40, 20]);
      pushToast(`🗣️ Fısıltı mikro seviyede başladı — ${current.langTr} kelime/cümle döngüsü yavaşça yükselecek`, 'theta');
    }
  }, [playing, induction, whisperArmed, elapsed, whisperDelaySec, current.langTr, pushToast]);

  /** 10 dk beklemeden okumayı hemen başlat (test + kullanıcı kontrolü) */
  const startWhisperNow = useCallback(() => {
    engine.update({ whisperGain: 0 });
    engine.setWhisperOn(false);
    whisperForceRef.current = 0.75; // duyulur test seviyesi
    setWhisperArmed(true);
    buzz([20, 40, 20]);
    pushToast(`🗣️ ${current.langTr} okuma hemen başlatıldı · 3 tekrar · yankılı`, 'theta');
  }, [current.langTr, pushToast]);

  // ── GERÇEK sesli okuma: 10. dakikadan sonra seçilen dilde kelime + cümle ──
  // (Önceki sürümde sadece prosedürel gürültü çalışıyordu; sesli yankı hiç devreye girmiyordu.)
  useEffect(() => {
    if (!whisperArmed || !playing) return;

    const lv = (['A1', 'A2', 'B1', 'B2', 'C1'] as CEFR[]).includes(current.level as CEFR)
      ? (current.level as CEFR)
      : 'A1';

    startWhisperSession({
      langId: current.lang,
      level: lv,
      mode: 'both',
      repeat: 3,
      endpoint: getEndpoint(),
      getVolume: () => Math.max(whisperForceRef.current, whisperRampRef.current),
      onLine: ({ line, real }) => {
        setWhisperReading(line);
        setWhisperReal(real);
      },
    });

    return () => {
      stopWhisperSession();
      setWhisperReading('');
    };
  }, [whisperArmed, playing, current.lang, current.level]);

  // 10 dk rampasını okuyucuya anlık aktar (efekti yeniden başlatmadan)
  useEffect(() => {
    whisperRampRef.current = whisperRampK;
  }, [whisperRampK]);

  // fısıltı aktifken hangi cümle kalıbının "okunduğunu" döngüsel göster (~9sn/cümle)
  useEffect(() => {
    if (!whisperArmed || !playing) return;
    const i = setInterval(() => setWhisperLiveIdx((v) => v + 1), 9000);
    return () => clearInterval(i);
  }, [whisperArmed, playing]);

  const whisperCountdown = Math.max(0, whisperDelaySec - elapsed);

  const jumpToStage = useCallback((idx: number) => {
    buzz(15);
    setStageManualIdx(((idx % STAGE_COUNT) + STAGE_COUNT) % STAGE_COUNT);
    pushToast(`Aşama ${idx + 1}/${STAGE_COUNT} seçildi · istediğin aşamayı dinlemek serbest`, 'theta');
  }, [pushToast]);

  const setStageAuto = useCallback(() => {
    buzz(10);
    setStageManualIdx(null);
    pushToast('Otomatik aşama akışına dönüldü · 45 dk/aşama', 'info');
  }, [pushToast]);

  const stageIdxRef = useRef(0);
  const cycleLapsRef = useRef(0);
  useEffect(() => {
    if (!playing || induction) return;
    if (stageIdx !== stageIdxRef.current) {
      const wrapped = cycleLaps > cycleLapsRef.current;
      stageIdxRef.current = stageIdx;
      cycleLapsRef.current = cycleLaps;
      engine.regenerateSentenceWhisper(stageIdx + 1 + cycleLaps * STAGE_COUNT);
      buzz([15, 30, 15]);
      pushToast(
        wrapped
          ? `Döngü tamamlandı · 7 aşama bitti, ${stage.rhyme} kafiyesiyle başa sarıyor`
          : `Aşama ${stageIdx + 1}/${STAGE_COUNT} · yeni kafiye grubu (${stage.rhyme}) · 45 dk sürecek`,
        'theta',
      );
    }
  }, [playing, induction, stageIdx, cycleLaps, stage.rhyme, pushToast]);

  // ── seans sayacı + faz otomasyonu + fade ──
  const finishSession = useCallback(async () => {
    if (finishing.current) return;
    finishing.current = true;
    await engine.stopAll();
    setPlaying(false);
    setWhisperArmed(false);
    engine.update({ masterGain: baseMaster.current });
    const mins = Math.max(1, Math.round(elapsed / 60));
    const earned = 25 + mins * 4;
    const w = 2 + Math.floor(Math.random() * 3);
    setXp((x) => x + earned);
    setTotalMin((m) => m + mins);
    setWords((x) => x + w);
    const tk = todayKey();
    if (lastNight !== tk) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      setStreak((s) => (lastNight === yesterday || lastNight === '' ? s + 1 : 1));
      setNights((n) => n + 1);
      setLastNight(tk);
    }
    // müfredat kilidi: lvl-ES-2-0 → ES seviyesi 3 tamamlandı
    if (current.id.startsWith('lvl-')) {
      const [, langId, idxStr] = current.id.split('-');
      const idx = parseInt(idxStr, 10);
      if (!Number.isNaN(idx)) {
        setUnlocked((u) => {
          const have = u[langId] ?? 0;
          if (idx + 1 > have) {
            const codes = ['A1', 'A2', 'B1', 'B2', 'C1'];
            const opened = codes[Math.min(4, idx + 1)];
            setTimeout(() => pushToast(
              idx + 1 >= 5 ? `${langTr(langId)} C1 tamamlandı · USTA oldun` : `${opened} seviyesi açıldı · ${langTr(langId)}`,
              'success'), 900);
            return { ...u, [langId]: Math.min(5, idx + 1) };
          }
          return u;
        });
      }
    }
    if (current.id.startsWith('induction-')) {
      setTimeout(() => pushToast('Hipnagojik iniş tamamlandı · beden uyudu, bilinç açık', 'success'), 900);
    }
    buzz([30, 60, 30]);
    setRecap({ xp: earned, minutes: mins, words: w, sessionTitle: current.title });
  }, [elapsed, lastNight, current.title, current.id, pushToast]);

  useEffect(() => {
    if (!playing) return;
    if (remaining <= 0) {
      finishSession();
      return;
    }
    const t = setTimeout(() => {
      setElapsed((e) => e + 1);
      setRemaining((r) => r - 1);
    }, 1000);
    return () => clearTimeout(t);
  }, [playing, remaining, finishSession]);

  // fade-out son 90 saniye
  useEffect(() => {
    if (!playing || !settings.fadeOut || remaining > 90 || remaining <= 0) return;
    const k = Math.max(0.12, remaining / 90);
    engine.update({ masterGain: Math.round(baseMaster.current * k) });
  }, [playing, remaining, settings.fadeOut]);

  // ── AKILLI SÖNDÜRME (Smart Taper) ──
  // Dr. A. Yıldıran (Uyku Nörolojisi) bulgusu: tüm gece yüksek seviyede
  // çalan sürekli ses mikro-uyanmalara yol açar ve uyku sürekliliğini bozar.
  // Kritik pencere (seansın %60'ı ya da en geç 12 dk — hangisi önce gelirse)
  // sona erince fısıltı ve uyaran kademeli olarak neredeyse sessizliğe iner;
  // uzun seanslarda (90dk vb.) tüm gece aynı yükseklikte çalmaz.
  // Dr. S. Aydemir (Kronobiyolog) bulgusu: kodlanmamış (TMR tutarlılığı
  // olmayan) aşamalarda fısıltı tam seviyede çalmamalı — dürüstçe "pasif
  // tanışma" seviyesine (−28%) çekilir. Her iki etki aynı whisperGain
  // parametresini hedeflediği için TEK bir efektte birleştirilir; aksi
  // halde iki ayrı efekt birbirinin üzerine yazıp "yarış koşulu" yaratırdı.
  const taperStartRef = useRef<number | null>(null);
  useEffect(() => {
    if (!playing) { taperStartRef.current = null; setTaperActive(false); return; }
    const baseWindowSec = Math.min(CRITICAL_WINDOW_MAX_SEC, totalSecs * CRITICAL_WINDOW_RATIO);
    // Fısıltı rampası tamamlanmadan söndürme başlamaz: önce 10. dakikada
    // mikro giriş, 20. dakikada tam seviye; söndürme ancak bundan sonra devrede.
    const windowSec = induction ? baseWindowSec : Math.max(baseWindowSec, Math.min(totalSecs, whisperFullAtSec));
    let taperK = 1;
    if (elapsed >= windowSec && !induction) {
      if (taperStartRef.current === null) taperStartRef.current = elapsed;
      const sinceStart = elapsed - taperStartRef.current;
      const taperLenSec = Math.max(60, Math.min(300, totalSecs - windowSec)); // 1-5 dk içinde kıs
      taperK = Math.max(0.22, 1 - sinceStart / taperLenSec); // asla tam sıfırlamaz, sakin bir zemin bırakır
      setTaperActive(true);
    } else {
      taperStartRef.current = null;
      setTaperActive(false);
    }
    const reinforceK = reinforcementActive ? 1 : 0.72; // pasif tanışma → kısık seviye
    const k = taperK * reinforceK * whisperRampK;
    engine.update({
      whisperGain: Math.round(params.whisperGain * k),
      binauralGain: Math.round(Math.max(35, params.binauralGain * Math.max(taperK, 0.55))),
    });
  }, [playing, elapsed, totalSecs, induction, reinforcementActive, params.whisperGain, params.binauralGain, whisperRampK, whisperFullAtSec]);

  // faz takibi (normal seanslar)
  const progress = totalSecs > 0 ? Math.min(1, elapsed / totalSecs) : 0;
  useEffect(() => {
    if (!playing || induction) return;
    let idx = 0;
    PHASE_AUTO.forEach((p, i) => { if (progress >= p.at) idx = i; });
    if (idx !== phaseIdx) {
      setPhaseIdx(idx);
      if (autoPhase) {
        patch(PHASE_AUTO[idx].patch, true);
        pushToast(`Faz ${idx + 1}/5 · ${PHASE_AUTO[idx].name} — ${PHASE_AUTO[idx].note}`, 'theta');
        buzz([15, 40, 15]);
      }
    }
  }, [progress, playing, phaseIdx, autoPhase, patch, pushToast, induction]);

  // hipnagojik iniş: 5 faz × 3 dk — iki çıkış modunda da aynı otomasyon
  const indPhase = induction ? inductionPhaseAt(elapsed) : 0;
  const indPhaseLeft = induction ? inductionPhaseLeft(elapsed) : 0;
  const indPhaseRef = useRef(0);
  useEffect(() => {
    if (!playing || !induction) return;
    const ip = inductionPhaseAt(elapsed);
    if (ip !== indPhaseRef.current) {
      indPhaseRef.current = ip;
      patch(INDUCTION[ip].patch, true);
      pushToast(`İniş ${ip + 1}/5 · ${INDUCTION[ip].name} — ${INDUCTION[ip].note}`, 'theta');
      buzz([15, 40, 15]);
    }
  }, [playing, induction, elapsed, patch, pushToast]);

  // Sürekli frekans kaydırma: her saniye eğri üzerindeki hedefe yumuşakça yaklaş.
  // Bu efekt faz patch'lerinden SONRA çalışır; böylece ani frekans sıçraması olmaz.
  useEffect(() => {
    if (!playing) return;
    engine.setEntrainment(liveTheta, thetaDepth);
  }, [playing, elapsed, liveTheta, thetaDepth, outputMode]);

  // kilit ekranı kontrolleri
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    try {
      (navigator as any).mediaSession.setActionHandler('play', () => togglePlayRef.current());
      (navigator as any).mediaSession.setActionHandler('pause', () => togglePlayRef.current());
    } catch { /* yok */ }
  }, []);

  // ── EKRAN KAPALI / ARKA PLAN: medya oturumu + wake lock + Android servisi ──
  useEffect(() => {
    setKeepAliveHandlers({
      onPause: () => { if (playing) togglePlayRef.current(); },
      onPlay: () => { if (!playing) togglePlayRef.current(); },
    });
  }, [playing]);

  useEffect(() => {
    if (playing) {
      startKeepAlive({ title: current.title, artist: `${current.langTr} · ${current.levelTr}` });
    } else {
      stopKeepAlive();
    }
  }, [playing, current.title, current.langTr, current.levelTr]);

  useEffect(() => {
    if (playing) updateKeepAliveMeta({ title: current.title, artist: `${current.langTr} · ${current.levelTr}` });
  }, [playing, current.title, current.langTr, current.levelTr]);

  // ── ritüel / günlük / quiz ──
  const toggleRitual = useCallback((id: string) => {
    buzz(10);
    setRitual((r) => {
      const next = { ...r, [id]: !r[id] };
      const done = Object.values(next).filter(Boolean).length;
      if (done === 4 && Object.values(r).filter(Boolean).length < 4) {
        setXp((x) => x + 10);
        pushToast('Gece ritüeli tamam · +10 XP', 'success');
      }
      return next;
    });
  }, [pushToast]);

  const ritualDone = useMemo(() => Object.values(ritual).filter(Boolean).length, [ritual]);

  const addJournal = useCallback((text: string, mood: string) => {
    if (!text.trim()) return;
    setJournal((j) => [{ id: Date.now(), date: 'Bu gece', text: text.trim(), mood }, ...j]);
    setXp((x) => x + 8);
    buzz(15);
    pushToast('Rüya günlüğe işlendi · +8 XP', 'success');
  }, [pushToast]);

  const startQuiz = useCallback(() => {
    // Sabah testi artık en son gerçekten uyanıkken kodlanan/çalınan aşamanın
    // kelimelerini kullanır (encodingWords/encodingGlosses) — cue tutarlılığı.
    const cards: QuizCard[] = encodingWords.map((w, i) => ({ word: w, gloss: encodingGlosses[i] ?? encodingGlosses[0] ?? '', langId: current.lang }));
    setQuizCards(cards);
    setQuizIdx(0);
    setQuizKnown(0);
    setQuizReveal(false);
    setReviewMode(false);
    setQuizOpen(true);
    buzz(15);
  }, [encodingWords, encodingGlosses, current.lang]);

  const srsDue = useMemo(() => dueCards(srsDeck), [srsDeck]);
  const srsDueCount = srsDue.length;

  /** Ebbinghaus'a dayalı "vadesi gelen" kelimeleri test eder (bilimsel aralıklı tekrar). */
  const startReviewQuiz = useCallback(() => {
    if (srsDue.length === 0) {
      pushToast('Şu an tekrar vakti gelen kelime yok — harika gidiyorsun', 'success');
      return;
    }
    const cards: QuizCard[] = srsDue.slice(0, 10).map((c) => ({ word: c.word, gloss: c.gloss, langId: c.langId }));
    setQuizCards(cards);
    setQuizIdx(0);
    setQuizKnown(0);
    setQuizReveal(false);
    setReviewMode(true);
    setQuizOpen(true);
    buzz(15);
  }, [srsDue, pushToast]);

  const revealQuiz = useCallback(() => { buzz(8); setQuizReveal(true); }, []);
  const closeQuiz = useCallback(() => setQuizOpen(false), []);

  const answerQuiz = useCallback((known: boolean) => {
    buzz(known ? 12 : [20, 40, 20]);
    const card = quizCards[quizIdx];
    if (known) {
      setQuizKnown((k) => k + 1);
      setMastered((m) => Array.from(new Set([...m, card?.word].filter(Boolean) as string[])));
    }
    // Ebbinghaus programını güncelle: doğru bilinirse aralık büyür, unutulursa sıfırlanır.
    if (card) {
      const key = srsKey(card.langId, card.word);
      setSrsDeck((deck) => {
        const existing = deck[key] ?? newSrsCard(card.langId, card.word, card.gloss, Date.now());
        return { ...deck, [key]: reviewSrsCard(existing, known, Date.now()) };
      });
    }
    if (quizIdx + 1 >= quizCards.length) {
      const total = quizKnown + (known ? 1 : 0);
      const bonus = 10 + total * 6;
      setXp((x) => x + bonus);
      setQuizDoneDate(todayKey());
      setQuizOpen(false);
      pushToast(
        reviewMode
          ? `Aralıklı tekrar: ${total}/${quizCards.length} · +${bonus} XP · program güncellendi`
          : `Sabah testi: ${total}/${quizCards.length} · +${bonus} XP`,
        total >= 3 ? 'success' : 'warn',
      );
    } else {
      setQuizIdx((i) => i + 1);
      setQuizReveal(false);
    }
  }, [quizIdx, quizCards, quizKnown, pushToast, reviewMode]);

  const closeRecap = useCallback(() => setRecap(null), []);
  const completeOnboarding = useCallback(() => {
    setOnboarded(true);
    setXp((x) => x + 20);
    pushToast('Hoş geldin, rüya gezgini · +20 XP', 'success');
  }, [pushToast]);

  const updateSettings = useCallback((p: Partial<Settings>) => {
    setSettings((s) => ({ ...s, ...p }));
  }, []);

  const resetAll = useCallback(() => {
    try { localStorage.removeItem(LS_KEY); } catch { /* yok */ }
    window.location.reload();
  }, []);

  const level = Math.floor(xp / 300) + 1;
  const levelPct = Math.round(((xp % 300) / 300) * 100);
  const liveWord = Math.floor(elapsed / 8) % 4;

  const bedtimeCountdown = useMemo(() => {
    const [h, m] = settings.bedtime.split(':').map(Number);
    const now = new Date();
    const bed = new Date();
    bed.setHours(h || 23, m || 30, 0, 0);
    if (bed.getTime() <= now.getTime()) bed.setDate(bed.getDate() + 1);
    const diff = bed.getTime() - now.getTime();
    const hh = Math.floor(diff / 3600000);
    const mm = Math.floor((diff % 3600000) / 60000);
    return hh > 0 ? `${hh}sa ${mm}dk` : `${mm}dk`;
  }, [settings.bedtime]);

  const value: AppCtx = {
    tab, setTab, playerOpen, setPlayerOpen,
    params, patch, applyPreset,
    playing, current, selectSession, togglePlay, stopSession,
    whisperArmed, whisperDelaySec, whisperCountdown, whisperLiveIdx, whisperReading, whisperReal, startWhisperNow,
    whisperRampProgress, whisperLevelPct, whisperFullAtSec,
    stage, stageCount: STAGE_COUNT, stageDurationSec: STAGE_DURATION_SEC, stageTimeLeftSec, cycleLaps,
    stageIsManual: stageManualIdx !== null, jumpToStage, setStageAuto,
    elapsed, totalSecs, remaining, progress,
    sleepTimerMin, setSleepTimer, smartWake, setSmartWake,
    autoPhase, setAutoPhase, phaseIdx, liveWord,
    xp, level, levelPct, streak, nights, totalMin, words,
    ritual, toggleRitual, ritualDone,
    journal, addJournal,
    settings, updateSettings,
    toasts, pushToast,
    onboarded, completeOnboarding,
    recap, closeRecap,
    quizOpen, quizCards, quizIdx, quizKnown, quizReveal,
    startQuiz, revealQuiz, answerQuiz, closeQuiz,
    encodingWords, encodingGlosses, reinforcementActive,
    srsDue, srsDueCount, startReviewQuiz, reviewMode,
    builderOpen, setBuilderOpen,
    bedtimeCountdown, mastered,
    outputMode, setOutputMode, unlocked, startLevel,
    speakerCalib, calibrating, calibLive, runCalibration, calibModalOpen, setCalibModalOpen,
    currLang, setCurrLang, induction, indPhase, indPhaseLeft,
    indOpen, setIndOpen, startInduction,
    resetAll,
    disclaimerAccepted, acceptDisclaimer, disclaimerOpen, setDisclaimerOpen,
    scienceOpen, setScienceOpen,
    encodingOpen, encodingIdx, encodingRevealed,
    startEncoding, revealEncoding, nextEncoding, closeEncoding, skipToSleep,
    encodingDoneForCurrent, requestPlay, taperActive,
    liveTheta, thetaDepth, descentProgress,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
