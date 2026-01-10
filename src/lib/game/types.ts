export interface Vector2D {
  x: number;
  y: number;
}

export interface Ship {
  position: Vector2D;
  velocity: Vector2D;
  rotation: number;
  alive: boolean;
  invulnerable: boolean;
  invulnerableUntil: number;
}

export interface Asteroid {
  id: number;
  position: Vector2D;
  velocity: Vector2D;
  size: number;
  vertices: Vector2D[];
}

export interface Bullet {
  id: number;
  position: Vector2D;
  velocity: Vector2D;
  createdAt: number;
}

export interface GameState {
  ship: Ship;
  asteroids: Asteroid[];
  bullets: Bullet[];
  score: number;
  lives: number;
  level: number;
  gameOver: boolean;
  paused: boolean;
  width: number;
  height: number;
}

export interface InputState {
  left: boolean;
  right: boolean;
  thrust: boolean;
  shoot: boolean;
}
