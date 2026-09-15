import React, { useState } from 'react';
import { useStudentProfile } from '../../context/StudentProfileContext';
import { 
  generateAtsResumeContent, 
  downloadAtsResumeDocx, 
  downloadAtsResumePdf,
  improveResumeWordingWithAI
} from '../../services/atsResumeService';
import { 
  FileText, 
  Sparkles, 
  Download, 
  X, 
  Copy, 
  Check, 
  Edit3, 
  RotateCcw,
  ShieldAlert
} from 'lucide-react';

interface AtsResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AtsResumeModal: React.FC<AtsResumeModalProps> = ({ isOpen, onClose }) => {
  const { profile } = useStudentProfile();
  const [resumeText, setResumeText] = useState(() => generateAtsResumeContent(profile));
  const [isEditing, setIsEditing] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleResetToProfile = () => {
    setResumeText(generateAtsResumeContent(profile));
    setErrorMsg(null);
  };

  const handleAiRefine = async () => {
    setErrorMsg(null);
    setIsRefining(true);
    try {
      const improved = await improveResumeWordingWithAI(profile);
      setResumeText(improved);
    } catch (err: any) {
      setErrorMsg(err?.message || 'AI resume wording refinement failed. Retaining current text.');
    } finally {
      setIsRefining(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(resumeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadDocx = () => {
    const filename = `${profile.personalInfo.fullName || 'Student'}_ATS_Resume.docx`;
    downloadAtsResumeDocx(profile, filename);
  };

  const handleDownloadPdf = () => {
    const filename = `${profile.personalInfo.fullName || 'Student'}_ATS_Resume.pdf`;
    downloadAtsResumePdf(profile, filename);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[90vh] animate-in fade-in duration-200">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-indigo-500/20 to-sky-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
              <FileText className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                ATS Resume Generator
              </h3>
              <p className="text-xs text-slate-400">
                Single-column ATS formatted resume compiled from your saved profile data
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Toolbar Header Controls */}
        <div className="p-3 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-colors border ${
                isEditing
                  ? 'bg-indigo-600 text-white border-indigo-500'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              {isEditing ? 'Editing Mode Active' : 'Edit Text'}
            </button>

            <button
              onClick={handleAiRefine}
              disabled={isRefining}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-500/20 to-sky-500/20 hover:from-indigo-500/30 hover:to-sky-500/30 text-indigo-300 rounded-lg font-semibold border border-indigo-500/30 transition-all disabled:opacity-50"
            >
              <Sparkles className={`w-3.5 h-3.5 text-indigo-400 ${isRefining ? 'animate-spin' : ''}`} />
              {isRefining ? 'Refining Impact Verbs...' : 'AI Refine Wording'}
            </button>

            <button
              onClick={handleResetToProfile}
              className="flex items-center gap-1 px-2.5 py-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
              title="Reset to Latest Saved Profile"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 text-slate-300 hover:text-white border border-slate-800 rounded-lg"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy Raw Text'}
            </button>
          </div>
        </div>

        {/* Error notification if AI failed */}
        {errorMsg && (
          <div className="p-3 bg-amber-500/10 border-b border-amber-500/20 text-amber-300 text-xs flex items-center gap-2 shrink-0">
            <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Modal Main Body Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-950/40 font-mono text-xs">
          {isEditing ? (
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              className="w-full h-full min-h-[420px] bg-slate-950 text-slate-200 border border-slate-800 rounded-xl p-4 focus:outline-none focus:border-indigo-500 font-mono text-xs leading-relaxed resize-none"
            />
          ) : (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-8 text-slate-200 leading-relaxed space-y-4 max-w-3xl mx-auto shadow-inner">
              <pre className="whitespace-pre-wrap font-sans text-xs text-slate-300 font-medium">
                {resumeText}
              </pre>
            </div>
          )}
        </div>

        {/* Modal Footer Downloads */}
        <div className="p-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 shrink-0">
          <p className="text-xs text-slate-400">
            Strictly compiled from actual saved profile data. No invented credentials.
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadDocx}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-600/20 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" /> Download DOCX
            </button>
            <button
              onClick={handleDownloadPdf}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" /> Download PDF
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
