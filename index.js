import express from "express";
import { Resend } from "resend";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const resend = new Resend(process.env.RESEND_API_KEY);

// Route de test inscription
app.post("/api/inscription", async (req, res) => {
  const { nom, email, telephone, ville } = req.body;

  try {
    const data = await resend.emails.send({
      from: "ZenPay <noreply@zenpaybj.xyz>",
      to: [email], // c'est l'adresse gmail qui reçoit
      subject: "Bienvenue sur ZenPay!",
      html: `
        <h2>Inscription réussie ✅</h2>
        <p>Bonjour <b>${nom}</b>,</p>
        <p>Merci pour ton inscription sur ZenPay.</p>
        <ul>
          <li><b>Nom:</b> ${nom}</li>
          <li><b>Email:</b> ${email}</li>
          <li><b>Téléphone:</b> ${telephone}</li>
          <li><b>Ville:</b> ${ville}</li>
        </ul>
        <p>Ton compte est en cours de validation.</p>
        <br/>
        <p>L'équipe ZenPay</p>
      `
    });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Page HTML pour tester rapidement
app.get("/", (req, res) => {
  res.send(`
  <form id="f" style="max-width:400px;margin:50px auto;display:flex;flex-direction:column;gap:10px;font-family:sans-serif">
    <h2>Test Inscription ZenPay</h2>
    <input name="nom" placeholder="Nom et prénom" required />
    <input name="email" type="email" placeholder="Adresse Gmail" required />
    <input name="telephone" placeholder="Numéro de téléphone" required />
    <input name="ville" placeholder="Ville" required />
    <button>Envoyer</button>
    <p id="msg"></p>
    <script>
      document.getElementById('f').onsubmit = async (e) => {
        e.preventDefault();
        const d = Object.fromEntries(new FormData(e.target));
        const r = await fetch('/api/inscription', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(d)});
        const j = await r.json();
        document.getElementById('msg').innerText = j.success? 'Email envoyé à ' + d.email : 'Erreur: ' + j.error;
      }
    </script>
  </form>`);
});

app.listen(10000, () => console.log("API OK"));
