import React, { useState, useEffect, useMemo, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { marked } from 'marked';
import LoadingSpinner from './LoadingSpinner.tsx';
import AudioPlayer from './AudioPlayer.tsx';
import CopyButton from './CopyButton.tsx';

interface WordMeaningResult {
    text: string;
    ukAudio: string | null;
    usAudio: string | null;
}

interface ResultCardProps {
    isLoading: boolean;
    resultText?: string;
    resultData?: WordMeaningResult | null;
}

const ResultCard: React.FC<ResultCardProps> = ({ isLoading, resultText, resultData }) => {
    const [isCopied, setIsCopied] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);
    const rootsRef = useRef<ReactDOM.Root[]>([]);

    const textToDisplay = resultData?.text ?? resultText ?? '';
    const ukAudio = resultData?.ukAudio;
    const usAudio = resultData?.usAudio;

    useEffect(() => {
        if (textToDisplay) {
            setIsCopied(false);
        }
    }, [textToDisplay]);

    useEffect(() => {
        const newRoots: ReactDOM.Root[] = [];

        if (contentRef.current && textToDisplay) {
            // 1. Mount Audio Players
            const mountPlayer = (type: 'uk' | 'us', audioData: string | null) => {
                if (audioData) {
                    const placeholder = contentRef.current?.querySelector(`[data-placeholder="${type}-audio"]`);
                    if (placeholder && !placeholder.hasChildNodes()) {
                        const root = ReactDOM.createRoot(placeholder);
                        root.render(<AudioPlayer audioData={audioData} />);
                        newRoots.push(root);
                    }
                }
            };
            mountPlayer('uk', ukAudio);
            mountPlayer('us', usAudio);

            // 2. Mount Copy Buttons for example sentences
            const exampleCopyPlaceholders = contentRef.current.querySelectorAll<HTMLElement>('[data-copy-placeholder="example"]');
            exampleCopyPlaceholders.forEach(placeholder => {
                const parentLi = placeholder.closest('li');
                if (parentLi) {
                    const liClone = parentLi.cloneNode(true) as HTMLElement;
                    liClone.querySelector('[data-copy-placeholder="example"]')?.remove();
                    const textToCopy = liClone.textContent?.trim().replace(/\s+/g, ' ') || '';
                    
                    if (textToCopy && !placeholder.hasChildNodes()) {
                        placeholder.style.display = 'inline-flex';
                        placeholder.style.alignItems = 'center';
                        placeholder.style.verticalAlign = 'middle';

                        const root = ReactDOM.createRoot(placeholder);
                        root.render(<CopyButton textToCopy={textToCopy} />);
                        newRoots.push(root);
                    }
                }
            });

            // 3. Mount Copy Buttons for pronunciations
            const pronunciationCopyPlaceholders = contentRef.current.querySelectorAll<HTMLElement>('[data-copy-placeholder="pronunciation"]');
            pronunciationCopyPlaceholders.forEach(placeholder => {
                const parentLi = placeholder.closest('li');
                if (parentLi) {
                    const phoneticSpan = parentLi.querySelector('.phonetic-text');
                    const textToCopy = phoneticSpan?.textContent?.trim() || '';

                    if (textToCopy && !placeholder.hasChildNodes()) {
                        placeholder.style.display = 'inline-flex';
                        placeholder.style.alignItems = 'center';
                        placeholder.style.verticalAlign = 'middle';

                        const root = ReactDOM.createRoot(placeholder);
                        root.render(<CopyButton textToCopy={textToCopy} />);
                        newRoots.push(root);
                    }
                }
            });
        }
        
        rootsRef.current = newRoots;

        // Cleanup function for this effect
        return () => {
            rootsRef.current.forEach(root => root.unmount());
            rootsRef.current = [];
        };
    }, [textToDisplay, ukAudio, usAudio]);

    const handleCopy = () => {
        if (textToDisplay) {
            navigator.clipboard.writeText(textToDisplay);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }
    };

    const renderedHtml = useMemo(() => {
        if (!textToDisplay) return { __html: '' };
        const rawHtml = marked.parse(textToDisplay, { breaks: true, gfm: true }) as string;
        return { __html: rawHtml };
    }, [textToDisplay]);

    const hasContent = !isLoading && textToDisplay;

    return (
        <div className="mt-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">
                Kết quả
            </label>
            <div className="relative w-full min-h-[116px] p-4 bg-slate-100 border border-slate-200 rounded-lg flex items-start">
                {isLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-500 bg-slate-100/80 rounded-lg">
                        <LoadingSpinner />
                        <span>AI is thinking...</span>
                    </div>
                )}
                {!isLoading && !textToDisplay && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <p className="text-slate-400 text-center">Your result will appear here.</p>
                    </div>
                )}
                {hasContent && (
                    <div
                        ref={contentRef}
                        className="w-full text-slate-800 result-content"
                        dangerouslySetInnerHTML={renderedHtml}
                    />
                )}
                {hasContent && (
                    <button
                        onClick={handleCopy}
                        className="absolute top-2 right-2 p-2 rounded-md bg-white hover:bg-slate-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                        aria-label="Copy to clipboard"
                    >
                        {isCopied ? <CheckIcon /> : <CopyIcon />}
                    </button>
                )}
            </div>
        </div>
    );
};

const CopyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);

export default ResultCard;