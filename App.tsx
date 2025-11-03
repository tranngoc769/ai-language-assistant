import React, { useState, useCallback } from 'react';
import { AppMode } from './types.ts';
import TranslateChecker from './components/TranslateChecker.tsx';
import GrammarCorrector from './components/GrammarCorrector.tsx';
import WordMeaningChecker from './components/WordMeaningChecker.tsx';

// FIX: Replaced JSX.Element with React.ReactNode to resolve TypeScript error "Cannot find namespace 'JSX'".
const TabButton = ({ label, icon, isActive, onClick }: { label: string, icon: React.ReactNode, isActive: boolean, onClick: () => void }) => (
    <button
        onClick={onClick}
        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm sm:text-base font-semibold rounded-lg transition-all duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-slate-100 ${
            isActive
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
        }`}
    >
        {icon}
        {label}
    </button>
);

const App: React.FC = () => {
    const [mode, setMode] = useState<AppMode>(AppMode.Translate);

    const handleSetMode = useCallback((newMode: AppMode) => {
        setMode(newMode);
    }, []);

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-900 to-slate-800">
            <div className="w-full max-w-2xl mx-auto">
                <header className="text-center mb-8">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                        AI Language <span className="text-indigo-400">Assistant</span>
                    </h1>
                    <p className="mt-2 text-lg text-slate-400">
                        Powered by Gemini
                    </p>
                </header>
                
                <main className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
                    <div className="flex gap-2 sm:gap-4 p-2 bg-slate-100 rounded-xl mb-6">
                        <TabButton
                            label="Dịch & Kiểm tra"
                            icon={<TranslateIcon />}
                            isActive={mode === AppMode.Translate}
                            onClick={() => handleSetMode(AppMode.Translate)}
                        />
                        <TabButton
                            label="Sửa ngữ pháp"
                            icon={<GrammarIcon />}
                            isActive={mode === AppMode.Grammar}
                            onClick={() => handleSetMode(AppMode.Grammar)}
                        />
                         <TabButton
                            label="Kiểm tra nghĩa"
                            icon={<WordMeaningIcon />}
                            isActive={mode === AppMode.WordMeaning}
                            onClick={() => handleSetMode(AppMode.WordMeaning)}
                        />
                    </div>

                    <div>
                        {mode === AppMode.Translate && <TranslateChecker />}
                        {mode === AppMode.Grammar && <GrammarCorrector />}
                        {mode === AppMode.WordMeaning && <WordMeaningChecker />}
                    </div>
                </main>

                 <footer className="text-center mt-8">
                    <p className="text-sm text-slate-500">
                        A world-class UI/UX by a Senior Frontend React Engineer.
                    </p>
                </footer>
            </div>
        </div>
    );
};

const TranslateIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h12M9 3v2m4 13-4-4m0 0l4-4m-4 4h12M17 11a2 2 0 104 0 2 2 0 10-4 0z" />
    </svg>
);

const GrammarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);

const WordMeaningIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
);


export default App;