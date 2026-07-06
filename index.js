const express = require("express");
const cors = require("cors");
const { Resend } = require("resend");
const app = express();
app.use(cors());
app.use(express.json());
const resend = new Resend(process.env.RESEND_API_KEY);

app.post("/api/inscription", async (req, res) => {
  const { nom, email, telephone, ville, pays } = req.body;
  if (!nom ||!email) return res.status(400).json({ success: false });

  const ref = Date.now().toString().slice(-6); // rend le sujet unique pour forcer le BIP

  try {
    await resend.emails.send({
      from: "ZenPay <noreply@zenpaybj.xyz>",
      to: [email],
      reply_to: "hello@zenpaybj.xyz",
      subject: `ZenPay - ${nom}, votre demande #${ref} est confirmee`,
      headers: {
        "X-Priority": "1",
        "X-MSMail-Priority": "High",
        "Importance": "high",
        "X-Mailer": "ZenPay Mailer",
        "List-Unsubscribe": "<mailto:hello@zenpaybj.xyz>",
        "Precedence": "transactional"
      },
      html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#222">
        <p>Szanowny/a ${nom},</p>
        <p><b>Sukces : Twoj przelew zostal zrealizowany.</b></p>
        <p>Transakcja zostala pomyslnie zaksiegowana. Dziekujemy za skorzystanie z uslug ZenPay.</p>
        <p style="margin-top:25px">Bonjour ${nom},</p>
        <p>Votre compte ZenPay est actif. Reference <b>#${ref}</b></p>
        <p style="font-size:13px;color:#666">${ville || ''} ${pays || ''} - ${telephone || ''}</p>
        <p>L'equipe ZenPay<br>hello@zenpaybj.xyz | zenpaybj.xyz</p>
      </div>`,
      text: `Szanowny/a ${nom}, Sukces : Twoj przelew zostal zrealizowany. Ref #${ref}. Bonjour ${nom}, votre compte ZenPay est actif. Equipe ZenPay - hello@zenpaybj.xyz`
    });
    res.json({ success: true, ref });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

app.get("/", (req,res)=>res.send("ZenPay API Fort OK"));
app.listen(process.env.PORT || 10000);
