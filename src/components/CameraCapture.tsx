import React, { useRef, useState, useCallback } from 'react';
import { Camera, RefreshCw, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CameraCaptureProps {
  onCapture: (base64: string) => void;
  onClose: () => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Camera access denied or not available.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      setIsStreaming(false);
    }
  }, []);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
        stopCamera();
      }
    }
  };

  const retake = () => {
    setCapturedImage(null);
    startCamera();
  };

  const confirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
    }
  };

  React.useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center"
    >
      <div className="relative w-full max-w-2xl aspect-[3/4] bg-neutral-900 overflow-hidden rounded-2xl">
        {!capturedImage ? (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover"
          />
        ) : (
          <img 
            src={capturedImage} 
            alt="Captured" 
            className="w-full h-full object-cover"
          />
        )}
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      <div className="mt-8 flex gap-6 items-center">
        {!capturedImage ? (
          <button 
            onClick={capturePhoto}
            className="w-20 h-20 bg-white rounded-full flex items-center justify-center border-4 border-accent-rose/30 hover:scale-105 transition-transform"
          >
            <div className="w-16 h-16 bg-accent-rose rounded-full flex items-center justify-center text-white">
              <Camera size={32} />
            </div>
          </button>
        ) : (
          <>
            <button 
              onClick={retake}
              className="flex flex-col items-center gap-2 text-white"
            >
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                <RefreshCw size={24} />
              </div>
              <span className="text-xs uppercase tracking-widest font-medium">Retake</span>
            </button>
            <button 
              onClick={confirm}
              className="flex flex-col items-center gap-2 text-white"
            >
              <div className="w-14 h-14 bg-accent-rose rounded-full flex items-center justify-center hover:bg-rose-600 transition-colors">
                <Check size={24} />
              </div>
              <span className="text-xs uppercase tracking-widest font-medium">Confirm</span>
            </button>
          </>
        )}
      </div>
      
      <canvas ref={canvasRef} className="hidden" />
    </motion.div>
  );
};
