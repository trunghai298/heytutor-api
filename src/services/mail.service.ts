import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    // user: "heytutor.noreply@gmail.com",
    // pass: "heytutor1234",
    user: "nguoi.choi.he.ax@gmail.com",
    pass: "Anhpr098",
  },
});

const sendMailToCollaborator = async (email, password) => {
  try {
    const mailOptions = {
      from: "heytutor.noreply@gmail.com",
      to: email,
      subject: "You are invited to HeyTutor system as a collaborator!",
      text: `Your account: email ${email}, password: ${password}`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
  } catch (error) {
    return error;
  }
};

export default {
  sendMailToCollaborator,
};
