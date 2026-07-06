const express = require("express");
const cors = require("cors");
const { Resend } = require("resend");

const app = express();
app.use(cors());
app.use(express.json());

const resend = new Resend(process.env.RESEND_API_KEY);
const PORT = process.env.PORT || 10000;

// API pour l'inscription - envoie l'email au Gmail du client
app.post("/api/inscription", async (req, res) => {
  const { nom, email, telephone, ville } = req.body;
  if (!nom ||!email) return res.status(400).json({ success: false, error: "Nom et email requis" });

  try {
    const result = await resend.emails.send({
      from: "ZenPay <noreply@zenpaybj.xyz>",
      to: [email],
      subject: "Bienvenue sur ZenPay!",
      html: `<h2>Inscription réussie ✅</h2><p>Bonjour <b>${nom}</b>,</p><p>Merci pour ton inscription.</p><ul><li><b>Nom:</b> ${nom}</li><li><b>Email:</b> ${email}</li><li><b>Téléphone:</b> ${telephone}</li><li><b>Ville:</b> ${ville}</li></ul><p>L'équipe ZenPay</p>`
    });
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Page de test pour toi
app.get("/", (req, res) => {
  res.send(`<form id="f" style="max-width:400px;margin:50px auto;display:flex;flex-direction:column;gap:12px;font-family:sans-serif"><h2>Test Inscription ZenPay</h2><input name="nom" placeholder="Nom et prénom" required style="padding:10px"/><input name="email" type="email" placeholder="Adresse Gmail" required style="padding:10px"/><input name="telephone" placeholder="Numéro de téléphone" required style="padding:10px"/><input name="ville" placeholder="Ville" required style="padding:10px"/><button style="padding:12px;background:black;color:white;border:0">Envoyer</button><p id="msg"></p><script>document.getElementById('f').onsubmit=async(e)=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.target));const r=await fetch('/api/inscription',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(d)});const j=await r.json();document.getElementById('msg').innerText=j.success?'Email envoyé à '+d.email:'Erreur: '+j.error}</script></form>`);
});

app.listen(PORT, () => console.log("API OK sur port " + PORT));
