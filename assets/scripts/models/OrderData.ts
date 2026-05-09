import { OrderType, MapLocation } from '../utils/Constants';

export interface OrderChain {
  id: string;
  steps: MapLocation[];
  currentStep: number;
  rewards: number[];
  bonusReputation: number;
}

export class OrderData {
  id: string = '';
  type: OrderType = OrderType.NORMAL;
  title: string = '';
  description: string = '';

  origin: MapLocation = MapLocation.RICE_SHOP;
  destination: MapLocation = MapLocation.TAVERN;
  distance: number = 100;

  reward: number = 10;
  reputationReward: number = 5;
  timeLimit: number = 0;
  weight: number = 5;

  isChainOrder: boolean = false;
  chainData: OrderChain | null = null;

  expireAt: number = 0;
  acceptedAt: number = 0;

  isActive: boolean = true;
  isCompleted: boolean = false;

  static generateId(): string {
    return `order_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  }

  get isExpired(): boolean {
    if (this.timeLimit <= 0) return false;
    if (!this.acceptedAt) return false;
    return Date.now() - this.acceptedAt > this.timeLimit * 1000;
  }

  get remainingTime(): number {
    if (this.timeLimit <= 0) return Infinity;
    if (!this.acceptedAt) return this.timeLimit;
    const elapsed = (Date.now() - this.acceptedAt) / 1000;
    return Math.max(0, this.timeLimit - elapsed);
  }

  toJSON(): any {
    return {
      id: this.id,
      type: this.type,
      title: this.title,
      description: this.description,
      origin: this.origin,
      destination: this.destination,
      distance: this.distance,
      reward: this.reward,
      reputationReward: this.reputationReward,
      timeLimit: this.timeLimit,
      weight: this.weight,
      expireAt: this.expireAt,
    };
  }
}
