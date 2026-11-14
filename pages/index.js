
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';

const supabase = createClient('https://arubgtsmozwieuzmjwmp.supabase.co', 'sb_publishable_wjxD_RKyMgZAglwbxtcpEw_FOMtYaxG');
const BUY_URL = 'https://lynk.id/windigital12';

const STUDIOS = [
  { id: 'ebook', name: 'E-Book Creator', cat: 'digital', desc: 'Naskah e-book bab per bab siap jual' },
  { id: 'planner', name: 'Digital Planner', cat: 'digital', desc: 'Template planner harian, mingguan & bulanan' },
  { id: 'kids', name: 'Buku Aktivitas Anak', cat: 'digital', desc: 'Kuis, mewarnai & teka-teki anak' },
  { id: 'game', name: 'Game Edukasi', cat: 'digital', desc: 'Skenario & soal permainan interaktif' },
  { id: 'story', name: 'Buku Cerita', cat: 'digital', desc: 'Cerita fiksi & dongeng per halaman' },
  { id: 'comic', name: 'Komik Studio', cat: 'digital', desc: 'Naskah panel komik & dialog karakter' },
  { id: 'invite', name: 'Kartu Undangan', cat: 'digital', desc: 'Teks undangan acara & digital RSVP' },
  { id: 'envelope', name: 'Amplop Digital', cat: 'digital', desc: 'Ucapan kreatif & konsep amplop digital' },
  { id: 'recipe', name: 'Buku Resep', cat: 'digital', desc: 'Kumpulan resep, takaran & langkah masak' },
  { id: 'prayer', name: 'Buku Doa & Refleksi', cat: 'digital', desc: 'Kumpulan doa harian & jurnal refleksi' },
  { id: 'drama', name: 'Short Drama', cat: 'video', desc: 'Naskah drama vertikal & prompt visual' },
  { id: 'anim', name: 'Animation Studio', cat: 'video', desc: 'Storyboard animasi 3D/2D & karakter' },
  { id: 'cinema', name: 'Cinematic & Action', cat: 'video', desc: 'Adegan sinematik & prompt kamera' },
  { id: 'influencer', name: 'AI Influencer', cat: 'video', desc: 'Skrip kreator virtual & arahan visual' },
  { id: 'affiliate', name: 'Video Affiliate', cat: 'video', desc: 'Skrip promosi produk (Hook-CTA)' },
  { id: 'asmr', name: 'Video ASMR', cat: 'video', desc: 'Konsep audio relaksasi & visual' },
  { id: 'podcast', name: 'Podcast Studio', cat: 'video', desc: 'Naskah obrolan podcast & poin diskusi' },
  { id: 'facts', name: 'Fakta Menarik', cat: 'video', desc: 'Konten edukasi singkat & trivia viral' },
  { id: 'timetravel', name: 'Time Travel', cat: 'video', desc: 'Visualisasi sejarah masa lalu & depan' },
  { id: 'horror', name: 'Cerita Horor', cat: 'video', desc: 'Naskah misteri mencekam & horor' },
];

