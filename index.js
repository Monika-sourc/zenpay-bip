const express = require('express');
const app = express();
app.use(express.json());

const ONESIGNAL_APP_ID = "c55fedae-b7e4-43f1-9038-b1f6e456f1bc";
const ONESIGNAL_API_KEY = "os_v2_app_yvp631vx4rb7debywh3oiwhrxrcuvnwui5qedbe2gwwsctgbxmoneglo5romajjyrzbuxqpetj3k3tqd6epx4shkybrsmyggzjklrwi";

async function envoyerBip(montant, client, tel) {
  await fetch("https://api.onesignal.com/notifications", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Basic ${ONESIGNAL_API_KEY}`
    },
    body: JSON.stringify({
      app_id: ONESIGNAL_APP_ID,
      include_email_tokens: ["avogodans61@gmail.com"],
      email_subject: `💰 NOUVELLE COMMANDE ${montant} FCFA - ZenPay`,
      email_body: `<html><body style="text-align:center; font-family:Arial"><h1 style="color:red; font-size:32px;">🔔 BIP BIP !</h1><h2>${montant} FCFA reçu</h2><p>Client: ${client}</p><p>Tel: ${tel}</p></body></html>`,
      email_from_name: "ZenPay Alerte"
    })
  });
}

app.get('/', (req, res) => res.send('ZenPay BIP API OK'));
app.get('/test-bip', async (req, res) => {
  await envoyerBip("10000", "Fidelia Test", "22997000000");
  res.send('BIP envoyé ! Verifie ton Gmail');
});
app.post('/api/bip', async (req, res) => {
  const { montant, client, telephone } = req.body;
  await envoyerBip(montant || "0", client || "Client", telephone || "");
  res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('BIP API en marche'));
