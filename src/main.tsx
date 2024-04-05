// import React from 'react'
import ReactDOM from 'react-dom/client'

import App from './App.tsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { Auth0Provider } from '@auth0/auth0-react'
// import * as dotenv from 'dotenv';
// dotenv.config();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  // <Auth0Provider
    
  //   domain='dev-8lsywbwx6lxvrsc4.eu.auth0.com'
  //   clientId='wB6O4QlO1QNV6c7mhmjRE7BAJNTq4hbg'
  //   authorizationParams={{
  //     redirect_uri: window.location.origin
  //   }}
  // >
  //   <BrowserRouter>
  //       <App />
  //   </BrowserRouter>
  // </Auth0Provider>
  
  <Auth0Provider
  domain = {import.meta.env.VITE_AUTH0_DOMAIN  as string} 
  clientId={import.meta.env.VITE_AUTH0_CLIENT_ID as string}
  authorizationParams={{
    redirect_uri: window.location.origin
  }}
>
  <BrowserRouter>
      <App />
  </BrowserRouter>
</Auth0Provider>
)
