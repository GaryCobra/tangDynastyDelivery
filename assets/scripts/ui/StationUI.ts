import { _decorator, Component, Node, Label, Button, EditBox, ScrollView, instantiate, Prefab } from 'cc';
import { GameManager, GameState } from '../core/GameManager';
import { StationSystem } from '../systems/StationSystem';
import { EmployeeData } from '../models/EmployeeData';
import { EmployeePersonality, GameEvents } from '../utils/Constants';
import { EventBus } from '../utils/EventBus';
import { Logger } from '../utils/Logger';

const { ccclass, property } = _decorator;

@ccclass('StationUI')
export class StationUI extends Component {
  @property(Label) stationNameLabel: Label | null = null;
  @property(Label) stationLevelLabel: Label | null = null;
  @property(Label) employeeCountLabel: Label | null = null;
  @property(Label) profitLabel: Label | null = null;
  @property(ScrollView) employeeListView: ScrollView | null = null;
  @property(Prefab) employeeItemPrefab: Prefab | null = null;
  @property(ScrollView) hireListView: ScrollView | null = null;
  @property(Prefab) hireItemPrefab: Prefab | null = null;
  @property(Button) backBtn: Button | null = null;
  @property(Button) paySalariesBtn: Button | null = null;
  @property(Button) upgradeBtn: Button | null = null;
  @property(Label) statusLabel: Label | null = null;
  @property(EditBox) stationNameInput: EditBox | null = null;
  @property(Button) establishBtn: Button | null = null;
  @property(Node) stationPanel: Node | null = null;
  @property(Node) establishPanel: Node | null = null;

  private gameManager: GameManager = GameManager.getInstance();
  private stationSystem: StationSystem | null = null;

  onLoad(): void {
    const data = this.gameManager.getPlayerData();
    if (data) {
      this.stationSystem = new StationSystem(data);
    }
    this.refreshUI();
  }

  start(): void {
    this.schedule(this.updateStation, 1.0);
  }

  private refreshUI(): void {
    const data = this.gameManager.getPlayerData();
    if (!data || !this.stationSystem) return;

    const station = this.stationSystem.getStation();

    if (data.hasStation && station) {
      if (this.establishPanel) this.establishPanel.active = false;
      if (this.stationPanel) this.stationPanel.active = true;

      if (this.stationNameLabel) this.stationNameLabel.string = `站点: ${station.name}`;
      if (this.stationLevelLabel) this.stationLevelLabel.string = `等级: ${station.level}`;
      if (this.employeeCountLabel) {
        const hired = this.stationSystem.getEmployees().filter(e => e.isHired).length;
        const slots = station.employeeSlots;
        this.employeeCountLabel.string = `员工: ${hired}/${slots}`;
      }
      if (this.profitLabel) {
        this.profitLabel.string = `营收: +${station.dailyRevenue} / 支出: -${station.dailyExpense}`;
      }

      this.refreshEmployeeList();
      this.refreshHireList();
    } else {
      if (this.establishPanel) this.establishPanel.active = true;
      if (this.stationPanel) this.stationPanel.active = false;
    }
  }

