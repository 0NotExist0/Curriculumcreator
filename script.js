let imageBase64 = '';

document.addEventListener('DOMContentLoaded', async () => {
  await loadModels();

  document.getElementById('imageInput').addEventListener('change', handleImageUpload);
  document.getElementById('generateBtn').addEventListener('click', generateCV);
  document.getElementById('pdfBtn').addEventListener('click', exportPDF);
});

async function loadModels() {
  const select = document.getElementById('modelSelect');
  try {
    const res = await fetch('/api/models');
    const data = await res.json();

    if (data.models && data.models.length > 0) {
      select.innerHTML = '';
      data.models.forEach((m) => {
        const opt = document.createElement('option');
        opt.value = m;
        opt.textContent = m;
        if (m.includes('vision')) opt.selected = true;
        select.appendChild(opt);
      });
    }
  } catch (err) {
    select.innerHTML = '<option>Errore caricamento modelli</option>';
  }
}

function handleImageUpload(e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onloadend = () => {
      imageBase64 = reader.result;
    };
    reader.readAsDataURL(file);
  }
}

async function generateCV() {
  const prompt = document.getElementById('promptInput').value;
  const model = document.getElementById('modelSelect').value;
  const generateBtn = document.getElementById('generateBtn');

  if (!prompt && !imageBase64) {
    alert('Inserisci del testo o carica un\'immagine.');
    return;
  }

  generateBtn.disabled = true;
  generateBtn.textContent = 'Generazione CV in corso...';

  try {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, prompt, imageBase64 }),
    });
    const data = await res.json();

    if (data.result) {
      const cleanHtml = data.result.replace(/```html|```/g, '').trim();
      const cvPreview = document.getElementById('cvPreview');
      cvPreview.innerHTML = cleanHtml;
      document.getElementById('outputContainer').style.display = 'block';
    } else {
      alert(data.error || 'Errore durante la generazione');
    }
  } catch (err) {
    console.error(err);
    alert('Errore nella richiesta al server.');
  } finally {
    generateBtn.disabled = false;
    generateBtn.textContent = 'Genera Curriculum';
  }
}

function exportPDF() {
  const element = document.getElementById('cvPreview');
  const opt = {
    margin: 0,
    filename: 'Curriculum_Vitae.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
  };
  html2pdf().set(opt).from(element).save();
}
