import fetch from "node-fetch";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";

export default async function handler(req, res) {
  try {
    const url = req.query.url;
    if (!url) return res.status(400).send("Parameter ?url wajib diisi");

    const pageResp = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    const html = await pageResp.text();

    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();
    const title = article?.title || "Halaman";
    const text = article?.textContent || "Tidak ada teks terbaca.";

    const encodedUrl = encodeURIComponent(url);
    const page = `
      <html lang="id">
        <head><meta charset="utf-8"/><title>${title}</title></head>
        <body style="font-family:sans-serif;max-width:800px;margin:auto;padding:20px">
          <h1>${title}</h1>
          <button onclick="speechSynthesis.speak(new SpeechSynthesisUtterance(document.getElementById('text').innerText))">Putar</button>
          <p id="text">${text}</p>
          <p><a href="${url}" target="_blank">Buka situs asli</a></p>
        </body>
      </html>
    `;
    res.setHeader("Content-Type", "text/html");
    res.send(page);
  } catch (e) {
    console.error(e);
    res.status(500).send("Terjadi kesalahan server.");
  }
}
