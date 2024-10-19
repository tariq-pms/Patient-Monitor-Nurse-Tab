import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import jwt from 'jsonwebtoken'; // Import jsonwebtoken for decoding JWT
import sendEmail from './sendEmail.js'; // Import your sendEmail function

dotenv.config(); // Load environment variables

const app = express();
const port = 3000;

app.use(bodyParser.json()); // Parse incoming JSON requests
app.use(cors()); // Enable CORS

let accessToken = ''; // Variable to store the access token
let refreshToken = ''; // Variable to store the refresh token
let tokenExpiryTime = 0; // Variable to store the token expiry time


// Route to initiate OAuth authorization
app.get('/auth', (req, res) => {
  const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?` +
                  `client_id=${process.env.CLIENT_ID}&` +
                  `response_type=code&` +
                  `redirect_uri=${process.env.REDIRECT_URI}&` +
                  `response_mode=query&` +
                  `scope=https://graph.microsoft.com/.default offline_access`; // Add offline_access here

  console.log('Redirecting to Auth URL:', authUrl); // Log the auth URL
  res.redirect(authUrl); // Redirect the user to the Microsoft authorization URL
});


// Function to exchange authorization code for access token
const exchangeCodeForToken = async (code) => {
  const tokenUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/token`;
  const params = new URLSearchParams();

  params.append('client_id', process.env.CLIENT_ID);
  params.append('client_secret', process.env.CLIENT_SECRET);
  params.append('code', code);
  params.append('redirect_uri', process.env.REDIRECT_URI);
  params.append('grant_type', 'authorization_code');
  params.append('scope', 'https://graph.microsoft.com/.default');

  const response = await fetch(tokenUrl, {
    method: 'POST',
    body: params,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('Error exchanging code for token:', errorBody);
    throw new Error('Failed to exchange code for token: ' + response.statusText + '. Response: ' + errorBody);
  }

  return response.json(); // Return the token response as JSON
};


// Function to refresh the access token using the refresh token
const refreshAccessToken = async () => {
  const tokenUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/token`;
  const params = new URLSearchParams();

  params.append('client_id', process.env.CLIENT_ID);
  params.append('client_secret', process.env.CLIENT_SECRET);
  params.append('refresh_token', refreshToken); // Use the refresh token
  params.append('grant_type', 'refresh_token');
  params.append('scope', 'https://graph.microsoft.com/.default');

  const response = await fetch(tokenUrl, {
    method: 'POST',
    body: params,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('Error refreshing access token:', errorBody);
    throw new Error('Failed to refresh access token: ' + response.statusText + '. Response: ' + errorBody);
  }

  const tokenResponse = await response.json();
  console.log('Refreshed tokens:', tokenResponse); // Log the refreshed tokens

  accessToken = tokenResponse.access_token; // Update access token
  if (tokenResponse.refresh_token) {
    refreshToken = tokenResponse.refresh_token; // Update refresh token if a new one is issued
  }
};


// Middleware to ensure valid access token
const ensureValidAccessToken = async () => {
  if (Date.now() >= tokenExpiryTime) {
    console.log('Access token expired, refreshing...');
    await refreshAccessToken();
  }
};

// Define a POST route for sending emails
app.post('/send-email', async (req, res) => {
  try {
    const { metrics } = req.body;

    console.log('Received metrics for email:', metrics); // Log received metrics

    await ensureValidAccessToken(); // Ensure the access token is valid

    console.log('Current Access Token:', accessToken); // Log the access token being used
    await sendEmail(metrics, accessToken);

    res.status(200).send('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).send('Error sending email: ' + error.message);
  }
});


// Define the callback route for OAuth
app.get('/auth/callback', async (req, res) => {
  const code = req.query.code;
  if (!code) {
    console.error('Authorization code not provided.');
    return res.status(400).send('Authorization code not provided.');
  }

  console.log('Authorization Code:', code); // Log the authorization code

  try {
    const tokens = await exchangeCodeForToken(code);
    console.log('Tokens received:', tokens); // Log the entire token response

    if (tokens.access_token && tokens.refresh_token) { // Check if refresh_token is present
      accessToken = tokens.access_token; // Save the access token
      refreshToken = tokens.refresh_token; // Save the refresh token
      console.log('Access Token:', accessToken);
      console.log('Refresh Token:', refreshToken); // Log refresh token

      const decodedToken = jwt.decode(accessToken);
      if (decodedToken) {
        console.log('Decoded Token:', decodedToken);
        console.log('Tenant ID from Token:', decodedToken.tid);
      } else {
        console.error('Failed to decode token.');
      }
    } else {
      console.error('Access or refresh token not found in tokens response');
    }

    res.status(200).send('Tokens received successfully');
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    res.status(500).send('Error exchanging code for token: ' + error.message);
  }
});


// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
