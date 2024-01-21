import React, { useRef } from 'react';
import { Canvas, useFrame } from 'react-three-fiber';
import { Stars } from '@react-three/drei';

const TwinklingStars = () => {
  const starsRef = useRef();
  const opacityThreshold = 0.0002; // Adjust this value to control the threshold

  useFrame(() => {
    // Rotate the stars over time
    starsRef.current.rotation.x += 0.0002;
    starsRef.current.rotation.y += 0.0002;

    // Randomly adjust the opacity of stars below the threshold
    starsRef.current.children.forEach((star) => {
      if (Math.random() < opacityThreshold) {
        const newOpacity = Math.random();
        star.material.color.set(`rgba(255, 255, 255, ${newOpacity})`);
      }
    });
  });

  return (
    <Stars
      ref={starsRef}
      radius={100}
      depth={20}
      count={4000}
      factor={5}
      saturation={0}
      fade
    />
  );
};

const StarryBackground = () => {
  return (
    <div style={{
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: '#0B0A23', // Replace with your desired background color
    }}>
      <Canvas style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, width: '100%', height: '100%' }}>
        <ambientLight intensity={0.1} />
        <pointLight position={[10, 10, 10]} />
        <TwinklingStars />
      </Canvas>
    </div>
  );
};

export default StarryBackground;
