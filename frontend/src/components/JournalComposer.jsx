import React from "react";
import { Mic, Square, Sparkles } from "lucide-react";
import { useRef, useState } from "react";

export default function JournalComposer({ onSubmit, loading }) {
  const [text, setText] = useState("");
  const [recording, setRecording] = useState(false);
  const recognitionRef = useRef(null);
  const transcriptSetRef = useRef(new Set());

  const speechSupported = "webkitSpeechRecognition" in window || "SpeechRecognition" in window;

  function cleanTranscript(value) {
    const sentences = value
      .replace(/\s+/g, " ")
      .trim()
      .split(/(?<=[.!?])\s+/)
      .filter(Boolean);
    return sentences.filter((sentence, index) => sentences.indexOf(sentence) === index).join(" ");
  }

  function toggleRecording() {
    if (!speechSupported) return;

    if (recording) {
      recognitionRef.current?.stop();
      setRecording(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.onresult = (event) => {
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];

        if (result.isFinal) {
          const transcript = result[0].transcript.replace(/\s+/g, " ").trim();
          if (transcript && !transcriptSetRef.current.has(transcript.toLowerCase())) {
            transcriptSetRef.current.add(transcript.toLowerCase());
            finalTranscript += transcript + " ";
          }
        }
      }

      if (finalTranscript) {
        setText((prev) => cleanTranscript(`${prev} ${finalTranscript}`));
      }
    };
    recognition.onend = () => {
      setRecording(false);
      transcriptSetRef.current.clear();
    };
    recognitionRef.current = recognition;
    recognition.start();
    setRecording(true);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const value = text.trim();
    if (!value || loading) return;
    await onSubmit(value);
    setText("");
    transcriptSetRef.current.clear();
  }

  return (
    <form onSubmit={handleSubmit} className="border-b border-slate-200 bg-white px-5 py-5 md:px-8">
      <div className="flex flex-col gap-4 lg:flex-row">
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Write what happened, what it meant, and what you keep circling back to..."
          className="min-h-32 flex-1 resize-none rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-100"
        />
        <div className="flex w-full flex-row gap-3 lg:w-48 lg:flex-col">
          <button
            type="button"
            onClick={toggleRecording}
            disabled={!speechSupported}
            title={speechSupported ? "Toggle voice input" : "Speech input is not supported in this browser"}
            className={`flex h-12 flex-1 items-center justify-center gap-2 rounded-lg border text-sm font-semibold transition lg:flex-none ${
              recording
                ? "border-rose-300 bg-rose-50 text-rose-700"
                : "border-slate-200 bg-white text-slate-700 hover:border-teal-400 hover:text-teal-700"
            } disabled:cursor-not-allowed disabled:opacity-50`}
          >
            {recording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            {recording ? "Stop" : "Voice"}
          </button>
          <button
            type="submit"
            disabled={loading || !text.trim()}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white shadow-soft transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300 lg:flex-none"
          >
            <Sparkles className="h-4 w-4" />
            {loading ? "Analyzing" : "Reflect"}
          </button>
        </div>
      </div>
    </form>
  );
}
