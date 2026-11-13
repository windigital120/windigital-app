import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');
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
  const [studio, setStudio] = useState(STUDIOS[0]);
  const [topic, setTopic] = useState('');
  const [detail, setDetail] = useState('');
  const [output, setOutput] = useState('');
  const [busy, setBusy] = useState(false);
  const [wait, setWait] = useState(0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => checkUser(data?.session?.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => checkUser(s?.user));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (wait <= 0) return;
    const t = setInterval(() => setWait((w) => w - 1), 1000);
    return () => clearInterval(t);
  }, [wait]);

  async function checkUser(u) {
    if (!u) { setUser(null); setApproved(null); setLoading(false); return; }
    setUser(u);
    const { data } = await supabase.from('approved_users').select('email').eq('email', u.email).maybeSingle();
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
