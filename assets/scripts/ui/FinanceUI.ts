import { _decorator, Component, Node, Label, Button, ScrollView, EditBox, instantiate, Prefab } from 'cc';
import { GameManager, GameState } from '../core/GameManager';
import { FinanceSystem } from '../systems/FinanceSystem';
import { CommodityType, COMMODITY_CONFIG, GameEvents } from '../utils/Constants';
import { EventBus } from '../utils/EventBus';
import { Logger } from '../utils/Logger';

const { ccclass, property } = _decorator;

@ccclass('FinanceUI')
export class FinanceUI extends Component {
  @property(ScrollView) marketListView: ScrollView | null = null;
  @property(Prefab) marketItemPrefab: Prefab | null = null;
  @property(Label) portfolioLabel: Label | null = null;
  @property(Label) profitLabel: Label | null = null;
  @property(Label) eventLabel: Label | null = null;
  @property(Label) trendHintLabel: Label | null = null;
  @property(Button) adHintBtn: Button | null = null;
  @property(Button) backBtn: Button | null = null;
  @property(Button) buyBtn: Button | null = null;
  @property(Button) sellBtn: Button | null = null;
  @property(EditBox) quantityInput: EditBox | null = null;
  @property(Label) selectedInfo: Label | null = null;

  private gameManager: GameManager = GameManager.getInstance();
  private financeSystem: FinanceSystem = new FinanceSystem();
  private selectedType: CommodityType | null = null;

  onLoad(): void {
    this.refreshMarket();
    this.refreshPortfolio();
    this.refreshEvent();
  }

  start(): void {
    this.schedule(this.updateMarket, 1.0);
  }

  private refreshMarket(): void {
    if (!this.marketListView || !this.marketItemPrefab) return;

    const content = this.marketListView.content;
    if (!content) return;
    content.removeAllChildren();

    const markets = this.financeSystem.getAllMarkets();
    for (const market of markets) {
      const item = instantiate(this.marketItemPrefab);
      item.parent = content;

      const nameLabel = item.getChildByName('Name')?.getComponent(Label);
      const priceLabel = item.getChildByName('Price')?.getComponent(Label);
      const changeLabel = item.getChildByName('Change')?.getComponent(Label);

      if (nameLabel) nameLabel.string = market.config.name;
      if (priceLabel) priceLabel.string = `${market.currentPrice} 铜钱`;
      if (changeLabel) {
        const sign = market.dailyChangePercent >= 0 ? '+' : '';
        changeLabel.string = `${sign}${market.dailyChangePercent.toFixed(1)}%`;
        changeLabel.color = market.dailyChangePercent >= 0
          ? new (window as any).cc.Color(255, 80, 80)
          : new (window as any).cc.Color(80, 200, 80);
      }

      item.on('click', () => {
        this.selectCommodity(market.type);
      });
    }
  }

  private selectCommodity(type: CommodityType): void {
    this.selectedType = type;
    const market = this.financeSystem.getMarket(type);
    if (!market || !this.selectedInfo) return;

    const hint = this.financeSystem.getTrendHint(type);
    const hintText = hint === 'unknown' ? '???' : hint === 'up' ? '📈 看涨' : hint === 'down' ? '📉 看跌' : '➡️ 平稳';
    this.selectedInfo.string = `${market.config.name}: ${market.currentPrice}文\n持有: ${market.playerHolding} 均价: ${market.playerAvgCost.toFixed(0)}文\n趋势: ${hintText}`;
  }

  private refreshPortfolio(): void {
    const portfolio = this.financeSystem.getPortfolioValue();
    if (this.portfolioLabel) {
      this.portfolioLabel.string = `持仓总值: ${portfolio.totalValue} 铜钱`;
    }
    if (this.profitLabel) {
      const sign = portfolio.profit >= 0 ? '+' : '';
      this.profitLabel.string = `盈亏: ${sign}${portfolio.profit} 铜钱`;
    }
  }

  private refreshEvent(): void {
    const eventName = this.financeSystem.getActiveEventName();
    const eventDesc = this.financeSystem.getActiveEventDescription();

    if (this.eventLabel) {
      if (eventName) {
        this.eventLabel.string = `📢 ${eventName}: ${eventDesc || ''}`;
      } else {
        this.eventLabel.string = '市场平静';
      }
    }
  }

  private updateMarket(dt: number): void {
    this.financeSystem.tick(dt);

    if (this.selectedType) {
      this.selectCommodity(this.selectedType);
    }
    this.refreshMarket();
    this.refreshPortfolio();
    this.refreshEvent();
  }

  onBuyClick(): void {
    if (!this.selectedType || !this.quantityInput) return;

    const qty = parseInt(this.quantityInput.string) || 1;
    const data = this.gameManager.getPlayerData();
    if (!data) return;

    const result = this.financeSystem.buy(this.selectedType, qty, data.coins);
    if (result.success) {
      data.coins = result.remainingCoins;
      EventBus.emit(GameEvents.COINS_CHANGED, data.coins);
      if (this.selectedInfo) this.selectedInfo.string += `\n✅ 买入 ${qty} 件`;
      Logger.info('FinanceUI', `Bought ${qty} ${this.selectedType}`);
    } else {
      if (this.selectedInfo) this.selectedInfo.string += `\n❌ ${result.error}`;
    }
    this.refreshPortfolio();
  }

  onSellClick(): void {
    if (!this.selectedType || !this.quantityInput) return;

    const qty = parseInt(this.quantityInput.string) || 1;
    const data = this.gameManager.getPlayerData();
    if (!data) return;

    const result = this.financeSystem.sell(this.selectedType, qty);
    if (result.revenue > 0) {
      data.coins += result.revenue;
      EventBus.emit(GameEvents.COINS_CHANGED, data.coins);
      if (this.selectedInfo) this.selectedInfo.string += `\n✅ 卖出 ${result.quantity} 件，收入 ${result.revenue}`;
      Logger.info('FinanceUI', `Sold ${result.quantity} ${this.selectedType} for ${result.revenue}`);
    } else {
      if (this.selectedInfo) this.selectedInfo.string += '\n❌ 没有可卖出的商品';
    }
    this.refreshPortfolio();
  }

  onAdHintClick(): void {
    this.financeSystem.unlockTrendHint();
    if (this.trendHintLabel) {
      this.trendHintLabel.string = '🔮 密报已解锁！查看趋势提示';
    }
    if (this.selectedType) {
      this.selectCommodity(this.selectedType);
    }
  }

  onBackClick(): void {
    this.unschedule(this.updateMarket);
    this.gameManager.setState(GameState.RUNNING);
  }
}
