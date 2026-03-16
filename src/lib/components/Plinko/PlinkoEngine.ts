import { binPayouts, MAX_CONCURRENT_BALLS } from '$lib/constants/game';
import {
  rowCount,
  winRecords,
  riskLevel,
  betAmount,
  balance,
  betAmountOfExistingBalls,
  totalProfitHistory,
  celebrationEvent,
} from '$lib/stores/game';
import { activePowerUps } from '$lib/stores/powerups';
import type { RiskLevel, RowCount, CelebrationTier } from '$lib/types';
import { getRandomBetween } from '$lib/utils/numbers';
import Matter, { type IBodyDefinition } from 'matter-js';
import { get } from 'svelte/store';
import { v4 as uuidv4 } from 'uuid';
import type PixiRenderer from './PixiRenderer';

type BallFrictionsByRowCount = {
  friction: NonNullable<IBodyDefinition['friction']>;
  frictionAirByRowCount: Record<RowCount, NonNullable<IBodyDefinition['frictionAir']>>;
};

type EngineEventHandler = (data: Record<string, unknown>) => void;

/**
 * Engine for the Plinko game using matter-js for physics + PixiJS for rendering.
 */
class PlinkoEngine {
  private renderer: PixiRenderer;

  private betAmount: number;
  private rowCount: RowCount;
  private riskLevel: RiskLevel;

  private engine: Matter.Engine;
  private runner: Matter.Runner;

  private pins: Matter.Body[] = [];
  private walls: Matter.Body[] = [];
  private sensor: Matter.Body;

  private pinsLastRowXCoords: number[] = [];
  private pinPositions: { x: number; y: number }[] = [];

  /** Event listeners */
  private eventListeners: Map<string, EngineEventHandler[]> = new Map();

  /** Store unsubscribe functions for cleanup */
  private unsubscribers: (() => void)[] = [];

  /** Golden peg indices (for GOLDEN_PEG power-up) */
  private goldenPinIndices: Set<number> = new Set();
  /** Balls that have hit a golden pin */
  private goldenBalls: Set<number> = new Set();

  static WIDTH = 760;
  static HEIGHT = 570;

  private static PADDING_X = 52;
  private static PADDING_TOP = 36;
  private static PADDING_BOTTOM = 28;

  private static PIN_CATEGORY = 0x0001;
  private static BALL_CATEGORY = 0x0002;

  private static ballFrictions: BallFrictionsByRowCount = {
    friction: 0.5,
    frictionAirByRowCount: {
      8: 0.0395,
      9: 0.041,
      10: 0.038,
      11: 0.0355,
      12: 0.0414,
      13: 0.0437,
      14: 0.0401,
      15: 0.0418,
      16: 0.0364,
    },
  };

  /** Magnet force constant for MAGNET power-up */
  private static MAGNET_FORCE = 0.00002;

  constructor(renderer: PixiRenderer) {
    this.renderer = renderer;

    this.betAmount = get(betAmount);
    this.rowCount = get(rowCount);
    this.riskLevel = get(riskLevel);
    this.unsubscribers.push(
      betAmount.subscribe((value) => (this.betAmount = value)),
      rowCount.subscribe((value) => this.updateRowCount(value)),
      riskLevel.subscribe((value) => (this.riskLevel = value)),
    );

    this.engine = Matter.Engine.create({
      timing: {
        timeScale: 1,
      },
    });
    this.runner = Matter.Runner.create();

    this.placePinsAndWalls();

    this.sensor = Matter.Bodies.rectangle(
      PlinkoEngine.WIDTH / 2,
      PlinkoEngine.HEIGHT,
      PlinkoEngine.WIDTH,
      10,
      {
        isSensor: true,
        isStatic: true,
        render: { visible: false },
      },
    );
    Matter.Composite.add(this.engine.world, [this.sensor]);

    // Collision detection
    Matter.Events.on(this.engine, 'collisionStart', ({ pairs }) => {
      pairs.forEach(({ bodyA, bodyB }) => {
        if (bodyA === this.sensor) {
          this.handleBallEnterBin(bodyB);
        } else if (bodyB === this.sensor) {
          this.handleBallEnterBin(bodyA);
        }

        // Ball-pin collision for audio events
        const ball =
          bodyA.collisionFilter.category === PlinkoEngine.BALL_CATEGORY ? bodyA :
          bodyB.collisionFilter.category === PlinkoEngine.BALL_CATEGORY ? bodyB : null;
        const pin =
          bodyA.collisionFilter.category === PlinkoEngine.PIN_CATEGORY ? bodyA :
          bodyB.collisionFilter.category === PlinkoEngine.PIN_CATEGORY ? bodyB : null;

        if (ball && pin) {
          const pinIndex = this.pins.indexOf(pin);
          const rowIndex = this.getRowIndexForPin(pinIndex);
          this.emit('ball-bounced', { ballId: ball.id, rowIndex, totalRows: this.rowCount });

          // Check golden pin hit
          if (this.goldenPinIndices.has(pinIndex)) {
            this.goldenBalls.add(ball.id);
          }
        }
      });
    });

    // Sync rendering with physics
    Matter.Events.on(this.engine, 'afterUpdate', () => {
      this.updateBallPositions();
    });
  }

