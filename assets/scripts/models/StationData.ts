export class StationData {
  id: string = '';
  name: string = '';
  level: number = 1;
  employeeSlots: number = 2;

  dailyRevenue: number = 0;
  dailyExpense: number = 0;
  totalRevenue: number = 0;
  totalExpense: number = 0;

  storageCapacity: number = 100;
  currentStorage: number = 0;

  upgradeCost: number = 10000;
  nextLevelExpRequired: number = 5000;
  currentExp: number = 0;

  constructor(name: string) {
    this.id = `station_${Date.now()}`;
    this.name = name;
    this.updateLevelConfig();
  }

  private updateLevelConfig(): void {
    this.employeeSlots = 1 + this.level;
    this.storageCapacity = 100 * this.level;
    this.upgradeCost = 10000 * Math.pow(2, this.level - 1);
    this.nextLevelExpRequired = 5000 * this.level;
  }

  get profit(): number {
    return this.dailyRevenue - this.dailyExpense;
  }

  get isProfitable(): boolean {
    return this.dailyRevenue > this.dailyExpense;
  }

  addExp(amount: number): void {
    this.currentExp += amount;
  }

  canUpgrade(): boolean {
    return this.currentExp >= this.nextLevelExpRequired;
  }

  upgrade(): void {
    if (!this.canUpgrade()) return;
    this.currentExp -= this.nextLevelExpRequired;
    this.level++;
    this.updateLevelConfig();
  }

  recordRevenue(amount: number): void {
    this.dailyRevenue += amount;
    this.totalRevenue += amount;
    this.addExp(amount);
  }

  recordExpense(amount: number): void {
    this.dailyExpense += amount;
    this.totalExpense += amount;
  }

  resetDaily(): void {
    this.dailyRevenue = 0;
    this.dailyExpense = 0;
  }

  toJSON(): any {
    return {
      id: this.id,
      name: this.name,
      level: this.level,
      employeeSlots: this.employeeSlots,
      dailyRevenue: this.dailyRevenue,
      dailyExpense: this.dailyExpense,
      totalRevenue: this.totalRevenue,
      totalExpense: this.totalExpense,
      storageCapacity: this.storageCapacity,
      currentStorage: this.currentStorage,
      upgradeCost: this.upgradeCost,
      currentExp: this.currentExp,
    };
  }

  static fromJSON(json: any): StationData {
    const station = new StationData(json.name || '');
    Object.assign(station, json);
    return station;
  }
}
