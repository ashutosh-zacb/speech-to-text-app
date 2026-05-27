"use client";

import { useRef, useState } from "react";

export default function Home() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState("");
  const [transcript, setTranscript] = useState("Your converted text will appear here...");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    chunksRef.current = [];

    mediaRecorder.ondataavailable = (event) => {
      chunksRef.current.push(event.data);
    };

    mediaRecorder.onstop = async () => {
  const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
  const url = URL.createObjectURL(audioBlob);
  setAudioURL(url);

  const formData = new FormData();
  formData.append("file", audioBlob, "recording.webm");

  setTranscript("Uploading audio to backend...");

  try {
    const response = await fetch("http://127.0.0.1:5000/transcribe", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    setTranscript(data.transcript);
  } catch (error) {
    setTranscript("Error uploading audio to backend.");
  }
};

    mediaRecorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-2">
          Speech-to-Text Application
        </h1>

        <p className="text-center text-gray-600 mb-8">
          Record your voice and convert it into text.
        </p>

        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={startRecording}
            disabled={isRecording}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 transition text-white px-6 py-3 rounded-xl font-semibold shadow-md"
          >
            Start Recording
          </button>

          <button
            onClick={stopRecording}
            disabled={!isRecording}
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 transition text-white px-6 py-3 rounded-xl font-semibold shadow-md"
          >
            Stop Recording
          </button>
        </div>

        <p className="text-center mb-6 font-semibold">
          Status: {isRecording ? "Recording..." : "Not Recording"}
        </p>

        {audioURL && (
          <div className="mb-6">
            <audio controls src={audioURL} className="w-full" />
            <a href={audioURL} download="recording.webm" className="text-blue-600 underline">
              Download Recording
            </a>
          </div>
        )}

        <div className="border rounded-xl p-5 min-h-40 bg-gray-50">
          <h2 className="font-semibold mb-3">Transcript</h2>
          <p className="text-gray-500">{transcript}</p>
        </div>
      </div>
    </main>
  );
}