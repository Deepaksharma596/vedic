
import React, { useState, useRef, useEffect } from 'react';
// import {
//   Book,
//   Bookmark,
//   Sparkles,
//   ChevronDown,
//   Play,
//   Search,
//   Brain,
//   X,
//   Users,
//   Shield,
//   Zap,
//   Download,
//   Menu,
//   Check,
//   Info,
//   Loader2,
//   Mic,
//   User as UserIcon,
// } from 'lucide-react';

import { sendMessageStream, initializeChat, generateIllustrations, translateForTTS, summarizeContent, generateFollowUpQuestions } from './services/geminiService';
import { MessageBubble } from './components/MessageBubble';
import { DisclaimerModal } from './components/DisclaimerModal';
import { NotesModal } from './components/NotesModal';
import { TilakLoader } from './components/TilakLoader';

// Custom Chariot Wheel Component
const ChariotWheel = ({ size = 24, className = "", mode = 'General Wisdom' }) => {
  // Determine colors based on mode
  let colors = { start: "#f59e0b", mid: "#fbbf24", end: "#d97706" }; // Default Gold (General)
  
  if (mode === 'Exact Reference') {
    colors = { start: "#2dd4bf", mid: "#14b8a6", end: "#0f766e" }; // Teal
  } else if (mode === 'Philosophical Angle') {
    colors = { start: "#c084fc", mid: "#a855f7", end: "#7e22ce" }; // Purple
  } else if (mode === 'Sanskrit Shloka') {
    colors = { start: "#fb7185", mid: "#f43f5e", end: "#be123c" }; // Rose/Red
  }

  // Create a unique ID for the gradient based on the mode to avoid conflicts
  const gradientId = `wheelGradient-${mode.replace(/\s/g, '')}`;

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={colors.start} />
          <stop offset="50%" stopColor={colors.mid} />
          <stop offset="100%" stopColor={colors.end} />
        </linearGradient>
      </defs>
      {/* Outer Rim */}
      <circle cx="12" cy="12" r="10" stroke={`url(#${gradientId})`} strokeWidth="2" />
      <circle cx="12" cy="12" r="8" stroke={`url(#${gradientId})`} strokeWidth="0.5" strokeOpacity="0.5" />
      {/* Center Hub */}
      <circle cx="12" cy="12" r="2" fill={`url(#${gradientId})`} />
      {/* Spokes */}
      <path d="M12 2V10" stroke={`url(#${gradientId})`} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 14V22" stroke={`url(#${gradientId})`} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M22 12H14" stroke={`url(#${gradientId})`} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M10 12H2" stroke={`url(#${gradientId})`} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M19.07 4.93L13.41 10.59" stroke={`url(#${gradientId})`} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M10.59 13.41L4.93 19.07" stroke={`url(#${gradientId})`} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M19.07 19.07L13.41 13.41" stroke={`url(#${gradientId})`} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M10.59 10.59L4.93 4.93" stroke={`url(#${gradientId})`} strokeWidth="1.5" strokeLinecap="round" />
      {/* Decorative Dots on Rim */}
      <circle cx="12" cy="1" r="1" fill={colors.mid} />
      <circle cx="12" cy="23" r="1" fill={colors.mid} />
      <circle cx="1" cy="12" r="1" fill={colors.mid} />
      <circle cx="23" cy="12" r="1" fill={colors.mid} />
    </svg>
  );
};

const DEFAULT_QUESTION_SETS = [
  [
    { text: "What does the Bhagavad Gita say about duty (Dharma)?", icon: <Book size={20} /> },
    { text: "How do the Upanishads explain the nature of the self (Atman)?", icon: <Sparkles size={20} /> },
    { text: "What is the significance of Om in Hinduism?", icon: <Atom size={20} /> }
  ],
  [
    { text: "Tell me a story from the Mahabharata about Karna.", icon: <Library size={20} /> },
    { text: "Explain the concept of Karma Yoga.", icon: <Brain size={20} /> },
    { text: "What are the 4 Vedas and their purpose?", icon: <FileText size={20} /> }
  ],
  [
    { text: "Who are the Trideva and their roles?", icon: <Users size={20} /> },
    { text: "What is the scientific parallel to the concept of time in Puranas?", icon: <Microscope size={20} /> },
    { text: "Interpret the Gayatri Mantra.", icon: <Flower size={20} /> }
  ]
];

