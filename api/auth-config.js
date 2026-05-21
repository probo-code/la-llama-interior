export default function handler(req, res) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    return res.status(500).json({
      error: 'Supabase no configurado. Agrega SUPABASE_URL y SUPABASE_ANON_KEY en las variables de entorno de Vercel.',
    });
  }

  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
  res.status(200).json({ url, key });
}
