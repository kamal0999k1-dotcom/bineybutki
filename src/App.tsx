import React, { useState, useCallback } from 'react';
import { 
  Upload, 
  Camera as CameraIcon, 
  FileText, 
  Sparkles, 
  BookOpen, 
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { analyzeQuestion } from './services/gemini';
import { CameraCapture } from './components/CameraCapture';

export default function App() {
  const [file, setFile] = useState<{ data: string; type: string } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFile({
          data: reader.result as string,
          type: selectedFile.type
        });
        setAnswer(null);
        setError(null);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleCameraCapture = (base64: string) => {
    setFile({
      data: base64,
      type: 'image/jpeg'
    });
    setShowCamera(false);
    setAnswer(null);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!file) return;
    
    setIsAnalyzing(true);
    setError(null);
    try {
      const result = await analyzeQuestion(file.data, file.type);
      setAnswer(result || "माफ गर्नुहोस्, कुनै उत्तर फेला परेन।");
    } catch (err) {
      console.error(err);
      setError("AI विश्लेषण गर्दा समस्या भयो। कृपया फेरि प्रयास गर्नुहोस्।");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setAnswer(null);
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-8 md:py-12">
      {/* Header */}
      <header className="w-full max-w-4xl text-center mb-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-rose/10 text-accent-rose text-xs font-semibold tracking-widest uppercase mb-4"
        >
          <Sparkles size={14} />
          TU BBS 3rd Year Assistant
        </motion.div>
        <h1 className="display-text text-4xl md:text-6xl font-bold text-neutral-900 mb-4">
          BIney Butki Pukuli
        </h1>
        <p className="serif-text text-lg md:text-xl text-neutral-600 italic">
          तपाईंको परीक्षा तयारीको लागि भरपर्दो साथी
        </p>
      </header>

      <main className="w-full max-w-4xl">
        <AnimatePresence mode="wait">
          {!file ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {/* Upload Card */}
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-neutral-100 flex flex-col items-center text-center group hover:shadow-md transition-shadow">
                <div className="w-16 h-16 bg-soft-pink rounded-2xl flex items-center justify-center text-accent-rose mb-6 group-hover:scale-110 transition-transform">
                  <Upload size={32} />
                </div>
                <h3 className="display-text text-xl font-bold mb-2">फोटो वा फाइल अपलोड गर्नुहोस्</h3>
                <p className="text-neutral-500 text-sm mb-8">
                  तपाईंको प्रश्नको फोटो, PDF वा कागजात यहाँ राख्नुहोस्।
                </p>
                <label className="w-full py-4 bg-accent-rose text-white rounded-2xl font-semibold cursor-pointer hover:bg-rose-600 transition-colors flex items-center justify-center gap-2">
                  <FileText size={20} />
                  फाइल छान्नुहोस्
                  <input type="file" className="hidden" accept="image/*,.pdf,.doc,.docx" onChange={handleFileUpload} />
                </label>
              </div>

              {/* Camera Card */}
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-neutral-100 flex flex-col items-center text-center group hover:shadow-md transition-shadow">
                <div className="w-16 h-16 bg-soft-pink rounded-2xl flex items-center justify-center text-accent-rose mb-6 group-hover:scale-110 transition-transform">
                  <CameraIcon size={32} />
                </div>
                <h3 className="display-text text-xl font-bold mb-2">फोटो खिच्नुहोस्</h3>
                <p className="text-neutral-500 text-sm mb-8">
                  तपाईंको प्रश्नको सिधै फोटो खिचेर उत्तर प्राप्त गर्नुहोस्।
                </p>
                <button 
                  onClick={() => setShowCamera(true)}
                  className="w-full py-4 border-2 border-accent-rose text-accent-rose rounded-2xl font-semibold hover:bg-soft-pink transition-colors flex items-center justify-center gap-2"
                >
                  <CameraIcon size={20} />
                  क्यामेरा खोल्नुहोस्
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[2.5rem] shadow-sm border border-neutral-100 overflow-hidden"
            >
              <div className="p-6 md:p-10">
                <div className="flex flex-col md:flex-row gap-8">
                  {/* File Preview */}
                  <div className="w-full md:w-1/3">
                    <div className="aspect-[3/4] rounded-3xl bg-neutral-50 border border-neutral-100 overflow-hidden relative">
                      {file.type.startsWith('image/') ? (
                        <img src={file.data} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400">
                          <FileText size={64} />
                          <span className="mt-2 text-sm font-medium">Document Loaded</span>
                        </div>
                      )}
                      <button 
                        onClick={reset}
                        className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-md rounded-full text-neutral-600 hover:text-accent-rose transition-colors"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </div>

                  {/* Action/Result Area */}
                  <div className="flex-1 flex flex-col">
                    {!answer ? (
                      <div className="h-full flex flex-col justify-center">
                        <h2 className="display-text text-2xl font-bold mb-4">प्रश्न विश्लेषण गर्न तयार हुनुहुन्छ?</h2>
                        <p className="serif-text text-neutral-600 mb-8">
                          हाम्रो AI ले तपाईंको प्रश्नलाई TU BBS 3rd Year को पाठ्यक्रम अनुसार अध्ययन गर्नेछ।
                        </p>
                        <button
                          onClick={handleAnalyze}
                          disabled={isAnalyzing}
                          className="w-full py-5 bg-accent-rose text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-rose-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-rose-200"
                        >
                          {isAnalyzing ? (
                            <>
                              <Loader2 className="animate-spin" size={24} />
                              विश्लेषण गर्दै...
                            </>
                          ) : (
                            <>
                              <Sparkles size={24} />
                              उत्तर प्राप्त गर्नुहोस्
                            </>
                          )}
                        </button>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col">
                        <div className="flex items-center gap-2 text-emerald-600 font-bold mb-4">
                          <CheckCircle2 size={20} />
                          विश्लेषण सम्पन्न भयो
                        </div>
                        <div className="flex-1 bg-soft-pink/30 rounded-3xl p-6 overflow-y-auto max-h-[400px] border border-soft-pink">
                          <div className="markdown-body prose prose-neutral max-w-none serif-text text-lg leading-relaxed">
                            <ReactMarkdown>{answer}</ReactMarkdown>
                          </div>
                        </div>
                        <button 
                          onClick={reset}
                          className="mt-6 text-accent-rose font-semibold flex items-center gap-2 hover:underline"
                        >
                          अर्को प्रश्न सोध्नुहोस् <ArrowRight size={18} />
                        </button>
                      </div>
                    )}

                    {error && (
                      <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 text-sm font-medium border border-red-100">
                        <AlertCircle size={18} />
                        {error}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Info */}
      <footer className="mt-16 text-center text-neutral-400 text-sm">
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="flex items-center gap-1">
            <BookOpen size={14} />
            TU BBS 3rd Year
          </div>
          <div className="w-1 h-1 bg-neutral-300 rounded-full" />
          <div>Nepali Medium</div>
        </div>
        <p>© 2026 BIney Butki Pukuli • For Educational Purposes Only</p>
      </footer>

      {/* Camera Overlay */}
      <AnimatePresence>
        {showCamera && (
          <CameraCapture 
            onCapture={handleCameraCapture} 
            onClose={() => setShowCamera(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function X({ size }: { size: number }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
    </svg>
  );
}
