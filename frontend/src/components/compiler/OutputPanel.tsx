import React from 'react';
import type { SupportedLanguage, ExecutionResponse } from '../../types/assessment';
import { Terminal, Eye, AlertTriangle, Clock } from 'lucide-react';

interface OutputPanelProps {
  language: SupportedLanguage;
  code: string;
  executionResult: ExecutionResponse | null;
  activeTab: 'console' | 'preview';
  onChangeTab: (tab: 'console' | 'preview') => void;
}

export const OutputPanel: React.FC<OutputPanelProps> = ({
  language,
  code,
  executionResult,
  activeTab,
  onChangeTab,
}) => {
  const isWebTech = language === 'html' || language === 'css' || language === 'react';

  // Construct iframe html source for live HTML/CSS/React preview
  const generatePreviewDoc = () => {
    if (language === 'html') return code;
    if (language === 'css') {
      return `<!DOCTYPE html>
<html>
<head>
  <style>${code}</style>
</head>
<body>
  <div class="box">
    <h1>SkillBridge CSS Sandbox</h1>
    <p>Live CSS preview container</p>
    <button>Interactive Button</button>
  </div>
</body>
</html>`;
    }
    if (language === 'react') {
      return `<!DOCTYPE html>
<html>
<head>
  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <style>
    body { margin: 0; font-family: sans-serif; background: #090d16; color: #fff; padding: 20px; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    ${code.replace('export default function App', 'function App')}
    const root = ReactDOM.createRoot(document.getElementById('root'));
    if (typeof App !== 'undefined') {
      root.render(<App />);
    }
  </script>
</body>
</html>`;
    }
    return '';
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl flex flex-col h-full overflow-hidden shadow-2xl">
      
      {/* Output Panel Header Bar */}
      <div className="bg-slate-900/90 border-b border-slate-800 p-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          {/* Console Tab Button */}
          <button
            onClick={() => onChangeTab('console')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'console'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Console Output</span>
          </button>

          {/* Web Live Preview Tab Button (Available for HTML/CSS/React) */}
          {isWebTech && (
            <button
              onClick={() => onChangeTab('preview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'preview'
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Live Sandboxed Preview</span>
            </button>
          )}
        </div>

        {/* Execution Time badge if execution ran */}
        {executionResult && (
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="flex items-center gap-1 text-slate-400">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>{executionResult.executionTimeMs}ms</span>
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              executionResult.status === 'success'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : executionResult.status === 'unavailable'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
            }`}>
              {executionResult.status.toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Main Output Body */}
      <div className="flex-1 p-4 overflow-y-auto custom-scrollbar font-mono text-xs relative">
        
        {/* PREVIEW TAB CONTENT */}
        {activeTab === 'preview' && isWebTech ? (
          <div className="w-full h-full min-h-[300px] bg-slate-900 rounded-xl overflow-hidden border border-slate-800">
            <iframe
              title="Sandboxed Web Preview"
              srcDoc={generatePreviewDoc()}
              sandbox="allow-scripts"
              className="w-full h-full border-none min-h-[300px]"
            />
          </div>
        ) : (
          /* CONSOLE TAB CONTENT */
          <div className="space-y-3">
            {!executionResult ? (
              <div className="text-slate-500 italic flex items-center gap-2 pt-4">
                <Terminal className="w-4 h-4 text-slate-600" />
                <span>Click "Run Code" or "Submit Assessment" to see execution output...</span>
              </div>
            ) : executionResult.status === 'unavailable' ? (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Compiler Service Unavailable</span>
                </div>
                <p className="text-xs text-amber-200 leading-relaxed font-sans font-normal">
                  {executionResult.error}
                </p>
              </div>
            ) : (
              <>
                {/* Standard Output stdout */}
                {executionResult.output && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                      Standard Output (stdout):
                    </span>
                    <pre className="p-3 bg-slate-900 rounded-xl text-slate-200 whitespace-pre-wrap leading-relaxed border border-slate-800">
                      {executionResult.output}
                    </pre>
                  </div>
                )}

                {/* Standard Error stderr */}
                {executionResult.error && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">
                      Runtime / Compilation Errors (stderr):
                    </span>
                    <pre className="p-3 bg-rose-950/40 rounded-xl text-rose-300 border border-rose-500/30 whitespace-pre-wrap leading-relaxed">
                      {executionResult.error}
                    </pre>
                  </div>
                )}
              </>
            )}
          </div>
        )}

      </div>

    </div>
  );
};
