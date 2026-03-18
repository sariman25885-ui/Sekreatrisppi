import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const processSupervisionData = async (
  roomName: string,
  date: string,
  audioFiles: File[],
  imageFiles: File[]
) => {
  const fileToPart = async (file: File) => {
    const base64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string).split(",")[1]);
      reader.readAsDataURL(file);
    });
    
    let mimeType = file.type;
    if (!mimeType) {
      const ext = file.name.split('.').pop()?.toLowerCase();
      const mimeTypes: Record<string, string> = {
        'mp3': 'audio/mp3',
        'wav': 'audio/wav',
        'm4a': 'audio/m4a',
        'ogg': 'audio/ogg',
        'aac': 'audio/aac',
        'opus': 'audio/ogg'
      };
      mimeType = mimeTypes[ext || ''] || 'application/octet-stream';
    }

    return {
      inlineData: {
        data: base64,
        mimeType: mimeType,
      },
    };
  };

  const prompt = `Anda adalah Asisten Sekretaris IPCN (Infection Prevention and Control Nurse).
Tugas Anda: Mengubah data mentah (transkrip audio & deskripsi gambar) menjadi HASIL TEMUAN SUPERVISI IPCN.

ATURAN KETAT:
1. HANYA tuliskan TEMUAN (kondisi/fakta yang ditemukan).
2. TANPA analisis sama sekali.
3. TANPA rekomendasi/saran perbaikan.
4. Gunakan format poin (1, 2, 3, dst).
5. Kelompokkan berdasarkan nama ruangan: ${roomName}
6. Gunakan bahasa Indonesia formal dan baku.
7. Tanggal Supervisi: ${date}

Silakan proses input audio dan gambar berikut untuk menyusun laporan temuan.`;

  const parts = [
    { text: prompt },
    ...(await Promise.all(audioFiles.map(fileToPart))),
    ...(await Promise.all(imageFiles.map(fileToPart))),
  ];

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ role: "user", parts }],
  });

  return response.text || "Tidak ada temuan yang dihasilkan.";
};
