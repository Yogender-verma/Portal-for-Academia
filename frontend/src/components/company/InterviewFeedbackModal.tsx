import React, { useState, useEffect } from 'react';
import { X, CheckCircle, MessageSquare, Calendar, Loader2 } from 'lucide-react';
import type { InterviewItem } from '../../services/interviewApiService';
import { updateInterviewFeedback } from '../../services/interviewApiService';

interface InterviewFeedbackModalProps {
  interview: InterviewItem | null;
  isOpen: boolean;
  onClose: () => void;
  onFeedbackSaved: (updated: InterviewItem) => void;
}

export const InterviewFeedbackModal: React.FC<InterviewFeedbackModalProps> = ({
  interview,
  isOpen,
  onClose,
  onFeedbackSaved,
}) => {
  const [feedbackText, setFeedbackText] = useState('');
  const [ratingVal, setRatingVal] = useState('4.8 / 5.0');
  const [statusVal, setStatusVal] = useState('COMPLETED');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (interview) {
      setFeedbackText(interview.feedback || '');
      setRatingVal(interview.rating && interview.rating !== 'Not Rated' ? interview.rating : '4.8 / 5.0');
      setStatusVal(interview.status || 'COMPLETED');
      setError(null);
    }
  }, [interview]);

  if (!isOpen || !interview) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) {
      setError('Please provide feedback notes before saving.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await updateInterviewFeedback(interview.id, feedbackText.trim(), ratingVal, statusVal);
      const updatedItem: InterviewItem = {
        ...interview,
        feedback: feedbackText.trim(),
        rating: ratingVal,
        status: statusVal,
      };
      onFeedbackSaved(updatedItem);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update interview feedback');
    } finally {
      setSaving(false);
    }
  };

  const ratingOptions = [
    '5.0 / 5.0 (Exceptional)',
    '4.8 / 5.0 (Strong Hire)',
    '4.5 / 5.0 (Hire)',
    '4.0 / 5.0 (Good)',
    '3.5 / 5.0 (Needs Improvement)',
    '3.0 / 5.0 (Reject)',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Recruiter Evaluation & Feedback</h3>
              <p className="text-xs text-slate-400">Record evaluation notes, rating & interview status in PostgreSQL.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          {/* Candidate Summary Card */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-base font-bold text-white block">{interview.student_name}</span>
                <span className="text-slate-400 font-medium">{interview.student_college} • {interview.student_degree}</span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 font-bold text-xs">
                {interview.role}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-800/80 text-[11px]">
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                {interview.skill_match} Skill Match
              </span>
              <span className="px-2 py-0.5 rounded bg-violet-500/10 text-violet-400 border border-violet-500/20 font-bold">
                {interview.assessment_score} Code Score
              </span>
              <span className="text-slate-400 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-500" />
                {interview.proposed_date} at {interview.proposed_time}
              </span>
            </div>
          </div>

          {/* Rating Selection */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Recruiter Evaluation Rating *
            </label>
            <select
              value={ratingVal}
              onChange={(e) => setRatingVal(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500 font-medium"
            >
              {ratingOptions.map((opt, i) => (
                <option key={i} value={opt.split(' ')[0] + ' / 5.0'}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Status Selection */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Interview Outcome Status *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'COMPLETED', label: 'Completed (Passed)' },
                { id: 'ACCEPTED', label: 'Offer Recommended' },
                { id: 'SCHEDULED', label: 'Rescheduled' },
              ].map((st) => (
                <button
                  type="button"
                  key={st.id}
                  onClick={() => setStatusVal(st.id)}
                  className={`py-2 px-3 rounded-xl font-bold text-[11px] border transition-all text-center ${
                    statusVal === st.id
                      ? 'bg-sky-600/20 border-sky-500 text-sky-300 shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Feedback Textarea */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Evaluation Notes & Technical Feedback *
            </label>
            <textarea
              rows={4}
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Enter detailed evaluation notes regarding candidate technical performance, communication, problem solving, and offer recommendations..."
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-sky-600/30 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              <span>Save Feedback to PostgreSQL</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
