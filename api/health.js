// Format CommonJS (paling aman dideteksi di Vercel Node.js)
module.exports = (req, res) => {
  res.status(200).json({ ok: true, when: new Date().toISOString() });
};
