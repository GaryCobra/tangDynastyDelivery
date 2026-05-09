import { CommodityType, COMMODITY_CONFIG, CommodityConfig } from '../utils/Constants';

export interface PriceRecord {
  time: number;
  price: number;
}

export class CommodityData {
  type: CommodityType;
  config: CommodityConfig;

  currentPrice: number;
  previousPrice: number;
  priceHistory: PriceRecord[] = [];

  dailyChangePercent: number = 0;
  weeklyChangePercent: number = 0;

  playerHolding: number = 0;
  playerAvgCost: number = 0;

  constructor(type: CommodityType) {
    this.type = type;
    this.config = COMMODITY_CONFIG[type];
    this.currentPrice = this.config.basePrice;
    this.previousPrice = this.config.basePrice;
    this.priceHistory.push({ time: Date.now(), price: this.currentPrice });
  }

  updatePrice(eventMultiplier: number = 1.0): void {
    this.previousPrice = this.currentPrice;

    const volatility = this.config.volatility * eventMultiplier;
    const change = (Math.random() - 0.48) * 2 * volatility * this.config.basePrice;
    this.currentPrice = Math.max(1, Math.round(this.currentPrice + change));

    this.priceHistory.push({ time: Date.now(), price: this.currentPrice });
    if (this.priceHistory.length > 168) {
      this.priceHistory = this.priceHistory.slice(-168);
    }

    this.dailyChangePercent = this.previousPrice > 0
      ? ((this.currentPrice - this.previousPrice) / this.previousPrice) * 100
      : 0;

    if (this.priceHistory.length >= 2) {
      const weekAgo = this.priceHistory[0].price;
      this.weeklyChangePercent = weekAgo > 0
        ? ((this.currentPrice - weekAgo) / weekAgo) * 100
        : 0;
    }
  }

  applyEventMultiplier(multiplier: number): void {
    this.currentPrice = Math.max(1, Math.round(this.currentPrice * multiplier));
    this.priceHistory.push({ time: Date.now(), price: this.currentPrice });
  }

  buy(quantity: number): number {
    const cost = this.currentPrice * quantity;
    const totalValue = this.playerHolding * this.playerAvgCost;
    this.playerHolding += quantity;
    this.playerAvgCost = (totalValue + cost) / this.playerHolding;
    return cost;
  }

  sell(quantity: number): number {
    if (quantity > this.playerHolding) quantity = this.playerHolding;
    const revenue = this.currentPrice * quantity;
    this.playerHolding -= quantity;
    if (this.playerHolding <= 0) {
      this.playerAvgCost = 0;
    }
    return revenue;
  }

  get profit(): number {
    return (this.currentPrice - this.playerAvgCost) * this.playerHolding;
  }

  get profitPercent(): number {
    if (this.playerAvgCost <= 0) return 0;
    return ((this.currentPrice - this.playerAvgCost) / this.playerAvgCost) * 100;
  }

  toJSON(): any {
    return {
      type: this.type,
      currentPrice: this.currentPrice,
      priceHistory: this.priceHistory.slice(-30),
      playerHolding: this.playerHolding,
      playerAvgCost: this.playerAvgCost,
    };
  }

  static fromJSON(type: CommodityType, json: any): CommodityData {
    const data = new CommodityData(type);
    data.currentPrice = json.currentPrice || data.currentPrice;
    data.priceHistory = json.priceHistory || [];
    data.playerHolding = json.playerHolding || 0;
    data.playerAvgCost = json.playerAvgCost || 0;
    return data;
  }
}
