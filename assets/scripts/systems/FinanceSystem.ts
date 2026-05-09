import { CommodityData, PriceRecord } from '../models/CommodityData';
import {
  CommodityType, COMMODITY_CONFIG, RANDOM_EVENTS,
  RandomEventConfig, GameEvents, AD_CONFIG,
} from '../utils/Constants';
import { EventBus } from '../utils/EventBus';
import { Logger } from '../utils/Logger';

export class FinanceSystem {
  private markets: Map<CommodityType, CommodityData> = new Map();
  private activeEvent: { config: RandomEventConfig; endTime: number } | null = null;
  private hasTrendHint: boolean = false;
  private updateTimer: number = 0;

  constructor() {
    this.initializeMarkets();
  }

  private initializeMarkets(): void {
    for (const type of Object.values(CommodityType)) {
      this.markets.set(type, new CommodityData(type));
    }
  }

  getMarket(type: CommodityType): CommodityData | undefined {
    return this.markets.get(type);
  }

  getAllMarkets(): CommodityData[] {
    return Array.from(this.markets.values());
  }

  updateMarket(): void {
    let eventMultiplier = 1.0;

    if (this.activeEvent) {
      if (Date.now() >= this.activeEvent.endTime) {
        this.activeEvent = null;
        Logger.info('FinanceSystem', 'Random event expired');
      } else {
        const eventPriceEffect = this.activeEvent.config.effect;
        const avgEffect = Object.values(eventPriceEffect).reduce((a, b) => a + b, 0) / Object.values(eventPriceEffect).length;
        eventMultiplier = avgEffect;
      }
    }

    for (const commodity of this.markets.values()) {
      commodity.updatePrice(eventMultiplier);

      if (this.activeEvent) {
        const type = commodity.type;
        const effect = this.activeEvent.config.effect[type];
        if (effect !== 1.0) {
          commodity.applyEventMultiplier(effect);
        }
      }
    }

    EventBus.emit(GameEvents.COMMODITY_PRICE_CHANGED, this.getAllMarketSnapshots());
  }

  private getAllMarketSnapshots(): any[] {
    return this.getAllMarkets().map(m => ({
      type: m.type,
      name: m.config.name,
      price: m.currentPrice,
      change: m.dailyChangePercent,
    }));
  }

  triggerRandomEvent(): void {
    if (this.activeEvent) return;

    const roll = Math.random();
    let cumulative = 0;

    for (const event of RANDOM_EVENTS) {
      cumulative += event.probability;
      if (roll <= cumulative) {
        this.activeEvent = {
          config: event,
          endTime: Date.now() + event.duration * 1000,
        };
        Logger.info('FinanceSystem', `Event triggered: ${event.name}`);

        for (const commodity of this.markets.values()) {
          const multiplier = event.effect[commodity.type];
          if (multiplier !== 1.0) {
            commodity.applyEventMultiplier(multiplier);
          }
        }

        EventBus.emit(GameEvents.RANDOM_EVENT, {
          name: event.name,
          description: event.description,
          duration: event.duration,
        });
        break;
      }
    }
  }

  getActiveEventName(): string | null {
    if (this.activeEvent && Date.now() < this.activeEvent.endTime) {
      return this.activeEvent.config.name;
    }
    return null;
  }

  getActiveEventDescription(): string | null {
    if (this.activeEvent && Date.now() < this.activeEvent.endTime) {
      return this.activeEvent.config.description;
    }
    return null;
  }

  buy(type: CommodityType, quantity: number, playerCoins: number): {
    success: boolean; cost: number; remainingCoins: number; error?: string;
  } {
    const commodity = this.markets.get(type);
    if (!commodity) return { success: false, cost: 0, remainingCoins: playerCoins, error: '商品不存在' };
    if (quantity <= 0) return { success: false, cost: 0, remainingCoins: playerCoins, error: '数量无效' };

    const cost = commodity.currentPrice * quantity;
    if (cost > playerCoins) {
      return { success: false, cost: 0, remainingCoins: playerCoins, error: '铜钱不足' };
    }

    commodity.buy(quantity);
    const remaining = playerCoins - cost;

    Logger.info('FinanceSystem', `Bought ${quantity} ${type} for ${cost}`);
    return { success: true, cost, remainingCoins: remaining };
  }

