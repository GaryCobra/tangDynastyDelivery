import { _decorator, Component, Node, director } from 'cc';
import { GameManager, GameState } from './core/GameManager';
import { DataManager } from './core/DataManager';
import { CloudManager } from './core/CloudManager';
import { AdManager } from './core/AdManager';
import { PlayerData } from './models/PlayerData';
import { Logger } from './utils/Logger';

const { ccclass, property } = _decorator;

@ccclass('App')
export class App extends Component {
  @property(Node) mainMenu: Node | null = null;
  @property(Node) loadingScreen: Node | null = null;

  private gameManager: GameManager = GameManager.getInstance();
  private dataManager: DataManager = DataManager.getInstance();
  private cloudManager: CloudManager = CloudManager.getInstance();

  onLoad(): void {
    director.addPersistRootNode(this.node);
    this.initializeGame();
  }

  private async initializeGame(): Promise<void> {
    Logger.info('App', 'Initializing game...');

    if (this.loadingScreen) this.loadingScreen.active = true;
    if (this.mainMenu) this.mainMenu.active = false;

    this.cloudManager.init();

    let playerData = this.dataManager.loadGame();

    if (!playerData) {
      const cloudInfo = await this.cloudManager.login();
      const uid = cloudInfo?.openid || `local_${Date.now()}`;
      playerData = PlayerData.createNew(uid);
      this.dataManager.saveGame(playerData);
      Logger.info('App', 'New player created');
    } else {
      const hoursAway = (Date.now() - playerData.lastLoginTime) / 3600000;
      if (hoursAway > 1) {
        Logger.info('App', `Player offline for ${hoursAway.toFixed(1)} hours`);
      }
      playerData.lastLoginTime = Date.now();
    }

    this.gameManager.init(playerData);

    if (this.loadingScreen) this.loadingScreen.active = false;
    if (this.mainMenu) this.mainMenu.active = true;

    this.schedule(this.gameLoop.bind(this), 1.0);
    Logger.info('App', 'Game initialized successfully');
  }

  private gameLoop(): void {
    if (this.gameManager.getState() === GameState.RUNNING) {
      this.gameManager.update(1.0);
    }
  }

  onNewGame(): void {
    const uid = `player_${Date.now()}`;
    const playerData = PlayerData.createNew(uid);
    this.dataManager.saveGame(playerData);
    this.gameManager.init(playerData);
    Logger.info('App', 'New game started');
  }

  onContinue(): void {
    const playerData = this.dataManager.loadGame();
    if (playerData) {
      this.gameManager.init(playerData);
      Logger.info('App', 'Game continued');
    }
  }

  onSave(): void {
    const data = this.gameManager.getPlayerData();
    if (data) {
      this.dataManager.saveGame(data);
    }
  }

  onReset(): void {
    this.dataManager.deleteGame();
    this.gameManager.reset();
    Logger.info('App', 'Game reset');
  }
}
