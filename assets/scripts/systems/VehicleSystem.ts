import { VehicleType, VEHICLE_CONFIG, VehicleConfig, GameEvents } from '../utils/Constants';
import { PlayerData } from '../models/PlayerData';
import { EventBus } from '../utils/EventBus';
import { Logger } from '../utils/Logger';

export class VehicleSystem {
  private playerData: PlayerData;

  constructor(playerData: PlayerData) {
    this.playerData = playerData;
  }

  unlockVehicle(type: VehicleType): boolean {
    if (this.playerData.unlockedVehicles.includes(type)) {
      return false;
    }
    const config = VEHICLE_CONFIG[type];
    if (this.playerData.reputationLevel < config.unlockReputation) {
      Logger.warn('VehicleSystem', `Reputation too low for ${type}`);
      return false;
    }
    if (config.unlockAdCount > 0 && this.playerData.adWatchCount < config.unlockAdCount) {
      Logger.warn('VehicleSystem', `Need ${config.unlockAdCount} ads for ${type}`);
      return false;
    }
    this.playerData.unlockedVehicles.push(type);
    EventBus.emit(GameEvents.VEHICLE_CHANGED, type, 'unlocked');
    Logger.info('VehicleSystem', `Unlocked vehicle: ${config.name}`);
    return true;
  }

  switchVehicle(type: VehicleType): boolean {
    if (!this.playerData.unlockedVehicles.includes(type)) {
      Logger.warn('VehicleSystem', `Vehicle ${type} not unlocked`);
      return false;
    }
    this.playerData.currentVehicle = type;
    EventBus.emit(GameEvents.VEHICLE_CHANGED, type, 'switched');
    Logger.info('VehicleSystem', `Switched to: ${VEHICLE_CONFIG[type].name}`);
    return true;
  }

  getCurrentVehicleConfig(): VehicleConfig {
    return VEHICLE_CONFIG[this.playerData.currentVehicle];
  }

  canAcceptOrder(orderWeight: number): boolean {
    return orderWeight <= this.getCurrentVehicleConfig().capacity;
  }

  getEffectiveSpeed(weatherModifier: number): number {
    const base = this.getCurrentVehicleConfig().speed;
    return base * weatherModifier;
  }

  getVehicleProgress(): { current: VehicleType; next: VehicleType | null; progress: number } {
    const allTypes = Object.values(VehicleType);
    const currentIdx = allTypes.indexOf(this.playerData.currentVehicle);

    let next: VehicleType | null = null;
    for (let i = currentIdx + 1; i < allTypes.length; i++) {
      const vt = allTypes[i];
      const cfg = VEHICLE_CONFIG[vt];
      if (cfg.unlockReputation <= this.playerData.reputationLevel ||
          cfg.unlockAdCount <= this.playerData.adWatchCount) {
        next = vt;
        break;
      }
    }

    let progress = 0;
    if (next) {
      const nextCfg = VEHICLE_CONFIG[next];
      const repProgress = this.playerData.reputationLevel / Math.max(1, nextCfg.unlockReputation);
      const adProgress = nextCfg.unlockAdCount > 0
        ? this.playerData.adWatchCount / nextCfg.unlockAdCount
        : 1;
      progress = Math.min(1, Math.max(repProgress, adProgress));
    } else {
      progress = 1;
    }

    return { current: this.playerData.currentVehicle, next, progress };
  }

  isAdUnlockRequired(type: VehicleType): boolean {
    return VEHICLE_CONFIG[type].unlockAdCount > 0;
  }

  checkAndUnlock(): VehicleType[] {
    const newlyUnlocked: VehicleType[] = [];
    const allTypes = Object.values(VehicleType);
    for (const vt of allTypes) {
      if (this.playerData.unlockedVehicles.includes(vt)) continue;
      const cfg = VEHICLE_CONFIG[vt];
      if (this.playerData.reputationLevel >= cfg.unlockReputation) {
        if (cfg.unlockAdCount <= 0 || this.playerData.adWatchCount >= cfg.unlockAdCount) {
          this.playerData.unlockedVehicles.push(vt);
          newlyUnlocked.push(vt);
          Logger.info('VehicleSystem', `Auto-unlocked: ${cfg.name}`);
        }
      }
    }
    return newlyUnlocked;
  }
}
