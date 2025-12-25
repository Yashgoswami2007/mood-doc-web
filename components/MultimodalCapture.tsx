
import React, { useRef, useState, useEffect } from 'react';
import { Camera, Mic, Play, Square, Loader2, Sparkles, AlertCircle, RefreshCcw } from 'lucide-react';
import { analyzeMultimodalMood } from '../services/geminiService';
import { MoodState, SupportMode } from '../types';

interface MultimodalCaptureProps {
  conversationId: string;
  onAnalysisComplete: (mood: MoodState, mode: SupportMode, response: string) => void;
  history?: { role: 'user' | 'assistant'; content: string }[];
}

const MultimodalCapture: React.FC<MultimodalCaptureProps> = ({ conversationId, onAnalysisComplete, history = [] }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [capturedImageBase64, setCapturedImageBase64] = useState<string | null>(null);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      setError(null);
      const constraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user"
        }
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setIsCameraActive(true);
        };
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      setError("Failed to access camera. Please ensure permissions are granted and no other app is using it.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => {
        track.stop();
        console.log("Stopped track:", track.label);
      });
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
    }
  };

  const captureFrame = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context && videoRef.current.videoWidth > 0) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        // Use quality 0.8 for better balance between speed and clarity
        const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.8);
        const base64 = dataUrl.split(',')[1];
        setCapturedImageBase64(base64);
        stopCamera();
      } else {
        setError("Camera not ready. Please wait a second.");
      }
    }
  };

  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1];
          setAudioBase64(base64);
        };
        reader.readAsDataURL(blob);
        stream.getTracks().forEach(t => t.stop());
      };

      recorder.start();
      setIsRecording(true);
    } catch (err: any) {
      console.error("Mic access error:", err);
      setError("Failed to access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleAnalyze = async () => {
    if (!capturedImageBase64 && !audioBase64) {
      setError("Please capture an image or record a voice note for analysis.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    try {
      // Ensure history is correctly formatted for Gemini parts
      const formattedHistory = history.map(h => ({ role: h.role, content: h.content }));
      
      const data = await analyzeMultimodalMood(
        undefined, // no text input in this step
        capturedImageBase64 || undefined,
        audioBase64 || undefined,
        formattedHistory
      );

      onAnalysisComplete(data.mood_state, data.mode, data.response);
    } catch (err: any) {
      console.error("Analysis Error:", err);
      setError("Emotional sync failed. " + (err.message || "Please check your connection and try again."));
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-6 overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full max-h-[400px]">
        {/* Camera Section */}
        <div className="relative bg-gray-950 dark:bg-black rounded-3xl overflow-hidden flex items-center justify-center min-h-[250px] border-4 border-gray-100 dark:border-slate-800 shadow-inner group transition-all">
          {!isCameraActive && !capturedImageBase64 && (
            <button 
              onClick={startCamera}
              className="flex flex-col items-center gap-4 text-white hover:scale-105 transition-transform active:scale-95"
            >
              <div className="p-5 bg-white/10 rounded-full backdrop-blur-lg border border-white/20">
                <Camera size={36} />
              </div>
              <span className="font-bold text-sm uppercase tracking-widest opacity-80">Enable Camera</span>
            </button>
          )}
          
          {isCameraActive && (
            <>
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline
                muted 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 border-[20px] border-white/10 pointer-events-none rounded-3xl" />
              <button 
                onClick={captureFrame}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 p-5 bg-white text-indigo-600 rounded-full shadow-2xl transition-all hover:scale-110 active:scale-90"
              >
                <Camera size={28} />
              </button>
            </>
          )}

          {capturedImageBase64 && (
            <>
              <img 
                src={`data:image/jpeg;base64,${capturedImageBase64}`} 
                className="w-full h-full object-cover animate-in fade-in zoom-in"
                alt="Captured"
              />
              <button 
                onClick={() => { setCapturedImageBase64(null); startCamera(); }}
                className="absolute top-4 right-4 px-4 py-2 bg-black/60 backdrop-blur-md text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black/80 transition-all flex items-center gap-2"
              >
                <RefreshCcw size={14} /> Retake
              </button>
            </>
          )}
        </div>

        {/* Audio Section */}
        <div className="bg-indigo-50 dark:bg-slate-800/50 rounded-3xl p-8 flex flex-col items-center justify-center border-4 border-indigo-100 dark:border-slate-700 shadow-sm relative group">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-100 dark:bg-slate-700 overflow-hidden">
             {isRecording && <div className="h-full bg-indigo-600 animate-[progress_2s_linear_infinite]" />}
          </div>
          
          <div className={`p-8 rounded-[2rem] transition-all duration-500 shadow-lg ${isRecording ? 'bg-red-500 text-white scale-110 rotate-3' : 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400'}`}>
            <Mic size={52} className={isRecording ? 'animate-pulse' : ''} />
          </div>
          
          <h3 className="mt-8 font-black text-indigo-900 dark:text-indigo-100 tracking-tight text-center">
            {isRecording ? "Analyzing tone..." : audioBase64 ? "Vocal pattern captured" : "Record Voice Note"}
          </h3>
          <p className="text-indigo-400 dark:text-slate-500 text-[11px] font-bold uppercase tracking-widest mt-1">
             {isRecording ? "Listening" : audioBase64 ? "Voice ready" : "Share how you feel"}
          </p>
          
          <div className="mt-8 flex gap-4">
            {!isRecording ? (
              <button 
                onClick={startRecording}
                className="flex items-center gap-3 px-8 py-4 bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 rounded-2xl font-black text-sm shadow-md hover:shadow-xl transition-all active:scale-95 border border-indigo-100 dark:border-slate-600"
              >
                <Play size={18} fill="currentColor" />
                {audioBase64 ? "Record Again" : "Start Mic"}
              </button>
            ) : (
              <button 
                onClick={stopRecording}
                className="flex items-center gap-3 px-8 py-4 bg-red-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-red-100 animate-pulse"
              >
                <Square size={18} fill="currentColor" />
                Stop
              </button>
            )}
          </div>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {error && (
        <div className="flex items-center gap-3 p-5 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-2xl border border-red-100 dark:border-red-900/20 animate-in fade-in slide-in-from-top-2">
          <AlertCircle size={24} />
          <p className="text-sm font-bold leading-relaxed">{error}</p>
        </div>
      )}

      <div className="mt-auto">
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing || (!capturedImageBase64 && !audioBase64)}
          className="w-full py-6 bg-indigo-600 text-white rounded-3xl font-black text-lg flex items-center justify-center gap-3 shadow-2xl shadow-indigo-100 dark:shadow-none disabled:opacity-50 transition-all hover:bg-indigo-700 active:scale-[0.98]"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="animate-spin" />
              Processing Emotion Sync...
            </>
          ) : (
            <>
              <Sparkles size={24} />
              Run Full Diagnostic
            </>
          )}
        </button>
      </div>

      <style>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default MultimodalCapture;
