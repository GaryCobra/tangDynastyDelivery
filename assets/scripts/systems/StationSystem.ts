import { StationData } from '../models/StationData';
import { EmployeeData } from '../models/EmployeeData';
import { OrderData } from '../models/OrderData';
import { PlayerData } from '../models/PlayerData';
import {
  EMPLOYEE_TEMPLATES, EmployeeTemplate, EmployeePersonality,
  ECONOMY_CONFIG, ReputationLevel, GameEvents, AD_CONFIG,
} from '../utils/Constants';
import { EventBus } from '../utils/EventBus';
import { Logger } from '../utils/Logger';

export class StationSystem {
  private playerData: PlayerData;
  private station: StationData | null = null;
  private employees: Map<string, EmployeeData> = new Map();
  private workTimer: number = 0;

  constructor(playerData: PlayerData) {
    this.playerData = playerData;
  }

  getStation(): StationData | null {
    return this.station;
  }

  getEmployees(): EmployeeData[] {
    return Array.from(this.employees.values());
  }

  getAvailableTemplates(): EmployeeTemplate[] {
    return EMPLOYEE_TEMPLATES;
  }

  establishStation(name: string, playerCoins: number): { success: boolean; station?: StationData; error?: string } {
    if (this.playerData.hasStation) {
      return { success: false, error: '已有站点' };
    }
    if (this.playerData.reputationLevel < ReputationLevel.XIAO_YOU_MING) {
      return { success: false, error: '声望不足，需要小有名气' };
    }
    if (playerCoins < ECONOMY_CONFIG.STATION_SETUP_COST) {
      return { success: false, error: `铜钱不足，需要${ECONOMY_CONFIG.STATION_SETUP_COST}` };
    }

    this.station = new StationData(name);
    this.playerData.hasStation = true;
    this.playerData.stationName = name;
    this.playerData.stationLevel = 1;
    this.playerData.coins -= ECONOMY_CONFIG.STATION_SETUP_COST;

    Logger.info('StationSystem', `Station established: ${name}`);
    EventBus.emit(GameEvents.COINS_CHANGED, this.playerData.coins);
    return { success: true, station: this.station };
  }

  upgradeStation(playerCoins: number): { success: boolean; cost: number; newLevel: number; error?: string } {
    if (!this.station) {
      return { success: false, cost: 0, newLevel: 0, error: '没有站点' };
    }
    if (!this.station.canUpgrade()) {
      return { success: false, cost: this.station.upgradeCost, newLevel: this.station.level, error: '经验不足' };
    }
    if (playerCoins < this.station.upgradeCost) {
      return { success: false, cost: this.station.upgradeCost, newLevel: this.station.level, error: '铜钱不足' };
    }

    this.playerData.coins -= this.station.upgradeCost;
    this.station.upgrade();
    this.playerData.stationLevel = this.station.level;

    Logger.info('StationSystem', `Station upgraded to level ${this.station.level}`);
    EventBus.emit(GameEvents.COINS_CHANGED, this.playerData.coins);
    return { success: true, cost: this.station.upgradeCost, newLevel: this.station.level, error: undefined };
  }

  hireEmployee(templateIndex: number): EmployeeData | null {
    if (!this.station) return null;
    if (this.employees.size >= this.station.employeeSlots) {
      Logger.warn('StationSystem', 'No free employee slots');
      return null;
    }

    const template = EMPLOYEE_TEMPLATES[templateIndex];
    if (!template) return null;

    if (this.playerData.coins < template.salary) {
      Logger.warn('StationSystem', 'Cannot afford salary');
      return null;
    }

    const employee = new EmployeeData(template);
    employee.isHired = true;
    employee.hireDate = Date.now();
    employee.lastPayDate = Date.now();
    employee.lastCheckIn = Date.now();

    this.employees.set(employee.id, employee);
    this.playerData.employeeIds.push(employee.id);

    Logger.info('StationSystem', `Hired employee: ${employee.name}`);
    EventBus.emit(GameEvents.EMPLOYEE_HIRED, employee);
    return employee;
  }

  fireEmployee(employeeId: string): void {
    const emp = this.employees.get(employeeId);
    if (!emp) return;

    this.employees.delete(employeeId);
    this.playerData.employeeIds = this.playerData.employeeIds.filter(id => id !== employeeId);

    Logger.info('StationSystem', `Fired employee: ${emp.name}`);
    EventBus.emit(GameEvents.EMPLOYEE_FIRED, emp);
  }

  assignOrder(employeeId: string, order: OrderData): void {
    const emp = this.employees.get(employeeId);
    if (!emp || !this.station) return;

    emp.currentOrderId = order.id;
    emp.isWorking = true;
    emp.work(1);
  }

