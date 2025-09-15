import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  // 1) Create a transporter
  const transporter = nodemailer.createTransport({
    service: 'Gmail', // or another service, such as SendGrid or Mailgun
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // 2) Define the email options
  const mailOptions = {
    from: 'no-reply@yourapp.com',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html: options.html, // Uncomment if you want to send an HTML email
  };

  // 3) Actually send the email
  await transporter.sendMail(mailOptions);
};

export default sendEmail;
