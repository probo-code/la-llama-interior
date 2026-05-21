const RESEND_API_KEY = process.env.RESEND_API_KEY;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metodo no permitido' });
  }

  const { email } = req.body || {};

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Correo electronico invalido' });
  }

  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY no configurada');
    return res.status(500).json({ error: 'Error de configuracion del servidor' });
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + RESEND_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'La Llama Interior <onboarding@resend.dev>',
        to: [email],
        subject: 'Bienvenido a La Llama Interior',
        html: [
          '<div style="max-width:600px;margin:0 auto;font-family:Georgia,serif;background:#0a0a0a;color:#d4c9a8;padding:40px 30px;border:1px solid #2a2010;">',
          '  <h1 style="color:#c9a84c;text-align:center;font-size:28px;letter-spacing:3px;margin-bottom:8px;">LA LLAMA INTERIOR</h1>',
          '  <p style="text-align:center;color:#6a5a3a;font-size:12px;letter-spacing:2px;text-transform:uppercase;margin-bottom:30px;">El Testimonio del Humo</p>',
          '  <hr style="border:none;border-top:1px solid #1a1408;margin:20px 0;">',
          '  <p style="color:#c4b998;font-size:16px;line-height:1.8;">Gracias por suscribirte a <strong style="color:#c9a84c;">La Llama Interior</strong>.</p>',
          '  <p style="color:#8a7a5a;font-size:15px;line-height:1.7;">A partir de ahora recibiras reflexiones, ritos y ensenanzas directamente en tu bandeja de entrada. Cada mensaje sera un recordatorio para hacer una pausa, encender la conciencia y dejar que el humo te guie.</p>',
          '  <div style="border-left:2px solid #c9a84c;padding:14px 20px;margin:24px 0;background:#0f0d08;">',
          '    <p style="color:#a09070;font-style:italic;font-size:15px;line-height:1.7;">"El humo no miente. En su transparencia se refleja la verdad del que fuma."</p>',
          '    <p style="color:#6a5a3a;font-size:13px;text-align:right;">&mdash; Ultimo Testimonio, 1:1</p>',
          '  </div>',
          '  <p style="color:#6a5a3a;font-size:13px;line-height:1.6;">Si en algun momento deseas dejar de recibir estos mensajes, simplemente responde a este correo con "Darme de baja".</p>',
          '  <hr style="border:none;border-top:1px solid #1a1408;margin:24px 0;">',
          '  <p style="text-align:center;color:#3a3020;font-size:11px;letter-spacing:1px;">La Llama Interior &bull; Una filosofia de conciencia plena</p>',
          '</div>',
        ].join('\n'),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Error Resend:', data);
      return res.status(500).json({ error: 'Error al enviar el correo de bienvenida' });
    }

    console.log('Suscripcion exitosa: ' + email + ' - Resend ID: ' + data.id);

    return res.status(200).json({
      message: 'Suscripcion exitosa. Revisa tu correo.',
      id: data.id,
    });
  } catch (error) {
    console.error('Error en handler subscribe:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}