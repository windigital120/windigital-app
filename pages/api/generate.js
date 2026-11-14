export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metode salah' });
  }

  const { studioName, category, topic, detail } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY belum terbaca oleh server.' });
  }

  const promptText = category === 'digital'
    ? 'Buat naskah lengkap Produk Digital "' + studioName + '" topik "' + topic + '". Detail: ' + detail + '. Tulis rapi bahasa Indonesia.'
    : 'Buat naskah video AI "' + studioName + '" topik "' + topic + '". Detail: ' + detail + '. Berisi: 1. Voiceover (Indonesia), 2. Teks Layar, 3. Prompt Visual (Inggris).';

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
      return res.status(500).json({ error: data.error?.message || 'API Key ditolak oleh Google' });
    }

    const kandidat = Array.isArray(data.candidates) ? data.candidates.at(0) : null;
    const bagian = Array.isArray(kandidat?.content?.parts) ? kandidat.content.parts.at(0) : null;
    const hasil = bagian?.text || 'Tidak ada hasil dari AI.';

    return res.status(200).json({ result: hasil });
  } catch (err) {
    return res.status(500).json({ error: 'Koneksi gagal: ' + err.message });
  }
}

