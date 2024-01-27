import React from 'react'
import './LoadingScreen.scss'
import StarryBackground from '../StarryBg'

export const LoadingScreen = () => {
    
  return (
    <div class="universe-wrapper">
        <StarryBackground/>
    <div class="stars-wrapper"></div>
    <div class="planets-wrapper">
      <div class="sun"></div>
      <div class="mercury"></div>
      <div class="venus"></div>
      <div class="earth"> </div>
      <div class="mars"> </div>
      <div class="jupiter"></div>
      <div class="saturn"></div>
      <div class="uranus"></div>
      <div class="neptune"></div>
      <div class="pluto"></div>
    </div>
  </div>
  )
}
