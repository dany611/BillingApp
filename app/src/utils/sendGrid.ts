// src/utils/sendGrid.ts
export const sendEmail = async (to: string, subject: string, content: string) => {
    const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: 'noreply@yourdomain.com' },
        subject: subject,
        content: [{ type: 'text/plain', value: content }]
      })
    });
  
    return res.ok;
  };
  