  processEmployeeWork(dt: number): void {
    if (!this.station) return;
    this.workTimer += dt;

    if (this.workTimer >= 10) {
      this.workTimer = 0;

      for (const emp of this.employees.values()) {
        if (!emp.isHired) continue;

        emp.fatigue = Math.min(100, emp.fatigue + 2);

        if (emp.fatigue > 80) {
          emp.rest();
          continue;
        }

        if (emp.personality === EmployeePersonality.LAZY && Math.random() < 0.3) {
          emp.fatigue = Math.min(100, emp.fatigue + 5);
          continue;
        }

        if (emp.isWorking) {
          const earned = emp.hourlyOutput * 0.1;
          this.station.recordRevenue(earned);

          const tip = emp.collectTip();
          if (tip > 0) {
            this.playerData.coins += tip;
            Logger.debug('StationSystem', `${emp.name} got tip: ${tip}`);
          }
        }
      }
    }
  }

  getStationIncome(dt: number): number {
    if (!this.station) return 0;
    let totalIncome = 0;

    for (const emp of this.employees.values()) {
      if (!emp.isHired || emp.isOnStrike) continue;
      totalIncome += emp.hourlyOutput * 0.1;
    }

    return totalIncome;
  }

  payEmployeeSalaries(): { totalSalary: number; canAfford: boolean } {
    let totalSalary = 0;
    for (const emp of this.employees.values()) {
      if (emp.isHired) totalSalary += emp.salary;
    }

    const canAfford = this.playerData.coins >= totalSalary;
    if (canAfford) {
      for (const emp of this.employees.values()) {
        if (emp.isHired) {
          this.playerData.coins -= emp.salary;
          emp.pay();
          emp.deliveriesCompleted++;
        }
      }
      if (this.station) {
        this.station.recordExpense(totalSalary);
      }
      Logger.info('StationSystem', `Paid salaries: ${totalSalary}`);
      EventBus.emit(GameEvents.COINS_CHANGED, this.playerData.coins);
    } else {
      for (const emp of this.employees.values()) {
        emp.checkStrike(this.playerData.coins);
      }
      Logger.warn('StationSystem', `Cannot afford salaries: need ${totalSalary}, have ${this.playerData.coins}`);
    }

    return { totalSalary, canAfford };
  }

  checkStrikeConditions(): string[] {
    const striking: string[] = [];
    for (const emp of this.employees.values()) {
      if (emp.isOnStrike) {
        striking.push(emp.name);
      }
    }
    return striking;
  }

  payEmployee(employeeId: string): boolean {
    const emp = this.employees.get(employeeId);
    if (!emp) return false;

    if (this.playerData.coins < emp.salary) return false;

    this.playerData.coins -= emp.salary;
    emp.pay();
    emp.totalEarned += emp.salary;
    EventBus.emit(GameEvents.COINS_CHANGED, this.playerData.coins);
    return true;
  }

  purchaseInsulatedBox(employeeId: string, playerCoins: number): boolean {
    const cost = 1000;
    if (playerCoins < cost) return false;
    const emp = this.employees.get(employeeId);
    if (!emp || emp.hasInsulatedBox) return false;

    this.playerData.coins -= cost;
    emp.hasInsulatedBox = true;
    return true;
  }

  purchaseUniform(employeeId: string, playerCoins: number): boolean {
    const cost = 1500;
    if (playerCoins < cost) return false;
    const emp = this.employees.get(employeeId);
    if (!emp || emp.hasUniform) return false;

    this.playerData.coins -= cost;
    emp.hasUniform = true;
    return true;
  }

  calculateOfflineIncome(hoursAway: number): { coins: number; exp: number; events: string[] } {
    if (!this.station) return { coins: 0, exp: 0, events: [] };

    const maxHours = AD_CONFIG.OFFLINE_MAX_HOURS;
    const effectiveHours = Math.min(hoursAway, maxHours);
    const employeeCount = this.employees.size;
    let totalEfficiency = 0;

    for (const emp of this.employees.values()) {
      if (emp.isHired) totalEfficiency += emp.hourlyOutput;
    }

    const coins = Math.floor(this.station.level * Math.max(1, employeeCount) * totalEfficiency * effectiveHours * 0.5);
    const exp = Math.floor(effectiveHours * 10);

    const events: string[] = [];
    if (Math.random() > 0.5) {
      events.push(`阿福发现了额外订单，获得 ${Math.floor(coins * 0.1)} 铜钱`);
    }
    if (Math.random() > 0.7) {
      events.push('有顾客留下小费，士气提升');
    }

    return { coins, exp, events };
  }

  loadState(stationJson: any, employeeJsonList: any[]): void {
    if (stationJson) {
      this.station = StationData.fromJSON(stationJson);
    }
    if (employeeJsonList) {
      for (const empJson of employeeJsonList) {
        const emp = EmployeeData.fromJSON(empJson);
        this.employees.set(emp.id, emp);
      }
    }
  }

  toJSON(): { station: any; employees: any[] } {
    return {
      station: this.station ? this.station.toJSON() : null,
      employees: Array.from(this.employees.values()).map(e => e.toJSON()),
    };
  }
}
