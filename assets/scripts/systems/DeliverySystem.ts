import { OrderData, OrderChain } from '../models/OrderData';
import { PlayerData } from '../models/PlayerData';
import {
  OrderType, MapLocation, LOCATION_CONFIG, VEHICLE_CONFIG,
  WEATHER_CONFIG, WeatherType, STAMINA_CONFIG, ECONOMY_CONFIG,
  GameEvents, ReputationLevel, AD_CONFIG,
} from '../utils/Constants';
import { EventBus } from '../utils/EventBus';
import { Logger } from '../utils/Logger';

interface DeliveryProgress {
  orderId: string;
  distanceTraveled: number;
  totalDistance: number;
  obstaclesDodged: number;
  totalObstacles: number;
  isPerfect: boolean;
  startTime: number;
  route: 'main' | 'alley';
}

export class DeliverySystem {
  private playerData: PlayerData;
  private activeOrders: OrderData[] = [];
  private currentDelivery: DeliveryProgress | null = null;
  private weatherTimer: number = 0;
  private weatherDuration: number = 300;
  private orderRefreshTimer: number = 0;

  constructor(playerData: PlayerData) {
    this.playerData = playerData;
    this.weatherDuration = WEATHER_CONFIG[this.playerData.currentWeather].duration;
  }

  getActiveOrders(): OrderData[] {
    return this.activeOrders.filter(o => o.isActive);
  }

  generateOrders(): void {
    const count = 3 + Math.floor(Math.random() * 3);
    const routes = this.generatePossibleRoutes();

    for (let i = 0; i < count && this.activeOrders.length < 10; i++) {
      const route = routes[Math.floor(Math.random() * routes.length)];
      const order = this.createOrder(route.origin, route.dest);
      this.activeOrders.push(order);
    }
  }

  private generatePossibleRoutes(): { origin: MapLocation; dest: MapLocation }[] {
    const locations = Object.values(MapLocation).filter(v => typeof v === 'string') as MapLocation[];
    const routes: { origin: MapLocation; dest: MapLocation }[] = [];

    for (let i = 0; i < locations.length; i++) {
      for (let j = 0; j < locations.length; j++) {
        if (i !== j) {
          routes.push({ origin: locations[i], dest: locations[j] });
        }
      }
    }
    return routes;
  }

  private createOrder(origin: MapLocation, destination: MapLocation): OrderData {
    const order = new OrderData();
    order.id = OrderData.generateId();
    order.origin = origin;
    order.destination = destination;

    const originCfg = LOCATION_CONFIG[origin];
    const destCfg = LOCATION_CONFIG[destination];
    const distance = Math.abs(originCfg.x - destCfg.x) + Math.abs(originCfg.y - destCfg.y);

    order.distance = Math.max(50, distance);
    order.reward = Math.floor(order.distance * 0.5 * (1 + Math.random() * 0.5));
    order.reputationReward = Math.floor(order.distance * 0.05) + 1;
    order.weight = 1 + Math.floor(Math.random() * 10);

    const rep = this.playerData.reputationLevel;
    const levelThreshold = Math.floor(Math.random() * 4);
    if (rep >= ReputationLevel.FU_HAO && levelThreshold === 3) {
      order.type = OrderType.CHAIN;
      order.title = '连环订单';
      order.description = `${originCfg.name} → ${destCfg.name}`;
      order.timeLimit = 120;
      order.reward = Math.floor(order.reward * 5);
      order.reputationReward = Math.floor(order.reputationReward * 3);
      order.weight = 5;
    } else if (rep >= ReputationLevel.YUAN_WAI && levelThreshold === 2) {
      order.type = OrderType.VALUABLE;
      order.title = '贵重订单';
      order.description = `运送货物到${destCfg.name}`;
      order.timeLimit = 60;
      order.reward = Math.floor(order.reward * 3);
      order.reputationReward = Math.floor(order.reputationReward * 2);
      order.weight = 8;
    } else if (rep >= ReputationLevel.XIAO_YOU_MING && levelThreshold === 1) {
      order.type = OrderType.EXPRESS;
      order.title = '加急订单';
      order.description = `快速送达${destCfg.name}`;
      order.timeLimit = 30;
      order.reward = Math.floor(order.reward * 2);
      order.weight = 3;
    } else {
      order.type = OrderType.NORMAL;
      order.title = '普通订单';
      order.description = `${originCfg.name} → ${destCfg.name}`;
    }

    order.expireAt = Date.now() + 120000 + Math.random() * 60000;
    return order;
  }

