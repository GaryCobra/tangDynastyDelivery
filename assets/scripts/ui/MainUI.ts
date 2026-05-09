import { _decorator, Component, Node, Label, Button, Sprite, director } from 'cc';
import { GameManager, GameState } from '../core/GameManager';
import { PlayerData } from '../models/PlayerData';
import { ReputationLevel, REPUTATION_CONFIG, GameEvents, WeatherType, WEATHER_CONFIG } from '../utils/Constants';
import { EventBus } from '../utils/EventBus';

const { ccclass, property } = _decorator;

@ccclass('MainUI')
export class MainUI extends Component {
  @property(Label) coinsLabel: Label | null = null;
  @property(Label) reputationLabel: Label | null = null;
  @property(Label) staminaLabel: Label | null = null;
  @property(Label) levelTitleLabel: Label | null = null;
  @property(Label) weatherLabel: Label | null = null;
  @property(Label) dayLabel: Label | null = null;
  @property(Button) deliveryBtn: Button | null = null;
  @property(Button) stationBtn: Button | null = null;
  @property(Button) financeBtn: Button | null = null;
  @property(Button) shopBtn: Button | null = null;
  @property(Sprite) weatherIcon: Sprite | null = null;

  private gameManager: GameManager = GameManager.getInstance();

  onLoad(): void {
    this.registerEvents();
    this.refreshAll();
  }

  private registerEvents(): void {
    EventBus.on(GameEvents.COINS_CHANGED, this.onCoinsChanged, this);
    EventBus.on(GameEvents.REPUTATION_CHANGED, this.onReputationChanged, this);
    EventBus.on(GameEvents.STAMINA_CHANGED, this.onStaminaChanged, this);
    EventBus.on(GameEvents.WEATHER_CHANGED, this.onWeatherChanged, this);
    EventBus.on(GameEvents.LEVEL_UP, this.onLevelUp, this);
    EventBus.on(GameEvents.DAY_CHANGED, this.onDayChanged, this);
  }

  onDestroy(): void {
    EventBus.off(GameEvents.COINS_CHANGED, this.onCoinsChanged, this);
    EventBus.off(GameEvents.REPUTATION_CHANGED, this.onReputationChanged, this);
    EventBus.off(GameEvents.STAMINA_CHANGED, this.onStaminaChanged, this);
    EventBus.off(GameEvents.WEATHER_CHANGED, this.onWeatherChanged, this);
    EventBus.off(GameEvents.LEVEL_UP, this.onLevelUp, this);
    EventBus.off(GameEvents.DAY_CHANGED, this.onDayChanged, this);
  }

  private refreshAll(): void {
    const data = this.gameManager.getPlayerData();
    if (!data) return;

    this.updateCoins(data.coins);
    this.updateReputation(data.reputationLevel, data.reputationExp);
    this.updateStamina(data.stamina);
    this.updateWeather(data.currentWeather);
    this.updateDay(this.gameManager.getDayCount());
    this.updateLevelTitle(data.reputationLevel);
  }

  private updateCoins(coins: number): void {
    if (this.coinsLabel) this.coinsLabel.string = `铜钱: ${coins.toLocaleString()}`;
  }

  private updateReputation(level: ReputationLevel, exp: number): void {
    if (this.reputationLabel) {
      const repName = REPUTATION_CONFIG[level].name;
      this.reputationLabel.string = `声望: ${repName} (${exp})`;
    }
  }

  private updateStamina(stamina: number): void {
    if (this.staminaLabel) this.staminaLabel.string = `体力: ${stamina}/100`;
  }

  private updateWeather(weather: WeatherType): void {
    if (this.weatherLabel) {
      this.weatherLabel.string = `天气: ${WEATHER_CONFIG[weather].name}`;
    }
  }

  private updateLevelTitle(level: ReputationLevel): void {
    if (this.levelTitleLabel) {
      this.levelTitleLabel.string = REPUTATION_CONFIG[level].title;
    }
  }

  private updateDay(day: number): void {
    if (this.dayLabel) this.dayLabel.string = `第${day}天`;
  }

  private onCoinsChanged(coins: number): void {
    this.updateCoins(coins);
  }

  private onReputationChanged(level: ReputationLevel, exp: number): void {
    this.updateReputation(level, exp);
    this.updateLevelTitle(level);
  }

  private onStaminaChanged(stamina: number): void {
    this.updateStamina(stamina);
  }

  private onWeatherChanged(weather: WeatherType): void {
    this.updateWeather(weather);
  }

  private onLevelUp(level: ReputationLevel): void {
    const repName = REPUTATION_CONFIG[level].name;
    console.log(`🎉 升级了！当前称号: ${REPUTATION_CONFIG[level].title}`);
  }

  private onDayChanged(day: number): void {
    this.updateDay(day);
  }

  onDeliveryClick(): void {
    this.gameManager.setState(GameState.DELIVERY);
  }

  onStationClick(): void {
    this.gameManager.setState(GameState.STATION);
  }

  onFinanceClick(): void {
    this.gameManager.setState(GameState.FINANCE);
  }
}
