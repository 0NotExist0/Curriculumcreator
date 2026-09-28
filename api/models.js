export default async function handler(req, res) {
  try {
    const response = await fetch('https://integrate.api.nvidia.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.NVIDIA_API_KEY}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Errore API: ${response.statusText}`);
    }

    const data = await response.json();
    const models = data.data.map((m) => m.id);

    return res.status(200).json({ models });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
