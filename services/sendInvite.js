import nodemailer from 'nodemailer';
import { google } from 'googleapis';
import dotenv from 'dotenv';
import fs from 'fs';
import handlebars from 'handlebars';
import path from 'path'; // Import path module

dotenv.config();

// OAuth2 client setup
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;
const CLIENT_USER = process.env.EMAIL_USER;

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const sendInvitationEmail = async (
  email,
  inviterEmail,
  inviterName,
  roomID
) => {
  try {
    // Get current file path using import.meta.url and resolve path to template
    const currentFilePath = new URL(import.meta.url).pathname;
    const templatePath = path.resolve(
      path.dirname(currentFilePath),
      'services/Register_temp.html'
    );

    // // Check if the template file exists
    // if (!fs.existsSync(templatePath)) {
    //   throw new Error(`Template file not found at: ${templatePath}`);
    // }

    // Read the template file
    const source = fs
      .readFileSync('services/Register_temp.html', 'utf-8')
      .toString();

    // Compile the template
    const template = handlebars.compile(source);

    // Generate email content
    const replacements = {
      email: email,
      room: roomID,
      inviterName: inviterName,
    };
    const htmlToSend = template(replacements);

    // Get an access token using OAuth2
    const accessToken = await oAuth2Client.getAccessToken();

    // Configure the email transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: CLIENT_USER,
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken.token,
      },
    });

    // Email options
    const mailOptions = {
      from: inviterEmail, // Use the inviter's email address
      to: email,
      subject: 'You have been invited to join a workroom!',
      text: `You have been invited to join the workroom '${roomID}'`,
      html: htmlToSend, // Use the compiled HTML template
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

export default sendInvitationEmail;
