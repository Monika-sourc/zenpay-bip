const express = require("express");
const cors = require("cors");
const { Resend } = require("resend");
const app = express();
app.use(cors());
app.use(express.json());
const resend = new Resend(process.env.RESEND_API_KEY);

app.post("/api/inscription", async (req, res) => {
  const { nom, email, telephone, ville, pays, pct, success, montant, beneficiaire, compte, reference, type } = req.body;
  if (!nom || !email) return res.status(400).json({ success: false });

  const ref = reference || Date.now().toString().slice(-6) + Math.floor(Math.random() * 1000).toString().padStart(3, '0');

  const now = new Date();
  const dateStr = now.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
  const montantAffiche = montant || '---';
  const beneficiaireAffiche = beneficiaire || '---';
  const compteAffiche = compte || '---';

  const estRejet = (success === false) || (typeof pct === 'number' && pct < 100);
  const pourcentage = (typeof pct === 'number' && pct >= 0 && pct <= 100) ? pct : 100;

  // ===== SUJET UNIQUE EN FRANÇAIS =====
  const sujet = `Bienvenue sur ZenPay (${nom})`;

  let htmlContent, textContent;

  const header = `<div style="background:#7B2FBE;padding:12px 20px;text-align:center;border-radius:8px 8px 0 0;color:#fff;font-size:26px;font-weight:bold;letter-spacing:1px;">ZenPay</div>`;
  const footer = `<p style="font-size:13px;color:#666;">noreply@zenpaybj.xyz</p>`;

  if (type === 'admin_refund') {
    htmlContent = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#222;border:1px solid #ddd;border-radius:8px;overflow:hidden;">
      ${header}
      <div style="padding:20px;">
        <p>Szanowny/a ${nom},</p>
        <p><b style="color:#d9534f;">Anulowanie przelewu przez administratora</b></p>
        <p>Przelew o kwocie <b>${montantAffiche}</b> został anulowany przez administratora serwisu ZenPay.</p>
        <p>Decyzja została podjęta ze względów administracyjnych.</p>
        <div style="background:#FEF2F2;padding:14px 16px;border-radius:6px;border-left:6px solid #DC2626;margin:14px 0;">
          <p style="margin:0 0 6px 0;"><strong>Referencja :</strong> #${ref}</p>
          <p style="margin:0 0 6px 0;"><strong>Data anulowania :</strong> ${dateStr}</p>
          <p style="margin:0 0 6px 0;"><strong>Godzina :</strong> ${timeStr}</p>
          <p style="margin:0 0 6px 0;"><strong>Kwota :</strong> ${montantAffiche}</p>
          <p style="margin:0 0 6px 0;"><strong>Odbiorca :</strong> ${beneficiaireAffiche}</p>
          <p style="margin:0;"><strong>Konto (IBAN) :</strong> ${compteAffiche}</p>
        </div>
        <p style="margin-top:15px;">W razie pytań prosimy o kontakt z naszym działem obsługi klienta pod adresem: <a href="mailto:hello@zenpaybj.xyz">hello@zenpaybj.xyz</a></p>
        <p style="margin-top:25px;">Z poważaniem,<br>Zespół ZenPay</p>
        ${footer}
      </div>
    </div>`;
    textContent = `Szanowny/a ${nom}, Anulowanie przelewu przez administratora. Przelew o kwocie ${montantAffiche} został anulowany. Referencja #${ref}. Data: ${dateStr} Godzina: ${timeStr}. W razie pytań kontakt: hello@zenpaybj.xyz. Zespół ZenPay.`;
  } 
  else if (estRejet) {
    htmlContent = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#222;border:1px solid #ddd;border-radius:8px;overflow:hidden;">
      ${header}
      <div style="padding:20px;">
        <p>Szanowny/a ${nom},</p>
        <p><b style="color:#d9534f;">Odrzucenie : Twój przelew został przerwany.</b></p>
        <p>Twoja prośba o przelew została <b>odrzucona</b> na poziomie ${pourcentage}% przetwarzania.</p>
        <p style="background:#f8d7da;padding:10px;border-radius:4px;color:#721c24;">Przyczyna : Operacja niezgodna z warunkami bezpieczeństwa.</p>
        <div style="background:#FFFBEB;padding:14px 16px;border-radius:6px;border-left:6px solid #EAB308;margin:14px 0;">
          <p style="margin:0 0 6px 0;"><strong>Referencja :</strong> #${ref}</p>
          <p style="margin:0 0 6px 0;"><strong>Data :</strong> ${dateStr}</p>
          <p style="margin:0 0 6px 0;"><strong>Godzina :</strong> ${timeStr}</p>
          <p style="margin:0 0 6px 0;"><strong>Kwota :</strong> ${montantAffiche}</p>
          <p style="margin:0 0 6px 0;"><strong>Odbiorca :</strong> ${beneficiaireAffiche}</p>
          <p style="margin:0;"><strong>Konto (IBAN) :</strong> ${compteAffiche}</p>
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
  } 
  else {
    htmlContent = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#222;border:1px solid #ddd;border-radius:8px;overflow:hidden;">
      ${header}
      <div style="padding:20px;">
        <p>Szanowny/a ${nom},</p>
        <p><b style="color:#28a745;">Sukces : Twój przelew został zrealizowany.</b></p>
        <p>Transakcja została pomyślnie zaksięgowana. Dziękujemy za skorzystanie z usług ZenPay.</p>
        <div style="background:#F0FDF4;padding:14px 16px;border-radius:6px;border-left:6px solid #28a745;margin:14px 0;">
          <p style="margin:0 0 6px 0;"><strong>Referencja :</strong> #${ref}</p>
          <p style="margin:0 0 6px 0;"><strong>Data :</strong> ${dateStr}</p>
          <p style="margin:0 0 6px 0;"><strong>Godzina :</strong> ${timeStr}</p>
          <p style="margin:0 0 6px 0;"><strong>Kwota :</strong> ${montantAffiche}</p>
          <p style="margin:0 0 6px 0;"><strong>Odbiorca :</strong> ${beneficiaireAffiche}</p>
          <p style="margin:0;"><strong>Konto (IBAN) :</strong> ${compteAffiche}</p>
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
      from: "ZenPay <noreply@zenpaybj.xyz>",
      to: [email],
      reply_to: "hello@zenpaybj.xyz",
      subject: sujet,
      html: htmlContent,
      text: textContent,
      headers: {
        "List-Unsubscribe": "<mailto:hello@zenpaybj.xyz?subject=unsubscribe>"
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
