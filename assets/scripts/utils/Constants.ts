/**
 * 《我在大唐送外卖》- 全局常量定义
 * 所有游戏平衡数值集中在此处，方便调优
 */

// ===== 声望等级 =====
export enum ReputationLevel {
  BU_YI = 0,        // 布衣 - 初始
  XIAO_YOU_MING = 1, // 小有名气
  YUAN_WAI = 2,      // 员外
  XIANG_SHEN = 3,    // 乡绅
  FU_HAO = 4,        // 富豪
  DA_XIANG_SHEN = 5, // 大乡绅
  YI_FANG_JU_FU = 6, // 一方巨富
}

export const REPUTATION_CONFIG: Record<ReputationLevel, { name: string; expRequired: number; title: string }> = {
  [ReputationLevel.BU_YI]:          { name: '布衣',     expRequired: 0,      title: '初来乍到' },
  [ReputationLevel.XIAO_YOU_MING]: { name: '小有名气',  expRequired: 1000,  title: '小有成就' },
  [ReputationLevel.YUAN_WAI]:      { name: '员外',     expRequired: 5000,  title: '一方乡贤' },
  [ReputationLevel.XIANG_SHEN]:    { name: '乡绅',     expRequired: 20000, title: '地方名流' },
  [ReputationLevel.FU_HAO]:        { name: '富豪',     expRequired: 80000, title: '富甲一方' },
  [ReputationLevel.DA_XIANG_SHEN]: { name: '大乡绅',   expRequired: 300000, title: '权势滔天' },
  [ReputationLevel.YI_FANG_JU_FU]: { name: '一方巨富',  expRequired: 1000000, title: '长安传说' },
};

// ===== 订单类型 =====
export enum OrderType {
  NORMAL = 'normal',         // 普通订单
  EXPRESS = 'express',       // 加急订单
  VALUABLE = 'valuable',     // 贵重订单
  CHAIN = 'chain',           // 连环订单
}

export interface OrderTypeConfig {
  name: string;
  timeLimit: number;       // 限时（秒），0=无限
  rewardMultiplier: number;
  penaltyDesc: string;
  minReputation: ReputationLevel;
}

export const ORDER_TYPE_CONFIG: Record<OrderType, OrderTypeConfig> = {
  [OrderType.NORMAL]: {
    name: '普通订单',
    timeLimit: 0,
    rewardMultiplier: 1.0,
    penaltyDesc: '无惩罚',
    minReputation: ReputationLevel.BU_YI,
  },
  [OrderType.EXPRESS]: {
    name: '加急订单',
    timeLimit: 30,
    rewardMultiplier: 2.0,
    penaltyDesc: '扣除信誉',
    minReputation: ReputationLevel.XIAO_YOU_MING,
  },
  [OrderType.VALUABLE]: {
    name: '贵重订单',
    timeLimit: 60,
    rewardMultiplier: 3.0,
    penaltyDesc: '破损赔偿',
    minReputation: ReputationLevel.YUAN_WAI,
  },
  [OrderType.CHAIN]: {
    name: '连环订单',
    timeLimit: 120,
    rewardMultiplier: 5.0,
    penaltyDesc: '全套获额外声望',
    minReputation: ReputationLevel.YUAN_WAI,
  },
};

// ===== 载具系统 =====
export enum VehicleType {
  LEGS = 'legs',
  HANDCART = 'handcart',
  FLATBED = 'flatbed',
  OX_CART = 'ox_cart',
  HORSE_CART = 'horse_cart',
}

export interface VehicleConfig {
  name: string;
  description: string;
  capacity: number;        // 载重(kg)
  speed: number;           // 速度(m/s)
  stability: number;       // 稳定性(0-1)
  endurance: number;       // 耐久/耐力
  unlockReputation: ReputationLevel;
  unlockAdCount: number;   // 观看广告次数解锁(0=不需要)
  icon: string;
}

