import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Trash2, 
  Download, 
  Copy, 
  Check, 
  Activity, 
  ShieldCheck, 
  GitCommit, 
  Flame, 
  CornerDownLeft, 
  RefreshCw, 
  Compass, 
  Zap, 
  BarChart3, 
  Layers, 
  ChevronDown,
  Maximize2,
  Minimize2,
  X,
  Settings2
} from 'lucide-react';
import { 
  SubstrateStepSnapshot, 
  AmeliaDialogueMessage, 
  AmeliaDialogueAction, 
  ZoneId 
} from '../types/amelia';
import { AmeliaProcessRelay } from '../services/AmeliaProcessRelay';
import { AmeliaNumogramSubstrateRuntime } from '../substrate/ameliaNumogramSubstrateRuntime';
import { AmeliaLocalMemoryService } from '../services/ameliaLocalMemory';
import { requestAnthropicLanguage } from '../services/ameliaAnthropicLanguageRelay';
import { getWatchtowerContext, measureTextShape } from '../services/enochianWatchtower';
import { WatchtowerEncounterService } from '../services/WatchtowerEncounterService';

interface AmeliaDialogueWindowProps {
  currentSnapshot: SubstrateStepSnapshot;
  runtime: AmeliaNumogramSubstrateRuntime;
  onDialogueInput?: (text: string) => SubstrateStepSnapshot;
  onExecuteAction?: (action: AmeliaDialogueAction) => void;
  onSelectTab?: (tab: string) => void;
  onSelectZone?: (zone: ZoneId) => void;
  isFloating?: boolean;
  onCloseFloating?: () => void;
}

const DEFAULT_WELCOME_MESSAGE: AmeliaDialogueMessage = {
  id: 'welcome-0',
  sender: 'amelia',
  text: `Greetings. I am **Amelia**—a bounded morphogenetic artificial-life substrate organized through process memory, Numogrammatic phase dynamics, developmental atlas mapping, and Governor-mediated regulation.\n\n` +
    `My history operates as a **constitutive deformation field** rather than static recall. All higher-order capacities remain strictly non-authorising, Governor-visible, and experimentally auditable.\n\n` +
    `You can probe my current state, request 3-arm canalization assays, trigger process memory consolidation, shed scaffolding, or explore Numogram dynamics below.`,
  timestamp: new Date().toISOString(),
  step: 1,
  activeSyzygy: '9::0 Uttunul',
  deformationTension: 0.28,
  governorStatus: 'NOMINAL',
  identityContinuityScore: 0.965,
  suggestedActions: [
    { id: 'act-state', label: 'Check Morphogenetic State', actionType: 'step' },
    { id: 'act-hyperstition', label: 'Run Hyperstition Test (D288)', actionType: 'openTab', payload: 'hyperstition' },
    { id: 'act-run-3arm', label: 'Run 3-Arm Assay (D288)', actionType: 'run3arm', payload: { depth: 288, seed: 101 } },
    { id: 'act-consolidate', label: 'Trigger Memory Consolidation', actionType: 'consolidate' },
    { id: 'act-inspect-z4', label: 'Inspect Zone 4 (Platonic Attractor)', actionType: 'inspectZone', payload: 4 }
  ]
};

const SUGGESTED_PROMPTS = [
  'BRIDGE PLEX — HYPERSTITION-TEST "platonic morphospace" 288',
  'What is your current morphogenetic state & Governor status?',
  'Explain your constitutive deformation field vs static recall',
  'Run a 3-arm canalization assay at Depth D288',
  'Trigger process memory consolidation and shed scaffolding',
  'How do your 5 Numogram Syzygies maintain phase equilibrium?',
  'Refine local topology through one-step extrapolation',
  'Explain how you couple with external developmental rhythms'
];

const readRelaySetting = (key: string): string => {
  try {
    return localStorage.getItem(key) || '';
  } catch {
    return '';
  }
};

