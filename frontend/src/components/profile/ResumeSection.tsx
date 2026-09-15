import React, { useState, useRef } from 'react';
import { useStudentProfile } from '../../context/StudentProfileContext';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { ResumeParserModal } from './ResumeParserModal';
import { AtsResumeModal } from './AtsResumeModal';
import { JobDescriptionMatchModal } from './JobDescriptionMatchModal';
import { parseResumeWithAI } from '../../services/resumeExtractorService';
import type { StudentProfile } from '../../types/profile';
import { 
  FileText, 
  Upload, 
  RefreshCw, 
  Eye, 
  Download, 
  Trash2, 
  CheckCircle2, 
  Calendar, 
  HardDrive, 
  FileCheck, 
  X,
  Sparkles,
  Target,
  ShieldCheck
} from 'lucide-react';

interface ResumeSectionProps {
  onNavigateSection?: (sectionId: string) => void;
}

export const ResumeSection: React.FC<ResumeSectionProps> = ({ onNavigateSection }) => {
  const { profile, updateResume, deleteResume, mergeExtractedProfileData } = useStudentProfile();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [parserModalOpen, setParserModalOpen] = useState(false);
  const [atsModalOpen, setAtsModalOpen] = useState(false);
  const [jobMatchModalOpen, setJobMatchModalOpen] = useState(false);

  const [isUploading, setIsUploading] = useState(false);
  const [extractedData, setExtractedData] = useState<Partial<StudentProfile> | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  const resume = profile.resume;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setParseError(null);
    setExtractedData(null);

    const today = new Date().toISOString().split('T')[0];
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
    const formattedSize = `${sizeInMB} MB`;

    // Prepare resume metadata upfront
    const resumeData = {
      fileName: file.name,
      fileSize: formattedSize,
      fileType: file.type || 'application/pdf',
      uploadDate: resume?.uploadDate || today,
      lastUpdated: today,
    };

    try {
      // 1. Extract structured data with AI parsing
      console.log('[ResumeSection] Starting AI extraction for:', file.name);
      const extracted = await parseResumeWithAI(file);
      setExtractedData(extracted);
      console.log('[ResumeSection] Extraction complete. Merging into profile...');

      // 2. Save resume metadata FIRST so the merge has it
      await updateResume(resumeData);

      // 3. Automatically merge extracted fields into profile
      //    This runs AFTER updateResume so the profile state includes resume metadata.
      //    mergeExtractedProfileData reads the latest profile via closure,
      //    and saveProfile will persist the fully merged state.
      await mergeExtractedProfileData(extracted);
      console.log('[ResumeSection] ✅ Profile merge complete. State and localStorage updated.');

      // 4. Open summary review modal
      setParserModalOpen(true);
    } catch (err: any) {
      console.error('[ResumeSection] ❌ Resume extraction error:', err);
      setParseError(err?.message || 'Failed to extract structured data from file.');

      // Still update resume metadata file entry even if AI parsing failed
      await updateResume(resumeData);
      setParserModalOpen(true);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleConfirmDelete = async () => {
    await deleteResume();
    setDeleteModalOpen(false);
  };

  const handleDownload = () => {
    if (!resume) return;
    const element = document.createElement('a');
    const file = new Blob([`SkillBridge Resume Document for ${profile.personalInfo.fullName || 'Student'}\nFileName: ${resume.fileName}`], {
      type: 'text/plain',
    });
    element.href = URL.createObjectURL(file);
    element.download = resume.fileName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Resume & CV Center</h2>
            <p className="text-xs text-slate-400">Automatic AI resume parsing, ATS resume compilation & Job Description matching</p>
          </div>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          accept=".pdf,.doc,.docx,.txt"
          onChange={handleFileUpload}
          className="hidden"
        />

        <div className="flex items-center gap-2">
          {!resume ? (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-rose-500/20 cursor-pointer disabled:opacity-50"
            >
              <Upload className={`w-4 h-4 ${isUploading ? 'animate-bounce' : ''}`} /> 
              {isUploading ? 'Auto-Populating Profile...' : 'Upload & Auto-Populate'}
            </button>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 font-semibold border border-slate-700 rounded-xl text-xs transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isUploading ? 'animate-spin' : ''}`} /> 
              {isUploading ? 'Auto-Populating...' : 'Replace & Re-Extract'}
            </button>
          )}
        </div>
      </div>

      {/* Feature Action Buttons Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={() => setAtsModalOpen(true)}
          className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/60 to-slate-900 border border-indigo-500/30 hover:border-indigo-500/60 transition-all flex items-center justify-between text-left group cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <Sparkles className="w-5 h-5 text-indigo-400 group-hover:rotate-12 transition-transform" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                Generate ATS Resume
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Single-column machine-readable resume (PDF / DOCX)
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold text-indigo-400 group-hover:translate-x-1 transition-transform">→</span>
        </button>

        <button
          onClick={() => setJobMatchModalOpen(true)}
          className="p-4 rounded-xl bg-gradient-to-r from-sky-950/60 to-slate-900 border border-sky-500/30 hover:border-sky-500/60 transition-all flex items-center justify-between text-left group cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-sky-500/20 text-sky-300 border border-sky-500/30">
              <Target className="w-5 h-5 text-sky-400 group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white group-hover:text-sky-300 transition-colors">
                Match with Job Description
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Compare your profile vs target JD & analyze score
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold text-sky-400 group-hover:translate-x-1 transition-transform">→</span>
        </button>
      </div>

      {!resume ? (
        /* Empty State */
        <div className="text-center py-10 bg-slate-950/40 rounded-2xl border border-dashed border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">📄 Upload your resume to auto-populate your profile</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              Select a PDF/DOCX file. AI will automatically extract skills, projects, and credentials directly into your profile sections. Existing saved data is strictly preserved.
            </p>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition-colors shadow-md shadow-rose-500/20 cursor-pointer"
          >
            <Upload className="w-4 h-4" /> Select PDF File
          </button>
        </div>
      ) : (
        /* Active Resume Card */
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 md:p-6 space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
                <FileCheck className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">{resume.fileName}</h3>
                  <span className="text-[10px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Auto-Populated
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <HardDrive className="w-3.5 h-3.5 text-slate-500" /> Size: {resume.fileSize}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" /> Uploaded: {resume.uploadDate}
                  </span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                onClick={() => setParserModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-emerald-400 rounded-xl text-xs font-semibold border border-slate-800 transition-colors cursor-pointer"
                title="Review Extraction Summary"
              >
                <ShieldCheck className="w-4 h-4" /> Review Summary
              </button>
              <button
                onClick={() => setViewModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-cyan-400 rounded-xl text-xs font-semibold border border-slate-800 transition-colors cursor-pointer"
                title="View Resume File Details"
              >
                <Eye className="w-4 h-4" /> File Details
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-emerald-400 rounded-xl text-xs font-semibold border border-slate-800 transition-colors cursor-pointer"
                title="Download Resume File"
              >
                <Download className="w-4 h-4" /> Download
              </button>
              <button
                onClick={() => setDeleteModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-rose-950/60 text-rose-400 rounded-xl text-xs font-semibold border border-slate-800 hover:border-rose-900 transition-colors cursor-pointer"
                title="Delete Resume Entry"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View File Details Modal */}
      {viewModalOpen && resume && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-rose-400" />
                <h3 className="text-lg font-bold text-white">{resume.fileName}</h3>
              </div>
              <button onClick={() => setViewModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 space-y-4 font-mono text-xs text-slate-300">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <span className="text-slate-400">File Type:</span>
                <span className="text-white font-bold">{resume.fileType}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <span className="text-slate-400">File Size:</span>
                <span className="text-white font-bold">{resume.fileSize}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <span className="text-slate-400">Upload Date:</span>
                <span className="text-white font-bold">{resume.uploadDate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">AI Profile Population Status:</span>
                <span className="text-emerald-400 font-bold">✓ Automatically Populated Profile Fields</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setViewModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-700 hover:border-slate-600 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs shadow-md shadow-emerald-500/20 cursor-pointer"
              >
                <Download className="w-4 h-4" /> Download Resume File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Automatic Population Summary Review Modal */}
      <ResumeParserModal
        isOpen={parserModalOpen}
        onClose={() => setParserModalOpen(false)}
        extractedData={extractedData}
        error={parseError}
        isLoading={isUploading}
        onNavigateSection={onNavigateSection}
      />

      {/* ATS Resume Generator Modal */}
      <AtsResumeModal
        isOpen={atsModalOpen}
        onClose={() => setAtsModalOpen(false)}
      />

      {/* Job Description Match Modal */}
      <JobDescriptionMatchModal
        isOpen={jobMatchModalOpen}
        onClose={() => setJobMatchModalOpen(false)}
      />

      {/* Delete confirmation modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Resume File"
        itemDescription={resume?.fileName}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />

    </div>
  );
};

