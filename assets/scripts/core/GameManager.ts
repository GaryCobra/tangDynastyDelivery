import { PlayerData } from '../models/PlayerData';
import { GameEvents } from '../utils/Constants';
import { EventBus } from '../utils/EventBus';
import { Logger } from '../utils/Logger';

export enum GameState {
  LOADING = 'loading',
  RUNNING = 'running',
  PAUSED = 'paused',
  DELIVERY = 'delivery',
  FINANCE = 'finance',
  STATION = 'station',
}

export class GameManager {
  private static instance: GameManager;
  private state: GameState = GameState.LOADING;
  private playerData: PlayerData | null = null;
  private gameTime: number = 0;
  private dayCount: number = 1;
  private autoSaveTimer: number = 0;
  private lastAutoSave: number = 0;
  private isInitialized: boolean = false;

  private constructor() {}

  static getInstance(): GameManager {
    if (!GameManager.instance) {
      GameManager.instance = new GameManager();
    }
    return GameManager.instance;
  }

  init(playerData: PlayerData): void {
    this.playerData = playerData;
    this.state = GameState.RUNNING;
    this.gameTime = 0;
    this.isInitialized = true;
    this.lastAutoSave = Date.now();
    Logger.info('GameManager', 'Game initialized');
    EventBus.emit(GameEvents.GAME_LOADED, playerData);
  }

  getState(): GameState {
    return this.state;
  }

  setState(newState: GameState): void {
    this.state = newState;
  }

  getPlayerData(): PlayerData | null {
    return this.playerData;
  }

  getGameTime(): number {
    return this.gameTime;
  }

  getDayCount(): number {
    return this.dayCount;
  }

  update(dt: number): void {
    if (!this.isInitialized || this.state === GameState.PAUSED) return;

    this.gameTime += dt;

    const now = Date.now();
    if (now - this.lastAutoSave >= 60000) {
      this.lastAutoSave = now;
      EventBus.emit(GameEvents.GAME_SAVED);
    }

    if (this.gameTime >= 86400) {
      this.gameTime = 0;
      this.dayCount++;
      EventBus.emit(GameEvents.DAY_CHANGED, this.dayCount);
    }
  }

  reset(): void {
    this.state = GameState.LOADING;
    this.playerData = null;
    this.gameTime = 0;
    this.dayCount = 1;
    this.isInitialized = false;
    Logger.info('GameManager', 'Game reset');
  }

  isReady(): boolean {
    return this.isInitialized && this.playerData !== null;
  }
}
