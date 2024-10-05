import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import sendEmail from './sendEmail.js';  // Import your sendEmail function

const app = express();
const port = 3000;

app.use(bodyParser.json());  // Parse incoming JSON requests
app.use(cors());  // Enable CORS

// Define a POST route for sending emails
app.post('/send-email', async (req, res) => {
  try {
    const { metrics } = req.body;  // Extract 'metrics' from the request body

    // Call the sendEmail function and pass the metrics data
    await sendEmail(metrics);

    res.status(200).send('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).send('Error sending email');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