export const VEHICLE_CONFIG: Record<VehicleType, VehicleConfig> = {
  [VehicleType.LEGS]: {
    name: '双腿',
    description: '初始载具，朴实无华',
    capacity: 10,
    speed: 1.0,
    stability: 1.0,
    endurance: 50,
    unlockReputation: ReputationLevel.BU_YI,
    unlockAdCount: 0,
    icon: 'vehicle_legs',
  },
  [VehicleType.HANDCART]: {
    name: '三轮推车',
    description: '新手目标，可接批量单',
    capacity: 50,
    speed: 1.5,
    stability: 0.8,
    endurance: 80,
    unlockReputation: ReputationLevel.XIAO_YOU_MING,
    unlockAdCount: 0,
    icon: 'vehicle_handcart',
  },
  [VehicleType.FLATBED]: {
    name: '四轮平板车',
    description: '稳定性提升，减少瓷器破损',
    capacity: 100,
    speed: 1.8,
    stability: 0.9,
    endurance: 120,
    unlockReputation: ReputationLevel.YUAN_WAI,
    unlockAdCount: 10,
    icon: 'vehicle_flatbed',
  },
  [VehicleType.OX_CART]: {
    name: '牛车',
    description: '耐力高，适合长途跋涉',
    capacity: 300,
    speed: 1.2,
    stability: 0.85,
    endurance: 250,
    unlockReputation: ReputationLevel.XIANG_SHEN,
    unlockAdCount: 30,
    icon: 'vehicle_ox_cart',
  },
  [VehicleType.HORSE_CART]: {
    name: '马车',
    description: '速度极快，可接加急订单',
    capacity: 500,
    speed: 2.5,
    stability: 0.75,
    endurance: 180,
    unlockReputation: ReputationLevel.FU_HAO,
    unlockAdCount: 50,
    icon: 'vehicle_horse_cart',
  },
};

// ===== 天气系统 =====
export enum WeatherType {
  SUNNY = 'sunny',
  RAINY = 'rainy',
  SNOWY = 'snowy',
}

export interface WeatherConfig {
  name: string;
  speedModifier: number;      // 速度倍率
  staminaModifier: number;    // 体力消耗倍率
  duration: number;           // 持续秒数
  probability: number;        // 出现概率(0-1)
}

export const WEATHER_CONFIG: Record<WeatherType, WeatherConfig> = {
  [WeatherType.SUNNY]: {
    name: '晴天',
    speedModifier: 1.0,
    staminaModifier: 1.0,
    duration: 300,
    probability: 0.6,
  },
  [WeatherType.RAINY]: {
    name: '雨天',
    speedModifier: 0.8,
    staminaModifier: 1.0,
    duration: 180,
    probability: 0.25,
  },
  [WeatherType.SNOWY]: {
    name: '雪天',
    speedModifier: 1.0,
    staminaModifier: 1.2,
    duration: 120,
    probability: 0.15,
  },
};

// ===== 商品类型（金融系统）=====
export enum CommodityType {
  GRAIN = 'grain',
  SILK = 'silk',
  PORCELAIN = 'porcelain',
  TEA = 'tea',
  SPICE = 'spice',
}

export interface CommodityConfig {
  name: string;
  basePrice: number;
  volatility: number;    // 波动率
  icon: string;
}

export const COMMODITY_CONFIG: Record<CommodityType, CommodityConfig> = {
  [CommodityType.GRAIN]:    { name: '粮食',   basePrice: 10,  volatility: 0.3, icon: 'commodity_grain' },
  [CommodityType.SILK]:     { name: '丝绸',   basePrice: 50,  volatility: 0.4, icon: 'commodity_silk' },
  [CommodityType.PORCELAIN]: { name: '瓷器',  basePrice: 80,  volatility: 0.5, icon: 'commodity_porcelain' },
  [CommodityType.TEA]:       { name: '茶叶', basePrice: 30,  volatility: 0.35, icon: 'commodity_tea' },
  [CommodityType.SPICE]:     { name: '香料', basePrice: 60,  volatility: 0.55, icon: 'commodity_spice' },
};

// ===== 随机事件 =====
export interface RandomEventConfig {
  name: string;
  description: string;
  effect: Record<CommodityType, number>;  // 价格倍率变动
  duration: number;   // 持续秒数
  probability: number; // 出现概率
}

