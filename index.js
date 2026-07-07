const express = require("express");
const cors = require("cors");
const { Resend } = require("resend");
const app = express();
app.use(cors());
app.use(express.json());
const resend = new Resend(process.env.RESEND_API_KEY);

function generateRandomCode(length = 4) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

app.post("/api/inscription", async (req, res) => {
  const { nom, email, telephone, ville, pays, pct, success, montant, beneficiaire, compte } = req.body;
  if (!nom || !email) return res.status(400).json({ success: false });

  const ref = Date.now().toString().slice(-6) + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  const randomPrefix = generateRandomCode(4);
  // Utiliser le préfixe aléatoire pour créer un alias unique
  const fromEmail = `noreply+${randomPrefix}@zenpaybj.xyz`;

  const now = new Date();
  const dateStr = now.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
  const montantAffiche = montant || '---';
  const beneficiaireAffiche = beneficiaire || '---';
  const compteAffiche = compte || '---';

  const estRejet = (success === false) || (typeof pct === 'number' && pct < 100);
  const pourcentage = (typeof pct === 'number' && pct >= 0 && pct <= 100) ? pct : 100;

  let sujet, htmlContent, textContent;

  const header = `<div style="background:#7B2FBE;padding:12px 20px;text-align:center;border-radius:8px 8px 0 0;color:#fff;font-size:22px;font-weight:bold;letter-spacing:1px;">ZenPay</div>`;
  const footer = `<p style="font-size:13px;color:#666;">noreply@zenpaybj.xyz</p>`;

  if (estRejet) {
    sujet = `${randomPrefix} ZenPay - Ref ${ref} : Twój przelew został odrzucony`;
    htmlContent = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#222;border:1px solid #ddd;border-radius:8px;overflow:hidden;">
      ${header}
      <div style="padding:20px;">
        <p>Szanowny/a ${nom},</p>
        <p><b style="color:#d9534f;">Odrzucenie : Twój przelew został przerwany.</b></p>
        <p>Twoja prośba o przelew została <b>odrzucona</b> na poziomie ${pourcentage}% przetwarzania.</p>
        <p style="background:#f8d7da;padding:10px;border-radius:4px;color:#721c24;">Przyczyna : Operacja niezgodna z warunkami bezpieczeństwa.</p>
        <div style="background:#f5f5f5;padding:10px;border-radius:4px;margin:10px 0;">
          <p><strong>Referencja :</strong> #${ref}</p>
          <p><strong>Data :</strong> ${dateStr}</p>
          <p><strong>Godzina :</strong> ${timeStr}</p>
          <p><strong>Kwota :</strong> ${montantAffiche}</p>
          <p><strong>Odbiorca :</strong> ${beneficiaireAffiche}</p>
          <p><strong>Konto (IBAN) :</strong> ${compteAffiche}</p>
        </div>
        <p>Prosimy sprawdzić dane i spróbować ponownie.</p>
        <p style="margin-top:25px">Witaj ${nom},</p>
        <p>Twoje konto ZenPay pozostaje aktywne. Referencja <b>#${ref}</b></p>
        <p style="font-size:13px;color:#666">${ville || ''} ${pays || ''} - ${telephone || ''}</p>
        <p>Zespół ZenPay</p>
        ${footer}
      </div>
    </div>`;
    textContent = `Szanowny/a ${nom}, Odrzucenie : Twój przelew został przerwany na poziomie ${pourcentage}%. Ref #${ref}. Data: ${dateStr} Godzina: ${timeStr} Kwota: ${montantAffiche} Odbiorca: ${beneficiaireAffiche} Konto: ${compteAffiche}. Prosimy sprawdzić dane. Zespół ZenPay.`;
  } else {
    sujet = `${randomPrefix} ZenPay - Ref ${ref} : Twój przelew został zrealizowany`;
    htmlContent = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#222;border:1px solid #ddd;border-radius:8px;overflow:hidden;">
      ${header}
      <div style="padding:20px;">
        <p>Szanowny/a ${nom},</p>
        <p><b style="color:#28a745;">Sukces : Twój przelew został zrealizowany.</b></p>
        <p>Transakcja została pomyślnie zaksięgowana. Dziękujemy za skorzystanie z usług ZenPay.</p>
        <div style="background:#f5f5f5;padding:10px;border-radius:4px;margin:10px 0;">
          <p><strong>Referencja :</strong> #${ref}</p>
          <p><strong>Data :</strong> ${dateStr}</p>
          <p><strong>Godzina :</strong> ${timeStr}</p>
          <p><strong>Kwota :</strong> ${montantAffiche}</p>
          <p><strong>Odbiorca :</strong> ${beneficiaireAffiche}</p>
          <p><strong>Konto (IBAN) :</strong> ${compteAffiche}</p>
        </div>
        <p style="margin-top:25px">Witaj ${nom},</p>
        <p>Twoje konto ZenPay jest aktywne. Referencja <b>#${ref}</b></p>
        <p style="font-size:13px;color:#666">${ville || ''} ${pays || ''} - ${telephone || ''}</p>
        <p>Zespół ZenPay</p>
        ${footer}
      </div>
    </div>`;
    textContent = `Szanowny/a ${nom}, Sukces : Twój przelew został zrealizowany. Ref #${ref}. Data: ${dateStr} Godzina: ${timeStr} Kwota: ${montantAffiche} Odbiorca: ${beneficiaireAffiche} Konto: ${compteAffiche}. Zespół ZenPay.`;
  }

  try {
    await resend.emails.send({
      from: `ZenPay <${fromEmail}>`, // Expéditeur unique à chaque envoi
      to: [email],
      reply_to: "noreply@zenpaybj.xyz",
      subject: sujet,
      priority: 'high',
      html: htmlContent,
      text: textContent,
      headers: {
        "X-Priority": "1 (Highest)",
        "X-MSMail-Priority": "High",
        "Importance": "high",
        "X-Google-Important": "yes",
        "X-Mailer": "ZenPay Mailer",
        "List-Unsubscribe": "<mailto:noreply@zenpaybj.xyz>",
        "Precedence": "transactional",
        "X-Entity-Ref-ID": ref
      }
    });
    res.json({ success: true, ref });
  } catch (e) {
    console.error("Erreur Resend:", e);
    res.status(500).json({ success: false, error: e.message });
  }
});

app.get("/", (req,res)=>res.send("ZenPay API Fort OK"));
app.listen(process.env.PORT || 10000);
