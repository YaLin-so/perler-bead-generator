// localStorage管理工具，防止容量溢出
export class StorageManager {
  private static readonly MAX_SIZE = 5 * 1024 * 1024; // 5MB限制
  private static readonly HISTORY_KEY = 'perler-history';
  private static readonly PRESETS_KEY = 'perler-presets';

  /**
   * 检查存储容量
   */
  static checkStorageSize(): number {
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length;
      }
    }
    return total;
  }

  /**
   * 安全保存数据
   */
  static safeSet(key: string, value: any): boolean {
    try {
      const jsonString = JSON.stringify(value);
      const currentSize = this.checkStorageSize();
      const newItemSize = jsonString.length + key.length;

      // 如果超出限制，清理旧数据
      if (currentSize + newItemSize > this.MAX_SIZE) {
        this.cleanupOldData();
      }

      localStorage.setItem(key, jsonString);
      return true;
    } catch (e) {
      console.error('存储失败:', e);
      // 尝试清理后再次保存
      this.cleanupOldData();
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (e2) {
        console.error('清理后仍然存储失败:', e2);
        return false;
      }
    }
  }

  /**
   * 获取数据
   */
  static safeGet<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.error('读取失败:', e);
      return defaultValue;
    }
  }

  /**
   * 清理旧数据
   */
  static cleanupOldData(): void {
    // 清理历史记录，只保留最近10条
    const history = this.safeGet<any[]>(this.HISTORY_KEY, []);
    if (history.length > 10) {
      const cleaned = history.slice(0, 10);
      localStorage.setItem(this.HISTORY_KEY, JSON.stringify(cleaned));
    }
  }

  /**
   * 压缩缩略图
   */
  static compressThumbnail(dataUrl: string, maxWidth: number = 100): string {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
      img.src = dataUrl;
      const scale = maxWidth / img.width;
      canvas.width = maxWidth;
      canvas.height = img.height * scale;
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL('image/jpeg', 0.5);
    } catch (e) {
      return dataUrl;
    }
  }
}
