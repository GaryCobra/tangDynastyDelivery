import { Logger } from '../utils/Logger';

declare const wx: any;

export class CloudManager {
  private static instance: CloudManager;
  private initialized: boolean = false;

  private constructor() {}

  static getInstance(): CloudManager {
    if (!CloudManager.instance) {
      CloudManager.instance = new CloudManager();
    }
    return CloudManager.instance;
  }

  init(): void {
    if (typeof wx !== 'undefined' && wx.cloud) {
      wx.cloud.init({
        env: wx.cloud.DYNAMIC_CURRENT_ENV,
        traceUser: true,
      });
      this.initialized = true;
      Logger.info('CloudManager', 'Cloud initialized');
    } else {
      Logger.warn('CloudManager', 'Cloud not available');
    }
  }

  isReady(): boolean {
    return this.initialized;
  }

  async login(): Promise<{ openid: string; isNewUser: boolean } | null> {
    if (!this.initialized) return null;
    try {
      const res = await this.callFunction('login', {});
      if (res && res.openid) {
        return res;
      }
      return null;
    } catch (e) {
      Logger.error('CloudManager', 'Login failed', e);
      return null;
    }
  }

  async callFunction(name: string, data: any = {}): Promise<any> {
    if (!this.initialized) {
      Logger.warn('CloudManager', `Cloud not ready, skipping ${name}`);
      return null;
    }
    try {
      const res = await wx.cloud.callFunction({ name, data });
      return res.result;
    } catch (e) {
      Logger.error('CloudManager', `Function ${name} failed`, e);
      throw e;
    }
  }

  async saveGame(uid: string, gameData: any): Promise<boolean> {
    const res = await this.callFunction('saveGame', { uid, gameData });
    return res?.success === true;
  }

  async loadGame(uid: string): Promise<any> {
    return await this.callFunction('loadGame', { uid });
  }

  async calculateOfflineEarnings(
    uid: string,
    lastLoginTime: number,
    stationLevel: number,
    employeeCount: number,
    totalEfficiency: number
  ): Promise<any> {
    return await this.callFunction('calculateOfflineEarnings', {
      uid, lastLoginTime, stationLevel, employeeCount, totalEfficiency,
    });
  }

  async rewardAd(uid: string, adType: string, rewardType: string): Promise<any> {
    return await this.callFunction('rewardAd', { uid, adType, rewardType });
  }

  async getLeaderboard(): Promise<any[]> {
    const res = await this.callFunction('getLeaderboard', {});
    return res?.list || [];
  }
}
