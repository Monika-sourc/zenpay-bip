const express = require("express");
const cors = require("cors");
const { Resend } = require("resend");
const app = express();
app.use(cors());
app.use(express.json());
const resend = new Resend(process.env.RESEND_API_KEY);

app.post("/api/inscription", async (req, res) => {
  // On accepte nom, email, et les nouveaux paramètres pct et success
  const { nom, email, telephone, ville, pays, pct, success } = req.body;
  if (!nom || !email) return res.status(400).json({ success: false });

  const ref = Date.now().toString().slice(-6);
  
  // Déterminer le sujet et le contenu HTML selon le statut
  let sujet, htmlContent, textContent;
  // Si success est explicitement false ou pct < 100 => rejet, sinon succès
  const estRejet = (success === false) || (typeof pct === 'number' && pct < 100);
  const pourcentage = (typeof pct === 'number' && pct >= 0 && pct <= 100) ? pct : 100;
  
  if (estRejet) {
    sujet = `❌ ZenPay - ${nom}, votre transfert #${ref} a été rejeté`;
    htmlContent = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#222">
      <p>Szanowny/a ${nom},</p>
      <p><b style="color:#d9534f;">Rejet : Votre transfert a été interrompu.</b></p>
      <p>Votre demande de transfert a été <b>rejetée</b> à ${pourcentage}% de traitement.</p>
      <p style="background:#f8d7da;padding:10px;border-radius:4px;color:#721c24;">Motif : Opération non conforme aux conditions de sécurité.</p>
      <p>Merci de vérifier vos informations et de réessayer.</p>
      <p style="margin-top:25px">Bonjour ${nom},</p>
      <p>Votre compte ZenPay est toujours actif. Reference <b>#${ref}</b></p>
      <p style="font-size:13px;color:#666">${ville || ''} ${pays || ''} - ${telephone || ''}</p>
      <p>L'equipe ZenPay<br>hello@zenpaybj.xyz | zenpaybj.xyz</p>
    </div>`;
    textContent = `Szanowny/a ${nom}, Rejet : Votre transfert a été interrompu à ${pourcentage}%. Ref #${ref}. Veuillez vérifier vos informations. Equipe ZenPay.`;
  } else {
    sujet = `✅ ZenPay - ${nom}, votre transfert #${ref} est confirmé`;
    htmlContent = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#222">
      <p>Szanowny/a ${nom},</p>
      <p><b style="color:#28a745;">Sukces : Votre transfert a été réalisé avec succès.</b></p>
      <p>Transakcja została pomyślnie zaksięgowana. Dziękujemy za skorzystanie z usług ZenPay.</p>
      <p style="margin-top:25px">Bonjour ${nom},</p>
      <p>Votre compte ZenPay est actif. Reference <b>#${ref}</b></p>
      <p style="font-size:13px;color:#666">${ville || ''} ${pays || ''} - ${telephone || ''}</p>
      <p>L'equipe ZenPay<br>hello@zenpaybj.xyz | zenpaybj.xyz</p>
    </div>`;
    textContent = `Szanowny/a ${nom}, Sukces : Votre transfert a été réalisé. Ref #${ref}. Bonjour ${nom}, votre compte ZenPay est actif. Equipe ZenPay.`;
  }

  try {
    await resend.emails.send({
      from: "ZenPay <noreply@zenpaybj.xyz>",
      to: [email],
      reply_to: "hello@zenpaybj.xyz",
      subject: sujet,
      headers: {
        "X-Priority": "1",
        "X-MSMail-Priority": "High",
        "Importance": "high",
        "X-Mailer": "ZenPay Mailer",
        "List-Unsubscribe": "<mailto:hello@zenpaybj.xyz>",
        "Precedence": "transactional"
      },
      html: htmlContent,
      text: textContent
    });
    res.json({ success: true, ref });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.get("/", (req,res)=>res.send("ZenPay API Fort OK"));
app.listen(process.env.PORT || 10000);
