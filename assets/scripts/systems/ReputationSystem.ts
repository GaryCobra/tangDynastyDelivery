import { ReputationLevel, REPUTATION_CONFIG, GameEvents } from '../utils/Constants';
import { PlayerData } from '../models/PlayerData';
import { EventBus } from '../utils/EventBus';
import { Logger } from '../utils/Logger';

export class ReputationSystem {
  private playerData: PlayerData;

  constructor(playerData: PlayerData) {
    this.playerData = playerData;
  }

  addReputation(amount: number): void {
    this.playerData.reputationExp += amount;

    const leveledUp = this.checkLevelUp();
    if (leveledUp !== null) {
      EventBus.emit(GameEvents.REPUTATION_CHANGED, this.playerData.reputationLevel, this.playerData.reputationExp);
      EventBus.emit(GameEvents.LEVEL_UP, leveledUp);
      Logger.info('ReputationSystem', `Level up to ${REPUTATION_CONFIG[leveledUp].name}`);
    } else {
      EventBus.emit(GameEvents.REPUTATION_CHANGED, this.playerData.reputationLevel, this.playerData.reputationExp);
    }
  }

  checkLevelUp(): ReputationLevel | null {
    const levels = [
      ReputationLevel.BU_YI,
      ReputationLevel.XIAO_YOU_MING,
      ReputationLevel.YUAN_WAI,
      ReputationLevel.XIANG_SHEN,
      ReputationLevel.FU_HAO,
      ReputationLevel.DA_XIANG_SHEN,
      ReputationLevel.YI_FANG_JU_FU,
    ];

    let newLevel: ReputationLevel | null = null;
    for (const level of levels) {
      if (this.playerData.reputationLevel < level &&
          this.playerData.reputationExp >= REPUTATION_CONFIG[level].expRequired) {
        newLevel = level;
      }
    }

    if (newLevel !== null) {
      this.playerData.reputationLevel = newLevel;
    }

    return newLevel;
  }

  getLevelProgress(): { current: ReputationLevel; name: string; exp: number; nextLevelExp: number; percent: number } {
    const current = this.playerData.reputationLevel;
    const levels = [
      ReputationLevel.BU_YI,
      ReputationLevel.XIAO_YOU_MING,
      ReputationLevel.YUAN_WAI,
      ReputationLevel.XIANG_SHEN,
      ReputationLevel.FU_HAO,
      ReputationLevel.DA_XIANG_SHEN,
      ReputationLevel.YI_FANG_JU_FU,
    ];

    const currentIdx = levels.indexOf(current);
    let nextLevelExp = REPUTATION_CONFIG[current].expRequired;

    if (currentIdx < levels.length - 1) {
      const nextLevel = levels[currentIdx + 1];
      nextLevelExp = REPUTATION_CONFIG[nextLevel].expRequired;
    }

    const prevLevelExp = REPUTATION_CONFIG[current].expRequired;
    const needed = nextLevelExp - prevLevelExp;
    const have = this.playerData.reputationExp - prevLevelExp;
    const percent = needed > 0 ? Math.min(100, Math.max(0, (have / needed) * 100)) : 100;

    return {
      current,
      name: REPUTATION_CONFIG[current].name,
      exp: this.playerData.reputationExp,
      nextLevelExp,
      percent,
    };
  }

  getReputationMultiplier(): number {
    const multipliers = [1.0, 1.2, 1.5, 1.8, 2.0, 2.3, 2.5];
    const idx = this.playerData.reputationLevel;
    return multipliers[idx] || 1.0;
  }

  getTitle(): string {
    return REPUTATION_CONFIG[this.playerData.reputationLevel].title;
  }

  static getUnlockedFeatures(level: ReputationLevel): string[] {
    const features: Record<ReputationLevel, string[]> = {
      [ReputationLevel.BU_YI]: ['普通订单配送', '步行送货'],
      [ReputationLevel.XIAO_YOU_MING]: ['加急订单', '站点建设', '三轮推车'],
      [ReputationLevel.YUAN_WAI]: ['贵重订单', '连环订单', '四轮平板车', '金融街基础交易'],
      [ReputationLevel.XIANG_SHEN]: ['牛车', '批量交易', '系统金'],
      [ReputationLevel.FU_HAO]: ['马车', '加急订单专享', '大额存单'],
      [ReputationLevel.DA_XIANG_SHEN]: ['大宗交易', '特殊商品'],
      [ReputationLevel.YI_FANG_JU_FU]: ['传奇称号', '所有功能解锁'],
    };
    return features[level] || [];
  }
}
