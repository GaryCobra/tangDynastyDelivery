import { ReputationLevel, VehicleType, WeatherType } from '../utils/Constants';

export interface InventoryItem {
  commodityType: string;
  quantity: number;
  purchasePrice: number;
}

export interface Achievement {
  id: string;
  unlockedAt: number;
}

export interface DailyRecord {
  date: string;
  deliveryCount: number;
  adWatchedCount: number;
  coinsEarned: number;
  coinsSpent: number;
}

export class PlayerData {
  uid: string = '';
  nickname: string = '跑腿小哥';

  coins: number = 100;
  reputationLevel: ReputationLevel = ReputationLevel.BU_YI;
  reputationExp: number = 0;
  stamina: number = 100;

  currentVehicle: VehicleType = VehicleType.LEGS;
  unlockedVehicles: VehicleType[] = [VehicleType.LEGS];
  adWatchCount: number = 0;

  hasStation: boolean = false;
  stationLevel: number = 0;
  stationName: string = '';
  employeeIds: string[] = [];

  inventory: InventoryItem[] = [];
  coinsInBank: number = 0;

  totalDeliveries: number = 0;
  perfectDeliveries: number = 0;
  failedDeliveries: number = 0;
  totalCoinsEarned: number = 0;

  achievements: Achievement[] = [];
  dailyRecord: DailyRecord = {
    date: '',
    deliveryCount: 0,
    adWatchedCount: 0,
    coinsEarned: 0,
    coinsSpent: 0,
  };

  lastLoginTime: number = 0;
  totalPlayTime: number = 0;
  currentWeather: WeatherType = WeatherType.SUNNY;

  constructor(uid?: string) {
    if (uid) this.uid = uid;
  }

  static createNew(uid: string): PlayerData {
    const data = new PlayerData(uid);
    data.lastLoginTime = Date.now();
    data.dailyRecord.date = new Date().toISOString().split('T')[0];
    return data;
  }

  static fromJSON(json: any): PlayerData {
    const data = new PlayerData();
    Object.assign(data, json);
    return data;
  }

  toJSON(): any {
    return { ...this };
  }
}
