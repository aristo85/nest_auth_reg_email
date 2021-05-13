const nodemailer = require('nodemailer');
import * as dotenv from 'dotenv';
dotenv.config()
const user = process.env.HOST_MAIL;
const pass = process.env.MAIL_PASS;
const service = process.env.MAIL_SERVICE;
const transport = nodemailer.createTransport({
  service: service,
  auth: {
    user: user,
    pass: pass,
  },
});

export const sendConfirmationEmail = (name, email, confirmationCode) => {

  console.log('Check', user, pass, service);
  transport
    .sendMail({
      from: user,
      to: email,
      subject: 'Please confirm your account',
      html: `<h1>Email Confirmation</h1>
          <h2>Hello ${name}</h2>
          <p>Your confirmation code ${confirmationCode}</p>
          </div>`,
    })
    .catch((err) => console.log(err));
};

export const sendFeedbackEmail = (name, email, title, text) => {
  console.log('Check feedback');
  transport
    .sendMail({
      from: user,
      to: user,
      subject: 'Обратная связь',
      html: `<h5>От: ${name}, ${email} </h5>
          <h2>${title}</h2>
          <p>${text}</p>
          </div>`,
    })
    .catch((err) => console.log(err));
};
