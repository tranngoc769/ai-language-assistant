import React, { useState, useCallback, useRef } from 'react';
import { decode, decodeAudioData } from '../../utils.ts';

interface AudioPlayerProps {
    audioData: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioData }) => {
    const [isDecoding, setIsDecoding] = useState(false);
    const audioContextRef = useRef<AudioContext | null>(null);

    const playAudio = useCallback(async () => {
        if (!audioData || isDecoding) return;
        setIsDecoding(true);

        try {
            if (!audioContextRef.current) {
                // FIX: Cast window to `any` to support `webkitAudioContext` for older Safari versions and resolve TypeScript error.
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            }
            const audioContext = audioContextRef.current;
            const decodedBytes = decode(audioData);
            const audioBuffer = await decodeAudioData(decodedBytes, audioContext, 24000, 1);
            
            const source = audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContext.destination);
            source.start();
        } catch (error) {
            console.error("Failed to play audio:", error);
        } finally {
            setIsDecoding(false);
        }
    }, [audioData, isDecoding]);
    
    return (
        <button
            onClick={playAudio}
            disabled={isDecoding}
            className="ml-2 inline-flex items-center justify-center p-1 rounded-full text-indigo-600 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:text-slate-400 disabled:bg-transparent"
            aria-label="Play pronunciation"
        >
            {isDecoding ? <SpinnerIcon /> : <SpeakerIcon />}
        </button>
    );
};

const SpeakerIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
    </svg>
);

const SpinnerIcon = () => (
     <svg className="animate-spin h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

export default AudioPlayer;