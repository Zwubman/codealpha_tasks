import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();


//Send email notification if the user registered successfully for the eventS
export const sendRegistrationEmail = async (
  userEmail,
  eventTitle,
  eventDate,
  eventLocation
) => {
  try {
    //Create transporter
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });


    //Email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: "Event Registration Confirmation",
      html: `
      <h2>Event Registration Successful!</h2>
        <p>Hello,</p>
        <p>You have successfully registered for the event <strong>${eventTitle}</strong>.</p>
        <p><strong>Date:</strong> ${eventDate}</p>
        <p><strong>Location:</strong> ${eventLocation}</p>
        <p>We look forward to seeing you there!</p>
        <p>Best regards,</p>
        <p>The Event Team</p>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully to", userEmail);
  } catch (error) {
    console.log("error sending email:", error);
  }
};
