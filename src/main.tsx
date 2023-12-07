// import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { Auth0Provider } from '@auth0/auth0-react'


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
  domain='neolife-sentinel.eu.auth0.com'
  clientId='EvcV4fbf5sNV5sDLfyCSd5om9yf8TN7W'
  authorizationParams={{
    redirect_uri: window.location.origin
  }}
>
  <BrowserRouter>
      <App />
  </BrowserRouter>
</Auth0Provider>
)