  sell(type: CommodityType, quantity: number): { revenue: number; quantity: number } {
    const commodity = this.markets.get(type);
    if (!commodity) return { revenue: 0, quantity: 0 };

    const sellQty = Math.min(quantity, commodity.playerHolding);
    const revenue = commodity.sell(sellQty);

    if (sellQty > 0) {
      Logger.info('FinanceSystem', `Sold ${sellQty} ${type} for ${revenue}`);
    }

    return { revenue, quantity: sellQty };
  }

  getPortfolioValue(): {
    totalValue: number; profit: number;
    items: Array<{ type: string; name: string; holding: number; value: number; profit: number }>;
  } {
    let totalValue = 0;
    let totalProfit = 0;
    const items: Array<{ type: string; name: string; holding: number; value: number; profit: number }> = [];

    for (const commodity of this.markets.values()) {
      if (commodity.playerHolding <= 0) continue;
      const value = commodity.currentPrice * commodity.playerHolding;
      const profit = commodity.profit;
      totalValue += value;
      totalProfit += profit;
      items.push({
        type: commodity.type,
        name: commodity.config.name,
        holding: commodity.playerHolding,
        value,
        profit,
      });
    }

    return { totalValue, profit: totalProfit, items };
  }

  calculateProfit(type: CommodityType): { profit: number; profitPercent: number } {
    const commodity = this.markets.get(type);
    if (!commodity) return { profit: 0, profitPercent: 0 };
    return { profit: commodity.profit, profitPercent: commodity.profitPercent };
  }

  unlockTrendHint(): void {
    this.hasTrendHint = true;
  }

  getTrendHint(type: CommodityType): 'up' | 'down' | 'stable' | 'unknown' {
    if (!this.hasTrendHint) return 'unknown';

    const commodity = this.markets.get(type);
    if (!commodity || commodity.priceHistory.length < 3) return 'stable';

    const recent = commodity.priceHistory.slice(-3);
    const up = recent[2].price > recent[1].price && recent[1].price > recent[0].price;
    const down = recent[2].price < recent[1].price && recent[1].price < recent[0].price;

    return up ? 'up' : down ? 'down' : 'stable';
  }

  getTrendHintStatus(): boolean {
    return this.hasTrendHint;
  }

  resetTrendHint(): void {
    this.hasTrendHint = false;
  }

  getKLineData(type: CommodityType, count: number): PriceRecord[] {
    const commodity = this.markets.get(type);
    if (!commodity) return [];
    return commodity.priceHistory.slice(-count);
  }

  getMarketSummary(): Array<{
    type: CommodityType; name: string; price: number; change: number; volume: number;
  }> {
    return this.getAllMarkets().map(m => ({
      type: m.type,
      name: m.config.name,
      price: m.currentPrice,
      change: m.dailyChangePercent,
      volume: m.playerHolding,
    }));
  }

  tick(dt: number): void {
    this.updateTimer += dt;
    if (this.updateTimer >= 60) {
      this.updateTimer = 0;
      this.updateMarket();

      if (Math.random() < 0.1) {
        this.triggerRandomEvent();
      }
    }
  }

  toJSON(): any {
    const markets: any = {};
    for (const [type, data] of this.markets.entries()) {
      markets[type] = data.toJSON();
    }
    return {
      markets,
      hasTrendHint: this.hasTrendHint,
      activeEvent: this.activeEvent ? {
        name: this.activeEvent.config.name,
        endTime: this.activeEvent.endTime,
      } : null,
    };
  }

  fromJSON(json: any): void {
    if (!json) return;
    if (json.markets) {
      for (const type of Object.values(CommodityType)) {
        if (json.markets[type]) {
          this.markets.set(type as CommodityType, CommodityData.fromJSON(type as CommodityType, json.markets[type]));
        }
      }
    }
    if (json.hasTrendHint !== undefined) this.hasTrendHint = json.hasTrendHint;
  }
}
