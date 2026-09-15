import React, { useState } from 'react';
import type { SavedCodeSnippet } from '../../types/assessment';
import { LANGUAGE_CONFIGS, downloadSourceCode } from '../../services/compilerService';
import { DeleteConfirmModal } from '../profile/DeleteConfirmModal';
import { FolderCode, Download, ExternalLink, Trash2, Clock } from 'lucide-react';

interface MyCodeProps {
  snippets: SavedCodeSnippet[];
  onOpenSnippet: (snippet: SavedCodeSnippet) => void;
  onDeleteSnippet: (id: string) => void;
}

export const MyCode: React.FC<MyCodeProps> = ({ snippets, onOpenSnippet, onDeleteSnippet }) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (!snippets || snippets.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-3">
        <FolderCode className="w-10 h-10 text-indigo-400 mx-auto opacity-60" />
        <h3 className="text-sm font-bold text-white">No Saved Code Snippets Yet</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Write code in the editor and click <strong>Save</strong> to store your code projects locally.
        </p>
      </div>
    );
  }

  const handleDelete = () => {
    if (deletingId) {
      onDeleteSnippet(deletingId);
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <FolderCode className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-bold text-white">My Code / Project History</h3>
        </div>
        <span className="text-xs font-mono font-bold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-full">
          {snippets.length} Saved Snippets
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {snippets.map((snippet) => {
          const config = LANGUAGE_CONFIGS[snippet.language] || LANGUAGE_CONFIGS.javascript;

          return (
            <div
              key={snippet.id}
              className="bg-slate-950/80 border border-slate-800 hover:border-indigo-500/40 rounded-xl p-4 space-y-3 transition-all flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded">
                    {config.name} ({config.extension})
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(snippet.lastEditedAt).toLocaleDateString()}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-white truncate">{snippet.title}</h4>
                <pre className="p-2 bg-slate-900 rounded-lg text-[10px] text-slate-400 font-mono line-clamp-3 leading-relaxed border border-slate-850">
                  {snippet.code}
                </pre>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-900 gap-2">
                <button
                  onClick={() => onOpenSnippet(snippet)}
                  className="flex-1 py-1.5 bg-slate-900 hover:bg-indigo-600 text-slate-300 hover:text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer border border-slate-800"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open</span>
                </button>

                <button
                  onClick={() => downloadSourceCode(snippet.code, snippet.language, snippet.title)}
                  className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 rounded-lg text-xs transition-all cursor-pointer border border-slate-800"
                  title="Download snippet file"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => setDeletingId(snippet.id)}
                  className="p-1.5 bg-slate-900 hover:bg-rose-950 text-slate-400 hover:text-rose-400 rounded-lg text-xs transition-all cursor-pointer border border-slate-800"
                  title="Delete snippet"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <DeleteConfirmModal
          isOpen={true}
          title="Delete Saved Code Snippet"
          itemDescription="saved code snippet"
          onConfirm={handleDelete}
          onCancel={() => setDeletingId(null)}
        />
      )}
    </div>
  );
};
