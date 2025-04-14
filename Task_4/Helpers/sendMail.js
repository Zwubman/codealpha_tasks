import nodemailer from "nodemailer";

// Send email notification only for the accepted applicants
export const sendMailNotification = async (
  userEMail,
  firstName,
  middleName,
  lastName,
  jobTitle,
  company,
  type
) => {
  try {
    // Create a transporter object using SMTP transport
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    let subject = "";
    let emailBody = "";

    // Set the subject and body based on the type of Accepted or Rejected
    if (type === "Accepted") {
      subject = `Congratulations, ${firstName} ${middleName} ${lastName} - You Are Accepted for the Job!`;
      emailBody = `
        <p>Dear ${firstName} ${middleName} ${lastName},</p>
        <p>We are excited to inform you that you have been accepted for the <strong>${jobTitle}</strong> position at <strong>${company}</strong>!</p>
        <p>Congratulations! Your application was reviewed and we are impressed by your qualifications.</p>
        <p>As the next step in the hiring process, you are scheduled for an interview. Please be prepared and available on:</p>
        <ul>
          <li><strong>Interview Date:</strong> In 7 days from today</li>
          <li><strong>Time:</strong> 12:00 AM</li>
          <li><strong>Location:</strong> [We will send you Video Link]</li>
        </ul>
        <p>We look forward to meeting you and discussing how you can contribute to our team at <strong>${company}</strong>.</p>
        <p>If you have any questions, please don’t hesitate to reach out. See you soon!</p>
      `;
    } else if (type === "Rejected") {
      subject = `We Regret to Inform You, ${firstName} ${middleName} ${lastName} - Application Rejected for the Job`;
      emailBody = `
        <p>Dear ${firstName} ${middleName} ${lastName},</p>
        <p>Thank you for your interest in the <strong>${jobTitle}</strong> position at <strong>${company}</strong>.</p>
        <p>After careful consideration, we regret to inform you that we will not be moving forward with your application at this time.</p>
        <p>While your qualifications are impressive, we have decided to proceed with other candidates for this particular role. We encourage you to apply for future opportunities with us, as your profile may be a good fit for other roles we may have.</p>
        <p>Thank you again for your time and interest in our company. We wish you the best of luck in your job search and future endeavors.</p>
        <p>If you have any questions, feel free to reach out. Thank you!</p>
      `;
    } else {
      throw new Error(
        "Invalid email type. Use 'Accepted' or 'Rejected'."
      );
    }

    // Set up the email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEMail,
      subject,
      html: `
        ${emailBody}
        <p>Best regards,</p>
        <p><strong>${company} Recruitment Team</strong></p>
      `,
    };

    // Send the email
    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to: ${userEMail}`);
  } catch (error) {
    console.log("Error sending email: ", error);
  }
};