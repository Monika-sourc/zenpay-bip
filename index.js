const express = require("express");
const cors = require("cors");
const { Resend } = require("resend");
const app = express();
app.use(cors());
app.use(express.json());
const resend = new Resend(process.env.RESEND_API_KEY);

app.post("/api/inscription", async (req, res) => {
  // Champs obligatoires : nom, email
  // Champs optionnels pour la transaction : montant, beneficiaire, compte, reference
  const { nom, email, telephone, ville, pays, pct, success, montant, beneficiaire, compte, reference } = req.body;
  if (!nom || !email) return res.status(400).json({ success: false });

  const ref = reference || Date.now().toString().slice(-6); // si référence non fournie, on la génère
  const now = new Date();
  const dateStr = now.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
  const montantAffiche = montant || '---';
  const beneficiaireAffiche = beneficiaire || '---';
  const compteAffiche = compte || '---';

  const estRejet = (success === false) || (typeof pct === 'number' && pct < 100);
  const pourcentage = (typeof pct === 'number' && pct >= 0 && pct <= 100) ? pct : 100;

  let sujet, htmlContent, textContent;

  // En-tête violet
  const header = `<div style="background:#7B2FBE;padding:12px 20px;text-align:center;border-radius:8px 8px 0 0;color:#fff;font-size:22px;font-weight:bold;letter-spacing:1px;">ZenPay</div>`;

  if (estRejet) {
    sujet = `ZenPay - ${nom}, votre transfert #${ref} a été rejeté`;
    htmlContent = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#222;border:1px solid #ddd;border-radius:8px;overflow:hidden;">
      ${header}
      <div style="padding:20px;">
        <p>Szanowny/a ${nom},</p>
        <p><b style="color:#d9534f;">Rejet : Votre transfert a été interrompu.</b></p>
        <p>Votre demande de transfert a été <b>rejetée</b> à ${pourcentage}% de traitement.</p>
        <p style="background:#f8d7da;padding:10px;border-radius:4px;color:#721c24;">Motif : Opération non conforme aux conditions de sécurité.</p>
        <div style="background:#f5f5f5;padding:10px;border-radius:4px;margin:10px 0;">
          <p><strong>Référence :</strong> #${ref}</p>
          <p><strong>Date :</strong> ${dateStr}</p>
          <p><strong>Heure :</strong> ${timeStr}</p>
          <p><strong>Montant :</strong> ${montantAffiche}</p>
          <p><strong>Destinataire :</strong> ${beneficiaireAffiche}</p>
          <p><strong>Compte (IBAN) :</strong> ${compteAffiche}</p>
        </div>
        <p>Merci de vérifier vos informations et de réessayer.</p>
        <p style="margin-top:25px">Bonjour ${nom},</p>
        <p>Votre compte ZenPay est toujours actif. Reference <b>#${ref}</b></p>
        <p style="font-size:13px;color:#666">${ville || ''} ${pays || ''} - ${telephone || ''}</p>
        <p>L'equipe ZenPay<br>hello@zenpaybj.xyz | zenpaybj.xyz</p>
      </div>
    </div>`;
    textContent = `Szanowny/a ${nom}, Rejet : Votre transfert a été interrompu à ${pourcentage}%. Ref #${ref}. Date: ${dateStr} Heure: ${timeStr} Montant: ${montantAffiche} Destinataire: ${beneficiaireAffiche} Compte: ${compteAffiche}. Veuillez vérifier vos informations. Equipe ZenPay.`;
  } else {
    sujet = `ZenPay - ${nom}, votre transfert #${ref} est confirmé`;
    htmlContent = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#222;border:1px solid #ddd;border-radius:8px;overflow:hidden;">
      ${header}
      <div style="padding:20px;">
        <p>Szanowny/a ${nom},</p>
        <p><b style="color:#28a745;">Sukces : Votre transfert a été réalisé avec succès.</b></p>
        <p>Transakcja została pomyślnie zaksięgowana. Dziękujemy za skorzystanie z usług ZenPay.</p>
        <div style="background:#f5f5f5;padding:10px;border-radius:4px;margin:10px 0;">
          <p><strong>Référence :</strong> #${ref}</p>
          <p><strong>Date :</strong> ${dateStr}</p>
          <p><strong>Heure :</strong> ${timeStr}</p>
          <p><strong>Montant :</strong> ${montantAffiche}</p>
          <p><strong>Destinataire :</strong> ${beneficiaireAffiche}</p>
          <p><strong>Compte (IBAN) :</strong> ${compteAffiche}</p>
        </div>
        <p style="margin-top:25px">Bonjour ${nom},</p>
        <p>Votre compte ZenPay est actif. Reference <b>#${ref}</b></p>
        <p style="font-size:13px;color:#666">${ville || ''} ${pays || ''} - ${telephone || ''}</p>
        <p>L'equipe ZenPay<br>hello@zenpaybj.xyz | zenpaybj.xyz</p>
      </div>
    </div>`;
    textContent = `Szanowny/a ${nom}, Sukces : Votre transfert a été réalisé. Ref #${ref}. Date: ${dateStr} Heure: ${timeStr} Montant: ${montantAffiche} Destinataire: ${beneficiaireAffiche} Compte: ${compteAffiche}. Equipe ZenPay.`;
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
