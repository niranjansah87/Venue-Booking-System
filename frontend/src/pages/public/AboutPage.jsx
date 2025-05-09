import React from 'react';

function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6">About Us</h1>
      <div className="prose max-w-none">
        <p className="text-lg mb-4">
          Welcome to our venue management platform. We specialize in creating memorable events
          and experiences for our clients.
        </p>
      </div>
    </div>
  );
}

export default AboutPage;