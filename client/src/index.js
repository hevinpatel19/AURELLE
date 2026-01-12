import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import { AuthProvider } from './context/AuthContext';

// VVVV --- THIS IS THE NEW PART --- VVVV
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

// 1. Paste your Stripe *Publishable Key* here (the 'pk_test_...' one)
//    It's safe for this key to be public.
const stripePromise = loadStripe('pk_test_51STyR8IkuLiRZrCBt3MgxdMfWISebWu7LDSTUYarsLWYdkGZ4eluBnbUB7UP8BG8hYaVinhDDcJ7nGUhTsScaaZq00rw102IfK'); 
// ^^^^ --- THIS IS THE NEW PART --- ^^^^


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        {/* VVVV --- WRAP YOUR APP IN ELEMENTS --- VVVV */}
        <Elements stripe={stripePromise}>
          <App />
        </Elements>
        {/* ^^^^ --- WRAP YOUR APP IN ELEMENTS --- ^^^^ */}
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);