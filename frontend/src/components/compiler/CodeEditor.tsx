import React, { useState } from 'react';
import type { SupportedLanguage } from '../../types/assessment';
import { LANGUAGE_CONFIGS, downloadSourceCode } from '../../services/compilerService';
import { 
  Play, 
  Send, 
  Download, 
  RotateCcw, 
  Copy, 
  Check, 
  Maximize2, 
  Minimize2, 
  Trash2, 
  Type,
  Code2
} from 'lucide-react';

interface CodeEditorProps {
  code: string;
  onChangeCode: (newCode: string) => void;
  selectedLanguage: SupportedLanguage;
  onRun: () => void;
  onSubmit?: () => void;
  onReset?: () => void;
  isExecuting?: boolean;
  questionTitle?: string;
  mode?: 'practice' | 'assessment';
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  onChangeCode,
  selectedLanguage,
  onRun,
  onSubmit,
  onReset,
  isExecuting = false,
  questionTitle,
  mode = 'practice',
}) => {
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fontSize, setFontSize] = useState<number>(14);

  const config = LANGUAGE_CONFIGS[selectedLanguage] || LANGUAGE_CONFIGS.javascript;

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    downloadSourceCode(code, selectedLanguage, questionTitle);
  };

  const lines = code.split('\n');

  return (
    <div className={`flex flex-col bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl transition-all ${
      isFullscreen ? 'fixed inset-4 z-50 rounded-3xl border-indigo-500/40' : 'h-full min-h-[460px]'
    }`}>
      
      {/* Editor Top Toolbar */}
      <div className="bg-slate-900/90 border-b border-slate-800 p-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono font-bold text-indigo-400">
            <Code2 className="w-3.5 h-3.5" />
            <span>{config.defaultFilename}</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono hidden md:inline">
            {lines.length} lines • {code.length} chars
          </span>
        </div>

        {/* Toolbar Controls */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Font Size Selector */}
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-lg p-1 text-slate-400 text-xs">
            <Type className="w-3.5 h-3.5 text-slate-400 ml-1" />
            <button
              onClick={() => setFontSize(Math.max(12, fontSize - 1))}
              className="px-1.5 hover:text-white font-bold"
              title="Decrease font size"
            >
              -
            </button>
            <span className="font-mono text-[11px] text-indigo-300 font-bold px-1">{fontSize}px</span>
            <button
              onClick={() => setFontSize(Math.min(20, fontSize + 1))}
              className="px-1.5 hover:text-white font-bold"
              title="Increase font size"
            >
              +
            </button>
          </div>

          {/* Copy Code */}
          <button
            onClick={handleCopy}
            className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
            title="Copy code to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
          </button>

          {/* Download Code */}
          <button
            onClick={handleDownload}
            className="px-2.5 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 text-cyan-300 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            title={`Download ${config.defaultFilename}`}
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Download Code</span>
          </button>

          {/* Reset Code */}
          {onReset && (
            <button
              onClick={onReset}
              className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white rounded-lg text-xs transition-all cursor-pointer"
              title="Reset code template"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Clear Code */}
          <button
            onClick={() => onChangeCode('')}
            className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-red-400 rounded-lg text-xs transition-all cursor-pointer"
            title="Clear editor"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white rounded-lg text-xs transition-all cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Editor'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

        </div>
      </div>

      {/* Code Textarea Body with Line Numbers */}
      <div className="flex-1 relative flex overflow-hidden bg-slate-950">
        
        {/* Line Numbers Column */}
        <div className="w-12 bg-slate-900/60 border-r border-slate-800/80 text-slate-600 font-mono select-none text-right py-4 pr-3 text-xs leading-relaxed shrink-0">
          {lines.map((_, i) => (
            <div key={i} style={{ fontSize: `${fontSize}px` }}>
              {i + 1}
            </div>
          ))}
        </div>

        {/* Real Code Input Textarea */}
        <textarea
          value={code}
          onChange={(e) => onChangeCode(e.target.value)}
          placeholder={`// Write your ${config.name} code here...`}
          spellCheck={false}
          style={{ fontSize: `${fontSize}px` }}
          className="flex-1 bg-transparent text-slate-100 font-mono p-4 resize-none outline-none leading-relaxed custom-scrollbar selection:bg-indigo-600 selection:text-white border-none focus:ring-0"
        />

      </div>

      {/* Editor Bottom Action Control Bar */}
      <div className="bg-slate-900/90 border-t border-slate-800 p-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-slate-400 font-mono">
            Mode: <strong className="text-white uppercase font-bold">{mode}</strong>
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* ▶ Run Code Button */}
          <button
            onClick={onRun}
            disabled={isExecuting}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Play className={`w-4 h-4 fill-current ${isExecuting ? 'animate-spin' : ''}`} />
            <span>{isExecuting ? 'Running...' : 'Run Code'}</span>
          </button>

          {/* ✓ Submit Assessment Button */}
          {onSubmit && mode === 'assessment' && (
            <button
              onClick={onSubmit}
              disabled={isExecuting}
              className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/25 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Submit Assessment</span>
            </button>
          )}
        </div>
      </div>

    </div>
  );
};
