import React from 'react';
import { useState } from 'react';

export default function Welcome({ onLoginClick }) {
  const [loginMode, setLoginMode] = useState('login');

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-lg w-full text-center">
        <h1 className="text-4xl font-bold text-primary mb-4">Welcome to Cyber Egypt</h1>
        <p className="text-slate-600 mb-6">
          Your trusted platform for bug bounty programs and cybersecurity collaboration.
        </p>
        <p className="text-slate-500 mb-8">
          Report vulnerabilities, manage your security programs, and collaborate with top researchers.
        </p>
        <button
          onClick={onLoginClick}
          className="bg-primary text-white px-6 py-3 rounded-lg text-lg font-medium hover:bg-accent transition-colors duration-200"
        >
          Get Started
        </button>
      </div>
    </div>
  );
}