// Use React.ReactNode explicitly to avoid JSX namespace errors
const SOURCE_SPECIFIC_QUESTIONS: Record<string, { text: string; icon: React.ReactNode }[]> = {
  'Bhagavad Gita': [
    { text: "What is the central message of the Bhagavad Gita?", icon: <Book size={20} /> },
    { text: "Explain the concept of Nishkama Karma.", icon: <Brain size={20} /> },
    { text: "How is the soul (Atman) described in Chapter 2?", icon: <Sparkles size={20} /> }
  ],
  'Rigveda': [
     { text: "What is the Gayatri Mantra and its meaning?", icon: <Flower size={20} /> },
     { text: "Who is Indra in the Rigveda?", icon: <Zap size={20} /> },
     { text: "Explain the Nasadiya Sukta (Creation Hymn).", icon: <Atom size={20} /> }
  ],
  'Yajurveda': [
      { text: "What is the focus of the Yajurveda?", icon: <FileText size={20} /> },
      { text: "Explain the significance of Yajna (sacrifice).", icon: <Check size={20} /> },
      { text: "Difference between Shukla and Krishna Yajurveda?", icon: <GitBranch size={20} /> }
  ],
  'Samaveda': [
      { text: "How is Samaveda related to music?", icon: <Radio size={20} /> },
      { text: "What is the importance of chanting?", icon: <Volume2 size={20} /> },
      { text: "Connection between Rigveda and Samaveda?", icon: <Link size={20} /> }
  ],
  'Atharvaveda': [
      { text: "What does the Atharvaveda contain?", icon: <Shield size={20} /> },
      { text: "Ayurveda's connection to Atharvaveda.", icon: <Microscope size={20} /> },
      { text: "Mantras for peace and prosperity.", icon: <Sparkles size={20} /> }
  ],
  'Ramayana': [
      { text: "Why is Rama considered Maryada Purushottam?", icon: <UserIcon size={20} /> },
      { text: "The significance of Hanuman's devotion.", icon: <Heart size={20} /> },
      { text: "Lessons from the relationship of Rama and Sita.", icon: <Users size={20} /> }
  ],
  'Mahabharata': [
      { text: "What caused the Kurukshetra war?", icon: <Shield size={20} /> },
      { text: "Explain the role of Krishna in Mahabharata.", icon: <Sparkles size={20} /> },
      { text: "What is the Yaksha Prashna?", icon: <Brain size={20} /> }
  ],
  'Puranas': [
      { text: "What are the 18 Mahapuranas?", icon: <Library size={20} /> },
      { text: "Story of the churning of the ocean (Samudra Manthan).", icon: <Radio size={20} /> },
      { text: "Concept of Yugas in Puranas.", icon: <Clock size={20} /> }
  ],
  'Upanishads': [
      { text: "What is 'Tat Tvam Asi'?", icon: <Fingerprint size={20} /> },
      { text: "Explain the story of Nachiketa from Katha Upanishad.", icon: <Book size={20} /> },
      { text: "What is Brahman and Atman?", icon: <Atom size={20} /> }
  ]
};

const MAX_ALPHANUMERIC_CHARS = 800;

