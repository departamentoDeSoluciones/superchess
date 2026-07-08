type LogListener = (log: string[]) => void;
class BattleLogger {
  //la class ya es el objeto
  private static instance: BattleLogger;
  private logs: string[] = [];
  private listeners: LogListener[] = [];
  private constructor() { }
  //aqui se accede a la instancia, si no existe se crea, si ya existe se retorna la misma
  static getInstance(): BattleLogger {
    if (!BattleLogger.instance) { BattleLogger.instance = new BattleLogger(); } return BattleLogger.instance;
  }
  log(message: string): void {
    this.logs.push(message);
    this.notifyListeners();
    console.log(` (test) log registrado: ${message}`);
  }
  getLogs(): string[] {
    return this.logs;
  }
  subscribe(listener: LogListener): () => void {
    this.listeners.push(listener);
    listener([...this.logs]);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
  private notifyListeners(): void {
    const currentLogs = [...this.logs];
    this.listeners.forEach(listener => listener(currentLogs));
  }
}
export const logger = BattleLogger.getInstance();
