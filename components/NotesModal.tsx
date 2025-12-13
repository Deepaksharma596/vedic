
import React, { useState } from 'react';
import { X, ChevronDown, ChevronUp, Target, Sparkles, Ban, HelpCircle, Info, Mic } from 'lucide-react';

interface NotesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotesModal: React.FC<NotesModalProps> = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState<string | null>('Purpose');

  if (!isOpen) return null;

  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? null : section);
  };

  const sections = [
    {
      id: 'Purpose',
      title: 'Purpose',
      icon: <Target size={18} />,
      content: (
        <div className="space-y-3 text-stone-300 text-sm leading-relaxed font-light">
          <p>
            VEDIQ exists to serve as a reliable, interactive gateway to Sanatan scriptures — enabling users to ask questions and receive clear, contextual, and meaningful answers derived from ancient texts.
          </p>
          <p>
            It simplifies access to wisdom from sources such as the Bhagavad Gita, Upanishads, Ramayana, Mahabharata, Puranas, and other classical literature, presenting concepts in a modern, understandable way.
          </p>
        </div>
      )
    },
    {
      id: 'Features',
      title: 'Features',
      icon: <Sparkles size={18} />,
      content: (
        <div className="space-y-6 text-stone-300 text-sm">
          <div>
            <h4 className="text-saffron-400 font-bold text-xs uppercase tracking-wider mb-2">2.1 Scripture Source Focus</h4>
            <p className="text-stone-400 text-xs leading-relaxed">By default, VEDIQ considers all major Sanatan scriptures simultaneously (Multi-text cross-referencing). Users can optionally choose a single scripture to focus on.</p>
          </div>
          <div>
            <h4 className="text-saffron-400 font-bold text-xs uppercase tracking-wider mb-2">2.2 Toolkit Wheel (Context Modes)</h4>
            <ul className="list-disc list-inside text-stone-400 text-xs space-y-1 ml-1 marker:text-saffron-600">
              <li>General Wisdom</li>
              <li>Exact Reference Mode (chapter/verse citations)</li>
              <li>Science Behind Mode</li>
              <li>Philosophy Mode</li>
              <li>Sanskrit Shloka Mode (with transliteration + meaning)</li>
            </ul>
          </div>
          <div>
            <h4 className="text-saffron-400 font-bold text-xs uppercase tracking-wider mb-2">2.3 Intelligent Image Depiction</h4>
            <p className="text-stone-400 text-xs leading-relaxed">System selects up to 4 images based on contextual relevance. Visuals are symbolic, scriptural, or conceptual.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
               <h4 className="text-saffron-400 font-bold text-xs uppercase tracking-wider mb-1">2.4 Bookmarking</h4>
               <p className="text-stone-400 text-[11px] leading-relaxed">Stored in browser cache (cleared if history deleted).</p>
            </div>
            <div>
               <h4 className="text-saffron-400 font-bold text-xs uppercase tracking-wider mb-1">2.5 Downloads</h4>
               <p className="text-stone-400 text-[11px] leading-relaxed">Download answers (HTML) or full chat.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
               <h4 className="text-saffron-400 font-bold text-xs uppercase tracking-wider mb-1">2.6 Read Aloud</h4>
               <p className="text-stone-400 text-[11px] leading-relaxed">Text-to-speech in English & Hindi.</p>
             </div>
             <div>
               <h4 className="text-saffron-400 font-bold text-xs uppercase tracking-wider mb-1">2.7 Language</h4>
               <p className="text-stone-400 text-[11px] leading-relaxed">Toggle English ↔ Hindi on-demand.</p>
             </div>
          </div>
          <div>
             <h4 className="text-saffron-400 font-bold text-xs uppercase tracking-wider mb-2">2.8 Summarisation</h4>
             <p className="text-stone-400 text-xs leading-relaxed">One-tap condensation of any long answer into a ~30-word mini-summary.</p>
          </div>
          <div>
             <h4 className="text-saffron-400 font-bold text-xs uppercase tracking-wider mb-2 flex items-center gap-2"><Mic size={12}/> 2.9 Voice Search</h4>
             <p className="text-stone-400 text-xs leading-relaxed">Tap microphone to activate. Touch search bar to stop. Supports language auto-detection.</p>
          </div>
        </div>
      )
    },
    {
      id: 'Unavailable',
      title: 'Unavailable Features',
      icon: <Ban size={18} />,
      content: (
        <div className="space-y-4 text-stone-300 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-stone-950/50 p-3 rounded-lg border border-stone-800">
               <h5 className="text-stone-500 font-bold text-[10px] uppercase mb-1">3.1 Media Upload</h5>
               <p className="text-xs text-stone-400">Users cannot upload images/PDFs. Only text input is supported.</p>
            </div>
            <div className="bg-stone-950/50 p-3 rounded-lg border border-stone-800">
               <h5 className="text-stone-500 font-bold text-[10px] uppercase mb-1">3.2 Offline Mode</h5>
               <p className="text-xs text-stone-400">Requires active internet connection for model inference.</p>
            </div>
            <div className="bg-stone-950/50 p-3 rounded-lg border border-stone-800">
               <h5 className="text-stone-500 font-bold text-[10px] uppercase mb-1">3.3 Cloud Sync</h5>
               <p className="text-xs text-stone-400">Chats exist only in browser memory. Clearing cache deletes them.</p>
            </div>
            <div className="bg-stone-950/50 p-3 rounded-lg border border-stone-800">
               <h5 className="text-stone-500 font-bold text-[10px] uppercase mb-1">3.4 User Accounts</h5>
               <p className="text-xs text-stone-400">No login or personal profiles. Entirely anonymous usage.</p>
            </div>
          </div>
          <div className="px-3 py-2 bg-red-900/10 border border-red-900/20 rounded-lg text-xs text-red-300/70 italic text-center">
             Also unavailable: Payment gateways, Server-side history, Community features.
          </div>
        </div>
      )
    },
    {
      id: 'FAQs',
      title: 'FAQs',
      icon: <HelpCircle size={18} />,
      content: (
        <div className="space-y-4 text-stone-300 text-sm">
          {[
            { q: "Do answers always include exact shlokas?", a: "Only if 'Exact Reference Mode' is selected or requested." },
            { q: "Why multiple scripture references?", a: "Default mode uses multi-text cross-referencing for depth." },
            { q: "Are images guaranteed?", a: "Yes, 1 to 4 images depending on relevance." },
            { q: "Do bookmarks stay forever?", a: "Only until you clear your browser history/cache." },
            { q: "Is VEDIQ free?", a: "Yes, entirely free for spiritual exploration." },
            { q: "Does the summary replace the answer?", a: "No, it's an optional compressed overview." },
            { q: "Does VEDIQ work offline?", a: "No. It requires internet access." },
          ].map((item, idx) => (
            <div key={idx} className="bg-stone-900/40 p-3 rounded-lg border border-stone-800/50">
              <p className="text-saffron-400 font-bold text-xs mb-1">Q: {item.q}</p>
              <p className="text-stone-400 text-xs leading-relaxed">A: {item.a}</p>
            </div>
          ))}
        </div>
      )
    }
  ];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#1c1917] w-full max-w-lg max-h-[85vh] rounded-2xl border border-stone-800 shadow-2xl flex flex-col overflow-hidden animate-scale-in">
        
        {/* Header */}
        <div className="p-5 border-b border-stone-800 flex justify-between items-center bg-stone-900/80">
           <div className="flex items-center gap-3">
             <div className="p-2 bg-saffron-900/20 rounded-lg text-saffron-500 border border-saffron-500/20">
               <Info size={20} />
             </div>
             <div>
               <h2 className="text-lg font-serif font-bold text-stone-100">About VEDIQ</h2>
               <p className="text-[10px] text-stone-500 uppercase tracking-widest">v2.0.0 • Satyameva Jayate</p>
             </div>
           </div>
           <button onClick={onClose} className="text-stone-500 hover:text-stone-200 transition-colors p-2 hover:bg-stone-800 rounded-full">
             <X size={20} />
           </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-4 space-y-3 custom-scrollbar bg-[#0c0a09]">
          {sections.map((section) => (
            <div key={section.id} className={`border rounded-xl overflow-hidden transition-all duration-300 ${activeSection === section.id ? 'bg-stone-900/60 border-saffron-900/30' : 'bg-stone-900/30 border-stone-800 hover:border-stone-700'}`}>
              <button 
                onClick={() => toggleSection(section.id)}
                className={`w-full flex items-center justify-between p-4 text-left transition-colors ${activeSection === section.id ? 'text-saffron-400' : 'text-stone-400 hover:text-stone-200'}`}
              >
                <div className="flex items-center gap-3">
                  <span className={activeSection === section.id ? 'text-saffron-500' : 'text-stone-500'}>{section.icon}</span>
                  <span className="font-bold tracking-wide text-xs uppercase">{section.title}</span>
                </div>
                {activeSection === section.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              
              <div 
                className={`transition-all duration-300 ease-in-out overflow-hidden ${activeSection === section.id ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <div className="p-4 pt-0 border-t border-dashed border-stone-800/50 mt-0">
                  <div className="pt-4">
                     {section.content}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-stone-800 bg-stone-900/50 text-center">
            <button 
                onClick={onClose}
                className="w-full py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-medium rounded-lg transition-colors"
            >
                Close Notes
            </button>
        </div>

      </div>
    </div>
  );
};
