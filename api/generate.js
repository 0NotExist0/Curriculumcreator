export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metodo non consentito' });
  }

  try {
    const { model, prompt, imageBase64 } = req.body;
    const userContent = [];

    if (imageBase64) {
      userContent.push({
        type: 'text',
        text: 'Analizza questa immagine del mio vecchio CV. Estrai i dati importanti e mantieni la struttura, lo stile visivo e la disposizione delle sezioni.',
      });
      userContent.push({
        type: 'image_url',
        image_url: { url: imageBase64 },
      });
    }

    userContent.push({
      type: 'text',
      text: `Crea un CV professionale completo in formato HTML semantico con CSS inline integrato. Dati e istruzioni utente: ${prompt}. Restituisci SOLO il codice HTML dentro un blocco unico senza spiegazioni o markdown aggiuntivo.`,
    });

    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NVIDIA_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model || 'meta/llama-3.2-11b-vision-instruct',
        messages: [{ role: 'user', content: userContent }],
        temperature: 0.2,
        max_tokens: 3000,
      }),
    });

    const data = await response.json();

    if (data.choices && data.choices[0]) {
      return res.status(200).json({ result: data.choices[0].message.content });
    } else {
      return res.status(500).json({ error: 'Nessuna risposta generata dal modello.' });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
