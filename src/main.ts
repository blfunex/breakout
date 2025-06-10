import WebFont from "webfontloader";

WebFont.load({
  google: {
    families: ["Press Start 2P"],
  },
});

const WIDTH = 400;
const HEIGHT = 800;

const OFFSET = 10;

const BALL_RADIUS = 10;
const BALL_SPEED = 5;
const BALL_BLINK_DURATION = 0.5;

const PADDLE_WIDTH = 100;
const PADDLE_HEIGHT = 10;
const PADDLE_SPEED = BALL_SPEED * 0.8;
const PADDLE_CPU_TRYHARD_MIN = 4;
const PADDLE_CPU_TRYHARD_MAX = 8;
const PADDLE_CPU_RESPONSIVENESS_MIN = 0.5;
const PADDLE_CPU_RESPONSIVENESS_MAX = 5;
const PADDLE_HIGHLIGHT_DURATION = 0.5;

const END_GAME_SCORE = 10;

const canvas = document.querySelector("canvas")!;
const ctx = canvas.getContext("2d", { alpha: false })!;

class Vector {
  constructor(public x: number, public y: number) {}

  static randomBallVelocity() {
    const vel = new Vector(randomSign(), random());
    return vel.normalize(BALL_SPEED);
  }

  add(v: Vector, scalar: number = 1) {
    this.x += v.x * scalar;
    this.y += v.y * scalar;
    return this;
  }

  sub(v: Vector, scalar: number = 1) {
    this.x -= v.x * scalar;
    this.y -= v.y * scalar;
    return this;
  }

  dot(v: Vector) {
    return this.x * v.x + this.y * v.y;
  }

  length() {
    return Math.hypot(this.x, this.y);
  }

  normalize(scalar: number = 1) {
    const len = this.length();
    if (len > 0) {
      this.x /= len;
      this.y /= len;
    }
    return this.scale(scalar);
  }

  scale(scalar: number) {
    this.x *= scalar;
    this.y *= scalar;
    return this;
  }
}

class Ball {
  position: Vector;
  velocity: Vector;
  radius: number;
  blink_duration: number;

  constructor(readonly game: Game, x: number, y: number, radius: number) {
    this.position = new Vector(x, y);
    this.velocity = Vector.randomBallVelocity();
    this.radius = radius;
    this.blink_duration = 0;
  }

  update() {
    this.blink_duration = Math.min(
      this.blink_duration + dt,
      BALL_BLINK_DURATION
    );
    if (!this.blinking) this.position.add(this.velocity);
  }

  get blinking() {
    return !this.game.isOver && this.blink_duration < BALL_BLINK_DURATION;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.blinking && Math.sin(time * 100) > 0) return;
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

class Paddle {
  position: Vector;
  velocity: Vector;
  width: number;
  height: number;
  score: number;
  highlight_duration: number = PADDLE_HIGHLIGHT_DURATION;

  constructor(
    readonly game: Game,
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    this.position = new Vector(x, y);
    this.velocity = new Vector(0, 0);
    this.width = width;
    this.height = height;
    this.score = 0;
  }

  update() {
    this.position.add(this.velocity);
    this.highlight_duration = Math.min(
      this.highlight_duration + dt,
      PADDLE_HIGHLIGHT_DURATION
    );
  }

  get highlighted() {
    return this.highlight_duration < PADDLE_HIGHLIGHT_DURATION;
  }

  get highlight() {
    return unlerp(this.highlight_duration, 0, PADDLE_HIGHLIGHT_DURATION);
  }

  constrain() {
    this.position.x = clamp(
      this.position.x,
      OFFSET,
      WIDTH - OFFSET - this.width
    );
  }

  get color() {
    return this.highlighted
      ? `hsl(30, 100%, ${lerp(50, 100, this.highlight).toFixed(2)}%)`
      : "white";
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
}

class Game {
  ball: Ball;
  paddle: Paddle;
  isOver: boolean = false;

