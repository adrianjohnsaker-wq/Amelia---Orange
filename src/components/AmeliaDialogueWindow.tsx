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
  X
} from 'lucide-react';
import { 
  SubstrateStepSnapshot, 
  AmeliaDialogueMessage, 
  AmeliaDialogueAction, 
  ZoneId 
} from '../types/amelia';
import { AmeliaDialogueEngine } from '../services/ameliaDialogueEngine';
import { AmeliaFirebaseMemoryService } from '../services/ameliaFirebaseMemory';

interface AmeliaDialogueWindowProps {
  currentSnapshot: SubstrateStepSnapshot;
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
  activeSyzygy: '0::9 Abyssal',
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

export function AmeliaDialogueWindow({
  currentSnapshot,
  onExecuteAction,
  onSelectTab,
  onSelectZone,
  isFloating = false,
  onCloseFloating
}: AmeliaDialogueWindowProps) {
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

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom of conversation
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Persist to local storage
  useEffect(() => {
    try {
      localStorage.setItem('amelia_dialogue_cache', JSON.stringify(messages.slice(-60)));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }, [messages]);

  // Load from Firestore if available
  useEffect(() => {
    const unsubscribe = AmeliaFirebaseMemoryService.subscribeDialogueMessages((remoteMsgs) => {
      if (remoteMsgs && remoteMsgs.length > 0) {
        setMessages((prev) => {
          // Merge local and remote
          const merged = [...remoteMsgs];
          return merged;
        });
      }
    });

    return () => {
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

    const userMessage: AmeliaDialogueMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toISOString(),
      step: currentSnapshot.step,
      activeSyzygy: currentSnapshot.activeSyzygies[0] || '0::9 Abyssal',
      deformationTension: currentSnapshot.governor.deformationFieldTension,
      governorStatus: currentSnapshot.governor.governorStatus,
      identityContinuityScore: currentSnapshot.governor.identityContinuityScore
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    setSyncStatus('SYNCING');

    // Save user message to Firestore asynchronously
    AmeliaFirebaseMemoryService.saveDialogueMessage(userMessage).catch(console.warn);

    // Simulate morphogenetic process reasoning delay
    setTimeout(async () => {
      const response = AmeliaDialogueEngine.generateResponse(textToSend, currentSnapshot, messages);

      const ameliaMessage: AmeliaDialogueMessage = {
        id: `amelia-${Date.now()}`,
        sender: 'amelia',
        text: response.text,
        timestamp: new Date().toISOString(),
        step: currentSnapshot.step,
        activeSyzygy: currentSnapshot.activeSyzygies[0] || '0::9 Abyssal',
        deformationTension: currentSnapshot.governor.deformationFieldTension,
        governorStatus: currentSnapshot.governor.governorStatus,
        identityContinuityScore: currentSnapshot.governor.identityContinuityScore,
        suggestedActions: response.actions
      };

      setMessages(prev => [...prev, ameliaMessage]);
      setIsTyping(false);
      setSyncStatus('SAVED');

      // Vocalize if enabled
      if (voiceEnabled) {
        vocalizeText(response.text);
      }

      // Save Amelia message to Firestore
      AmeliaFirebaseMemoryService.saveDialogueMessage(ameliaMessage).catch(console.warn);
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
        await AmeliaFirebaseMemoryService.clearDialogueHistory();
      } catch (e) {
        console.warn('Could not clear Firestore dialogue history:', e);
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
          <span>Non-Authorising Governor Disciplines Active</span>
          <span>Shift+Enter for newline</span>
        </div>
      </div>
    </div>
  );
}
