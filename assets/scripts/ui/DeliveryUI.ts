import { _decorator, Component, Node, Label, Button, ScrollView, instantiate, Prefab } from 'cc';
import { GameManager, GameState } from '../core/GameManager';
import { PlayerData } from '../models/PlayerData';
import { OrderData } from '../models/OrderData';
import { DeliverySystem } from '../systems/DeliverySystem';
import { VehicleSystem } from '../systems/VehicleSystem';
import {
  OrderType, MapLocation, LOCATION_CONFIG, VEHICLE_CONFIG,
  WeatherType, GameEvents, GameEvents as Events,
} from '../utils/Constants';
import { EventBus } from '../utils/EventBus';
import { Logger } from '../utils/Logger';

const { ccclass, property } = _decorator;

@ccclass('DeliveryUI')
export class DeliveryUI extends Component {
  @property(ScrollView) orderListView: ScrollView | null = null;
  @property(Prefab) orderItemPrefab: Prefab | null = null;
  @property(Label) vehicleLabel: Label | null = null;
  @property(Label) weatherStatusLabel: Label | null = null;
  @property(Label) deliveryStatusLabel: Label | null = null;
  @property(Button) backBtn: Button | null = null;
  @property(Node) deliveryProgressNode: Node | null = null;
  @property(Label) progressLabel: Label | null = null;

  private gameManager: GameManager = GameManager.getInstance();
  private deliverySystem: DeliverySystem | null = null;
  private vehicleSystem: VehicleSystem | null = null;

  onLoad(): void {
    const data = this.gameManager.getPlayerData();
    if (data) {
      this.deliverySystem = new DeliverySystem(data);
      this.vehicleSystem = new VehicleSystem(data);
      this.deliverySystem.generateOrders();
    }
    this.refreshUI();
  }

  start(): void {
    this.schedule(this.updateDelivery, 0.5);
  }

  private refreshUI(): void {
    const data = this.gameManager.getPlayerData();
    if (!data) return;

    if (this.vehicleLabel) {
      const vc = VEHICLE_CONFIG[data.currentVehicle];
      this.vehicleLabel.string = `载具: ${vc.name} (速度${vc.speed}, 载重${vc.capacity}kg)`;
    }

    if (this.weatherStatusLabel) {
      this.weatherStatusLabel.string = `天气: ${data.currentWeather === WeatherType.SUNNY ? '晴天' : data.currentWeather === WeatherType.RAINY ? '雨天' : '雪天'}`;
    }

    this.refreshOrderList();
  }

  private refreshOrderList(): void {
    if (!this.orderListView || !this.deliverySystem || !this.orderItemPrefab) return;

    const content = this.orderListView.content;
    if (!content) return;

    content.removeAllChildren();
    const orders = this.deliverySystem.getActiveOrders();

    for (const order of orders) {
      const item = instantiate(this.orderItemPrefab);
      item.parent = content;

      const orderTypeLabel = item.getChildByName('OrderType')?.getComponent(Label);
      const descLabel = item.getChildByName('Desc')?.getComponent(Label);
      const rewardLabel = item.getChildByName('Reward')?.getComponent(Label);
      const acceptBtn = item.getChildByName('AcceptBtn')?.getComponent(Button);

      if (orderTypeLabel) {
        const typeNames: Record<string, string> = {
          normal: '普通订单', express: '加急', valuable: '贵重', chain: '连环',
        };
        orderTypeLabel.string = typeNames[order.type] || '普通订单';
      }
      if (descLabel) {
        const origin = LOCATION_CONFIG[order.origin as MapLocation]?.name || order.origin;
        const dest = LOCATION_CONFIG[order.destination as MapLocation]?.name || order.destination;
        descLabel.string = `${origin} → ${dest} (${order.distance}m)`;
      }
      if (rewardLabel) {
        rewardLabel.string = `💰${order.reward} 声望+${order.reputationReward}`;
      }
      if (acceptBtn) {
        acceptBtn.node.on('click', () => {
          this.acceptOrder(order.id);
        });
      }
    }
  }

  private acceptOrder(orderId: string): void {
    if (!this.deliverySystem) return;

    const result = this.deliverySystem.acceptOrder(orderId);
    if (result.success) {
      this.deliverySystem.startDelivery(orderId);
      if (this.deliveryStatusLabel) {
        this.deliveryStatusLabel.string = '配送中...';
      }
      if (this.deliveryProgressNode) {
        this.deliveryProgressNode.active = true;
      }
      Logger.info('DeliveryUI', `Started delivery ${orderId}`);
    } else {
      if (this.deliveryStatusLabel) {
        this.deliveryStatusLabel.string = `❌ ${result.error}`;
      }
    }

    this.refreshOrderList();
  }

  private updateDelivery(dt: number): void {
    if (!this.deliverySystem) return;

    this.deliverySystem.updateOrderPool(dt);
    this.deliverySystem.updateWeather(dt);
    this.deliverySystem.updateDelivery(dt);

    const prog = this.deliverySystem.getCurrentDelivery();
    if (prog && this.progressLabel) {
      const pct = Math.min(100, Math.floor((prog.distanceTraveled / prog.totalDistance) * 100));
      this.progressLabel.string = `配送进度: ${pct}%`;
    }

    const current = this.deliverySystem.getCurrentDelivery();
    if (!current && this.deliveryProgressNode) {
      this.deliveryProgressNode.active = false;
      if (this.deliveryStatusLabel) {
        this.deliveryStatusLabel.string = '选择订单开始配送';
      }
    }
  }

  onRefreshClick(): void {
    if (this.deliverySystem) {
      this.deliverySystem.refreshOrders(true);
      this.refreshOrderList();
    }
  }

  onBackClick(): void {
    this.unschedule(this.updateDelivery);
    this.gameManager.setState(GameState.RUNNING);
  }
}
