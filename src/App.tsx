import React, { useState, useRef } from 'react';
import { 
  Stethoscope, 
  Mic, 
  Image as ImageIcon, 
  CloudUpload, 
  FileText, 
  Download, 
  AlertCircle, 
  CheckCircle2, 
  Loader2,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { processSupervisionData } from './services/gemini';
import { exportToDocx } from './utils/export';

export default function App() {
  const [roomName, setRoomName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [audioFiles, setAudioFiles] = useState<File[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [findings, setFindings] = useState<string | null>(null);

  const outputRef = useRef<HTMLDivElement>(null);

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAudioFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImageFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeAudio = (index: number) => {
    setAudioFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleProcess = async () => {
    if (!roomName) {
      setError('Nama ruangan wajib diisi.');
      return;
    }
    if (audioFiles.length === 0 && imageFiles.length === 0) {
      setError('Silakan upload minimal 1 file audio atau 1 file gambar.');
      return;
    }

    setError(null);
    setIsProcessing(true);
    setStatusText('Menganalisis data dengan AI...');

    try {
      const result = await processSupervisionData(roomName, date, audioFiles, imageFiles);
      setFindings(result);
      setTimeout(() => {
        outputRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      console.error(err);
      setError(`Terjadi kesalahan: ${err.message || 'Gagal memproses data'}`);
    } finally {
      setIsProcessing(false);
      setStatusText('');
    }
  };

  const handleExport = async () => {
    if (!findings) return;
    try {
      await exportToDocx(roomName, date, findings);
    } catch (err: any) {
      setError(`Gagal export: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-700 to-pink-600 py-8 px-6 md:px-12 lg:px-20 text-white shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
            <Stethoscope className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-2xl md:text-4xl font-bold tracking-tight">Sekretaris PPI Berbasis AI</h1>
            <p className="text-purple-100 text-sm md:text-lg mt-1 font-medium opacity-90">
              Sistem Otomatisasi Laporan Supervisi IPCN
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 md:p-12 space-y-10">
        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-xl flex items-start gap-3 shadow-sm"
            >
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <p className="text-sm font-semibold">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form Section */}
        <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">Nama Ruangan</label>
              <input 
                type="text" 
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="Contoh: IGD, ICU, Ruang Melati..." 
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none text-lg"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">Tanggal Supervisi</label>
              <input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none text-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 pt-4">
            {/* Audio Upload */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-800">
                <Mic className="w-5 h-5 text-purple-600" />
                <h2 className="font-bold text-lg">Rekaman Audio</h2>
              </div>
              <div className="relative group">
                <input 
                  type="file" 
                  multiple 
                  accept="audio/*" 
                  onChange={handleAudioChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center group-hover:border-purple-400 group-hover:bg-purple-50/30 transition-all">
                  <CloudUpload className="w-10 h-10 mx-auto text-slate-400 group-hover:text-purple-500 mb-2" />
                  <p className="text-slate-600 font-medium">Klik atau seret file audio di sini</p>
                  <p className="text-xs text-slate-400 mt-1">MP3, WAV, M4A, OGG</p>
                </div>
              </div>
              <ul className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {audioFiles.map((file, idx) => (
                  <motion.li 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={idx} 
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-slate-600 truncate">{file.name}</span>
                    </div>
                    <button onClick={() => removeAudio(idx)} className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Image Upload */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-800">
                <ImageIcon className="w-5 h-5 text-purple-600" />
                <h2 className="font-bold text-lg">Foto Temuan</h2>
              </div>
              <div className="relative group">
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center group-hover:border-purple-400 group-hover:bg-purple-50/30 transition-all">
                  <CloudUpload className="w-10 h-10 mx-auto text-slate-400 group-hover:text-purple-500 mb-2" />
                  <p className="text-slate-600 font-medium">Klik atau seret foto di sini</p>
                  <p className="text-xs text-slate-400 mt-1">JPG, PNG, WEBP</p>
                </div>
              </div>
              <ul className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {imageFiles.map((file, idx) => (
                  <motion.li 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={idx} 
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-slate-600 truncate">{file.name}</span>
                    </div>
                    <button onClick={() => removeImage(idx)} className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-6">
            <button 
              onClick={handleProcess}
              disabled={isProcessing}
              className={`w-full md:w-auto flex items-center justify-center gap-3 px-12 py-5 rounded-2xl font-bold text-white transition-all shadow-xl active:scale-[0.98] ${
                isProcessing ? 'bg-slate-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 hover:shadow-purple-200'
              }`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>{statusText}</span>
                </>
              ) : (
                <>
                  <CloudUpload className="w-6 h-6" />
                  <span>Proses Temuan AI</span>
                </>
              )}
            </button>
          </div>
        </section>

        {/* Output Section */}
        <AnimatePresence>
          {findings && (
            <motion.section 
              ref={outputRef}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-xl border border-green-100 overflow-hidden"
            >
              <div className="bg-green-50/50 border-b border-green-100 p-6 md:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500 rounded-lg text-white">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-green-900 text-xl">Hasil Temuan Supervisi</h3>
                </div>
                <button 
                  onClick={handleExport}
                  className="flex items-center gap-2 bg-green-600 text-white px-8 py-3.5 rounded-xl hover:bg-green-700 transition-all shadow-lg shadow-green-100 font-bold w-full sm:w-auto justify-center"
                >
                  <Download className="w-5 h-5" />
                  <span>Export (.docx)</span>
                </button>
              </div>
              <div className="p-8 md:p-12 space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-8 border-b border-slate-100">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ruangan</p>
                    <p className="text-xl font-bold text-slate-800">{roomName}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tanggal</p>
                    <p className="text-xl font-bold text-slate-800">{new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                </div>
                <div className="prose prose-slate max-w-none">
                  <div className="whitespace-pre-wrap text-slate-700 text-lg leading-relaxed font-medium">
                    {findings}
                  </div>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      <footer className="py-12 text-center text-slate-400 text-sm">
        <p>© 2026 Sekretaris PPI Berbasis AI • Membantu IPCN bekerja lebih cerdas</p>
      </footer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
}