  acceptOrder(orderId: string): { success: boolean; error?: string } {
    const order = this.activeOrders.find(o => o.id === orderId);
    if (!order) return { success: false, error: '订单不存在' };

    if (order.isExpired) {
      order.isActive = false;
      return { success: false, error: '订单已过期' };
    }

    const vehicleCfg = VEHICLE_CONFIG[this.playerData.currentVehicle];
    if (order.weight > vehicleCfg.capacity) {
      return { success: false, error: '载具载重不足' };
    }

    let staminaCost = STAMINA_CONFIG.NORMAL_DELIVERY_COST;
    if (order.type === OrderType.EXPRESS) staminaCost = STAMINA_CONFIG.EXPRESS_DELIVERY_COST;
    else if (order.type === OrderType.VALUABLE) staminaCost = STAMINA_CONFIG.VALUABLE_DELIVERY_COST;
    else if (order.type === OrderType.CHAIN) staminaCost = STAMINA_CONFIG.CHAIN_DELIVERY_COST;

    if (this.playerData.stamina < staminaCost) {
      return { success: false, error: '体力不足' };
    }

    this.playerData.stamina -= staminaCost;
    order.acceptedAt = Date.now();
    order.isActive = false;

    const totalObstacles = Math.floor(order.distance / 50) + 5;
    this.currentDelivery = {
      orderId: order.id,
      distanceTraveled: 0,
      totalDistance: order.distance,
      obstaclesDodged: 0,
      totalObstacles,
      isPerfect: true,
      startTime: Date.now(),
      route: Math.random() > 0.5 ? 'main' : 'alley',
    };

    EventBus.emit(GameEvents.ORDER_ACCEPTED, order);
    Logger.info('DeliverySystem', `Accepted order: ${order.id}`);
    return { success: true };
  }

  startDelivery(orderId: string): boolean {
    const order = this.activeOrders.find(o => o.id === orderId);
    if (!order || this.currentDelivery) return false;
    return this.acceptOrder(orderId).success;
  }

  updateDelivery(dt: number): void {
    if (!this.currentDelivery) return;

    const order = this.activeOrders.find(o => o.id === this.currentDelivery!.orderId);
    if (!order) {
      this.currentDelivery = null;
      return;
    }

    if (order.isExpired) {
      this.failDelivery('超时未送达');
      return;
    }

    const weatherCfg = WEATHER_CONFIG[this.playerData.currentWeather];
    const vehicleCfg = VEHICLE_CONFIG[this.playerData.currentVehicle];
    const speed = vehicleCfg.speed * weatherCfg.speedModifier;

    this.currentDelivery.distanceTraveled += speed * dt;

    if (Math.random() < 0.02 * dt) {
      this.currentDelivery.totalObstacles++;
      const dodgeChance = vehicleCfg.stability;
      if (Math.random() > dodgeChance) {
        this.currentDelivery.isPerfect = false;
      } else {
        this.currentDelivery.obstaclesDodged++;
      }
    }

    if (this.currentDelivery.distanceTraveled >= this.currentDelivery.totalDistance) {
      this.completeDelivery();
    }
  }

