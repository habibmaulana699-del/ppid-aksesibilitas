const fetch = require("node-fetch");
const { JSDOM } = require("jsdom");
const { Readability } = require("@mozilla/readability");

module.exports = async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) return res.status(400).send("Parameter ?url wajib diisi");

    const pageResp = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!pageResp.ok) return res.status(502).send("Gagal mengambil halaman target.");
    const html = await pageResp.text();

    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    const title = (article && article.title) ? article.title : "Halaman";
    const text = (article && article.textContent) ? article.textContent : "";

    const page = `
<!doctype html><html lang="id"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title></head>
<body style="font-family:sans-serif;max-width:800px;margin:auto;padding:20px">
<h1>${title}</h1>
<button onclick="(function(){ const u=new SpeechSynthesisUtterance(document.getElementById('text').innerText); u.lang='id-ID'; speechSynthesis.cancel(); speechSynthesis.speak(u); })()">Putar (Browser)</button>
<p id="text" style="white-space:pre-wrap">${text.replace(/&/g,'&amp;').replace(/</g,'&lt;')}</p>
<p><a href="${url}" target="_blank" rel="noopener">Buka situs asli</a></p>
</body></html>`;
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(page);
  } catch (e) {
    console.error(e);
    res.status(500).send("Terjadi kesalahan server.");
  }
};
