import { EmployeePersonality, EmployeeTemplate } from '../utils/Constants';

export class EmployeeData {
  id: string = '';
  templateName: string = '';

  name: string = '';
  personality: EmployeePersonality = EmployeePersonality.HONEST;

  speed: number = 5;
  capacity: number = 5;
  diligence: number = 5;
  salary: number = 200;

  isHired: boolean = false;
  isWorking: boolean = false;
  isOnStrike: boolean = false;

  morale: number = 100;
  fatigue: number = 0;

  hasInsulatedBox: boolean = false;
  hasUniform: boolean = false;

  currentOrderId: string = '';
  deliveriesCompleted: number = 0;
  totalEarned: number = 0;
  tipsCollected: number = 0;

  hireDate: number = 0;
  lastPayDate: number = 0;
  lastCheckIn: number = 0;

  constructor(template: EmployeeTemplate) {
    this.templateName = template.name;
    this.name = template.name;
    this.personality = template.personality;
    this.speed = template.speed;
    this.capacity = template.capacity;
    this.diligence = template.diligence;
    this.salary = template.salary;
    this.id = `emp_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  }

  get efficiency(): number {
    let base = (this.speed * 0.4 + this.capacity * 0.3 + this.diligence * 0.3);
    if (this.hasUniform) base *= 1.15;
    if (this.isOnStrike) base *= 0.3;
    if (this.fatigue > 80) base *= 0.5;
    return base;
  }

  get hourlyOutput(): number {
    return Math.round(this.efficiency * 10);
  }

  canWork(): boolean {
    if (this.isOnStrike) return false;
    if (this.fatigue >= 100) return false;
    if (this.morale < 20) return false;
    return true;
  }

  checkStrike(currentCoins: number): void {
    if (currentCoins < this.salary) {
      this.isOnStrike = true;
      this.morale = Math.max(0, this.morale - 20);
    }
  }

  pay(): void {
    this.isOnStrike = false;
    this.lastPayDate = Date.now();
    this.morale = Math.min(100, this.morale + 10);
  }

  work(hours: number): void {
    this.isWorking = true;
    this.fatigue = Math.min(100, this.fatigue + hours * 5);
    if (this.personality === EmployeePersonality.LAZY) {
      this.fatigue += hours * 3;
    }
    if (Date.now() - this.lastCheckIn > 8 * 3600 * 1000) {
      this.fatigue = Math.min(100, this.fatigue + 15);
    }
    this.lastCheckIn = Date.now();
  }

  rest(): void {
    this.isWorking = false;
    this.fatigue = Math.max(0, this.fatigue - 30);
    this.morale = Math.min(100, this.morale + 5);
  }

  collectTip(): number {
    if (this.personality === EmployeePersonality.SMART) {
      const tip = Math.ceil(Math.random() * this.salary * 0.3);
      this.tipsCollected += tip;
      return tip;
    }
    return 0;
  }

  toJSON(): any {
    return {
      id: this.id,
      templateName: this.templateName,
      name: this.name,
      personality: this.personality,
      speed: this.speed,
      capacity: this.capacity,
      diligence: this.diligence,
      salary: this.salary,
      isHired: this.isHired,
      isWorking: this.isWorking,
      isOnStrike: this.isOnStrike,
      morale: this.morale,
      fatigue: this.fatigue,
      hasInsulatedBox: this.hasInsulatedBox,
      hasUniform: this.hasUniform,
      deliveriesCompleted: this.deliveriesCompleted,
      totalEarned: this.totalEarned,
      hireDate: this.hireDate,
      lastPayDate: this.lastPayDate,
    };
  }

  static fromJSON(json: any): EmployeeData {
    const emp = new EmployeeData({
      name: json.name,
      personality: json.personality,
      speed: json.speed,
      capacity: json.capacity,
      diligence: json.diligence,
      salary: json.salary,
      description: '',
    });
    Object.assign(emp, json);
    return emp;
  }
}