  on(event: string, handler: EngineEventHandler): void {
    const handlers = this.eventListeners.get(event) ?? [];
    handlers.push(handler);
    this.eventListeners.set(event, handlers);
  }

  off(event: string, handler: EngineEventHandler): void {
    const handlers = this.eventListeners.get(event) ?? [];
    this.eventListeners.set(event, handlers.filter((h) => h !== handler));
  }

  private emit(event: string, data: Record<string, unknown>): void {
    const handlers = this.eventListeners.get(event) ?? [];
    for (const handler of handlers) {
      handler(data);
    }
  }

  private getRowIndexForPin(pinIndex: number): number {
    let count = 0;
    for (let row = 0; row < this.rowCount; row++) {
      count += 3 + row;
      if (pinIndex < count) return row;
    }
    return this.rowCount - 1;
  }

  start() {
    Matter.Runner.run(this.runner, this.engine);
  }

  stop() {
    Matter.Runner.stop(this.runner);
    this.unsubscribers.forEach((unsub) => unsub());
    this.unsubscribers = [];
    this.eventListeners.clear();
  }

  dropBall() {
    const currentActivePowerUps = get(activePowerUps);
    const isMultiBall = currentActivePowerUps.has('MULTI_BALL');
    const ballCount = isMultiBall ? 3 : 1;

    // Check concurrent ball limit
    const currentBalls = Matter.Composite.allBodies(this.engine.world).filter(
      (b) => b.collisionFilter.category === PlinkoEngine.BALL_CATEGORY
    ).length;
    if (currentBalls + ballCount > MAX_CONCURRENT_BALLS) {
      return;
    }

    const ballOffsetRangeX = this.pinDistanceX * 0.8;
    const ballRadius = this.pinRadius * 2;
    const { friction, frictionAirByRowCount } = PlinkoEngine.ballFrictions;

    // Deduct balance once
    balance.update((b) => b - this.betAmount);

    for (let i = 0; i < ballCount; i++) {
      const xOffset = isMultiBall ? (i - 1) * ballRadius * 1.5 : 0;
      const ball = Matter.Bodies.circle(
        getRandomBetween(
          PlinkoEngine.WIDTH / 2 - ballOffsetRangeX,
          PlinkoEngine.WIDTH / 2 + ballOffsetRangeX,
        ) + xOffset,
        0,
        ballRadius,
        {
          restitution: 0.8,
          friction,
          frictionAir: frictionAirByRowCount[this.rowCount],
          collisionFilter: {
            category: PlinkoEngine.BALL_CATEGORY,
            mask: PlinkoEngine.PIN_CATEGORY,
          },
          render: { fillStyle: '#ff0000' },
        },
      );

      Matter.Composite.add(this.engine.world, ball);
      betAmountOfExistingBalls.update((value) => ({ ...value, [ball.id]: this.betAmount }));
      this.renderer.drawBall(ball.id, ball.position.x, ball.position.y, ballRadius);
    }
  }

  get binsWidthPercentage(): number {
    const lastPinX = this.pinsLastRowXCoords[this.pinsLastRowXCoords.length - 1];
    return (lastPinX - this.pinsLastRowXCoords[0]) / PlinkoEngine.WIDTH;
  }

  private get pinDistanceX(): number {
    const lastRowPinCount = 3 + this.rowCount - 1;
    return (PlinkoEngine.WIDTH - PlinkoEngine.PADDING_X * 2) / (lastRowPinCount - 1);
  }

  private get pinRadius(): number {
    return (24 - this.rowCount) / 2;
  }

