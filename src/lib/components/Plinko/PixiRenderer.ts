import type { Application, Container, Graphics } from 'pixi.js';

interface BallSprite {
  graphics: Graphics;
  trail: Graphics[];
}

/**
 * PixiJS WebGL rendering layer for the Plinko game.
 * Renders pins, balls (with glow + motion trail), and walls.
 * Physics positions come from matter-js — this only handles visuals.
 */
class PixiRenderer {
  private app!: Application;
  private PIXI!: typeof import('pixi.js');
  private pinsContainer!: Container;
  private ballsContainer!: Container;
  private wallsContainer!: Container;
  private trailContainer!: Container;

  private balls: Map<number, BallSprite> = new Map();
  private _isWebGL = true;
  private _ready = false;
  private reducedMotion = false;

  private width: number;
  private height: number;

  /** Max trail circles behind a ball */
  private static TRAIL_LENGTH = 4;
  /** Ball colors for variety */
  private static BALL_COLORS = [0xff4444, 0xff6b35, 0xffd700, 0x22c55e, 0x3b82f6, 0xec4899];
  private colorIndex = 0;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    if (typeof window !== 'undefined') {
      this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
  }

  async init(canvas: HTMLCanvasElement): Promise<void> {
    this.PIXI = await import('pixi.js');

    this.app = new this.PIXI.Application();
    await this.app.init({
      canvas,
      width: this.width,
      height: this.height,
      background: 0x0a1628,
      antialias: true,
      resolution: Math.min(window.devicePixelRatio || 1, 2),
      autoDensity: true,
    });

    this._isWebGL = this.app.renderer.type === this.PIXI.RendererType.WEBGL;

    this.trailContainer = new this.PIXI.Container();
    this.pinsContainer = new this.PIXI.Container();
    this.wallsContainer = new this.PIXI.Container();
    this.ballsContainer = new this.PIXI.Container();

    this.app.stage.addChild(this.trailContainer);
    this.app.stage.addChild(this.pinsContainer);
    this.app.stage.addChild(this.wallsContainer);
    this.app.stage.addChild(this.ballsContainer);

    this._ready = true;
  }

  get isWebGL(): boolean {
    return this._isWebGL;
  }

  get ready(): boolean {
    return this._ready;
  }

  get trailLength(): number {
    if (this.reducedMotion) return 0;
    return this._isWebGL ? PixiRenderer.TRAIL_LENGTH : 2;
  }

  drawPins(positions: { x: number; y: number }[], radius: number): void {
    if (!this._ready) return;

    this.pinsContainer.removeChildren();

    for (const pos of positions) {
      const pin = new this.PIXI.Graphics();
      // Outer glow
      pin.circle(0, 0, radius * 1.8);
      pin.fill({ color: 0xffd700, alpha: 0.15 });
      // Main pin
      pin.circle(0, 0, radius);
      pin.fill({ color: 0xffffff });
      // Inner bright spot
      pin.circle(-radius * 0.2, -radius * 0.2, radius * 0.4);
      pin.fill({ color: 0xffffff, alpha: 0.6 });
      pin.position.set(pos.x, pos.y);
      this.pinsContainer.addChild(pin);
    }
  }

  drawGoldenPins(positions: { x: number; y: number }[], radius: number, goldenIndices: Set<number>): void {
    if (!this._ready) return;

    this.pinsContainer.removeChildren();

    positions.forEach((pos, i) => {
      const pin = new this.PIXI.Graphics();
      const isGolden = goldenIndices.has(i);

      if (isGolden) {
        // Gold glow
        pin.circle(0, 0, radius * 2.5);
        pin.fill({ color: 0xffd700, alpha: 0.3 });
        pin.circle(0, 0, radius);
        pin.fill({ color: 0xffd700 });
        pin.circle(-radius * 0.2, -radius * 0.2, radius * 0.4);
        pin.fill({ color: 0xffffff, alpha: 0.7 });
      } else {
        pin.circle(0, 0, radius * 1.8);
        pin.fill({ color: 0xffd700, alpha: 0.15 });
        pin.circle(0, 0, radius);
        pin.fill({ color: 0xffffff });
        pin.circle(-radius * 0.2, -radius * 0.2, radius * 0.4);
        pin.fill({ color: 0xffffff, alpha: 0.6 });
      }
      pin.position.set(pos.x, pos.y);
      this.pinsContainer.addChild(pin);
    });
  }

  drawBall(id: number, x: number, y: number, radius: number): void {
    if (!this._ready) return;

    const color = PixiRenderer.BALL_COLORS[this.colorIndex % PixiRenderer.BALL_COLORS.length];
    this.colorIndex++;

    const graphics = new this.PIXI.Graphics();
    // Glow
    graphics.circle(0, 0, radius * 2);
    graphics.fill({ color, alpha: 0.2 });
    // Main ball
    graphics.circle(0, 0, radius);
    graphics.fill({ color });
    // Highlight
    graphics.circle(-radius * 0.25, -radius * 0.25, radius * 0.35);
    graphics.fill({ color: 0xffffff, alpha: 0.4 });

    graphics.position.set(x, y);
    this.ballsContainer.addChild(graphics);

    const trail: Graphics[] = [];
    const trailLen = this.trailLength;
    for (let i = 0; i < trailLen; i++) {
      const t = new this.PIXI.Graphics();
      t.circle(0, 0, radius * (1 - (i + 1) * 0.15));
      t.fill({ color, alpha: 0.3 - i * 0.07 });
      t.position.set(x, y);
      t.visible = false;
      this.trailContainer.addChild(t);
      trail.push(t);
    }

    this.balls.set(id, { graphics, trail });
  }

  updateBall(id: number, x: number, y: number): void {
    const ball = this.balls.get(id);
    if (!ball) return;

    // Shift trail positions
    for (let i = ball.trail.length - 1; i > 0; i--) {
      ball.trail[i].position.copyFrom(ball.trail[i - 1].position);
      ball.trail[i].visible = true;
    }
    if (ball.trail.length > 0) {
      ball.trail[0].position.copyFrom(ball.graphics.position);
      ball.trail[0].visible = true;
    }

    ball.graphics.position.set(x, y);
  }

  removeBall(id: number): void {
    const ball = this.balls.get(id);
    if (!ball) return;

    this.ballsContainer.removeChild(ball.graphics);
    ball.graphics.destroy();
    for (const t of ball.trail) {
      this.trailContainer.removeChild(t);
      t.destroy();
    }
    this.balls.delete(id);
  }

  drawWalls(_positions: { x: number; y: number; angle: number }[]): void {
    // Walls are invisible physics boundaries — nothing to render
  }

  clear(): void {
    if (!this._ready) return;
    this.pinsContainer.removeChildren();
    this.ballsContainer.removeChildren();
    this.trailContainer.removeChildren();
    this.wallsContainer.removeChildren();
    this.balls.clear();
  }

  destroy(): void {
    if (this._ready) {
      this.clear();
      this.app.destroy(true);
      this._ready = false;
    }
  }
}

export default PixiRenderer;
