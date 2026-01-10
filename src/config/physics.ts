export interface PhysicsConfig {
  gravity: number;
  shipAcceleration: number;
  shipMaxSpeed: number;
  shipRotationSpeed: number;
  asteroidSpeed: number;
  asteroidCount: number;
  asteroidMinSize: number;
  asteroidMaxSize: number;
  bulletSpeed: number;
  bulletFireRate: number;
}

export const DEFAULT_PHYSICS: PhysicsConfig = {
  gravity: 0,
  shipAcceleration: 0.15,
  shipMaxSpeed: 6,
  shipRotationSpeed: 5,
  asteroidSpeed: 1.5,
  asteroidCount: 5,
  asteroidMinSize: 15,
  asteroidMaxSize: 45,
  bulletSpeed: 8,
  bulletFireRate: 200,
};
