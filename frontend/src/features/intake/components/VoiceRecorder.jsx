import React, { useRef, useState, useEffect } from "react";
import {
  Mic,
  Square,
  Trash2,
  Play,
  Pause,
  CheckCircle2,
} from "lucide-react";

const VoiceRecorder = ({
  onRecordingComplete,
  onTranscriptChange,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });

        const url = URL.createObjectURL(audioBlob);

        setAudioUrl(url);

        if (onRecordingComplete) {
          onRecordingComplete(audioBlob);
        }

        // Stop microphone tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();

      setRecordingTime(0);
      setIsRecording(true);

      timerRef.current = setInterval(() => {
        setRecordingTime((previousTime) => previousTime + 1);
      }, 1000);
    } catch (error) {
      console.error("Microphone access error:", error);

      alert(
        "Unable to access the microphone. Please allow microphone permission."
      );
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
    }

    setIsRecording(false);

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const deleteRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }

    setAudioUrl(null);
    setRecordingTime(0);
    setIsPlaying(false);
    audioChunksRef.current = [];

    if (onRecordingComplete) {
      onRecordingComplete(null);
    }

    if (onTranscriptChange) {
      onTranscriptChange("");
    }
  };

  const togglePlayback = () => {
    if (!audioRef.current) {
      return;
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  return (
    <div className="space-y-5">
      {/* Recording Area */}
      {!audioUrl && (
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-6 text-center">
          <button
            type="button"
            onClick={
              isRecording ? stopRecording : startRecording
            }
            className={`mx-auto flex h-24 w-24 items-center justify-center rounded-full transition-all duration-200 ${
              isRecording
                ? "animate-pulse bg-red-500 text-white"
                : "bg-emerald-700 text-white hover:scale-105 active:scale-95"
            }`}
          >
            {isRecording ? (
              <Square size={30} fill="currentColor" />
            ) : (
              <Mic size={34} />
            )}
          </button>

          <h3 className="mt-5 text-lg font-semibold text-slate-800">
            {isRecording
              ? "Listening..."
              : "Tap to Start Speaking"}
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            {isRecording
              ? "Speak naturally about your health concern."
              : "You can explain your symptoms in your own words."}
          </p>

          {isRecording && (
            <div className="mt-5 flex items-center justify-center gap-3">
              <span className="h-3 w-3 animate-pulse rounded-full bg-red-500" />

              <span className="font-mono text-lg font-semibold text-red-600">
                {formatTime(recordingTime)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Recorded Audio */}
      {audioUrl && (
        <div className="rounded-2xl border border-emerald-200 bg-white p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
              <CheckCircle2
                size={23}
                className="text-emerald-700"
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="font-semibold text-slate-800">
                Recording Complete
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Duration: {formatTime(recordingTime)}
              </p>
            </div>
          </div>

          <audio
            ref={audioRef}
            src={audioUrl}
            onEnded={handleAudioEnded}
          />

          <div className="mt-5 flex gap-3">
            {/* Play Button */}
            <button
              type="button"
              onClick={togglePlayback}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-medium text-white transition hover:bg-emerald-800"
            >
              {isPlaying ? (
                <>
                  <Pause size={18} />
                  Pause
                </>
              ) : (
                <>
                  <Play size={18} />
                  Play Recording
                </>
              )}
            </button>

            {/* Delete Button */}
            <button
              type="button"
              onClick={deleteRecording}
              className="flex items-center justify-center rounded-xl border border-red-200 px-4 text-red-600 transition hover:bg-red-50"
              title="Delete recording"
            >
              <Trash2 size={19} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;