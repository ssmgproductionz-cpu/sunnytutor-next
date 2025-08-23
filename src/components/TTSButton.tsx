'use client';

import { useCallback, useEffect, useState } from 'react';
import { Volume2, Square } from 'lucide-react';

export default function TTSButton({
  text,
  rate = 1,
  pitch = 1,
  className = '',
}: {
  text: string;
  rate?: number;
  pitch?: number;
  className?: string;
}) {
  const [support, setSupport] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setSupport('speechSynthesis' in window);
  }, []);

  const speak = useCallback(() => {
    if (!support || !text) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = rate;
    utter.pitch = pitch;
    utter.onend = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.cancel(); // stop anything else
    window.speechSynthesis.speak(utter);
  }, [support, text, rate, pitch]);

  const stop = useCallback(() => {
    if (!support) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, [support]);

  if (!support) {
    return (
      <button
        className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 shadow-sm border text-sm bg-white ${className}`}
        disabled
        title="Text-to-speech not supported on this device"
      >
        <Volume2 className="w-4 h-4" />
        Read aloud
      </button>
    );
  }

  return (
    <button
      onClick={speaking ? stop : speak}
      className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 shadow-sm border text-sm font-medium hover:shadow transition ${
        speaking ? 'bg-gray-100' : 'bg-white'
      } ${className}`}
      aria-label={speaking ? 'Stop reading' : 'Read aloud'}
    >
      {speaking ? <Square className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
      {speaking ? 'Stop' : 'Read aloud'}
    </button>
  );
}