  private updateRowCount(rowCount: RowCount) {
    if (rowCount === this.rowCount) {
      return;
    }

    this.removeAllBalls();
    this.rowCount = rowCount;
    this.placePinsAndWalls();
  }

  private handleBallEnterBin(ball: Matter.Body) {
    const binIndex = this.pinsLastRowXCoords.findLastIndex((pinX) => pinX < ball.position.x);
    if (binIndex !== -1 && binIndex < this.pinsLastRowXCoords.length - 1) {
      const betAmt = get(betAmountOfExistingBalls)[ball.id] ?? 0;
      let multiplier = binPayouts[this.rowCount][this.riskLevel][binIndex];

      // Apply GOLDEN_PEG 2x bonus
      if (this.goldenBalls.has(ball.id)) {
        multiplier *= 2;
        this.goldenBalls.delete(ball.id);
      }

      const payoutValue = betAmt * multiplier;
      const profit = payoutValue - betAmt;

      winRecords.update((records) => [
        ...records,
        {
          id: uuidv4(),
          betAmount: betAmt,
          rowCount: this.rowCount,
          binIndex,
          payout: { multiplier, value: payoutValue },
          profit,
        },
      ]);
      totalProfitHistory.update((history) => {
        const lastTotalProfit = history.slice(-1)[0];
        return [...history, lastTotalProfit + profit];
      });
      balance.update((b) => b + payoutValue);

      // Emit ball-binned event
      this.emit('ball-binned', {
        ballId: ball.id,
        multiplier,
        binIndex,
        payoutValue,
        rowCount: this.rowCount,
        riskLevel: this.riskLevel,
      });

      // Calculate celebration tier
      const maxMultiplier = Math.max(...binPayouts[this.rowCount][this.riskLevel]);
      const ratio = multiplier / maxMultiplier;
      const totalBins = this.rowCount + 1;
      const isNearMiss = binIndex === 1 || binIndex === totalBins - 2;

      let tier: CelebrationTier = 'none';
      if (ratio >= 0.8) tier = 'jackpot';
      else if (ratio >= 0.3) tier = 'big_win';
      else if (ratio >= 0.1) tier = 'win';
      else if (isNearMiss) tier = 'near_miss';

      if (tier !== 'none') {
        celebrationEvent.set({
          multiplier,
          payoutValue,
          binIndex,
          tier,
          rowCount: this.rowCount,
        });
      }
    }

    this.renderer.removeBall(ball.id);
    Matter.Composite.remove(this.engine.world, ball);
    betAmountOfExistingBalls.update((value) => {
      const newValue = { ...value };
      delete newValue[ball.id];
      return newValue;
    });
  }

  private updateBallPositions() {
    const currentActivePowerUps = get(activePowerUps);
    const hasMagnet = currentActivePowerUps.has('MAGNET');
    const hasWallGuide = currentActivePowerUps.has('WALL_GUIDE');

    Matter.Composite.allBodies(this.engine.world).forEach((body) => {
      if (body.collisionFilter.category === PlinkoEngine.BALL_CATEGORY) {
        // Apply magnet force in bottom 3 rows
        if (hasMagnet) {
          const rowHeight = (PlinkoEngine.HEIGHT - PlinkoEngine.PADDING_TOP - PlinkoEngine.PADDING_BOTTOM) / (this.rowCount - 1);
          const bottomRowsY = PlinkoEngine.PADDING_TOP + (this.rowCount - 3) * rowHeight;
          if (body.position.y > bottomRowsY) {
            // Pull toward nearest high-value bin (edges)
            const centerX = PlinkoEngine.WIDTH / 2;
            const direction = body.position.x < centerX ? -1 : 1;
            Matter.Body.applyForce(body, body.position, {
              x: PlinkoEngine.MAGNET_FORCE * direction,
              y: 0,
            });
          }
        }

        // Wall guide: gentle centering force in top 3 rows
        if (hasWallGuide) {
          const rowHeight = (PlinkoEngine.HEIGHT - PlinkoEngine.PADDING_TOP - PlinkoEngine.PADDING_BOTTOM) / (this.rowCount - 1);
          const topRowsY = PlinkoEngine.PADDING_TOP + 3 * rowHeight;
          if (body.position.y < topRowsY) {
            const centerX = PlinkoEngine.WIDTH / 2;
            const dx = centerX - body.position.x;
            Matter.Body.applyForce(body, body.position, {
              x: dx * 0.000001,
              y: 0,
            });
          }
        }

        this.renderer.updateBall(body.id, body.position.x, body.position.y);
      }
    });
  }

