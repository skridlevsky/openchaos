import type { PhysicsConfig } from "@/config/physics";
import type {
  GameState,
  Ship,
  Asteroid,
  Bullet,
  InputState,
  Vector2D,
} from "./types";

let nextId = 1;

function generateId(): number {
  return nextId++;
}

function generateAsteroidVertices(size: number): Vector2D[] {
  const vertices: Vector2D[] = [];
  const numVertices = 8 + Math.floor(Math.random() * 5);
  for (let i = 0; i < numVertices; i++) {
    const angle = (i / numVertices) * Math.PI * 2;
    const variance = 0.6 + Math.random() * 0.4;
    vertices.push({
      x: Math.cos(angle) * size * variance,
      y: Math.sin(angle) * size * variance,
    });
  }
  return vertices;
}

function createAsteroid(
  x: number,
  y: number,
  size: number,
  vx?: number,
  vy?: number,
  speed?: number
): Asteroid {
  const actualSpeed = speed ?? 1;
  const angle = Math.random() * Math.PI * 2;
  return {
    id: generateId(),
    position: { x, y },
    velocity: {
      x: vx ?? Math.cos(angle) * actualSpeed,
      y: vy ?? Math.sin(angle) * actualSpeed,
    },
    size,
    vertices: generateAsteroidVertices(size),
  };
}

export function createInitialState(
  width: number,
  height: number,
  physics: PhysicsConfig
): GameState {
  nextId = 1;
  const asteroids: Asteroid[] = [];
  const centerX = width / 2;
  const centerY = height / 2;
  const safeRadius = 100;

  for (let i = 0; i < physics.asteroidCount; i++) {
    let x: number, y: number;
    do {
      x = Math.random() * width;
      y = Math.random() * height;
    } while (
      Math.hypot(x - centerX, y - centerY) < safeRadius + physics.asteroidMaxSize
    );

    const size =
      physics.asteroidMinSize +
      Math.random() * (physics.asteroidMaxSize - physics.asteroidMinSize);
    asteroids.push(createAsteroid(x, y, size, undefined, undefined, physics.asteroidSpeed));
  }

  return {
    ship: {
      position: { x: centerX, y: centerY },
      velocity: { x: 0, y: 0 },
      rotation: -90,
      alive: true,
      invulnerable: true,
      invulnerableUntil: Date.now() + 2000,
    },
    asteroids,
    bullets: [],
    score: 0,
    lives: 3,
    level: 1,
    gameOver: false,
    paused: false,
    width,
    height,
  };
}

function wrapPosition(
  pos: Vector2D,
  width: number,
  height: number
): Vector2D {
  let { x, y } = pos;
  if (x < 0) x += width;
  if (x > width) x -= width;
  if (y < 0) y += height;
  if (y > height) y -= height;
  return { x, y };
}

