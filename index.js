const express = require("express");
const cors = require("cors");
const { Resend } = require("resend");
const app = express();
app.use(cors());
app.use(express.json());
const resend = new Resend(process.env.RESEND_API_KEY);

app.post("/api/inscription", async (req, res) => {
  const { nom, email } = req.body;
  try {
    await resend.emails.send({
      from: "ZenPay <noreply@zenpaybj.xyz>",
      to: [email],
      reply_to: "hello@zenpaybj.xyz",
      subject: "Votre demande ZenPay a ete effectuee avec succes",
      html: `<p>Szanowny/a ${nom},</p><p><b>Sukces : Twoj przelew zostal zrealizowany.</b></p><p>Transakcja zostala pomyslnie zaksiegowana na koncie odbiorcy. Dziekujemy za skorzystanie z uslug ZenPay.</p><hr><p>Bonjour ${nom}, votre compte est actif.</p><p>L'equipe ZenPay</p>`,
      text: `Sukces ${nom}, Twoj przelew zostal zrealizowany. Merci pour ton inscription ZenPay.`
    });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});
app.get("/", (req,res)=>res.send("OK"));
app.listen(process.env.PORT || 10000);
