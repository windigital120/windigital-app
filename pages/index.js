
import { useState } from 'react';

const LIST = [
  'E-Book Creator', 'Digital Planner', 'Buku Aktivitas Anak', 'Game Edukasi',
  'Buku Cerita', 'Komik Studio', 'Kartu Undangan', 'Amplop Digital',
  'Buku Resep', 'Buku Doa & Refleksi', 'Short Drama', 'Animation Studio',
  'Cinematic & Action', 'AI Influencer', 'Video Affiliate', 'Video ASMR',
  'Podcast Studio', 'Fakta Menarik', 'Time Travel', 'Cerita Horor', 'Miniature World'
];

export default function Home() {
  const [pilih, setPilih] = useState(LIST[0]);
  const [topik, setTopik] = useState('');
  const [detail, setDetail] = useState('');
  const [hasil, setHasil] = useState('');
  const [loading, setLoading] = useState(false);

  async function buatKarya(e) {
    e.preventDefault();
    if (!topik.trim() || loading) return;
    setLoading(true);
    setHasil('');
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studioName: pilih,
          category: LIST.indexOf(pilih) < 10 ? 'digital' : 'video',
          topic: topik,
          detail: detail
        })
      });
      const data = await res.json();
      setHasil(data.error ? 'Error: ' + data.error : data.result);
    } catch {
      setHasil('Gagal terhubung ke server.');
    }
    setLoading(false);
  }

  return (
    <div style={{ minHeight: '100vh', background: '#090d16', color: '#fff', fontFamily: 'sans-serif', padding: 20 }}>
      <h1 style={{ color: '#fbbf24', fontSize: 22 }}>WINDIGITAL AI STUDIO (21 STUDIO)</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginTop: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: '65vh', overflowY: 'auto' }}>
          {LIST.map((nama) => (
            <button key={nama} onClick={() => { setPilih(nama); setHasil(''); }}
              style={{ textAlign: 'left', padding: 12, borderRadius: 10, border: pilih === nama ? '2px solid #f59e0b' : '1px solid #334155', background: pilih === nama ? '#1e293b' : '#0f172a', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}>
              {nama}
            </button>
          ))}
        </div>
        <div style={{ background: '#0f172a', padding: 20, borderRadius: 14, border: '1px solid #334155' }}>
          <h2 style={{ margin: '0 0 12px', color: '#fbbf24' }}>{pilih}</h2>
          <form onSubmit={buatKarya} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input type="text" required value={topik} onChange={(e) => setTopik(e.target.value)} placeholder="Masukkan Topik / Judul *" style={{ padding: 12, borderRadius: 8, background: '#090d16', border: '1px solid #475569', color: '#fff' }} />
            <textarea rows={3} value={detail} onChange={(e) => setDetail(e.target.value)} placeholder="Detail tambahan (opsional)..." style={{ padding: 12, borderRadius: 8, background: '#090d16', border: '1px solid #475569', color: '#fff' }} />
            <button type="submit" disabled={loading} style={{ padding: 14, background: '#f59e0b', color: '#000', fontWeight: 'bold', borderRadius: 8, border: 'none', cursor: 'pointer' }}>
              {loading ? 'Sedang Membuat...' : 'Generate Sekarang'}
            </button>
          </form>
          {hasil && (
            <div style={{ marginTop: 16 }}>
              <button onClick={() => { navigator.clipboard.writeText(hasil); alert('Tersalin!'); }} style={{ padding: '8px 12px', background: '#334155', color: '#fff', border: 'none', borderRadius: 6, marginBottom: 8, cursor: 'pointer' }}>Salin Hasil</button>
              <pre style={{ background: '#090d16', padding: 14, borderRadius: 8, whiteSpace: 'pre-wrap', fontSize: 13, lineHeight: 1.5 }}>{hasil}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