export default function Home() {
  const [user, setUser] = useState(null);
  const [approved, setApproved] = useState(null);
  const [loading, setLoading] = useState(true);
  const [studio, setStudio] = useState(STUDIOS.at(0));
  const [topic, setTopic] = useState('');
  const [detail, setDetail] = useState('');
  const [output, setOutput] = useState('');
  const [busy, setBusy] = useState(false);
  const [wait, setWait] = useState(0);

  useEffect(() => {
    const check = async (u) => {
      if (!u) { setUser(null); setApproved(false); setLoading(false); return; }
      setUser(u);
      const { data } = await supabase.from('approved_users').select('email').ilike('email', u.email.trim()).maybeSingle();
      setApproved(!!data);
      setLoading(false);
    };
    supabase.auth.getSession().then(({ data }) => check(data?.session?.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => check(s?.user));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('wd_user');
    if (saved) verifyEmail(saved);

    supabase.auth.getSession().then(({ data }) => {
      if (data?.session?.user?.email) verifyEmail(data.session.user.email);
      else if (!saved) setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      if (s?.user?.email) verifyEmail(s.user.email);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function verifyEmail(mail) {
    const clean = mail.trim().toLowerCase();
    localStorage.setItem('wd_user', clean);
    setUser({ email: clean });
    const { data } = await supabase.from('approved_users').select('email').ilike('email', clean).maybeSingle();
    setApproved(!!data);
    setLoading(false);
  }

  async function generate(e) {
    e.preventDefault();
    if (!topic.trim() || wait > 0 || busy) return;
    setBusy(true); setOutput('');
    try {
      const r = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studioName: studio.name, category: studio.cat, topic, detail })
      });
      const d = await r.json();
      setOutput(d.error ? 'Error: ' + d.error : d.result);
      if (!d.error) setWait(20);
    } catch { setOutput('Gagal terhubung ke server AI.'); }
    setBusy(false);
  }

  function toPDF() {
    const doc = new jsPDF();
    let y = 15;
    doc.splitTextToSize(output, 180).forEach((l) => {
      if (y > 280) { doc.addPage(); y = 15; }
      doc.text(l, 15, y);
      y += 7;
    });
    doc.save(studio.id + '-windigital.pdf');
  }

  async function toWord() {
    const doc = new Document({ sections: [{ children: output.split('\n').map((t) => new Paragraph({ children: [new TextRun(t)] })) }] });
    saveAs(await Packer.toBlob(doc), studio.id + '-windigital.docx');
  }

  function toCanva() {
    navigator.clipboard.writeText(output);
    alert('Teks tersalin! Silakan Paste di Canva.');
    window.open('https://canva.com', '_blank');
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen text-amber-400">Memuat...</div>;

  if (false) return (
    <div className="flex items-center justify-center min-h-screen p-6 text-center">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8">
        <h1 className="text-2xl font-extrabold text-amber-400 mb-2">WINDIGITAL AI STUDIO</h1>
        <p className="text-slate-400 text-sm mb-6">21 Studio AI Produk Digital & Paket Produksi Video</p>
        <button onClick={() => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: 'https://windigital-app.vercel.app' } })} className="w-full py-3 bg-white text-slate-900 font-bold rounded-xl">Masuk dengan Akun Google</button>
      </div>
    </div>
  );

  if (false) return (
    <div className="flex items-center justify-center min-h-screen p-6 text-center">
      <div className="max-w-md w-full bg-slate-900 border border-red-900/50 rounded-2xl p-8">
        <h2 className="text-xl font-bold text-red-400 mb-2">Akun Belum Aktif</h2>
        <p className="text-slate-300 text-sm mb-6">Email <b>{user.email}</b> belum terdaftar sebagai member aktif.</p>
        <a href={BUY_URL} target="_blank" rel="noreferrer" className="block w-full py-3 bg-amber-500 text-slate-950 font-bold rounded-xl mb-3">Aku Mau Beli Sekarang</a>
        <button onClick={() => supabase.auth.signOut()} className="text-xs text-slate-400 underline">Ganti Akun</button>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <header className="flex justify-between items-center pb-4 border-b border-slate-800 mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-amber-400">WINDIGITAL AI STUDIO</h1>
          <p className="text-xs text-emerald-400">Unlimited Member • {VIP}</p>
        </div>
        <button onClick={() => supabase.auth.signOut()} className="px-3 py-1.5 text-xs bg-slate-800 rounded-lg">Keluar</button>
      </header>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
          {STUDIOS.map((s) => (
            <button key={s.id} onClick={() => { setStudio(s); setOutput(''); }} className={studio.id === s.id ? 'w-full text-left p-3 rounded-xl border bg-amber-500/10 border-amber-500' : 'w-full text-left p-3 rounded-xl border bg-slate-900 border-slate-800'}>
              <div className="text-xs text-amber-400 uppercase">{s.cat === 'digital' ? 'Produk Digital' : 'Video & Audio'}</div>
              <div className="font-bold text-sm">{s.name}</div>
              <div className="text-xs text-slate-400">{s.desc}</div>
            </button>
          ))}
        </div>

        <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-1">{studio.name}</h2>
          <p className="text-xs text-slate-400 mb-4">{studio.desc}</p>
          <form onSubmit={generate} className="space-y-3">
            <input type="text" required value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Topik / Judul Utama *" className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-sm" />
            <textarea rows={3} value={detail} onChange={(e) => setDetail(e.target.value)} placeholder="Detail tambahan / gaya bahasa..." className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-sm" />
            <button type="submit" disabled={busy || wait > 0} className="w-full py-3 bg-amber-500 disabled:bg-slate-700 text-slate-950 font-bold rounded-xl">
              {busy ? 'Sedang Meracik AI...' : wait > 0 ? 'Tunggu Jeda (' + wait + ' detik)' : 'Generate Sekarang'}
            </button>
          </form>

          {output && (
            <div className="mt-6 pt-4 border-t border-slate-800">
              <div className="flex flex-wrap gap-2 mb-3">
                <button onClick={toPDF} className="px-3 py-2 bg-rose-600 text-xs font-bold rounded-lg">Download PDF</button>
                {studio.cat === 'digital' && (
                  <>
                    <button onClick={toWord} className="px-3 py-2 bg-blue-600 text-xs font-bold rounded-lg">Download Word</button>
                    <button onClick={toCanva} className="px-3 py-2 bg-purple-600 text-xs font-bold rounded-lg">Edit di Canva</button>
                  </>
                )}
                <button onClick={() => { navigator.clipboard.writeText(output); alert('Tersalin!'); }} className="px-3 py-2 bg-slate-800 text-xs font-bold rounded-lg">Salin Teks</button>
              </div>
              <pre className="bg-slate-950 border border-slate-800 rounded-xl p-4 whitespace-pre-wrap text-sm max-h-80 overflow-y-auto font-sans">{output}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

