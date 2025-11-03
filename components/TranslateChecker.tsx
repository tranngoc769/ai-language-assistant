
import React, { useState, useCallback } from 'react';
import { translateAndCheck } from '../services/geminiService.ts';
import ResultCard from './common/ResultCard.tsx';
import LoadingSpinner from './common/LoadingSpinner.tsx';

const TranslateChecker: React.FC = () => {
    const [inputText, setInputText] = useState<string>('');
    const [resultText, setResultText] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleTranslate = useCallback(async () => {
        if (!inputText.trim()) return;
        setIsLoading(true);
        setError('');
        setResultText('');
        try {
            const translation = await translateAndCheck(inputText);
            setResultText(translation);
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [inputText]);

    return (
        <div className="flex flex-col gap-4">
            <div>
                <label htmlFor="vietnamese-input" className="block text-sm font-medium text-slate-700 mb-1">
                    Nhập câu tiếng Việt
                </label>
                <textarea
                    id="vietnamese-input"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Ví dụ: Chúc bạn một ngày tốt lành!"
                    rows={4}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow duration-200"
                    disabled={isLoading}
                />
            </div>
            <button
                onClick={handleTranslate}
                disabled={isLoading || !inputText.trim()}
                className="inline-flex items-center justify-center w-full px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors"
            >
                {isLoading ? (
                    <>
                        <LoadingSpinner />
                        Đang dịch...
                    </>
                ) : (
                    'Dịch sang tiếng Anh'
                )}
            </button>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <ResultCard isLoading={isLoading} resultText={resultText} />
        </div>
    );
};

export default TranslateChecker;