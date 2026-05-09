import { PlayerData } from '../models/PlayerData';
import { GameEvents } from '../utils/Constants';
import { EventBus } from '../utils/EventBus';
import { Logger } from '../utils/Logger';

const SAVE_KEY = 'tang_dynasty_delivery_save';

declare const wx: any;

export class DataManager {
  private static instance: DataManager;
  private isCloudAvailable: boolean = false;

  private constructor() {}

  static getInstance(): DataManager {
    if (!DataManager.instance) {
      DataManager.instance = new DataManager();
    }
    return DataManager.instance;
  }

  checkCloudAvailability(): void {
    if (typeof wx !== 'undefined' && wx.cloud) {
      this.isCloudAvailable = true;
    }
  }

  saveGame(playerData: PlayerData): boolean {
    try {
      const json = JSON.stringify(playerData.toJSON());
      if (typeof wx !== 'undefined' && wx.setStorageSync) {
        wx.setStorageSync(SAVE_KEY, json);
      }
      if (this.isCloudAvailable) {
        this.syncToCloud(playerData);
      }
      Logger.info('DataManager', 'Game saved locally');
      EventBus.emit(GameEvents.GAME_SAVED);
      return true;
    } catch (e) {
      Logger.error('DataManager', 'Save failed', e);
      return false;
    }
  }

  loadGame(): PlayerData | null {
    try {
      let json: string | null = null;
      if (typeof wx !== 'undefined' && wx.getStorageSync) {
        json = wx.getStorageSync(SAVE_KEY);
      }
      if (json) {
        const data = JSON.parse(json);
        Logger.info('DataManager', 'Game loaded from local');
        return PlayerData.fromJSON(data);
      }
      Logger.info('DataManager', 'No save data found');
      return null;
    } catch (e) {
      Logger.error('DataManager', 'Load failed', e);
      return null;
    }
  }

  deleteGame(): void {
    try {
      if (typeof wx !== 'undefined' && wx.removeStorageSync) {
        wx.removeStorageSync(SAVE_KEY);
      }
      Logger.info('DataManager', 'Game data deleted');
    } catch (e) {
      Logger.error('DataManager', 'Delete failed', e);
    }
  }

  async syncToCloud(playerData: PlayerData): Promise<boolean> {
    if (!this.isCloudAvailable) return false;
    try {
      const res = await wx.cloud.callFunction({
        name: 'saveGame',
        data: { uid: playerData.uid, gameData: playerData.toJSON() },
      });
      Logger.info('DataManager', 'Cloud sync success', res);
      return true;
    } catch (e) {
      Logger.warn('DataManager', 'Cloud sync failed, offline mode', e);
      return false;
    }
  }

  async syncFromCloud(uid: string): Promise<PlayerData | null> {
    if (!this.isCloudAvailable) return null;
    try {
      const res = await wx.cloud.callFunction({
        name: 'loadGame',
        data: { uid },
      });
      if (res.result && res.result.gameData) {
        Logger.info('DataManager', 'Cloud load success');
        return PlayerData.fromJSON(res.result.gameData);
      }
      return null;
    } catch (e) {
      Logger.warn('DataManager', 'Cloud load failed', e);
      return null;
    }
  }

  async calculateOfflineEarnings(
    uid: string,
    lastLoginTime: number,
    stationLevel: number,
    employeeCount: number,
    efficiency: number
  ): Promise<{ coins: number; hours: number; message: string } | null> {
    if (!this.isCloudAvailable) return null;
    try {
      const res = await wx.cloud.callFunction({
        name: 'calculateOfflineEarnings',
        data: { uid, lastLoginTime, stationLevel, employeeCount, totalEfficiency: efficiency },
      });
      return res.result || null;
    } catch (e) {
      Logger.warn('DataManager', 'Offline earnings calc failed', e);
      return null;
    }
  }
}