function App() {
  const [state, setState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    error: null
  });

  // Local History State
  interface HistoryItem { text: string; isFactCheck: boolean; }
  
  const [recentChats, setRecentChats] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('vediq_recent_chats');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'string') {
          return parsed.map((t: string) => ({ text: t, isFactCheck: false }));
      }
      return parsed;
    } catch { return []; }
  });

  // Modals & Sidebar
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Speech & Input
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [currentlyReadingId, setCurrentlyReadingId] = useState<string | null>(null);

  // Follow-up Suggestions State
  const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([]);
  const [isInputFocused, setIsInputFocused] = useState(false);

  // Settings
  const [activeSource, setActiveSource] = useState<SourceText>('All Scriptures');
  const [activeMode, setActiveMode] = useState<ToolkitMode>('General Wisdom');
  
  // Language State: Defaults to Auto
  const [responseLang, setResponseLang] = useState<Language>(Language.AUTO);

  const [showSourceMenu, setShowSourceMenu] = useState(false);
  const [showToolkitMenu, setShowToolkitMenu] = useState(false);
  
  // Ref for the Floating Source Menu (Right side)
  const floatingSourceRef = useRef<HTMLDivElement>(null);

  // Random Switching Questions State
  const [currentQuestionSet, setCurrentQuestionSet] = useState(0);
  const [isFading, setIsFading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const speechSynth = useRef<SpeechSynthesis>(window.speechSynthesis);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const voiceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const sourceMenuRef = useRef<HTMLDivElement>(null);
  const toolkitMenuRef = useRef<HTMLDivElement>(null);

  const [bookmarks, setBookmarks] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem('vediq_bookmarks');
      if (saved) return JSON.parse(saved).map((msg: any) => ({ ...msg, timestamp: new Date(msg.timestamp) }));
    } catch (e) { console.error(e); }
    return [];
  });

  useEffect(() => { localStorage.setItem('vediq_bookmarks', JSON.stringify(bookmarks)); }, [bookmarks]);
  
  useEffect(() => { localStorage.setItem('vediq_recent_chats', JSON.stringify(recentChats)); }, [recentChats]);

  useEffect(() => {
    initializeChat();
    const loadVoices = () => { speechSynth.current.getVoices(); };
    loadVoices();
    if (speechSynth.current.onvoiceschanged !== undefined) {
      speechSynth.current.onvoiceschanged = loadVoices;
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sourceMenuRef.current && !sourceMenuRef.current.contains(event.target as Node)) setShowSourceMenu(false);
      if (toolkitMenuRef.current && !toolkitMenuRef.current.contains(event.target as Node)) setShowToolkitMenu(false);
      // Close floating menu if clicked outside
      if (floatingSourceRef.current && !floatingSourceRef.current.contains(event.target as Node)) setShowSourceMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(() => { scrollToBottom(); }, [state.messages]);

  // Helper to count alphanumeric characters
  const getAlphanumericCount = (text: string) => {
    return text.replace(/[^a-zA-Z0-9\u0900-\u097F]/g, '').length;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    
    // Allow alphanumeric, Hindi chars, and common punctuation/spaces. Block others (like emojis).
    // Allowed: a-z, A-Z, 0-9, Hindi Range, Space, .,!?:;'"-()
    if (/^[a-zA-Z0-9\u0900-\u097F\s.,!?:;'"\-()]*$/.test(newVal)) {
      setInputText(newVal);
      // We clear error when user types valid input
      if (state.error === "Please rephrase your question short") {
        setState(prev => ({ ...prev, error: null }));
      }
    }
  };

  // Speech to Text Logic
  const startListening = async () => {
    if (!('webkitSpeechRecognition' in window)) {
        alert("Speech recognition not supported in this browser. Try Chrome.");
        return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognition = new (window as any).webkitSpeechRecognition();
    recognitionRef.current = recognition;

    // If AUTO, defaulting recognition to Hindi/India as it handles mixed best, or English if strictly english needed.
    // However, best UX for auto is to use 'en-US' or 'hi-IN' based on what we think, but we can't guess before they speak.
    // Defaulting to 'en-IN' (Indian English) often captures Hindi terms well too.
    let langCode = 'en-IN';
    if (responseLang === Language.HINDI) langCode = 'hi-IN';
    if (responseLang === Language.ENGLISH) langCode = 'en-US';
    
    recognition.lang = langCode;
    recognition.continuous = true; 
    recognition.interimResults = true;

    recognition.onstart = () => {
        setIsListening(true);
        // Set 30 second auto-stop and send timer
        if (voiceTimeoutRef.current) clearTimeout(voiceTimeoutRef.current);
        voiceTimeoutRef.current = setTimeout(() => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        }, 30000); 
    };
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
        let currentComplete = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
           currentComplete += event.results[i][0].transcript;
        }
        setInputText(currentComplete);
    };

    recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
        if (voiceTimeoutRef.current) clearTimeout(voiceTimeoutRef.current);

        let errorMessage = null;

        switch (event.error) {
            case 'not-allowed':
                errorMessage = "Microphone access denied. Check permissions.";
                break;
            case 'network':
                errorMessage = "Network error. Speech recognition needs internet.";
                break;
            case 'no-speech':
                // Often happens if user stays silent, just ignore or subtle hint
                break;
            case 'aborted':
                // User stopped it
                break;
            default:
                errorMessage = "Speech recognition failed. Try typing.";
        }

        if (errorMessage) {
             setState(prev => ({ ...prev, error: errorMessage }));
             // Auto-clear error after 4 seconds
             setTimeout(() => setState(prev => ({ ...prev, error: null })), 4000);
        }
    };

    recognition.onend = () => {
       setIsListening(false);
       if (voiceTimeoutRef.current) clearTimeout(voiceTimeoutRef.current);
       
       setTimeout(() => {
          // Use ref in effect to send if needed
       }, 100);
    };

    try {
        recognition.start();
    } catch (e) {
        console.error("Recognition start error", e);
    }
  };
  
  // Ref to track latest input for the auto-send closure
  const latestInputRef = useRef(inputText);
  useEffect(() => { latestInputRef.current = inputText; }, [inputText]);

  // Hook into the onEnd logic properly
  useEffect(() => {
      // We need to overwrite the onend logic to use the ref
      if (recognitionRef.current) {
          recognitionRef.current.onend = () => {
              setIsListening(false);
              if (voiceTimeoutRef.current) clearTimeout(voiceTimeoutRef.current);
              
              const textToSend = latestInputRef.current;
              if (textToSend.trim()) {
                  startChat(textToSend);
              }
          };
      }
  }, [recognitionRef.current]);

  const stopListening = () => {
      if (recognitionRef.current) {
          recognitionRef.current.stop();
          setIsListening(false);
          if (voiceTimeoutRef.current) clearTimeout(voiceTimeoutRef.current);
      }
  };

  const startChat = async (text: string) => {
    if (!text.trim()) return;

    // CHECK CHARACTER LIMIT (Alphanumeric only)
    if (getAlphanumericCount(text) > MAX_ALPHANUMERIC_CHARS) {
       setState(prev => ({ ...prev, error: "Please rephrase your question short" }));
       if (speechSynth.current.speaking) speechSynth.current.cancel();
       setCurrentlyReadingId(null);
       return;
    }

    if (speechSynth.current.speaking) { speechSynth.current.cancel(); setCurrentlyReadingId(null); }
    
    // Clear previous follow-ups
    setFollowUpQuestions([]);
    
    // 1. "Act as" Guard - Local Check
    if (text.trim().toLowerCase().startsWith("act as")) {
        const userMsg: Message = { id: Date.now().toString(), role: 'user', text: text, timestamp: new Date() };
        const botMsg: Message = { id: (Date.now()+1).toString(), role: 'model', text: "I can't act.", timestamp: new Date() };
        setState(prev => ({ ...prev, messages: [...prev.messages, userMsg, botMsg], error: null }));
        setInputText('');
        return;
    }

    const newUserMsg: Message = { id: Date.now().toString(), role: 'user', text: text, timestamp: new Date() };
    const tempBotMsgId = (Date.now() + 1).toString();
    const newBotMsg: Message = { id: tempBotMsgId, role: 'model', text: '', isStreaming: true, timestamp: new Date() };

    setState(prev => ({ ...prev, messages: [...prev.messages, newUserMsg, newBotMsg], isLoading: true, error: null }));
    setInputText('');
    
    try {
      // Pass the current responseLang state and HISTORY for server-side stateless processing
      const currentHistory = [...state.messages, newUserMsg];
      const stream = sendMessageStream(text, currentHistory, activeSource, activeMode, responseLang);
      
      let fullText = '';
      for await (const chunk of stream) {
        fullText += chunk;
        setState(prev => ({ ...prev, messages: prev.messages.map(msg => msg.id === tempBotMsgId ? { ...msg, text: fullText } : msg) }));
      }
      setState(prev => ({ ...prev, isLoading: false, messages: prev.messages.map(msg => msg.id === tempBotMsgId ? { ...msg, isStreaming: false } : msg) }));

      if (!fullText.startsWith("Ask relevant") && !fullText.startsWith("This inquiry appears")) {
        const isFactCheck = fullText.startsWith("**Fact Check:**");
        
        // Update History
        setRecentChats(prev => {
           const filtered = prev.filter(t => t.text !== text);
           return [{ text: text, isFactCheck }, ...filtered].slice(0, 15);
        });

        // Generate Follow-ups
        const generatedFollowUps = await generateFollowUpQuestions(fullText);
        setFollowUpQuestions(generatedFollowUps);
      }
    } catch (error: any) {
         setState(prev => ({ 
           ...prev, 
           isLoading: false, 
           error: "Connection interrupted. Please try again.", 
           messages: prev.messages.map(msg => msg.id === tempBotMsgId ? { ...msg, isStreaming: false, text: "..." } : msg) 
         }));
    }
  };

  const handleReadAloud = async (message: Message, lang: string) => {
    if (currentlyReadingId === message.id) {
      speechSynth.current.cancel();
      setCurrentlyReadingId(null);
      return;
    }
    if (speechSynth.current.speaking) speechSynth.current.cancel();
    if (!lang) { setCurrentlyReadingId(null); return; }

    let textToSpeak = message.text;
    try {
      // If the message is already in the target language (roughly), avoid translation api call
      // Simple heuristic: If target is Hindi and text has Devanagari, or target English and text is Latin
      const hasDevanagari = /[\u0900-\u097F]/.test(message.text);
      const isAlreadyTarget = (lang === Language.HINDI && hasDevanagari) || (lang === Language.ENGLISH && !hasDevanagari);

      if (message.cachedTranslations && message.cachedTranslations[lang]) {
        textToSpeak = message.cachedTranslations[lang];
      } else if (!isAlreadyTarget) {
        setState(prev => ({ ...prev, messages: prev.messages.map(m => m.id === message.id ? { ...m, isTranslatingAudio: true } : m) }));
        textToSpeak = await translateForTTS(message.text, lang);
        setState(prev => ({ ...prev, messages: prev.messages.map(m => m.id === message.id ? { ...m, isTranslatingAudio: false, cachedTranslations: { ...(m.cachedTranslations || {}), [lang]: textToSpeak } } : m) }));
      }
    } catch (e) {
      textToSpeak = message.text;
      setState(prev => ({ ...prev, messages: prev.messages.map(m => m.id === message.id ? { ...m, isTranslatingAudio: false } : m) }));
    }

    setCurrentlyReadingId(message.id);
    const cleanText = textToSpeak.replace(/\*\*/g, "").replace(/[#*]/g, "").replace(/`/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // ACCENT LOGIC
    // Hindi: 'hi-IN'
    // English: 'en-IN' (Indian English)
    const targetLangCode = lang === Language.HINDI ? 'hi-IN' : 'en-IN';
    utterance.lang = targetLangCode;
    utterance.rate = lang === Language.HINDI ? 0.9 : 1.0; 
    utterance.pitch = 1.0;
    
    const voices = speechSynth.current.getVoices();
    let preferredVoice = null;

    if (lang === Language.HINDI) {
      // Look for Hindi specific voices
      preferredVoice = voices.find(v => v.lang === 'hi-IN' && (v.name.includes('Google') || v.name.includes('Lekha'))) 
                      || voices.find(v => v.lang.includes('hi'));
    } else {
      // Look for English (India) specific voices
      preferredVoice = voices.find(v => (v.lang === 'en-IN' || v.lang === 'en_IN') && v.name.includes('Google')) 
                    || voices.find(v => (v.lang === 'en-IN' || v.lang === 'en_IN'))
                    || voices.find(v => v.lang.startsWith('en') && v.name.includes('India'));
      
      // Ultimate fallback if no Indian English is found
      if (!preferredVoice) {
         preferredVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google'));
      }
    }

    if (preferredVoice) utterance.voice = preferredVoice;
    
    utterance.onend = () => setCurrentlyReadingId(null);
    utterance.onerror = () => setCurrentlyReadingId(null);
    speechSynth.current.speak(utterance);
  };
  
  const handleVisualize = async (message: Message) => {
    if (message.isGeneratingImages) return;
    setState(prev => ({ ...prev, messages: prev.messages.map(m => m.id === message.id ? { ...m, isGeneratingImages: true } : m) }));
    try {
        const images = await generateIllustrations(message.text);
        setState(prev => ({ ...prev, messages: prev.messages.map(m => m.id === message.id ? { ...m, isGeneratingImages: false, generatedImages: images } : m) }));
    } catch {
        setState(prev => ({ ...prev, messages: prev.messages.map(m => m.id === message.id ? { ...m, isGeneratingImages: false } : m) }));
    }
  };
  const handleToggleBookmark = (message: Message) => {
    setBookmarks(prev => prev.find(b => b.id === message.id) ? prev.filter(b => b.id !== message.id) : [...prev, message]);
  };
  const handleSummarize = async (message: Message) => {
    if (message.summary) return;
    setState(prev => ({ ...prev, messages: prev.messages.map(m => m.id === message.id ? { ...m, isSummarizing: true } : m) }));
    try {
        const summary = await summarizeContent(message.text);
        setState(prev => ({ ...prev, messages: prev.messages.map(m => m.id === message.id ? { ...m, isSummarizing: false, summary } : m) }));
    } catch {
        setState(prev => ({ ...prev, messages: prev.messages.map(m => m.id === message.id ? { ...m, isSummarizing: false } : m) }));
    }
  };
  const handleDownloadChat = () => { 
    if (state.messages.length === 0) return;
    const validMessages = state.messages.filter((msg, index, array) => {
        if (msg.role === 'user') {
            const nextMsg = array[index + 1];
            return nextMsg && nextMsg.role === 'model' && !nextMsg.text.startsWith("Ask relevant");
        } else {
            return !msg.text.startsWith("Ask relevant");
        }
    });

    if (validMessages.length === 0) return;

    const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    const messagesHTML = validMessages.map(m => {
        const isUser = m.role === 'user';
        const isFactCheck = !isUser && m.text.includes('**Fact Check:**');
        
        const alignClass = isUser ? 'user' : 'bot';
        const roleName = isUser ? 'Seeker' : 'Vedic Wisdom';
        
        // Enhance Fact Check Visuals
        const factCheckClass = isFactCheck ? 'fact-check' : '';
        const factCheckIcon = isFactCheck ? '<span class="warning-icon">⚠️ Fact Correction</span>' : '';

        const content = m.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
        
        let imagesHTML = '';
        if (m.generatedImages && m.generatedImages.length > 0) {
            imagesHTML = `<div class="image-grid">${m.generatedImages.map(img => 
                `<div class="image-card"><img src="${img}" alt="Divination" /></div>`
            ).join('')}</div>`;
        }

        let summaryHTML = '';
        if (m.summary) {
            summaryHTML = `<div class="summary-box"><strong>Summary:</strong> ${m.summary}</div>`;
        }

        return `
        <div class="message ${alignClass} ${factCheckClass}">
            <div class="role-label">${roleName} ${factCheckIcon}</div>
            <div class="bubble">
                <div class="content">${content}</div>
                ${summaryHTML}
                ${imagesHTML}
            </div>
        </div>`;
    }).join('');

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>VEDIQ - Spiritual Dialogue Export</title>
    <link href="https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700&family=Inter:wght@300;400;600&display=swap" rel="stylesheet">
    <style>
        body { background: #0c0a09; color: #e7e5e4; font-family: 'Inter', sans-serif; padding: 40px; line-height: 1.6; }
        .container { max-width: 800px; margin: 0 auto; }
        h1 { font-family: 'Merriweather', serif; color: #f59e0b; text-align: center; border-bottom: 1px solid #333; padding-bottom: 20px; margin-bottom: 40px; }
        .message { margin-bottom: 30px; clear: both; }
        .user { text-align: right; }
        .bot { text-align: left; }
        .role-label { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #78716c; margin-bottom: 5px; font-weight: bold; }
        .bubble { display: inline-block; padding: 20px; border-radius: 12px; max-width: 85%; text-align: left; position: relative; }
        
        /* User Styling */
        .user .bubble { background: #292524; color: #e7e5e4; border: 1px solid #44403c; border-top-right-radius: 2px; }
        
        /* Bot Styling */
        .bot .bubble { background: #1c1917; color: #d6d3d1; border: 1px solid #292524; border-top-left-radius: 2px; }
        
        /* Fact Check Styling - Special Treatment */
        .fact-check .bubble { 
            border: 1px solid #f59e0b; 
            background: rgba(245, 158, 11, 0.05);
            box-shadow: 0 0 15px rgba(245, 158, 11, 0.1);
        }
        .warning-icon { color: #f59e0b; margin-left: 8px; font-size: 10px; border: 1px solid #f59e0b; padding: 2px 6px; border-radius: 4px; }
        
        strong { color: #fcd34d; font-weight: 600; }
        .summary-box { margin-top: 15px; padding: 15px; background: rgba(0,0,0,0.3); border-left: 3px solid #f59e0b; font-style: italic; color: #fbbf24; font-size: 0.9em; }
        
        /* Images */
        .image-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 10px; margin-top: 15px; }
        img { width: 100%; border-radius: 8px; border: 1px solid #444; }
        
        .footer { text-align: center; margin-top: 60px; font-size: 12px; color: #555; }
    </style>
</head>
<body>
    <div class="container">
        <h1>VEDIQ Journey <span style="font-size: 0.6em; color: #777; display: block; margin-top: 5px;">${dateStr}</span></h1>
        ${messagesHTML}
        <div class="footer">Generated by VEDIQ AI • Satyameva Jayate</div>
    </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `VEDIQ-Journey-${new Date().toISOString().split('T')[0]}.html`;
    a.click();
  };

  const handleDownloadMessage = (message: Message) => { 
    const dateStr = new Date().toLocaleDateString();
    const isFactCheck = message.text.includes('**Fact Check:**');
    
    // Logic to style the single card download beautifully
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>VEDIQ Wisdom Card</title>
      <link href="https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700&family=Inter:wght@300;400;600&display=swap" rel="stylesheet">
      <style>
         body { background: #0c0a09; color: #e7e5e4; padding: 40px; font-family: 'Inter', sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; }
         .card { 
            background: #1c1917; 
            padding: 40px; 
            border-radius: 16px; 
            max-width: 700px; 
            border: 1px solid ${isFactCheck ? '#f59e0b' : '#333'};
            box-shadow: 0 20px 50px rgba(0,0,0,0.5);
         }
         h2 { color: #f59e0b; font-family: 'Merriweather', serif; margin-top: 0; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 15px; }
         p { line-height: 1.8; color: #d6d3d1; white-space: pre-wrap; }
         strong { color: #fcd34d; }
         .summary { margin-top: 20px; padding: 15px; background: rgba(245, 158, 11, 0.1); color: #fbbf24; font-style: italic; border-radius: 8px; }
         img { max-width: 100%; margin-top: 20px; border-radius: 8px; border: 1px solid #444; }
         .footer { margin-top: 30px; font-size: 12px; color: #555; text-align: right; }
      </style>
    </head>
      <body>
        <div class="card">
           <h2>VEDIQ Wisdom ${isFactCheck ? '<span style="font-size:0.6em; color: #f59e0b; border:1px solid #f59e0b; padding:2px 6px; border-radius:4px; vertical-align:middle; margin-left:10px;">FACT CORRECTION</span>' : ''}</h2>
           <p>${message.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</p>
           ${message.summary ? `<div class="summary"><strong>Essence:</strong> ${message.summary}</div>` : ''}
           ${message.generatedImages?.map(img => `<img src="${img}" />`).join('') || ''}
           <div class="footer">Generated on ${dateStr}</div>
        </div>
      </body>
    </html>
    `;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `VEDIQ-Wisdom-${message.id}.html`;
    a.click();
  };

  useEffect(() => {
    if (state.messages.length > 0) return;
    const interval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => { setCurrentQuestionSet((prev) => (prev + 1) % 3); setIsFading(false); }, 500);
    }, 5000);
    return () => clearInterval(interval);
  }, [state.messages.length]);

  const clearHistory = () => { if(confirm("Clear history?")) setRecentChats([]); };
  const clearBookmarks = () => { if(confirm("Clear bookmarks?")) setBookmarks([]); };
  
  const validMessageCount = state.messages.filter(m => m.role === 'model' && !m.text.startsWith("Ask relevant")).length;

  const getQuestions = () => {
    if (activeSource === 'All Scriptures') {
        return DEFAULT_QUESTION_SETS[currentQuestionSet];
    }
    return SOURCE_SPECIFIC_QUESTIONS[activeSource] || DEFAULT_QUESTION_SETS[0];
  };

  return (
    <div className="flex flex-col h-screen bg-[#0c0a09] text-stone-100 font-sans overflow-hidden selection:bg-saffron-900/30 selection:text-saffron-200">
      <DisclaimerModal onOpenNotes={() => setShowNotesModal(true)} />
      <NotesModal isOpen={showNotesModal} onClose={() => setShowNotesModal(false)} />

      {/* HEADER */}
      <header className="flex-none flex items-center justify-between px-6 py-6 z-[110]">
        <div className="flex items-center gap-5">
            <button onClick={() => setIsSidebarOpen(true)} className="text-stone-400 hover:text-saffron-400 transition-colors">
                <Menu size={26} strokeWidth={1.5} />
            </button>
            <span className="text-2xl font-serif font-bold tracking-tight select-none">
                <span className="text-white">VED</span><span className="text-vedic-teal-400">IQ</span>
            </span>
        </div>
        <div className="flex items-center gap-6">
            <button onClick={handleDownloadChat} disabled={validMessageCount === 0} className={`text-stone-400 hover:text-vedic-teal-400 ${validMessageCount===0?'opacity-30':''}`}><Download size={22} /></button>
            
            {/* 3-Option Segmented Control Pill for Language (Visible) */}
            <div className="bg-[#1c1917] rounded-full border border-stone-800 p-1 flex items-center">
               {[
                 { label: 'AUTO', val: Language.AUTO, icon: <Globe size={10} /> },
                 { label: 'ENG', val: Language.ENGLISH, icon: null },
                 { label: 'HINDI', val: Language.HINDI, icon: null }
               ].map((opt) => (
                 <button
                   key={opt.label}
                   onClick={() => setResponseLang(opt.val)}
                   className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all duration-300 flex items-center gap-1.5 ${
                     responseLang === opt.val
                       ? opt.val === Language.ENGLISH ? 'bg-saffron-900/30 text-saffron-400 border border-saffron-500/30' 
                       : opt.val === Language.HINDI ? 'bg-vedic-teal-900/30 text-vedic-teal-400 border border-vedic-teal-500/30'
                       : 'bg-stone-700 text-white'
                       : 'text-stone-500 hover:text-stone-300'
                   }`}
                 >
                   {opt.icon}
                   <span>{opt.label}</span>
                 </button>
               ))}
            </div>
        </div>
      </header>

      {/* SIDEBAR */}
      <div className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-[140] transition-opacity ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsSidebarOpen(false)} />
      <div className={`fixed inset-y-0 left-0 w-80 bg-[#1c1917] border-r border-stone-800 shadow-2xl z-[150] transform transition-transform duration-500 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
        <div className="flex justify-end p-4">
           <button onClick={() => setIsSidebarOpen(false)}><X size={20} className="text-stone-500 hover:text-white" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xs font-bold text-stone-500 uppercase tracking-widest">Recent Wisdom</h3>
                    {recentChats.length > 0 && <button onClick={clearHistory} className="text-[10px] text-red-500 hover:text-red-400">Clear</button>}
                </div>
                {recentChats.length ? (
                    <div className="space-y-2">
                        {recentChats.map((chat, idx) => (
                            <div key={idx} onClick={() => startChat(chat.text)} className="p-3 rounded-lg bg-stone-900/30 border border-stone-800/50 text-sm text-stone-400 hover:text-white hover:bg-stone-900 transition-colors cursor-pointer flex items-center gap-2 group">
                                {chat.isFactCheck && <AlertTriangle size={14} className="text-amber-500 flex-shrink-0 group-hover:text-amber-400" />}
                                <span className="truncate">{chat.text}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-stone-600 text-xs italic">No recent chats.</p>
                )}
            </div>
            <div>
                <div className="flex justify-between items-center mb-4">
                     <h3 className="text-xs font-bold text-stone-500 uppercase tracking-widest flex items-center gap-2"><Bookmark size={14} /> Bookmarks</h3>
                     {bookmarks.length > 0 && <button onClick={clearBookmarks} className="text-[10px] text-red-500 hover:text-red-400">Clear</button>}
                </div>
                {bookmarks.map(m => (
                    <div key={m.id} className="p-3 bg-stone-900/50 rounded-lg border border-stone-800 text-xs text-stone-300 line-clamp-2 mb-2">{m.text}</div>
                ))}
            </div>
        </div>
        <div className="p-4 border-t border-stone-800">
             <button onClick={() => { setIsSidebarOpen(false); setShowNotesModal(true); }} className="flex items-center justify-center gap-2 w-full py-2.5 bg-stone-900 hover:bg-stone-800 rounded-xl text-stone-400 transition-all border border-stone-800 text-sm font-medium">
                 <Info size={16} /><span>About & Notes</span>
             </button>
        </div>
      </div>

      {/* Floating Source Button (Active Chat State) */}
      {state.messages.length > 0 && (
         <div className="fixed right-4 bottom-24 z-[105]" ref={floatingSourceRef}>
            <div className="relative flex flex-col items-end">
              {showSourceMenu && (
                 <div className="mb-2 w-56 bg-[#1c1917] border border-stone-800 rounded-xl shadow-2xl py-1 animate-scale-in max-h-60 overflow-y-auto custom-scrollbar">
                     {['All Scriptures', 'Bhagavad Gita', 'Rigveda', 'Yajurveda', 'Samaveda', 'Atharvaveda', 'Ramayana', 'Mahabharata', 'Puranas', 'Upanishads'].map(src => (
                         <button 
                           key={src} 
                           onClick={()=>{setActiveSource(src as SourceText); setShowSourceMenu(false)}} 
                           className={`w-full text-left px-4 py-2 text-xs hover:bg-stone-800 hover:text-saffron-400 ${activeSource === src ? 'text-saffron-400 bg-stone-800/50' : 'text-stone-400'}`}
                         >
                           {src}
                         </button>
                     ))}
                 </div>
              )}
              <button 
                onClick={() => setShowSourceMenu(!showSourceMenu)} 
                className="w-12 h-12 rounded-full bg-stone-800 border border-stone-700 shadow-xl flex items-center justify-center text-saffron-400 hover:text-saffron-300 hover:scale-105 transition-all"
                title={`Source: ${activeSource}`}
              >
                 <Scroll size={20} />
              </button>
            </div>
         </div>
      )}

      {/* MAIN CONTENT */}
      <main className={`flex-1 w-full max-w-3xl mx-auto px-4 relative flex flex-col ${state.messages.length === 0 ? 'overflow-hidden justify-center' : 'overflow-y-auto pb-32 custom-scrollbar'}`}>
        {state.messages.length === 0 ? (
          <div className="w-full flex flex-col items-center animate-fade-in -mt-20">
            <div className="w-full text-left mb-4 px-2">
               <h2 className="text-sm font-bold text-white tracking-widest uppercase">Main Content</h2>
               {activeSource !== 'All Scriptures' && <span className="text-xs text-saffron-500 font-medium animate-fade-in">Focus: {activeSource}</span>}
            </div>
            <div className="w-full space-y-4 relative min-h-[250px]">
               {getQuestions().map((q, idx) => (
                 <button key={`${activeSource}-${currentQuestionSet}-${idx}`} onClick={() => startChat(q.text)} className={`w-full text-left p-5 rounded-2xl border border-stone-800 bg-[#1c1917]/60 hover:bg-[#1c1917] hover:border-stone-700 transition-all duration-500 group flex items-center gap-4 ${isFading && activeSource === 'All Scriptures' ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`} style={{ transitionDelay: `${idx * 100}ms` }}>
                    <div className="p-2 rounded-lg bg-stone-900 text-stone-500 group-hover:text-saffron-400 group-hover:bg-stone-800 transition-colors">{q.icon}</div>
                    <span className="text-stone-300 font-medium group-hover:text-stone-100 transition-colors text-base md:text-lg">{q.text}</span>
                 </button>
               ))}
            </div>
          </div>
        ) : (
          <div className="pt-4 space-y-6">
            {state.messages.map((msg) => (
              <MessageBubble 
                key={msg.id} 
                message={msg} 
                onReadAloud={handleReadAloud}
                onVisualize={handleVisualize}
                onToggleBookmark={handleToggleBookmark}
                onSummarize={handleSummarize}
                onDownload={handleDownloadMessage}
                isBookmarked={bookmarks.some(b => b.id === msg.id)}
                currentlyReadingId={currentlyReadingId}
              />
            ))}
            <div ref={messagesEndRef} />
            
            {/* Loading Indicator */}
            {state.isLoading && state.messages[state.messages.length - 1]?.role === 'user' && (
               <div className="flex justify-start w-full mb-8 animate-fade-in"><div className="flex items-center gap-3 bg-stone-900/40 px-5 py-3 rounded-2xl rounded-tl-none border border-stone-800"><TilakLoader size={20} /><span className="text-stone-500 text-sm italic">Consulting the scriptures...</span></div></div>
            )}
            
            {/* Error Indicator (e.g. Length Exceeded) */}
            {state.error && (
              <div className="flex justify-center w-full mb-6 animate-fade-in">
                 <div className="bg-red-900/30 border border-red-900/50 px-4 py-2 rounded-lg text-red-200 text-sm flex items-center gap-2">
                    <AlertTriangle size={14} />
                    {state.error}
                 </div>
              </div>
            )}

            {/* Follow-up Questions Container */}
            {!state.isLoading && followUpQuestions.length > 0 && (
                <div className={`mt-8 mb-4 transition-all duration-500 ease-in-out ${isInputFocused ? 'opacity-0 translate-y-4 pointer-events-none' : 'opacity-100 translate-y-0'}`}>
                    <div className="flex items-center gap-2 mb-3 px-1">
                        <Sparkles size={14} className="text-saffron-400" />
                        <span className="text-xs font-bold text-stone-500 uppercase tracking-widest">Seek Further</span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {followUpQuestions.map((q, idx) => (
                            <button
                                key={idx}
                                onClick={() => startChat(q)}
                                className="group flex items-center gap-2 px-4 py-2.5 bg-stone-900/50 hover:bg-stone-800 border border-stone-800 hover:border-saffron-500/30 rounded-full text-sm text-stone-300 hover:text-saffron-100 transition-all duration-300 active:scale-95 text-left"
                            >
                                <span>{q}</span>
                                <ArrowRight size={14} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-saffron-400" />
                            </button>
                        ))}
                    </div>
                </div>
            )}
          </div>
        )}
      </main>

      {/* FOOTER INPUT */}
      <footer className="flex-none p-6 pt-0 bg-transparent z-[100] relative">
        <div className="max-w-3xl mx-auto relative">
           
           {/* Center Pill Source Switcher (Empty Chat State Only) */}
           {state.messages.length === 0 && (
             <div className="absolute -top-12 left-1/2 -translate-x-1/2 transition-all duration-300">
                <div className="relative" ref={sourceMenuRef}>
                   <button onClick={() => setShowSourceMenu(!showSourceMenu)} className="flex items-center gap-2 bg-[#1c1917] border border-stone-800/80 hover:border-saffron-500/30 text-stone-400 hover:text-saffron-200 px-4 py-1.5 rounded-full text-xs transition-all shadow-lg whitespace-nowrap min-w-[180px] justify-center">
                     <span>Source: <span className="text-saffron-400">{activeSource}</span></span><ChevronDown size={12} />
                   </button>
                    {showSourceMenu && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-[#1c1917] border border-stone-800 rounded-xl shadow-2xl py-1 z-50 max-h-60 overflow-y-auto custom-scrollbar">
                         {['All Scriptures', 'Bhagavad Gita', 'Rigveda', 'Yajurveda', 'Samaveda', 'Atharvaveda', 'Ramayana', 'Mahabharata', 'Puranas', 'Upanishads'].map(src => (
                             <button key={src} onClick={()=>{setActiveSource(src as SourceText);setShowSourceMenu(false)}} className="w-full text-left px-4 py-2 text-xs text-stone-400 hover:bg-stone-800 hover:text-saffron-400">{src}</button>
                         ))}
                      </div>
                    )}
                </div>
             </div>
           )}

           <div className={`relative flex items-center bg-[#1c1917] border rounded-full shadow-2xl transition-all duration-300 ${isListening ? 'border-red-500/50 ring-2 ring-red-500/20 bg-stone-900' : 'border-stone-800 focus-within:border-saffron-900/50'}`}>
              
              {isListening && (
                <div onClick={stopListening} className="absolute inset-0 z-20 bg-vedic-teal-900/90 backdrop-blur-md flex items-center justify-between px-6 cursor-pointer animate-pulse-slow rounded-full">
                    <div className="flex items-center gap-4">
                        <div className="relative"><span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping"></span><div className="relative bg-red-500 p-2 rounded-full text-white"><Radio size={20} className="animate-pulse" /></div></div>
                        <div><p className="text-white font-medium text-sm">Listening...</p><p className="text-vedic-teal-200 text-xs">{inputText || "Tap anywhere to stop"}</p></div>
                    </div>
                    <div className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold text-white uppercase tracking-wider border border-white/20">Tap to Send</div>
                </div>
              )}

              <div className="pl-4 pr-2 relative" ref={toolkitMenuRef}>
                 <button 
                   type="button" 
                   onClick={(e) => { e.stopPropagation(); if(!isListening) setShowToolkitMenu(!showToolkitMenu); }} 
                   className={`transition-all duration-300 outline-none hover:scale-110 ${isListening ? 'opacity-20' : 'opacity-100'}`}
                 >
                    <ChariotWheel size={24} mode={activeMode} className={activeMode === 'General Wisdom' ? "animate-spin-slow opacity-90" : "animate-[spin_4s_linear_infinite] opacity-100"} />
                 </button>
                 {showToolkitMenu && (
                    <div className="absolute bottom-full left-0 mb-4 w-52 bg-[#1c1917] border border-stone-800 rounded-xl shadow-2xl overflow-hidden py-1 z-[200]">
                       {[{ label: 'General Wisdom', mode: 'General Wisdom' }, { label: 'Exact Reference', mode: 'Exact Reference' }, { label: 'Philosophy', mode: 'Philosophical Angle' }, { label: 'Sanskrit Shloka', mode: 'Sanskrit Shloka' }].map((opt) => (
                           <button key={opt.mode} onClick={()=>{setActiveMode(opt.mode as ToolkitMode);setShowToolkitMenu(false)}} className="w-full text-left px-4 py-2 text-xs text-stone-400 hover:bg-stone-800 hover:text-saffron-400">{opt.label}</button>
                       ))}
                    </div>
                 )}
              </div>

              <input
                type="text"
                value={inputText}
                onChange={handleInputChange}
                onKeyDown={(e) => e.key === 'Enter' && startChat(inputText)}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setTimeout(() => setIsInputFocused(false), 200)}
                placeholder={isListening ? "" : `Ask (${activeMode})...`}
                disabled={isListening}
                className={`flex-1 bg-transparent border-none focus:ring-0 text-stone-200 placeholder-stone-500 h-14 text-lg transition-opacity ${isListening ? 'opacity-0' : 'opacity-100'}`}
              />

              <button onClick={startListening} disabled={state.isLoading || isListening} className={`p-2 mr-2 rounded-full transition-colors relative z-10 ${isListening ? 'text-transparent pointer-events-none' : 'text-stone-500 hover:text-stone-300'}`}><Mic size={20} /></button>
              <div className={`pr-2 transition-opacity ${isListening ? 'opacity-0' : 'opacity-100'}`}>
                <button onClick={() => startChat(inputText)} disabled={!inputText.trim() || state.isLoading} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${inputText.trim() ? 'bg-vedic-teal-500 text-stone-950' : 'bg-stone-800 text-stone-600'}`}>
                {state.isLoading ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-stone-900 border-t-transparent" /> : <Play size={18} fill="currentColor" />}
                </button>
              </div>
           </div>
           
           <div className={`absolute -bottom-5 right-6 text-[10px] transition-colors ${getAlphanumericCount(inputText) > MAX_ALPHANUMERIC_CHARS ? 'text-red-500 font-bold' : 'text-stone-600'}`}>
             {getAlphanumericCount(inputText)}/{MAX_ALPHANUMERIC_CHARS}
           </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
