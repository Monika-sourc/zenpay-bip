const express = require('express');
const nodemailer = require('nodemailer');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req,res)=>{
  res.send('ZenPay BIP Server OK - ' + new Date().toISOString());
});

const transporter = nodemailer.createTransport({
  host: 'smtppro.zoho.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  connectionTimeout: 15000,
  greetingTimeout: 15000,
  socketTimeout: 15000
});

app.get('/test-bip', async (req,res)=>{
  const to = req.query.email;
  if(!to) return res.send('Ajoute ?email=tonemail@gmail.com');
  console.log('Tentative envoi vers', to);
  try {
    let info = await transporter.sendMail({
      from: '"ZenPay" <noreply@zenpaybj.xyz>',
      to: to,
      subject: 'BIP BIP! Paiement ZenPay',
      html: '<h1>🔔 10 000 FCFA recu - ZenPay</h1><p>Test OK depuis noreply@zenpaybj.xyz</p>'
    });
    console.log('Envoye', info.messageId);
    res.send('BIP ENVOYE avec SUCCES a ' + to);
  } catch(e){ 
    console.error('ERREUR SMTP', e);
    res.status(500).send('ERREUR ZOHO: '+e.message); 
  }
});

app.get('/bip', async (req,res)=>{
  const clientEmail = req.query.email;
  const montant = req.query.montant || '10000';
  if(!clientEmail) return res.status(400).send('email client manquant');
  try {
    await transporter.sendMail({
      from: '"ZenPay" <noreply@zenpaybj.xyz>',
      to: clientEmail,
      subject: `Paiement ${montant} FCFA confirme`,
      html: `<h2>Merci ! ${montant} FCFA recu</h2>`
    });
    res.send('BIP client envoye a '+clientEmail);
  } catch(e){ res.status(500).send(e.message) }
});

app.listen(PORT, ()=> console.log('OK port '+PORT));
