export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metode tidak diizinkan' });
  }

  const { studioName, category, topic, detail } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY belum terpasang di Vercel.' });
  }

  const promptText = category === 'digital'
    ? 'Kamu adalah ahli pembuat Produk Digital profesional. Buat naskah lengkap per halaman/bagian untuk produk "' + studioName + '" dengan topik "' + topic + '" dan detail tambahan "' + detail + '". Tulis dalam bahasa Indonesia yang rapi dan siap diterbitkan.'
    : 'Kamu adalah Sutradara & Penulis Naskah Video AI profesional. Buat Paket Produksi Video untuk "' + studioName + '" dengan topik "' + topic + '" dan detail "' + detail + '". Formatkan setiap adegan berisi: 1. Naskah Voiceover (Bahasa Indonesia), 2. Teks Layar, dan 3. Prompt Visual (Bahasa Inggris detail).';

  try {
    const response = await fetch(
      'https://googleapis.com' + apiKey,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }]
        })
      }
    );

    const data = await response.json();
    if (!response.ok) {
      return res.status(500).json({ error: data.error?.message || 'Gagal memproses AI' });
    }

    const firstCandidate = Array.isArray(data.candidates) ? data.candidates.at(0) : null;
    const firstPart = Array.isArray(firstCandidate?.content?.parts) ? firstCandidate.content.parts.at(0) : null;
    const resultText = firstPart?.text || 'Tidak ada hasil.';

    return res.status(200).json({ result: resultText });
  } catch (err) {
    return res.status(500).json({ error: 'Terjadi kesalahan koneksi server.' });
  }
}