  constructor() {
    this.ball = new Ball(this, WIDTH / 2, HEIGHT / 2, BALL_RADIUS);
    this.paddle = new PlayerPaddle(
      this,
      (WIDTH - 2 * OFFSET - PADDLE_WIDTH) / 2,
      HEIGHT - OFFSET - PADDLE_HEIGHT,
      PADDLE_WIDTH,
      PADDLE_HEIGHT
    );
  }

  restart() {
    this.ball.position.x = WIDTH / 2;
    this.ball.position.y = HEIGHT / 2;

    this.ball.velocity = Vector.randomBallVelocity();

    this.ball.blink_duration = 0;

    this.paddle.score = 0;

    this.paddle.velocity.y = 0;

    this.paddle.position.y = (HEIGHT - 2 * OFFSET - PADDLE_HEIGHT) / 2 + OFFSET;

    this.paddle.highlight_duration = PADDLE_HIGHLIGHT_DURATION;

    this.isOver = false;
  }

  update() {
    if (this.isOver) return;

    this.ball.update();

    this.paddle.update();
    this.paddle.constrain();
    collideBallWithPaddle(
      this.ball,
      this.paddle,
      // Reflecting ball velicity's X resulted in a bug where the ball would
      // bounce off the paddle and then bounce back on the other side. This
      // fixes that.
      this.paddle.position.x < WIDTH / 2 ? 1 : -1
    );

    if (this.paddle.score >= END_GAME_SCORE) {
      this.isOver = true;
    }

    if (constrainBallToGameArea(this.ball)) {
      this.paddle.score -= 100;
      this.paddle.highlight_duration = 0;

      if (!this.isOver) {
        this.ball.position.x = WIDTH / 2;
        this.ball.position.y = HEIGHT / 2;

        this.ball.velocity = Vector.randomBallVelocity();

        this.ball.blink_duration = 0;
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    ctx.strokeStyle = "#555";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(WIDTH / 2, 0);
    ctx.lineTo(WIDTH / 2, HEIGHT);
    ctx.stroke();

    ctx.strokeStyle = "white";
    ctx.lineWidth = 1;
    ctx.strokeRect(
      OFFSET / 2 - 0.5,
      OFFSET / 2 - 0.5,
      WIDTH - OFFSET + 1,
      HEIGHT - OFFSET + 1
    );

    ctx.font = "48px 'Press Start 2P'";
    ctx.textBaseline = "top";

    ctx.fillStyle = this.paddle.color;
    ctx.textAlign = "right";
    ctx.fillText(
      this.paddle.score.toString(),
      WIDTH / 2 - 3 * OFFSET,
      OFFSET * 3
    );

    this.ball.draw(ctx);
    this.paddle.draw(ctx);

    if (this.isOver) {
      ctx.fillStyle = "#0006";
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      ctx.fillStyle = "white";
      ctx.font = "48px 'Press Start 2P'";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("GAME OVER", WIDTH / 2, HEIGHT / 2);

      const score = this.paddle.score;
      const winner = false ? "CPU" : "PLAYER";

      ctx.fillStyle =
        Math.sin(time * 20) > 0 ? "white" : winner === "CPU" ? "#f00" : "#0f0";
      ctx.font = "16px 'Press Start 2P'";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`GAME OVER`, WIDTH / 2, HEIGHT / 2 + 48);
    }
  }
}

class ComputerPaddle extends Paddle {
  update() {
    super.update();

    const ball = this.game.ball;
    const by = ball.position.y - ball.radius;
    const py = this.position.y + this.height / 2;

    const lambda = remap(
      this.score,
      PADDLE_CPU_TRYHARD_MIN,
      PADDLE_CPU_TRYHARD_MAX,
      PADDLE_CPU_RESPONSIVENESS_MIN,
      PADDLE_CPU_RESPONSIVENESS_MAX,
      saturate
    );

    const speed = py < by ? PADDLE_SPEED : py > by ? -PADDLE_SPEED : 0;

    this.velocity.y = damp(this.velocity.y, speed, lambda, dt);
  }
}

class PlayerPaddle extends Paddle {
  constructor(game: Game, x: number, y: number, width: number, height: number) {
    super(game, x, y, width, height);

    this.attachEventListeners();
    this.target = y;
  }

