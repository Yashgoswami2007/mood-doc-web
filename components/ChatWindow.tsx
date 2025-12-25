
import React, { useState, useRef, useEffect } from 'react';
import { Send, Camera, Mic, Sparkles, Loader2, MicOff, X, History, Plus, MessageSquare, Menu, ChevronLeft } from 'lucide-react';
import { Message, MoodState, SupportMode, Conversation } from '../types';
import MultimodalCapture from './MultimodalCapture';
import { analyzeMultimodalMood, analyzeVoiceOnly } from '../services/geminiService';
import { callOpenRouter } from '../services/openRouterService';
import { cloudService } from '../services/cloudService';

interface ChatWindowProps {
  currentMood: MoodState | null;
  onMoodDetected: (mood: MoodState, mode: SupportMode) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ currentMood, onMoodDetected }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showCapture, setShowCapture] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzingVoice, setIsAnalyzingVoice] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (activeConvId) {
      loadMessages(activeConvId);
    }
  }, [activeConvId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const loadConversations = async () => {
    try {
      const data = await cloudService.getConversations();
      setConversations(data);
      if (data.length > 0 && !activeConvId) {
        setActiveConvId(data[0].id);
      } else if (data.length === 0) {
        startNewChat();
      }
    } catch (e) {
      console.error("Failed to load sessions", e);
    }
  };

  const loadMessages = async (id: string) => {
    const data = await cloudService.getMessages(id);
    setMessages(data);
  };

  const startNewChat = async () => {
    const title = `Session ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    try {
      const id = await cloudService.createConversation(title);
      setActiveConvId(id);
      loadConversations();
      setMessages([]);
      setShowHistory(false);
    } catch (e) {
      setActiveConvId('temp-' + Date.now());
      setMessages([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || isTyping || !activeConvId) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    const textToSend = inputText;
    setInputText('');
    setIsTyping(true);

    const isGuest = localStorage.getItem('md_is_guest') === 'true';
    if (!isGuest && !activeConvId.startsWith('temp')) {
      await cloudService.saveMessage(userMsg, activeConvId);
    }

    try {
      let data;

      console.log("[ChatWindow] Sending message:", textToSend);
      console.log("[ChatWindow] Active conversation:", activeConvId);

      try {
        console.log("[ChatWindow] Attempting Gemini analysis...");
        data = await analyzeMultimodalMood(
          textToSend,
          undefined,
          undefined,
          messages.slice(-5).map(m => ({ role: m.role, content: m.content }))
        );
        console.log("[ChatWindow] Gemini response received:", data);
      } catch (geminiError) {
        console.warn("Gemini Analysis Failed, switching to OpenRouter:", geminiError);
        console.log("[ChatWindow] Attempting OpenRouter fallback...");

        // Fallback to OpenRouter
        const openRouterHistory = messages.slice(-5).map(m => ({
          role: m.role as 'user' | 'assistant' | 'system',
          content: m.content
        }));
        // Add current user message
        openRouterHistory.push({ role: 'user', content: textToSend });

        data = await callOpenRouter(openRouterHistory);
        console.log("[ChatWindow] OpenRouter response received:", data);
      }

      if (!data || !data.response) {
        throw new Error("No response received from AI");
      }

      onMoodDetected(data.mood_state, data.mode);

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        mood_state: data.mood_state,
        mode: data.mode
      };

      setMessages(prev => [...prev, assistantMsg]);
      if (!isGuest && !activeConvId.startsWith('temp')) {
        await cloudService.saveMessage(assistantMsg, activeConvId);
      }
    } catch (error: any) {
      console.error("[ChatWindow] Error in handleSend:", error);
      console.error("[ChatWindow] Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name
      });

      // Show error message to user
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `❌ Sorry, I encountered an error: ${error.message || 'Unknown error'}. Please check your API keys in .env and try again.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(prev => (prev ? prev + ' ' : '') + transcript);
        setIsListening(false);
      };
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  const toggleListening = () => {
    if (isListening) recognitionRef.current?.stop();
    else {
      setIsListening(true);
      recognitionRef.current?.start();
    }
  };

  // Voice Recording Functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        await processVoiceRecording(blob);
        stream.getTracks().forEach(t => t.stop());
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Mic access error:', err);
      alert('Failed to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processVoiceRecording = async (blob: Blob) => {
    setIsAnalyzingVoice(true);
    try {
      // Convert blob to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];

        try {
          // Call Gemini API for mood detection and transcription
          const result = await analyzeVoiceOnly(base64);

          console.log('Voice Analysis Result:', result);

          // Set transcription in input field
          setInputText(result.transcription);

          // Show mood detection result
          const moodNotification = `🎤 Voice analyzed: ${result.mood} (${Math.round(result.confidence * 100)}% confidence)`;
          console.log(moodNotification);

          // Optional: Auto-detect mood and update UI
          // You can create a MoodState from the detected mood if needed

        } catch (error) {
          console.error('Voice analysis failed:', error);
          alert('Failed to analyze voice. Please try again.');
        } finally {
          setIsAnalyzingVoice(false);
        }
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error('Voice processing error:', error);
      setIsAnalyzingVoice(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="flex h-[calc(100vh-140px)] lg:h-[calc(100vh-100px)] gap-0 relative overflow-hidden rounded-[2rem] border border-slate-100 dark:border-slate-800">

      {/* Session Archives Sidebar */}
      <div className={`absolute inset-y-0 left-0 w-[280px] bg-white dark:bg-slate-900 z-[80] transition-transform duration-500 ease-[cubic-bezier(0.87,0,0.13,1)] border-r border-slate-100 dark:border-slate-800 shadow-2xl ${showHistory ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-5 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-[10px]">Archives</h3>
          <button onClick={() => setShowHistory(false)} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white active:scale-90"><X size={18} /></button>
        </div>
        <div className="p-4 space-y-2 overflow-y-auto h-full pb-20 no-scrollbar">
          <button onClick={startNewChat} className="w-full flex items-center justify-center gap-2 p-4 bg-brand-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-brand-600/20 active:scale-95 transition-all mb-4">
            <Plus size={14} /> New Sanctuary
          </button>
          {conversations.map(conv => (
            <button
              key={conv.id}
              onClick={() => { setActiveConvId(conv.id); setShowHistory(false); }}
              className={`w-full flex items-center gap-3 p-4 rounded-xl text-left transition-all ${activeConvId === conv.id ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
            >
              <MessageSquare size={14} className={activeConvId === conv.id ? 'text-brand-600' : 'text-slate-300'} />
              <div className="overflow-hidden">
                <p className={`font-bold text-[11px] truncate ${activeConvId === conv.id ? 'text-brand-600' : 'text-slate-700 dark:text-slate-300'}`}>{conv.title}</p>
                <p className="text-[8px] opacity-40 font-black mt-0.5">{new Date(conv.created_at).toLocaleDateString()}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white/60 dark:bg-slate-900/40 relative backdrop-blur-sm">
        {/* Chat Header */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-100/50 dark:border-slate-800/50 flex items-center justify-between bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowHistory(true)}
              className="p-3 text-slate-500 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 active:scale-90 transition-all shadow-sm hover:border-brand-500"
              title="Open Archives"
            >
              <Menu size={18} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-600/20">
                <Sparkles size={16} />
              </div>
              <div className="hidden sm:block">
                <h2 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white leading-none">Therapy Sanctuary</h2>
                <p className="text-[9px] text-brand-500 font-black uppercase tracking-widest mt-1">AI Guided Protocol</p>
              </div>
            </div>
          </div>

          {currentMood && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 text-[9px] font-black uppercase tracking-widest rounded-full border border-brand-100 dark:border-brand-900/20 animate-in fade-in zoom-in">
              <div className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-pulse" />
              {currentMood.dominant_mood}
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 no-scrollbar">
          {messages.length === 0 && !isTyping && (
            <div className="flex flex-col items-center justify-center h-full text-center max-w-[240px] mx-auto opacity-30 animate-in fade-in duration-1000">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <MessageSquare size={20} className="text-slate-400" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2">Private Sanctuary</p>
              <p className="text-[10px] leading-relaxed">Encrypted Session. Sharing insights for your wellness map.</p>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              <div className={`max-w-[85%] sm:max-w-[70%] px-4 py-3 rounded-2xl text-[13px] sm:text-sm font-medium shadow-sm ${msg.role === 'user' ? 'bg-brand-600 text-white rounded-tr-none' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-100 dark:border-slate-700/50'}`}>
                {msg.content}
                <span className="block text-[8px] mt-2 font-black uppercase opacity-40 tracking-tighter">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-slate-800 px-4 py-4 rounded-2xl rounded-tl-none border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-1.5">
                <div className="w-1 h-1 bg-brand-500 rounded-full animate-bounce" />
                <div className="w-1 h-1 bg-brand-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-1 h-1 bg-brand-500 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>


        {/* Chat Input */}
        <div className="p-4 sm:p-6 border-t border-slate-100/50 dark:border-slate-800/50 bg-white/40 dark:bg-slate-900/40">
          <div className={`flex items-center gap-2 bg-white dark:bg-slate-800 p-1.5 rounded-2xl border transition-all duration-300 ${isRecording ? 'border-red-500 ring-4 ring-red-500/20' :
            isListening ? 'border-rose-500 ring-4 ring-rose-500/10' :
              'border-slate-100 dark:border-slate-700 focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/10 shadow-sm'
            }`}>
            <button onClick={() => setShowCapture(true)} type="button" className="p-3 text-slate-400 hover:text-brand-600 active:scale-90 transition-all rounded-xl"><Camera size={18} /></button>
            <textarea
              rows={1}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isRecording ? "🎤 Recording..." :
                  isAnalyzingVoice ? "🔄 Analyzing voice..." :
                    isListening ? "Listening..." :
                      "Message Guide..."
              }
              disabled={isTyping || isRecording || isAnalyzingVoice}
              className="flex-1 bg-transparent border-none focus:ring-0 text-[13px] sm:text-sm font-bold text-slate-700 dark:text-slate-100 py-2.5 resize-none placeholder:text-slate-300"
            />
            <div className="flex items-center gap-1.5 pr-1">
              <button
                onClick={toggleRecording}
                type="button"
                disabled={isAnalyzingVoice}
                className={`p-2.5 rounded-xl transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse' :
                  isAnalyzingVoice ? 'bg-blue-500 text-white' :
                    'text-slate-400 hover:text-brand-600'
                  }`}
                title={isRecording ? "Stop recording" : "Record voice message"}
              >
                {isAnalyzingVoice ? <Loader2 className="animate-spin" size={18} /> :
                  isRecording ? <MicOff size={18} /> :
                    <Mic size={18} />}
              </button>
              <button onClick={handleSend} type="button" disabled={!inputText.trim() || isTyping} className="p-3 bg-brand-600 text-white rounded-xl shadow-lg shadow-brand-600/20 active:scale-90 transition-all disabled:opacity-50">
                {isTyping ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
              </button>
            </div>
          </div>
        </div>


        {showCapture && (
          <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl relative animate-in zoom-in-95 border border-white/10">
              <div className="p-6 sm:p-8">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Biometric Scan</h2>
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1">Mood Sync Active</p>
                  </div>
                  <button onClick={() => setShowCapture(false)} className="p-3 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full active:scale-90"><X size={20} /></button>
                </div>
                <MultimodalCapture conversationId={activeConvId || 'session'} onAnalysisComplete={async (mood, mode, response) => {
                  onMoodDetected(mood, mode);
                  const assistantMsg: Message = { id: Date.now().toString(), role: 'assistant', content: response, timestamp: new Date(), mood_state: mood, mode: mode };
                  setMessages(prev => [...prev, assistantMsg]);
                  setShowCapture(false);
                }} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;
