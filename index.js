const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('ZenPay BIP Server OK - BREVO - ' + new Date().toISOString());
});

// TEST RAPIDE
app.get('/test-bip', async (req, res) => {
  const to = req.query.email;
  if (!to) return res.send('Ajoute ?email=tonemail@gmail.com dans le lien');
  
  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: { name: "ZenPay", email: "noreply@zenpaybj.xyz" },
        to: [{ email: to }],
        subject: "BIP BIP! Paiement ZenPay 10 000 FCFA",
        htmlContent: "<h1>🔔 10 000 FCFA recu - ZenPay</h1><p>BIP de test OK depuis Brevo API ! Ca marche !</p>"
      })
    });
    const data = await response.json();
    console.log('BREVO:', data);
    if (!response.ok) throw new Error(JSON.stringify(data));
    res.send('BIP ENVOYE AVEC SUCCES a ' + to + ' via BREVO');
  } catch (e) {
    console.error(e);
    res.status(500).send('ERREUR BREVO: ' + e.message);
  }
});

// VRAI BIP POUR TES CLIENTS
app.get('/bip', async (req, res) => {
  const clientEmail = req.query.email;
  const montant = req.query.montant || '10000';
  if (!clientEmail) return res.status(400).send('email client manquant');
  
  try {
    await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: { name: "ZenPay", email: "noreply@zenpaybj.xyz" },
        to: [{ email: clientEmail }],
        subject: `Paiement ${montant} FCFA confirme - ZenPay`,
        htmlContent: `<div style="font-family:Arial;padding:20px"><h2 style="color:green">Merci ! ${montant} FCFA recu</h2><p>Votre paiement ZenPay est confirme.</p><p>ZenPay - Paiement Securise</p></div>`
      })
    });
    res.send('BIP client envoye a ' + clientEmail);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

app.listen(PORT, () => console.log('OK port ' + PORT));