export const RANDOM_EVENTS: RandomEventConfig[] = [
  {
    name: '西域商路通',
    description: '西域商路畅通，香料价格下跌',
    effect: {
      [CommodityType.GRAIN]: 1.0,
      [CommodityType.SILK]: 0.9,
      [CommodityType.PORCELAIN]: 1.0,
      [CommodityType.TEA]: 1.0,
      [CommodityType.SPICE]: 0.6,
    },
    duration: 600,
    probability: 0.2,
  },
  {
    name: '江南大旱',
    description: '江南大旱，粮食价格暴涨',
    effect: {
      [CommodityType.GRAIN]: 2.5,
      [CommodityType.SILK]: 1.0,
      [CommodityType.PORCELAIN]: 1.0,
      [CommodityType.TEA]: 1.2,
      [CommodityType.SPICE]: 1.0,
    },
    duration: 300,
    probability: 0.15,
  },
  {
    name: '宫廷采购',
    description: '宫廷大量采购丝绸瓷器',
    effect: {
      [CommodityType.GRAIN]: 1.0,
      [CommodityType.SILK]: 1.8,
      [CommodityType.PORCELAIN]: 1.6,
      [CommodityType.TEA]: 1.0,
      [CommodityType.SPICE]: 1.0,
    },
    duration: 240,
    probability: 0.1,
  },
  {
    name: '茶马古道',
    description: '茶马古道重开，茶叶价格飙升',
    effect: {
      [CommodityType.GRAIN]: 1.0,
      [CommodityType.SILK]: 1.0,
      [CommodityType.PORCELAIN]: 1.0,
      [CommodityType.TEA]: 2.0,
      [CommodityType.SPICE]: 1.0,
    },
    duration: 360,
    probability: 0.12,
  },
  {
    name: '胡商云集',
    description: '胡商大量收购，所有商品价格上涨',
    effect: {
      [CommodityType.GRAIN]: 1.3,
      [CommodityType.SILK]: 1.4,
      [CommodityType.PORCELAIN]: 1.4,
      [CommodityType.TEA]: 1.3,
      [CommodityType.SPICE]: 1.5,
    },
    duration: 180,
    probability: 0.08,
  },
];

// ===== 员工属性 =====
export enum EmployeePersonality {
  HONEST = 'honest',       // 老实
  SMART = 'smart',         // 机灵
  LAZY = 'lazy',           // 懒散
}

export interface EmployeeTemplate {
  name: string;
  personality: EmployeePersonality;
  speed: number;           // 速度(1-10)
  capacity: number;        // 负重(1-10)
  diligence: number;       // 勤劳(1-10) 影响工作时长
  salary: number;          // 日薪(铜钱)
  description: string;
}

export const EMPLOYEE_TEMPLATES: EmployeeTemplate[] = [
  { name: '阿福',   personality: EmployeePersonality.HONEST, speed: 5, capacity: 6, diligence: 8, salary: 200,  description: '老实肯干，从不偷懒' },
  { name: '小六',   personality: EmployeePersonality.SMART,  speed: 8, capacity: 4, diligence: 6, salary: 300,  description: '机灵鬼，偶尔带回小费' },
  { name: '大壮',   personality: EmployeePersonality.HONEST, speed: 4, capacity: 9, diligence: 7, salary: 250,  description: '力气大，能扛重货' },
  { name: '狗子',   personality: EmployeePersonality.LAZY,   speed: 6, capacity: 5, diligence: 3, salary: 150,  description: '懒散但便宜，需监督' },
  { name: '翠花',   personality: EmployeePersonality.SMART,  speed: 7, capacity: 5, diligence: 7, salary: 280,  description: '精明能干，善于沟通' },
  { name: '铁柱',   personality: EmployeePersonality.HONEST, speed: 5, capacity: 7, diligence: 9, salary: 220,  description: '任劳任怨，从不抱怨' },
  { name: '二蛋',   personality: EmployeePersonality.LAZY,   speed: 5, capacity: 6, diligence: 4, salary: 160,  description: '能偷懒就偷懒' },
  { name: '小花',   personality: EmployeePersonality.SMART,  speed: 9, capacity: 3, diligence: 5, salary: 320,  description: '手脚麻利，效率极高' },
];

// ===== 地图相关 =====
export enum MapLocation {
  RICE_SHOP = 'rice_shop',       // 米铺
  TAVERN = 'tavern',             // 酒肆
  CLOTH_SHOP = 'cloth_shop',     // 布庄
  BLACKSMITH = 'blacksmith',     // 铁匠铺
  WEAPON_SHOP = 'weapon_shop',   // 兵器铺
  MILITARY_CAMP = 'military_camp',// 军营
  MEDICAL_BUREAU = 'medical_bureau', // 太医署
  FINANCIAL_STREET = 'financial_street', // 金融街
  HOME = 'home',                 // 家（出发点）
}

export interface LocationConfig {
  name: string;
  description: string;
  x: number;
  y: number;
}

