import Head from 'next/head';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>WINDIGITAI AI STUDIO</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script src="https://tailwindcss.com"></script>
      </Head>
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
        <Component {...pageProps} />
      </div>
    </>
  );
}
