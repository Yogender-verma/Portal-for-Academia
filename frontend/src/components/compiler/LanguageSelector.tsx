import React from 'react';
import type { SupportedLanguage } from '../../types/assessment';
import { LANGUAGE_CONFIGS } from '../../services/compilerService';
import { ChevronDown, Check } from 'lucide-react';

interface LanguageSelectorProps {
  selectedLanguage: SupportedLanguage;
  onSelectLanguage: (lang: SupportedLanguage) => void;
  availableLanguages?: SupportedLanguage[];
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguage,
  onSelectLanguage,
  availableLanguages,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const allLanguages = availableLanguages || (Object.keys(LANGUAGE_CONFIGS) as SupportedLanguage[]);
  const currentConfig = LANGUAGE_CONFIGS[selectedLanguage] || LANGUAGE_CONFIGS.javascript;

  return (
    <div className="relative inline-block text-left z-30">
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">
          Select Technology:
        </span>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 rounded-xl text-xs font-bold text-white flex items-center gap-2.5 transition-all shadow-md cursor-pointer"
        >
          <div className="w-5 h-5 rounded-md bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-mono text-[10px]">
            {currentConfig.extension.replace('.', '').toUpperCase()}
          </div>
          <span>{currentConfig.name}</span>
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 mt-2 w-64 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl z-50 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800/80 flex items-center justify-between">
              <span>Supported Technologies</span>
              <span className="text-cyan-400 font-mono">{allLanguages.length} Languages</span>
            </div>

            <div className="max-h-72 overflow-y-auto custom-scrollbar space-y-0.5 pt-1">
              {allLanguages.map((langKey) => {
                const config = LANGUAGE_CONFIGS[langKey];
                const isSelected = selectedLanguage === langKey;

                return (
                  <button
                    key={langKey}
                    onClick={() => {
                      onSelectLanguage(langKey);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600/30 text-cyan-300 border border-indigo-500/40'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-slate-950 border border-slate-800 text-indigo-300 font-mono text-[10px] flex items-center justify-center">
                        {config.extension.replace('.', '').toUpperCase()}
                      </span>
                      <div>
                        <span className="block font-bold leading-tight">{config.name}</span>
                        <span className="text-[10px] text-slate-400 font-normal">{config.category}</span>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-cyan-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