  private placePinsAndWalls() {
    const { PADDING_X, PADDING_TOP, PADDING_BOTTOM, PIN_CATEGORY, BALL_CATEGORY } = PlinkoEngine;

    if (this.pins.length > 0) {
      Matter.Composite.remove(this.engine.world, this.pins);
      this.pins = [];
    }
    if (this.pinsLastRowXCoords.length > 0) {
      this.pinsLastRowXCoords = [];
    }
    if (this.walls.length > 0) {
      Matter.Composite.remove(this.engine.world, this.walls);
      this.walls = [];
    }
    this.pinPositions = [];

    for (let row = 0; row < this.rowCount; ++row) {
      const rowY =
        PADDING_TOP +
        ((PlinkoEngine.HEIGHT - PADDING_TOP - PADDING_BOTTOM) / (this.rowCount - 1)) * row;

      const rowPaddingX = PADDING_X + ((this.rowCount - 1 - row) * this.pinDistanceX) / 2;

      for (let col = 0; col < 3 + row; ++col) {
        const colX = rowPaddingX + ((PlinkoEngine.WIDTH - rowPaddingX * 2) / (3 + row - 1)) * col;
        const pin = Matter.Bodies.circle(colX, rowY, this.pinRadius, {
          isStatic: true,
          render: { fillStyle: '#ffffff' },
          collisionFilter: {
            category: PIN_CATEGORY,
            mask: BALL_CATEGORY,
          },
        });
        this.pins.push(pin);
        this.pinPositions.push({ x: colX, y: rowY });

        if (row === this.rowCount - 1) {
          this.pinsLastRowXCoords.push(colX);
        }
      }
    }
    Matter.Composite.add(this.engine.world, this.pins);

    // Set up golden pins if power-up active
    this.refreshGoldenPins();

    // Draw pins via renderer
    const currentActivePowerUps = get(activePowerUps);
    if (currentActivePowerUps.has('GOLDEN_PEG') && this.goldenPinIndices.size > 0) {
      this.renderer.drawGoldenPins(this.pinPositions, this.pinRadius, this.goldenPinIndices);
    } else {
      this.renderer.drawPins(this.pinPositions, this.pinRadius);
    }

    // Walls
    const firstPinX = this.pins[0].position.x;
    const leftWallAngle = Math.atan2(
      firstPinX - this.pinsLastRowXCoords[0],
      PlinkoEngine.HEIGHT - PADDING_TOP - PADDING_BOTTOM,
    );
    const leftWallX =
      firstPinX - (firstPinX - this.pinsLastRowXCoords[0]) / 2 - this.pinDistanceX * 0.25;

    const leftWall = Matter.Bodies.rectangle(
      leftWallX,
      PlinkoEngine.HEIGHT / 2,
      10,
      PlinkoEngine.HEIGHT,
      {
        isStatic: true,
        angle: leftWallAngle,
        render: { visible: false },
      },
    );
    const rightWall = Matter.Bodies.rectangle(
      PlinkoEngine.WIDTH - leftWallX,
      PlinkoEngine.HEIGHT / 2,
      10,
      PlinkoEngine.HEIGHT,
      {
        isStatic: true,
        angle: -leftWallAngle,
        render: { visible: false },
      },
    );
    this.walls.push(leftWall, rightWall);
    Matter.Composite.add(this.engine.world, this.walls);
  }

  refreshGoldenPins() {
    this.goldenPinIndices.clear();
    const currentActivePowerUps = get(activePowerUps);
    if (!currentActivePowerUps.has('GOLDEN_PEG')) return;

    const count = 3 + Math.floor(Math.random() * 3); // 3-5 golden pins
    const totalPins = this.pins.length;
    while (this.goldenPinIndices.size < count && this.goldenPinIndices.size < totalPins) {
      this.goldenPinIndices.add(Math.floor(Math.random() * totalPins));
    }
  }

  private removeAllBalls() {
    Matter.Composite.allBodies(this.engine.world).forEach((body) => {
      if (body.collisionFilter.category === PlinkoEngine.BALL_CATEGORY) {
        this.renderer.removeBall(body.id);
        Matter.Composite.remove(this.engine.world, body);
      }
    });
    betAmountOfExistingBalls.set({});
    this.goldenBalls.clear();
  }
}

export default PlinkoEngine;
