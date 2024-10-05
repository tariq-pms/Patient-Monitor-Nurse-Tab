
import nodemailer from 'nodemailer';

// Define the sendEmail function, receiving 'metrics' as a parameter
const sendEmail = async (metrics) => {
  // Create a transporter using your email provider's SMTP settings
  const transporter = nodemailer.createTransport({
    service: 'gmail',  // You can change this to your email provider
    auth: {
      user: 'munnarjuly@gmail.com', // Your Gmail address
      pass: 'uayj eatt zfmm qrna', // Use your generated App Password if 2FA is enabled
    },
  });
  // const transporter = nodemailer.createTransport({
  //   host: 'smtp.office365.com', // Outlook SMTP server
  //   port: 587, // Secure port for Outlook
  //   secure: false, // Use TLS (false for port 587)
  //   auth: {
  //     user: 'servicephoenix@outlook.com', // Your Outlook email address
  //     pass: 'aucbobqsmioxtdvw', // Your Outlook email password (or App Password if 2FA is enabled)
  //   },
  //   tls: {
  //     ciphers: 'SSLv3' // To avoid TLS-related issues
  //   }
  // });

  // Construct the email content based on metrics data
  const mailOptions = {
    from: 'servicephoenix@outlook.com', // Sender address
    to: 'tariq.a@pmsind.com', // Recipient address
    subject: 'Critical Alarm Detected',  // Email subject
    text: `Critical Alarm - ${metrics[0]?.alarmCode || 'Unknown'} was detected on device with Serial No: ${metrics[0]?.metricId || 'Unknown'} at ${metrics[0]?.timestamp || 'Unknown'}. Please check the log for further details.`,
    html: `
      <p>
        Critical Alarm <strong> ${metrics[0]?.alarmCode || 'Unknown'}</strong> was detected on device with 
        Serial No: <strong>${metrics[0]?.metricId || 'Unknown'}</strong> at 
        <strong>${metrics[0]?.timestamp || 'Unknown'}</strong>
      </p>
      <p>Please check the log for further details.</p>
    `, 
 

  };

  // Send the email
  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

export default sendEmail;
