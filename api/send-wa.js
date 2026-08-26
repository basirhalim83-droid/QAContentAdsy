export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { to, type, data } = req.body;
  if (!to || !type) return res.status(400).json({ error: 'Missing params' });

  const FONNTE_TOKEN = process.env.FONNTE_TOKEN;
  if (!FONNTE_TOKEN) return res.status(500).json({ error: 'FONNTE_TOKEN not set' });

  let message = '';

  if (type === 'qc_result') {
    const { advertiser_name, judul, brand, status, catatan } = data;
    if (status === 'approved') {
      message = `Halo ${advertiser_name}! ✅\n\nKonten kamu telah di-review oleh tim QC.\n\n*Judul:* ${judul}\n*Brand:* ${brand}\n*Status:* APPROVED ✅\n\nKonten kamu sudah disetujui dan bisa digunakan untuk iklan.${catatan ? '\n\n*Catatan QC:* ' + catatan : ''}\n\nTerima kasih! 🎉`;
    } else if (status === 'rejected') {
      message = `Halo ${advertiser_name},\n\nKonten kamu telah di-review oleh tim QC.\n\n*Judul:* ${judul}\n*Brand:* ${brand}\n*Status:* TIDAK DI-ACC ❌\n\n*Catatan QC:* ${catatan || '-'}\n\nSilakan submit ulang konten yang sudah direvisi melalui dashboard kamu ya. 🙏`;
    }
  }

  if (!message) return res.status(400).json({ error: 'Unknown type' });

  // Normalisasi nomor WA
  let phone = to.replace(/\D/g, '');
  if (phone.startsWith('0')) phone = '62' + phone.slice(1);

  try {
    const resp = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: { 'Authorization': FONNTE_TOKEN, 'Content-Type': 'application/json' },
      body: JSON.stringify({ target: phone, message, countryCode: '62' }),
    });
    const result = await resp.json();
    return res.status(200).json({ ok: true, result });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