function distance(a: Vector2D, b: Vector2D): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function updateGame(
  state: GameState,
  physics: PhysicsConfig,
  input: InputState,
  lastShootTime: number
): { state: GameState; lastShootTime: number } {
  if (state.gameOver || state.paused) {
    return { state, lastShootTime };
  }

  const now = Date.now();
  let { ship, asteroids, bullets, score, lives, level } = state;
  const { width, height } = state;

  // Update ship rotation
  if (ship.alive) {
    let rotation = ship.rotation;
    if (input.left) rotation -= physics.shipRotationSpeed;
    if (input.right) rotation += physics.shipRotationSpeed;

    // Update ship velocity with thrust
    let velocity = { ...ship.velocity };
    if (input.thrust) {
      const rad = (rotation * Math.PI) / 180;
      velocity.x += Math.cos(rad) * physics.shipAcceleration;
      velocity.y += Math.sin(rad) * physics.shipAcceleration;
    }

    // Apply gravity
    velocity.y += physics.gravity * 0.01;

    // Clamp velocity
    const speed = Math.hypot(velocity.x, velocity.y);
    if (speed > physics.shipMaxSpeed) {
      velocity.x = (velocity.x / speed) * physics.shipMaxSpeed;
      velocity.y = (velocity.y / speed) * physics.shipMaxSpeed;
    }

    // Apply friction
    velocity.x *= 0.99;
    velocity.y *= 0.99;

    // Update position
    const position = wrapPosition(
      {
        x: ship.position.x + velocity.x,
        y: ship.position.y + velocity.y,
      },
      width,
      height
    );

    // Update invulnerability
    const invulnerable = ship.invulnerable && now < ship.invulnerableUntil;

    ship = {
      ...ship,
      position,
      velocity,
      rotation,
      invulnerable,
      invulnerableUntil: invulnerable ? ship.invulnerableUntil : 0,
    };

    // Shoot
    if (input.shoot && now - lastShootTime >= physics.bulletFireRate) {
      const rad = (ship.rotation * Math.PI) / 180;
      bullets = [
        ...bullets,
        {
          id: generateId(),
          position: { ...ship.position },
          velocity: {
            x: Math.cos(rad) * physics.bulletSpeed + ship.velocity.x * 0.5,
            y: Math.sin(rad) * physics.bulletSpeed + ship.velocity.y * 0.5,
          },
          createdAt: now,
        },
      ];
      lastShootTime = now;
    }
  }

  // Update bullets
  bullets = bullets
    .filter((b) => now - b.createdAt < 1500) // Bullets live 1.5 seconds
    .map((b) => ({
      ...b,
      position: wrapPosition(
        {
          x: b.position.x + b.velocity.x,
          y: b.position.y + b.velocity.y,
        },
        width,
        height
      ),
    }));

  // Update asteroids
  asteroids = asteroids.map((a) => ({
    ...a,
    position: wrapPosition(
      {
        x: a.position.x + a.velocity.x,
        y: a.position.y + a.velocity.y,
      },
      width,
      height
    ),
  }));

  // Check bullet-asteroid collisions
  const newAsteroids: Asteroid[] = [];
  const hitAsteroidIds = new Set<number>();
  const hitBulletIds = new Set<number>();

  for (const bullet of bullets) {
    for (const asteroid of asteroids) {
      if (hitAsteroidIds.has(asteroid.id)) continue;
      if (distance(bullet.position, asteroid.position) < asteroid.size) {
        hitAsteroidIds.add(asteroid.id);
        hitBulletIds.add(bullet.id);
        score += Math.floor(100 / asteroid.size) * 10;

        // Split asteroid if large enough
        if (asteroid.size > physics.asteroidMinSize * 1.5) {
          const newSize = asteroid.size * 0.5;
          const angle1 = Math.random() * Math.PI * 2;
          const angle2 = angle1 + Math.PI * 0.5 + Math.random() * Math.PI;
          newAsteroids.push(
            createAsteroid(
              asteroid.position.x,
              asteroid.position.y,
              newSize,
              Math.cos(angle1) * physics.asteroidSpeed * 1.5,
              Math.sin(angle1) * physics.asteroidSpeed * 1.5
            ),
            createAsteroid(
              asteroid.position.x,
              asteroid.position.y,
              newSize,
              Math.cos(angle2) * physics.asteroidSpeed * 1.5,
              Math.sin(angle2) * physics.asteroidSpeed * 1.5
            )
          );
        }
        break;
      }
    }
  }

  asteroids = asteroids
    .filter((a) => !hitAsteroidIds.has(a.id))
    .concat(newAsteroids);
  bullets = bullets.filter((b) => !hitBulletIds.has(b.id));

  // Check ship-asteroid collision
  if (ship.alive && !ship.invulnerable) {
    for (const asteroid of asteroids) {
      if (distance(ship.position, asteroid.position) < asteroid.size + 10) {
        lives--;
        if (lives <= 0) {
          return {
            state: {
              ...state,
              ship: { ...ship, alive: false },
              asteroids,
              bullets,
              score,
              lives: 0,
              gameOver: true,
            },
            lastShootTime,
          };
        } else {
          ship = {
            position: { x: width / 2, y: height / 2 },
            velocity: { x: 0, y: 0 },
            rotation: -90,
            alive: true,
            invulnerable: true,
            invulnerableUntil: now + 2000,
          };
        }
        break;
      }
    }
  }

  // Level complete - spawn new asteroids
  if (asteroids.length === 0) {
    level++;
    const newCount = physics.asteroidCount + level - 1;
    for (let i = 0; i < newCount; i++) {
      let x: number, y: number;
      do {
        x = Math.random() * width;
        y = Math.random() * height;
      } while (Math.hypot(x - ship.position.x, y - ship.position.y) < 150);

      const size =
        physics.asteroidMinSize +
        Math.random() * (physics.asteroidMaxSize - physics.asteroidMinSize);
      asteroids.push(
        createAsteroid(x, y, size, undefined, undefined, physics.asteroidSpeed * (1 + level * 0.1))
      );
    }
    ship = {
      ...ship,
      invulnerable: true,
      invulnerableUntil: now + 2000,
    };
  }

  return {
    state: {
      ...state,
      ship,
      asteroids,
      bullets,
      score,
      lives,
      level,
    },
    lastShootTime,
  };
}