  completeDelivery(): void {
    if (!this.currentDelivery) return;

    const order = this.activeOrders.find(o => o.id === this.currentDelivery!.orderId);
    if (!order) {
      this.currentDelivery = null;
      return;
    }

    let reward = order.reward;
    let repReward = order.reputationReward;

    if (this.currentDelivery.isPerfect) {
      reward = Math.floor(reward * ECONOMY_CONFIG.PERFECT_DELIVERY_BONUS);
      this.playerData.perfectDeliveries++;
    }

    const weatherCfg = WEATHER_CONFIG[this.playerData.currentWeather];
    if (weatherCfg.staminaModifier > 1) {
      this.playerData.stamina = Math.max(0, this.playerData.stamina - 5);
    }

    this.playerData.coins += reward;
    this.playerData.reputationExp += repReward;
    this.playerData.totalDeliveries++;
    this.playerData.totalCoinsEarned += reward;

    if (this.playerData.dailyRecord.date === new Date().toISOString().split('T')[0]) {
      this.playerData.dailyRecord.deliveryCount++;
      this.playerData.dailyRecord.coinsEarned += reward;
    }

    order.isCompleted = true;

    Logger.info('DeliverySystem', `Completed order, reward: ${reward}, rep: ${repReward}`);
    EventBus.emit(GameEvents.ORDER_COMPLETED, {
      order,
      reward,
      reputationReward: repReward,
      isPerfect: this.currentDelivery.isPerfect,
    });

    EventBus.emit(GameEvents.COINS_CHANGED, this.playerData.coins);
    EventBus.emit(GameEvents.STAMINA_CHANGED, this.playerData.stamina);
    this.currentDelivery = null;
  }

  failDelivery(reason: string): void {
    if (!this.currentDelivery) return;

    const order = this.activeOrders.find(o => o.id === this.currentDelivery!.orderId);
    if (order) {
      this.playerData.failedDeliveries++;
      EventBus.emit(GameEvents.ORDER_FAILED, { order, reason });
      Logger.warn('DeliverySystem', `Failed delivery: ${reason}`);
    }

    this.currentDelivery = null;
  }

  switchRoute(): void {
    if (!this.currentDelivery) return;
    this.currentDelivery.route = this.currentDelivery.route === 'main' ? 'alley' : 'main';
  }

  getCurrentDelivery(): DeliveryProgress | null {
    return this.currentDelivery;
  }

  updateWeather(dt: number): void {
    this.weatherTimer += dt;
    if (this.weatherTimer >= this.weatherDuration) {
      this.weatherTimer = 0;
      this.changeWeather();
    }
  }

  private changeWeather(): void {
    const roll = Math.random();
    let cumulative = 0;
    let newWeather = WeatherType.SUNNY;

    for (const wt of [WeatherType.SUNNY, WeatherType.RAINY, WeatherType.SNOWY]) {
      cumulative += WEATHER_CONFIG[wt].probability;
      if (roll <= cumulative) {
        newWeather = wt;
        break;
      }
    }

    this.playerData.currentWeather = newWeather;
    this.weatherDuration = WEATHER_CONFIG[newWeather].duration;
    EventBus.emit(GameEvents.WEATHER_CHANGED, newWeather);
  }

  getWeatherModifier(): { speed: number; stamina: number } {
    const cfg = WEATHER_CONFIG[this.playerData.currentWeather];
    return { speed: cfg.speedModifier, stamina: cfg.staminaModifier };
  }

  updateOrderPool(dt: number): void {
    this.orderRefreshTimer += dt;

    this.activeOrders = this.activeOrders.filter(o => {
      if (o.isCompleted) return false;
      if (o.isExpired) {
        o.isActive = false;
        return false;
      }
      return true;
    });

    if (this.orderRefreshTimer >= 60) {
      this.orderRefreshTimer = 0;
      this.generateOrders();
    }
  }

  getOrderById(orderId: string): OrderData | undefined {
    return this.activeOrders.find(o => o.id === orderId);
  }

  refreshOrders(force: boolean = false): void {
    if (force) {
      this.activeOrders = [];
    }
    this.generateOrders();
  }
}