export const LOCATION_CONFIG: Record<MapLocation, LocationConfig> = {
  [MapLocation.RICE_SHOP]:        { name: '米铺',     description: '长安最大的米粮市', x: 200, y: 600 },
  [MapLocation.TAVERN]:           { name: '酒肆',     description: '热闹的酒馆', x: 400, y: 800 },
  [MapLocation.CLOTH_SHOP]:       { name: '布庄',     description: '绫罗绸缎', x: 600, y: 500 },
  [MapLocation.BLACKSMITH]:       { name: '铁匠铺',   description: '打铁造器', x: 300, y: 400 },
  [MapLocation.WEAPON_SHOP]:      { name: '兵器铺',   description: '刀剑盔甲', x: 450, y: 350 },
  [MapLocation.MILITARY_CAMP]:    { name: '军营',     description: '驻军大营', x: 700, y: 300 },
  [MapLocation.MEDICAL_BUREAU]:   { name: '太医署',   description: '官办医署', x: 550, y: 650 },
  [MapLocation.FINANCIAL_STREET]: { name: '金融街',   description: '商贾云集', x: 800, y: 700 },
  [MapLocation.HOME]:             { name: '家',       description: '你的出发地', x: 100, y: 900 },
};

// ===== 广告相关 =====
export const AD_CONFIG = {
  REWARDED_VIDEO_PLACEMENT_ID: 'your_rewarded_video_id',
  INTERSTITIAL_PLACEMENT_ID: 'your_interstitial_id',
  REWARD_COINS_FOR_AD: 50,           // 看广告获得铜钱
  FINANCE_TIP_AD_COUNT: 1,            // 看广告获得金融提示
  VEHICLE_AD_THRESHOLDS: [10, 30, 50], // 各层级需要的广告数
  MAX_DAILY_REWARDED_ADS: 30,         // 每日最大激励视频次数
  OFFLINE_MAX_HOURS: 12,              // 离线最大计算时长
};

// ===== 体力系统 =====
export const STAMINA_CONFIG = {
  MAX_STAMINA: 100,
  NORMAL_DELIVERY_COST: 10,
  EXPRESS_DELIVERY_COST: 15,
  VALUABLE_DELIVERY_COST: 20,
  CHAIN_DELIVERY_COST: 30,
  RECOVER_RATE: 1,          // 每X秒恢复1点
  RECOVER_INTERVAL: 30,     // 恢复间隔（秒）
  AD_RECOVER_AMOUNT: 30,    // 看广告恢复体力
};

// ===== 铜钱/经济 =====
export const ECONOMY_CONFIG = {
  INITIAL_COINS: 100,
  STATION_SETUP_COST: 5000,
  MAX_COINS: 999999999,
  PERFECT_DELIVERY_BONUS: 1.5,   // 完美送达倍率
};

// ===== 成就 =====
export enum AchievementType {
  FIRST_DELIVERY = 'first_delivery',
  DELIVERY_100 = 'delivery_100',
  DELIVERY_1000 = 'delivery_1000',
  UNLOCK_VEHICLE = 'unlock_vehicle',
  ALL_VEHICLES = 'all_vehicles',
  HIRE_EMPLOYEE = 'hire_employee',
  STATION_LEVEL_5 = 'station_level_5',
  FINANCE_PROFIT = 'finance_profit',
  FINANCE_GURU = 'finance_guru',
  COINS_100K = 'coins_100k',
  COINS_1M = 'coins_1m',
  REPUTATION_MAX = 'reputation_max',
}

// ===== 事件名称 =====
export const GameEvents = {
  COINS_CHANGED: 'coins_changed',
  REPUTATION_CHANGED: 'reputation_changed',
  STAMINA_CHANGED: 'stamina_changed',
  VEHICLE_CHANGED: 'vehicle_changed',
  ORDER_ACCEPTED: 'order_accepted',
  ORDER_COMPLETED: 'order_completed',
  ORDER_FAILED: 'order_failed',
  WEATHER_CHANGED: 'weather_changed',
  EMPLOYEE_HIRED: 'employee_hired',
  EMPLOYEE_FIRED: 'employee_fired',
  COMMODITY_PRICE_CHANGED: 'commodity_price_changed',
  RANDOM_EVENT: 'random_event',
  AD_REWARD_CLAIMED: 'ad_reward_claimed',
  GAME_SAVED: 'game_saved',
  GAME_LOADED: 'game_loaded',
  ACHIEVEMENT_UNLOCKED: 'achievement_unlocked',
  LEVEL_UP: 'level_up',
  DAY_CHANGED: 'day_changed',
} as const;