  private refreshEmployeeList(): void {
    if (!this.employeeListView || !this.employeeItemPrefab || !this.stationSystem) return;

    const content = this.employeeListView.content;
    if (!content) return;
    content.removeAllChildren();

    const employees = this.stationSystem.getEmployees().filter(e => e.isHired);
    for (const emp of employees) {
      const item = instantiate(this.employeeItemPrefab);
      item.parent = content;

      const nameLabel = item.getChildByName('Name')?.getComponent(Label);
      const infoLabel = item.getChildByName('Info')?.getComponent(Label);
      const statusLabel = item.getChildByName('Status')?.getComponent(Label);
      const fireBtn = item.getChildByName('FireBtn')?.getComponent(Button);

      if (nameLabel) nameLabel.string = emp.name;
      if (infoLabel) {
        const pType = emp.personality === EmployeePersonality.HONEST ? '老实' : emp.personality === EmployeePersonality.SMART ? '机灵' : '懒散';
        infoLabel.string = `速度:${emp.speed} 负重:${emp.capacity} 勤劳:${emp.diligence} 薪资:${emp.salary}/日 [${pType}]`;
      }
      if (statusLabel) {
        if (emp.isOnStrike) statusLabel.string = '⚠️ 罢工中';
        else if (emp.isWorking) statusLabel.string = '工作中...';
        else statusLabel.string = `疲劳:${emp.fatigue} 士气:${emp.morale}`;
      }
      if (fireBtn) {
        fireBtn.node.on('click', () => {
          this.stationSystem!.fireEmployee(emp.id);
          this.refreshUI();
        });
      }
    }
  }

  private refreshHireList(): void {
    if (!this.hireListView || !this.hireItemPrefab || !this.stationSystem) return;

    const content = this.hireListView.content;
    if (!content) return;
    content.removeAllChildren();

    const templates = this.stationSystem.getAvailableTemplates();
    for (let i = 0; i < templates.length; i++) {
      const t = templates[i];
      const item = instantiate(this.hireItemPrefab);
      item.parent = content;

      const nameLabel = item.getChildByName('Name')?.getComponent(Label);
      const descLabel = item.getChildByName('Desc')?.getComponent(Label);
      const hireBtn = item.getChildByName('HireBtn')?.getComponent(Button);

      if (nameLabel) nameLabel.string = t.name;
      if (descLabel) {
        const pType = t.personality === EmployeePersonality.HONEST ? '老实' : t.personality === EmployeePersonality.SMART ? '机灵' : '懒散';
        descLabel.string = `${t.description} | 薪资:${t.salary}/日 [${pType}]`;
      }
      if (hireBtn) {
        const idx = i;
        hireBtn.node.on('click', () => {
          this.stationSystem!.hireEmployee(idx);
          this.refreshUI();
        });
      }
    }
  }

  private updateStation(dt: number): void {
    if (!this.stationSystem) return;

    this.stationSystem.processEmployeeWork(dt);
    this.stationSystem.checkStrikeConditions();

    this.refreshEmployeeList();
  }

  onEstablishClick(): void {
    if (!this.stationSystem) return;
    const name = this.stationNameInput?.string || '我的站点';
    const data = this.gameManager.getPlayerData();
    if (!data) return;

    const result = this.stationSystem.establishStation(name, data.coins);
    if (result.success) {
      if (this.statusLabel) this.statusLabel.string = '✅ 站点建立成功！';
      Logger.info('StationUI', 'Station established');
    } else {
      if (this.statusLabel) this.statusLabel.string = `❌ ${result.error}`;
    }
    this.refreshUI();
  }

  onPaySalariesClick(): void {
    if (!this.stationSystem) return;
    const result = this.stationSystem.payEmployeeSalaries();
    if (this.statusLabel) {
      if (result.canAfford) {
        this.statusLabel.string = `✅ 已支付薪资 ${result.totalSalary}`;
      } else {
        this.statusLabel.string = `❌ 铜钱不足，需要 ${result.totalSalary}`;
      }
    }
    this.refreshUI();
  }

  onUpgradeClick(): void {
    if (!this.stationSystem) return;
    const data = this.gameManager.getPlayerData();
    if (!data) return;

    const result = this.stationSystem.upgradeStation(data.coins);
    if (this.statusLabel) {
      if (result.success) {
        this.statusLabel.string = `✅ 站点升级到 ${result.newLevel} 级！`;
      } else {
        this.statusLabel.string = `❌ ${result.error}`;
      }
    }
    this.refreshUI();
  }

  onBackClick(): void {
    this.unschedule(this.updateStation);
    this.gameManager.setState(GameState.RUNNING);
  }
}