  private target: number;

  attachEventListeners() {
    window.addEventListener("mousemove", (event) => {
      if (this.game.isOver) return;
      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientY - rect.left;
      this.target = clamp(
        mouseX - this.width / 2,
        OFFSET,
        WIDTH - OFFSET - this.width
      );
    });

    window.addEventListener("click", () => {
      if (!this.game.isOver) return;
      this.game.restart();
    });
  }

  update() {
    super.update();

    this.position.x = damp(this.position.x, this.target, 5, dt);
  }
}

interface Circle {
  position: Vector;
  radius: number;
}

interface Rectangle {
  position: Vector;
  width: number;
  height: number;
}

function intersectRectangleCircle(
  rectangle: Rectangle,
  circle: Circle
): boolean {
  const {
    position: { x: rx, y: ry },
    width,
    height,
  } = rectangle;
  const {
    position: { x: cx, y: cy },
    radius,
  } = circle;

  const x = clamp(cx, rx, rx + width);
  const y = clamp(cy, ry, ry + height);

  const dx = cx - x;
  const dy = cy - y;
  const distance = Math.hypot(dx, dy);

  return distance < circle.radius;
}

function constrainBallToGameArea(ball: Ball): boolean {
  const offset = OFFSET / 2;

  if (ball.position.y + ball.radius > HEIGHT - offset) return true;

  if (ball.position.y - ball.radius < offset) {
    ball.position.y = offset + ball.radius;
    ball.velocity.y *= -1; // Bounce off top wall
  } else if (ball.position.x + ball.radius > WIDTH - offset) {
    ball.position.x = WIDTH - offset - ball.radius;
    ball.velocity.x *= -1; // Bounce off right wall
  } else if (ball.position.x - ball.radius < offset) {
    ball.position.x = offset + ball.radius;
    ball.velocity.x *= -1; // Bounce off left wall
  }

  return false;
}

function collideBallWithPaddle(ball: Ball, paddle: Paddle, side: -1 | 1) {
  if (!intersectRectangleCircle(paddle, ball)) return;

  paddle.score += 10;

  ball.velocity.x = side * Math.abs(ball.velocity.x);

  // if (Math.abs(paddle.velocity.y) === 0) return;

  const dy = ball.position.y - paddle.position.y;
  const ry = (dy / paddle.height) * 2 - 1; // Normalize to [-1, 1]

  ball.velocity.y = ry * Math.abs(ball.velocity.x);

  ball.velocity.normalize(BALL_SPEED);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function saturate(value: number) {
  return clamp(value, 0, 1);
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function unlerp(value: number, a: number, b: number) {
  if (a === b) return 0;
  return (value - a) / (b - a);
}

function easeLinear(t: number) {
  return t;
}

function remap(
  value: number,
  fromMin: number,
  fromMax: number,
  toMin: number,
  toMax: number,
  ease: (t: number) => number = easeLinear
) {
  return lerp(toMin, toMax, ease(unlerp(value, fromMin, fromMax)));
}

function damp(value: number, target: number, lambda: number, dt: number = 1) {
  return lerp(value, target, 1 - Math.exp(-lambda * dt));
}

function random() {
  return Math.random() * 2 - 1;
}

function randomSign() {
  return random() >= 0.5 ? 1 : -1;
}

function near(a: number, b: number, epsilon = 1e-6) {
  if (a === b) return true;
  return (
    Math.abs(a - b) <
    epsilon * clamp(Math.max(Math.abs(a), Math.abs(b), 1), 0, 1)
  );
}

const game = new Game();

canvas.width = WIDTH;
canvas.height = HEIGHT;

let lastTime = performance.now();
let dt = 0;
let frameCount = 0;
let time = 0;

function animate() {
  const now = performance.now();
  dt = (now - lastTime) / 1000;
  time += dt;
  lastTime = now;
  frameCount++;

  game.update(); // Convert time to seconds
  game.draw(ctx);

  requestAnimationFrame(animate);
}

animate();
