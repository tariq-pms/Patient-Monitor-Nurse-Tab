import fetch from 'node-fetch';

// Define the sendEmail function, receiving 'metrics' and 'accessToken' as parameters
const sendEmail = async (metrics, accessToken) => {
  // Check if metrics is an array and contains at least one element
  if (!Array.isArray(metrics) || metrics.length === 0) {
    throw new Error('Metrics array is empty or invalid.');
  }

  // Log the received access token
  console.log('Access Token:', accessToken);

  const mailOptions = {
    message: {
      subject: 'Critical Alarm Detected',
      body: {
        contentType: 'html', // Correct the content type here
        content: `
          <p>
            Critical Alarm <strong>${metrics[0]?.alarmCode || 'Unknown'}</strong> was detected on device with 
            Serial No: <strong>${metrics[0]?.metricId || 'Unknown'}</strong> at 
            <strong>${metrics[0]?.timestamp || 'Unknown'}</strong>
          </p>
          <p>Please check the log for further details.</p>
        `,
      },
      toRecipients: [
        {
          emailAddress: {
            address: 'tariq.a@pmsind.com', 
          },
        },
        {
          emailAddress: {
            address: 'sanjeev.pn@pmsind.com', 
          },
        },
       
      ],
    },
  };
  

  try {
    const response = await fetch('https://graph.microsoft.com/v1.0/me/sendMail', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`, // Use the access token
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mailOptions),
    });

    if (!response.ok) {
      const errorBody = await response.text(); // Log the error body for debugging
      console.error('Error sending email:', errorBody); // Log detailed error
      throw new Error(`Failed to send email: ${response.statusText}`);
    }

    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    throw error; // Rethrow the error to handle it in the calling function
  }
};

export default sendEmail;
