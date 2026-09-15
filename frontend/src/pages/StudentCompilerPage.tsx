import React, { useState, useEffect } from 'react';
import { useStudentProfile } from '../context/StudentProfileContext';
import type { SupportedLanguage, CodingQuestion, ExecutionResponse, CodingAssessmentResult, SavedCodeSnippet } from '../types/assessment';
import { LANGUAGE_CONFIGS, executeCode, runAssessmentEvaluation } from '../services/compilerService';
import { CODING_QUESTIONS } from '../data/codingQuestions';
import { LanguageSelector } from '../components/compiler/LanguageSelector';
import { CodeEditor } from '../components/compiler/CodeEditor';
import { ProblemPanel } from '../components/compiler/ProblemPanel';
import { OutputPanel } from '../components/compiler/OutputPanel';
import { TestResults } from '../components/compiler/TestResults';
import { RecommendedAssessments } from '../components/compiler/RecommendedAssessments';
import { MyCode } from '../components/compiler/MyCode';
import { Save, Code2 } from 'lucide-react';

export const StudentCompilerPage: React.FC = () => {
  const { profile, saveCodeSnippet, deleteCodeSnippet, recordAssessmentResult } = useStudentProfile();

  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>('javascript');
  const [currentQuestion, setCurrentQuestion] = useState<CodingQuestion>(CODING_QUESTIONS[0]);
  const [mode, setMode] = useState<'practice' | 'assessment'>('practice');

  const [code, setCode] = useState<string>(() => {
    return currentQuestion.defaultCode[selectedLanguage] || '// Write code here...';
  });

  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResponse | null>(null);
  const [assessmentResult, setAssessmentResult] = useState<CodingAssessmentResult | null>(null);
  const [activeOutputTab, setActiveOutputTab] = useState<'console' | 'preview'>('console');
  const [savedSuccessMsg, setSavedSuccessMsg] = useState<string | null>(null);

  // When language or question changes, update code template
  useEffect(() => {
    const template = currentQuestion.defaultCode[selectedLanguage] || LANGUAGE_CONFIGS[selectedLanguage]?.description || '';
    setCode(template);
    setExecutionResult(null);
    setAssessmentResult(null);
    if (selectedLanguage === 'html' || selectedLanguage === 'css' || selectedLanguage === 'react') {
      setActiveOutputTab('preview');
    } else {
      setActiveOutputTab('console');
    }
  }, [selectedLanguage, currentQuestion]);

  // Handle Run Code
  const handleRun = async () => {
    setIsExecuting(true);
    setExecutionResult(null);

    const result = await executeCode(selectedLanguage, code);
    setExecutionResult(result);
    setIsExecuting(false);

    if (selectedLanguage === 'html' || selectedLanguage === 'css' || selectedLanguage === 'react') {
      setActiveOutputTab('preview');
    } else {
      setActiveOutputTab('console');
    }
  };

  // Handle Submit Assessment
  const handleSubmitAssessment = async () => {
    setIsExecuting(true);
    setAssessmentResult(null);

    const evaluation = await runAssessmentEvaluation(currentQuestion, selectedLanguage, code);
    setAssessmentResult(evaluation);

    // Save assessment score into StudentProfileContext (updates skill gap analysis & roadmap)
    await recordAssessmentResult(evaluation);
    setIsExecuting(false);
  };

  // Handle Save Code
  const handleSaveSnippet = async () => {
    const title = currentQuestion?.title ? `${currentQuestion.title} (${LANGUAGE_CONFIGS[selectedLanguage].name})` : `My ${LANGUAGE_CONFIGS[selectedLanguage].name} Snippet`;
    const success = await saveCodeSnippet({
      title,
      language: selectedLanguage,
      code,
      questionId: currentQuestion?.id,
    });

    if (success) {
      setSavedSuccessMsg('✓ Code saved to profile!');
      setTimeout(() => setSavedSuccessMsg(null), 3000);
    }
  };

  // Handle Reset Code Template
  const handleReset = () => {
    const template = currentQuestion.defaultCode[selectedLanguage] || '';
    setCode(template);
    setExecutionResult(null);
    setAssessmentResult(null);
  };

  // Handle Open Snippet from MyCode
  const handleOpenSnippet = (snippet: SavedCodeSnippet) => {
    setSelectedLanguage(snippet.language);
    setCode(snippet.code);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* 1. HERO HEADER BANNER */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-indigo-500/30 bg-indigo-950/20 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400">
              <Code2 className="w-4 h-4" />
              <span>SkillBridge Skill Assessment Lab</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Code Compiler & Skill Assessment Engine
            </h1>
            <p className="text-xs sm:text-sm text-indigo-200 font-medium">
              Practice • Assess • Improve — Real-time execution across 12 technologies linked to Skill Gap Intelligence.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveSnippet}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/25 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Code</span>
            </button>

            {savedSuccessMsg && (
              <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/30 animate-in fade-in">
                {savedSuccessMsg}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2. TOP TOOLBAR: LANGUAGE & MODE CONTROLS */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <LanguageSelector
          selectedLanguage={selectedLanguage}
          onSelectLanguage={(lang) => setSelectedLanguage(lang)}
        />

        <div className="flex items-center gap-3 text-xs">
          <span className="text-slate-400 font-semibold hidden sm:inline">Execution Mode:</span>
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-1">
            <button
              onClick={() => setMode('practice')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                mode === 'practice'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Practice Mode
            </button>
            <button
              onClick={() => setMode('assessment')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                mode === 'assessment'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Assessment Mode
            </button>
          </div>
        </div>
      </div>

      {/* 3. MAIN IDE SPLIT LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[580px]">
        
        {/* Left Column: Problem Panel */}
        <div className="lg:col-span-5 flex flex-col min-h-[400px]">
          <ProblemPanel
            question={currentQuestion}
            mode={mode}
            onToggleMode={(m) => setMode(m)}
            questionsList={CODING_QUESTIONS}
            onSelectQuestion={(q) => setCurrentQuestion(q)}
          />
        </div>

        {/* Right Column: Code Editor + Output Panel */}
        <div className="lg:col-span-7 flex flex-col space-y-6">
          
          {/* Code Editor */}
          <div className="h-[380px]">
            <CodeEditor
              code={code}
              onChangeCode={setCode}
              selectedLanguage={selectedLanguage}
              onRun={handleRun}
              onSubmit={mode === 'assessment' ? handleSubmitAssessment : undefined}
              onReset={handleReset}
              isExecuting={isExecuting}
              questionTitle={currentQuestion.title}
              mode={mode}
            />
          </div>

          {/* Output Panel or Assessment Results */}
          <div className="min-h-[220px]">
            {assessmentResult ? (
              <TestResults
                assessmentResult={assessmentResult}
                onClose={() => setAssessmentResult(null)}
              />
            ) : (
              <OutputPanel
                language={selectedLanguage}
                code={code}
                executionResult={executionResult}
                activeTab={activeOutputTab}
                onChangeTab={setActiveOutputTab}
              />
            )}
          </div>

        </div>

      </div>

      {/* 4. RECOMMENDED ASSESSMENTS BASED ON TARGET ROLE */}
      <RecommendedAssessments
        onSelectAssessment={(q) => {
          setCurrentQuestion(q);
          setMode('assessment');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        questions={CODING_QUESTIONS}
      />

      {/* 5. MY CODE / SAVED SNIPPETS */}
      <MyCode
        snippets={profile.savedCodeSnippets || []}
        onOpenSnippet={handleOpenSnippet}
        onDeleteSnippet={deleteCodeSnippet}
      />

    </div>
  );
};