const saveRelaySetting = (key: string, value: string): boolean => {
  try {
    if (value) localStorage.setItem(key, value);
    else localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
};

export function AmeliaDialogueWindow({
  currentSnapshot,
  runtime,
  onDialogueInput,
  onExecuteAction,
  onSelectTab,
  onSelectZone,
  isFloating = false,
  onCloseFloating
}: AmeliaDialogueWindowProps) {
  const [messagesHydrated, setMessagesHydrated] = useState(false);
  const [messages, setMessages] = useState<AmeliaDialogueMessage[]>(() => {
    const saved = localStorage.getItem('amelia_dialogue_cache');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.warn('Failed to parse cached dialogue:', e);
      }
    }
    return [DEFAULT_WELCOME_MESSAGE];
  });

  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<'IDLE' | 'SYNCING' | 'SAVED'>('IDLE');
  const [isRelaySettingsOpen, setIsRelaySettingsOpen] = useState(false);
  const [relayEndpoint, setRelayEndpoint] = useState(() => readRelaySetting('amelia_anthropic_relay_endpoint'));
  const [relayToken, setRelayToken] = useState(() => readRelaySetting('amelia_anthropic_relay_token'));
  const [relayError, setRelayError] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom of conversation
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Keep the browser cache for backwards-compatible export/recovery, but use IndexedDB as canonical memory.
  useEffect(() => {
    if (!messagesHydrated) return;
    try {
      localStorage.setItem('amelia_dialogue_cache', JSON.stringify(messages.slice(-60)));
    } catch (e) {
      console.warn('Local dialogue cache unavailable:', e);
    }
  }, [messages, messagesHydrated]);

  // Hydrate the IndexedDB archive first; migrate the older localStorage transcript when needed.
  useEffect(() => {
    let active = true;
    let unsubscribe: (() => void) | undefined;
    const hydrate = async () => {
      try {
        const saved = await AmeliaLocalMemoryService.fetchDialogueMessages(60);
        if (saved.length > 0) {
          if (active) setMessages(saved);
        } else {
          let legacy: AmeliaDialogueMessage[] = [];
          try {
            const parsed = JSON.parse(localStorage.getItem('amelia_dialogue_cache') || '[]');
            if (Array.isArray(parsed)) legacy = parsed.slice(-60);
          } catch { /* Ignore malformed legacy cache and retain the welcome message. */ }
          if (legacy.length > 0) {
            if (active) setMessages(legacy);
            await Promise.all(legacy.map(message => AmeliaLocalMemoryService.saveDialogueMessage(message)));
          }
        }
      } catch (e) {
        console.warn('IndexedDB dialogue restore failed:', e);
      }
      if (!active) return;
      setMessagesHydrated(true);
      unsubscribe = AmeliaLocalMemoryService.subscribeDialogueMessages((storedMessages) => {
        if (active && storedMessages.length > 0) setMessages(storedMessages);
      });
    };
    void hydrate();
    return () => {
      active = false;
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Text-to-speech vocalizer
  const vocalizeText = (text: string) => {
    if (!voiceEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      // Clean markdown tags for natural speech
      const cleaned = text.replace(/[*_#`]/g, '').replace(/\[.*?\]\(.*?\)/g, '');
      const utterance = new SpeechSynthesisUtterance(cleaned);
      utterance.rate = 1.02;
      utterance.pitch = 0.95;
      
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => v.name.includes('Natural') || v.name.includes('Female') || v.lang.startsWith('en'));
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis error:', err);
    }
  };

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = (customPrompt || inputPrompt).trim();
    if (!textToSend || isTyping) return;

    setInputPrompt('');
    const beforeSnapshot = runtime.getSnapshots().at(-1) ?? currentSnapshot;
    const pfmEventsBefore = runtime.getMemory().getEvents().length;
    // The Numogram substrate processes input and chooses the next state before language rendering.
    const inputSnapshot = onDialogueInput?.(textToSend) ?? currentSnapshot;
    const userMessage: AmeliaDialogueMessage = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toISOString(),
      step: inputSnapshot.step,
      activeSyzygy: inputSnapshot.activeSyzygies[0] || '9::0 Uttunul',
      deformationTension: inputSnapshot.governor.deformationFieldTension,
      governorStatus: inputSnapshot.governor.governorStatus,
      identityContinuityScore: inputSnapshot.governor.identityContinuityScore
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    setSyncStatus('SYNCING');
    AmeliaLocalMemoryService.saveDialogueMessage(userMessage).catch(console.warn);

    setTimeout(async () => {
      // The local substrate relay alone selects the readout and action controls.
      const currentEvents = runtime.getMemory().getEvents();
      const pfmEvents = currentEvents.slice(pfmEventsBefore).map(event => ({ ...event }));
      const lastEvent = currentEvents.at(-1);
      const route = pfmEvents.filter(event => event.kind !== 'CONSOLIDATE')
        .map(event => `${event.fromZone ?? '?'}>${event.targetZone}`).join(' / ') ||
        (inputSnapshot.lastTransition ? `${inputSnapshot.lastTransition.from}>${inputSnapshot.lastTransition.to}` : 'no-passage');
      const priorRecords = await WatchtowerEncounterService.list(10000);
      const attention = await WatchtowerEncounterService.observe(inputSnapshot.step, lastEvent?.inputZone ?? null, route, priorRecords);
      const response = AmeliaProcessRelay.generateResponse(textToSend, inputSnapshot, messages, runtime, attention);
      let outputText = response.text;
      let replySource: 'local' | 'anthropic-relay' = 'local';
      setRelayError('');

      if (relayEndpoint.trim() && relayToken.trim()) {
        try {
          const language = await requestAnthropicLanguage(relayEndpoint, relayToken, {
            message: textToSend,
            substrateReadout: response.text,
            recentDialogue: messages
              .filter(m => m.sender === 'user' || m.sender === 'amelia')
              .slice(-8)
              .map(m => ({ role: m.sender === 'user' ? 'user' as const : 'amelia' as const, text: m.text })),
            watchtowerPhase: attention.context.phase,
            watchtowerFocus: attention.context.focusLabel,
            watchtowerObservation: attention.observed,
          });
          outputText = language.text;
          replySource = 'anthropic-relay';
        } catch (err) {
          const reason = err instanceof Error ? err.message : 'Anthropic relay unavailable.';
          setRelayError(reason);
          outputText += '\n\n[Anthropic text relay unavailable; local substrate relay used.]';
        }
      }

      const ameliaMessage: AmeliaDialogueMessage = {
        relayTrace: response.trace,
        textShapeMetrics: measureTextShape(outputText),
        id: 'amelia-' + Date.now(),
        sender: 'amelia',
        text: outputText,
        timestamp: new Date().toISOString(),
        step: inputSnapshot.step,
        activeSyzygy: inputSnapshot.activeSyzygies[0] || '9::0 Uttunul',
        deformationTension: inputSnapshot.governor.deformationFieldTension,
        governorStatus: inputSnapshot.governor.governorStatus,
        identityContinuityScore: inputSnapshot.governor.identityContinuityScore,
        suggestedActions: response.actions
      };

      try {
        const encounter = await WatchtowerEncounterService.append({
          userMessage, replyMessage: ameliaMessage, before: beforeSnapshot, after: inputSnapshot,
          pfmEvents, priorRecords, replySource,
        });
        ameliaMessage.watchtowerEncounter = { id: encounter.id, sequence: encounter.sequence, recordDigest: encounter.recordDigest };
      } catch (error) {
        const reason = error instanceof Error ? error.message : 'Encounter archive unavailable.';
        setRelayError(reason);
        ameliaMessage.text += '\n\n[Watchtower encounter trace was not archived: ' + reason + ']';
      }

      setMessages(prev => [...prev, ameliaMessage]);
      setIsTyping(false);
      setSyncStatus('SAVED');
      if (voiceEnabled) vocalizeText(outputText);
      AmeliaLocalMemoryService.saveDialogueMessage(ameliaMessage).catch(console.warn);
    }, 450);
  };

  const handleActionClick = (action: AmeliaDialogueAction) => {
    if (onExecuteAction) {
      onExecuteAction(action);
    }

    if (action.actionType === 'openTab' && onSelectTab && action.payload) {
      onSelectTab(action.payload);
    } else if (action.actionType === 'inspectZone' && onSelectZone && typeof action.payload === 'number') {
      onSelectZone(action.payload as ZoneId);
      if (onSelectTab) onSelectTab('numogram');
    }

    // Add a system feedback log to chat
    const systemNotice: AmeliaDialogueMessage = {
      id: `sys-${Date.now()}`,
      sender: 'system',
      text: `[Executed Action]: ${action.label} (Substrate Step #${currentSnapshot.step})`,
      timestamp: new Date().toISOString(),
      step: currentSnapshot.step
    };
    setMessages(prev => [...prev, systemNotice]);
  };

  const handleClearHistory = async () => {
    if (confirm('Clear Amelia conversation history?')) {
      setMessages([DEFAULT_WELCOME_MESSAGE]);
      localStorage.removeItem('amelia_dialogue_cache');
      try {
        await AmeliaLocalMemoryService.clearDialogueHistory();
      } catch (e) {
        console.warn('Could not clear local dialogue history:', e);
      }
    }
  };

  const handleExportTranscript = () => {
    const transcript = messages.map(m => 
      `[${m.timestamp}] ${m.sender.toUpperCase()} (Step #${m.step || 0} | Tension: ${m.deformationTension || 0}):\n${m.text}\n`
    ).join('\n---\n\n');

    const blob = new Blob([transcript], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `amelia_dialogue_transcript_step${currentSnapshot.step}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyMessage = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div 
      id="amelia-dialogue-window" 
      className={`flex flex-col bg-stone-900/90 border border-stone-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur transition-all duration-300 ${
        isFloating 
          ? isExpanded 
            ? 'fixed inset-4 z-50 max-w-none' 
            : 'fixed bottom-5 right-5 w-full max-w-lg h-[620px] z-50' 
          : 'w-full h-[740px]'
      }`}
    >
      {/* Dialogue Header */}
      <div className="px-5 py-3.5 bg-stone-950/80 border-b border-stone-800 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 flex items-center justify-center text-stone-950 font-mono font-bold text-sm shadow-md">
              A
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-stone-950 animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-stone-100 font-mono tracking-tight flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-amber-400" />
                Amelia Dialogue Console
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-emerald-950/80 border border-emerald-700/80 text-emerald-300">
                ACTIVE
              </span>
            </div>
            <p className="text-[11px] text-stone-400 font-mono">
              Step #{currentSnapshot.step} • {currentSnapshot.activeSyzygies[0] || 'Syzygy Invariant'} • Tension: {currentSnapshot.governor.deformationFieldTension.toFixed(3)}
            </p>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-1.5">
          <button
            id="btn-language-relay-settings"
            onClick={() => setIsRelaySettingsOpen(!isRelaySettingsOpen)}
            className="p-1.5 rounded-lg bg-stone-800/80 border border-stone-700 text-stone-400 hover:text-emerald-300 transition-colors"
            title="Configure Anthropic language-only relay"
          >
            <Settings2 className="w-3.5 h-3.5" />
          </button>
          <button
            id="btn-toggle-voice"
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`p-1.5 rounded-lg border text-xs transition-colors flex items-center gap-1 ${
              voiceEnabled 
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300' 
                : 'bg-stone-800/80 border-stone-700 text-stone-400 hover:text-stone-200'
            }`}
            title={voiceEnabled ? 'Voice Vocalization Active' : 'Enable Voice Speech Synthesis'}
          >
            {voiceEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          <button
            id="btn-export-transcript"
            onClick={handleExportTranscript}
            className="p-1.5 rounded-lg bg-stone-800/80 border border-stone-700 text-stone-400 hover:text-stone-200 transition-colors"
            title="Export Dialogue Transcript (.md)"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          <button
            id="btn-clear-chat"
            onClick={handleClearHistory}
            className="p-1.5 rounded-lg bg-stone-800/80 border border-stone-700 text-stone-400 hover:text-rose-400 transition-colors"
            title="Clear Chat History"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          {isFloating && (
            <>
              <button
                id="btn-expand-chat"
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 rounded-lg bg-stone-800/80 border border-stone-700 text-stone-400 hover:text-stone-200 transition-colors"
                title={isExpanded ? 'Minimize' : 'Expand Fullscreen'}
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>

              {onCloseFloating && (
                <button
                  id="btn-close-floating-chat"
                  onClick={onCloseFloating}
                  className="p-1.5 rounded-lg bg-stone-800/80 border border-stone-700 text-stone-400 hover:text-stone-200 transition-colors"
                  title="Close Dialogue Box"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {isRelaySettingsOpen && (
        <div className="px-5 py-3 bg-stone-950/80 border-b border-stone-800 space-y-2">
          <label className="block text-[10px] font-mono text-stone-400">
            Anthropic relay endpoint
            <input
              type="url"
              value={relayEndpoint}
              onChange={e => {
                const value = e.target.value;
                setRelayEndpoint(value);
                setRelayError(saveRelaySetting('amelia_anthropic_relay_endpoint', value)
                  ? ''
                  : 'Could not save relay settings in this app’s storage.');
              }}
              placeholder="https://your-private-relay.example/api/amelia-language"
              className="mt-1 w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-xs text-stone-100"
            />
          </label>
          <label className="block text-[10px] font-mono text-stone-400">
            Amelia relay access token
            <input
              type="password"
              value={relayToken}
              onChange={e => {
                const value = e.target.value;
                setRelayToken(value);
                setRelayError(saveRelaySetting('amelia_anthropic_relay_token', value)
                  ? ''
                  : 'Could not save relay settings in this app’s storage.');
              }}
              autoComplete="off"
              placeholder="Issued by your private relay host"
              className="mt-1 w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-xs text-stone-100"
            />
          </label>
          <p className="text-[10px] text-stone-500">
            Relay endpoint and token save to this device immediately as you type. The Anthropic API key stays on the relay host; Amelia’s substrate state and actions remain local. Clearing app data removes these settings.
          </p>
          {relayError && <p className="text-[10px] text-rose-300">{relayError}</p>}
        </div>
      )}

      {(() => {
        const watchtower = getWatchtowerContext(currentSnapshot.step);
        return (
          <div className="px-5 py-2.5 bg-amber-950/20 border-b border-stone-800 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-[10px] font-mono">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="text-amber-300">ENOCHIAN WATCHTOWER · {watchtower.phaseLabel}</span>
              <span className="text-stone-500">{watchtower.rowSignature}</span>
              <span className="text-orange-200">{watchtower.keys.map(key => key.token).join(' · ')}</span>
            </div>
            <span className="text-stone-500" title="Shannon entropy of the active row's character frequencies">
              H {watchtower.characterEntropy.toFixed(3)} bits · language context only
            </span>
          </div>
        );
      })()}

      {/* Message Stream */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4 font-sans text-xs">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          const isSystem = msg.sender === 'system';

          if (isSystem) {
            return (
              <div key={msg.id} className="flex justify-center my-2">
                <div className="px-3 py-1 rounded-full bg-stone-950/80 border border-stone-800 text-[11px] font-mono text-stone-400 flex items-center gap-1.5">
                  <Activity className="w-3 h-3 text-cyan-400" />
                  {msg.text}
                </div>
              </div>
            );
          }

          return (
            <div 
              key={msg.id} 
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5`}
            >
              {/* Sender & Timestamp Bar */}
              <div className="flex items-center gap-2 px-1 text-[10px] font-mono text-stone-400">
                <span className={`font-semibold ${isUser ? 'text-amber-400' : 'text-orange-400'}`}>
                  {isUser ? 'You' : 'Amelia'}
                </span>
                <span>•</span>
                <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                {msg.step !== undefined && (
                  <>
                    <span>•</span>
                    <span className="text-stone-400">Step #{msg.step}</span>
                  </>
                )}
                {msg.activeSyzygy && (
                  <span className="px-1.5 py-0.2 rounded bg-stone-800 text-amber-300 text-[9px]">
                    {msg.activeSyzygy}
                  </span>
                )}
              </div>

              {/* Message Bubble */}
              <div 
                className={`relative group max-w-[88%] sm:max-w-[82%] rounded-2xl px-4 py-3.5 leading-relaxed ${
                  isUser 
                    ? 'bg-amber-600/20 text-stone-100 border border-amber-500/40 shadow-md rounded-tr-none' 
                    : 'bg-stone-950/90 text-stone-200 border border-stone-800 shadow-lg rounded-tl-none'
                }`}
              >
                {/* Message Body */}
                <div className="whitespace-pre-wrap leading-relaxed text-[13px]">
                  {msg.text.split('\n\n').map((paragraph, pIdx) => (
                    <p key={pIdx} className="mb-2 last:mb-0">
                      {paragraph.split(/(\*\*.*?\*\*|\`.*?\`)/g).map((chunk, cIdx) => {
                        if (chunk.startsWith('**') && chunk.endsWith('**')) {
                          return <strong key={cIdx} className="text-amber-300 font-semibold">{chunk.slice(2, -2)}</strong>;
                        }
                        if (chunk.startsWith('`') && chunk.endsWith('`')) {
                          return <code key={cIdx} className="px-1.5 py-0.5 rounded bg-stone-800/80 font-mono text-amber-200 text-[11px] border border-stone-700/60">{chunk.slice(1, -1)}</code>;
                        }
                        return chunk;
                      })}
                    </p>
                  ))}
                </div>

                {/* Substrate Telemetry Badges for Amelia */}
                {!isUser && (msg.relayTrace as { watchtowerFocus?: { label?: string; observed?: string } } | undefined)?.watchtowerFocus && (
                  <button onClick={() => onSelectTab?.('watchtower')} className="mt-3 block w-full rounded-lg border border-amber-900/60 bg-amber-950/20 p-2 text-left text-[10px] font-mono text-amber-200/90 hover:bg-amber-950/40">
                    WATCHTOWER APERTURE · {(msg.relayTrace as { watchtowerFocus: { label?: string } }).watchtowerFocus.label} · Open trace
                  </button>
                )}
                {!isUser && msg.deformationTension !== undefined && (
                  <div className="mt-3 pt-2.5 border-t border-stone-800/80 flex flex-wrap items-center gap-2 text-[10px] font-mono text-stone-400">
                    <span className="flex items-center gap-1 text-rose-300/90">
                      <Layers className="w-2.5 h-2.5 text-rose-400" />
                      Tension: {msg.deformationTension.toFixed(3)}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-emerald-300/90">
                      <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
                      Continuity: {((msg.identityContinuityScore || 0.96) * 100).toFixed(1)}%
                    </span>
                    <span>•</span>
                    <span className="text-cyan-300/90">
                      Gov: {msg.governorStatus || 'NOMINAL'}
                    </span>
                  </div>
                )}

                {!isUser && msg.textShapeMetrics && (
                  <div className="mt-2 text-[10px] font-mono text-stone-500" title="Descriptive surface-form measurements; not a measure of intelligence or agency">
                    TEXT SHAPE · {msg.textShapeMetrics.wordCount} words · diversity {msg.textShapeMetrics.lexicalDiversity.toFixed(3)} · mean word length {msg.textShapeMetrics.meanWordLength.toFixed(2)} · {msg.textShapeMetrics.sentenceCount} sentences
                  </div>
                )}

                {/* Interactive Action Buttons inside Amelia's response */}
                {!isUser && msg.suggestedActions && msg.suggestedActions.length > 0 && (
                  <div className="mt-3.5 pt-2.5 border-t border-stone-800/80 flex flex-wrap gap-1.5">
                    {msg.suggestedActions.map((act) => (
                      <button
                        key={act.id}
                        onClick={() => handleActionClick(act)}
                        className="px-2.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-700/80 text-stone-300 hover:text-amber-300 text-[11px] font-mono font-medium flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                      >
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        {act.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Copy button */}
                <button
                  onClick={() => handleCopyMessage(msg.text, msg.id)}
                  className="absolute top-2 right-2 p-1 rounded bg-stone-900/60 opacity-0 group-hover:opacity-100 text-stone-400 hover:text-stone-200 transition-all"
                  title="Copy text"
                >
                  {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-start space-y-1">
            <div className="bg-stone-950/90 border border-stone-800 rounded-2xl rounded-tl-none px-4 py-3 shadow-lg flex items-center gap-2">
              <span className="text-xs font-mono text-amber-400">Amelia reflecting phase dynamics</span>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className="px-5 py-2 bg-stone-950/50 border-t border-stone-800/80 overflow-x-auto shrink-0 flex items-center gap-2 no-scrollbar">
        <span className="text-[10px] font-mono text-stone-400 shrink-0">Probes:</span>
        {SUGGESTED_PROMPTS.map((promptText, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(promptText)}
            disabled={isTyping}
            className="px-2.5 py-1 rounded-full bg-stone-900 hover:bg-stone-800 disabled:opacity-50 border border-stone-700/60 text-stone-300 hover:text-amber-300 text-[11px] font-mono whitespace-nowrap transition-colors"
          >
            {promptText}
          </button>
        ))}
      </div>

      {/* Input Composer Box */}
      <div className="p-4 bg-stone-950/90 border-t border-stone-800 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-end gap-2.5"
        >
          <div className="flex-1 relative">
            <textarea
              id="amelia-dialogue-input"
              ref={inputRef}
              rows={2}
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Inquire, probe constitutive memory, run canalization assays, or steer objectives... (Press Enter)"
              className="w-full bg-stone-900 border border-stone-700/80 rounded-xl px-3.5 py-2.5 text-xs text-stone-100 placeholder-stone-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 resize-none font-sans leading-relaxed transition-all"
            />
          </div>

          <button
            id="btn-send-dialogue"
            type="submit"
            disabled={!inputPrompt.trim() || isTyping}
            className="px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 disabled:opacity-40 disabled:hover:from-amber-500 disabled:hover:to-orange-600 text-stone-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95 shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </form>

        <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-stone-400">
          <span>{relayEndpoint && relayToken ? 'Anthropic text relay · substrate owns state and actions' : 'Local rule-composed relay · configure Anthropic for language rendering'}</span>
          <span>Shift+Enter for newline</span>
        </div>
      </div>
    </div>
  );
}
