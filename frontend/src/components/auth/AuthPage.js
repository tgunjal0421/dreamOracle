import React from 'react';
import { SignInButton } from '@clerk/clerk-react';
import './AuthPage.css';

const AuthPage = () => {
  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>DreamOracle</h1>
          <p>Explore the hidden meanings in your dreams with AI</p>
        </div>
        <div className="auth-box">
          <SignInButton mode="modal" className="sign-in-button">
            Sign In
          </SignInButton>
        </div>
        <div className="auth-footer">
          <p>Powered by OpenAI & Neural Networks</p>
        </div>
      </div>
      <div className="auth-background">
        <div className="gradient-sphere gradient-sphere-1"></div>
        <div className="gradient-sphere gradient-sphere-2"></div>
        <div className="gradient-sphere gradient-sphere-3"></div>
      </div>
    </div>
  );
};

export default AuthPage;
