// src/components/LandingPage.js
import React, { useState } from 'react';
import './Home.css';

const Home = () => {
  const [illuminated, setIlluminated] = useState(false);

  const toggleIllumination = () => {
    setIlluminated((prev) => !prev);
  };

  return (
    <div className="home-container">
      <div className='home-bg'>
      <div className={`moon ${illuminated ? 'illuminated' : ''}`}>
        <div className="home-text-container">
          <h1>{illuminated ? 'Illuminated Text' : 'Hidden Text'}</h1>
        </div>
      </div>
      <button className="home-button" onClick={toggleIllumination}>
        Toggle Illumination
      </button>
    </div>
    </div>
  );
};

export default Home;
