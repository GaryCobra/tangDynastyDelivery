import { AD_CONFIG, STAMINA_CONFIG, GameEvents } from '../utils/Constants';
import { EventBus } from '../utils/EventBus';
import { Logger } from '../utils/Logger';

declare const wx: any;

export type AdRewardType = 'coins' | 'stamina' | 'finance_tip';

export class AdManager {
  private static instance: AdManager;
  private dailyAdCount: number = 0;
  private lastResetDate: string = '';

  private constructor() {}

  static getInstance(): AdManager {
    if (!AdManager.instance) {
      AdManager.instance = new AdManager();
    }
    return AdManager.instance;
  }

  private checkDailyReset(): void {
    const today = new Date().toISOString().split('T')[0];
    if (this.lastResetDate !== today) {
      this.dailyAdCount = 0;
      this.lastResetDate = today;
    }
  }

  canWatchAd(): boolean {
    this.checkDailyReset();
    return this.dailyAdCount < AD_CONFIG.MAX_DAILY_REWARDED_ADS;
  }

  getDailyAdCount(): number {
    this.checkDailyReset();
    return this.dailyAdCount;
  }

  showRewardedAd(rewardType: AdRewardType, onReward: () => void, onFail?: () => void): void {
    if (!this.canWatchAd()) {
      Logger.warn('AdManager', 'Daily ad limit reached');
      onFail?.();
      return;
    }

    if (typeof wx === 'undefined' || !wx.createRewardedVideoAd) {
      Logger.warn('AdManager', 'Ad SDK not available, simulating reward');
      this.dailyAdCount++;
      onReward();
      EventBus.emit(GameEvents.AD_REWARD_CLAIMED, rewardType);
      return;
    }

    try {
      const ad = wx.createRewardedVideoAd({ adUnitId: AD_CONFIG.REWARDED_VIDEO_PLACEMENT_ID });

      ad.onClose((res: { isEnded: boolean }) => {
        if (res.isEnded) {
          this.dailyAdCount++;
          onReward();
          EventBus.emit(GameEvents.AD_REWARD_CLAIMED, rewardType);
          Logger.info('AdManager', `Ad reward granted: ${rewardType}`);
        } else {
          Logger.warn('AdManager', 'Ad not completed');
          onFail?.();
        }
      });

      ad.onError((err: any) => {
        Logger.error('AdManager', 'Ad error', err);
        onFail?.();
      });

      ad.show().catch(() => {
        ad.load().then(() => ad.show()).catch(() => {
          Logger.error('AdManager', 'Ad load & show failed');
          onFail?.();
        });
      });
    } catch (e) {
      Logger.error('AdManager', 'Ad creation failed', e);
      onFail?.();
    }
  }

  showInterstitialAd(): void {
    if (typeof wx === 'undefined' || !wx.createInterstitialAd) return;

    try {
      const ad = wx.createInterstitialAd({ adUnitId: AD_CONFIG.INTERSTITIAL_PLACEMENT_ID });
      ad.show().catch(() => {
        ad.load().then(() => ad.show()).catch(() => {});
      });
    } catch (e) {
      Logger.warn('AdManager', 'Interstitial ad failed', e);
    }
  }

  getRewardAmount(rewardType: AdRewardType): number {
    switch (rewardType) {
      case 'coins': return AD_CONFIG.REWARD_COINS_FOR_AD;
      case 'stamina': return STAMINA_CONFIG.AD_RECOVER_AMOUNT;
      case 'finance_tip': return 0;
    }
  }
}
