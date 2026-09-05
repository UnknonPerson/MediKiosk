import React, { useEffect, useState } from "react";
import {
  Volume2,
  Pause,
  Play,
  Loader2,
} from "lucide-react";

const AudioPrompt = ({
  text = "",
  autoPlay = false,
  onPlayingChange,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    if (!("speechSynthesis" in window)) {
      setIsSupported(false);
    }

    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    if (autoPlay && text) {
      playAudio();
    }
  }, [text, autoPlay]);

  const playAudio = () => {
    if (!isSupported || !text) return;

    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(text);

    speech.rate = 0.9;
    speech.pitch = 1;

    speech.onstart = () => {
      setIsPlaying(true);

      if (onPlayingChange) {
        onPlayingChange(true);
      }
    };

    speech.onend = () => {
      setIsPlaying(false);

      if (onPlayingChange) {
        onPlayingChange(false);
      }
    };

    speech.onerror = () => {
      setIsPlaying(false);

      if (onPlayingChange) {
        onPlayingChange(false);
      }
    };

    window.speechSynthesis.speak(speech);
  };

  const stopAudio = () => {
    window.speechSynthesis.cancel();

    setIsPlaying(false);

    if (onPlayingChange) {
      onPlayingChange(false);
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={isPlaying ? stopAudio : playAudio}
      disabled={!text}
      className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition ${
        isPlaying
          ? "border-emerald-300 bg-emerald-50 text-emerald-700"
          : "border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50"
      } ${
        !text
          ? "cursor-not-allowed opacity-50"
          : ""
      }`}
    >
      {isPlaying ? (
        <>
          <Pause size={18} />
          Stop Audio
        </>
      ) : (
        <>
          <Volume2 size={18} />
          Listen to Question
        </>
      )}
    </button>
  );
};

export default AudioPrompt;