import { ConversionResult } from './imageConverter';
import { BeadColor, getColorPalette } from './colorPalette';

/**
 * 导出PNG格式图纸
 */
export function exportToPNG(
  canvas: HTMLCanvasElement,
  filename: string = 'perler-bead-pattern.png'
): void {
  canvas.toBlob((blob) => {
    if (blob) {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    }
  });
}

/**
 * 导出PDF格式图纸
 */
export function exportToPDF(
  result: ConversionResult,
  options: {
    showGrid: boolean;
    showColorCode: boolean;
    beadSize: number;
    title?: string;
  }
): void {
  const { pixels, width, height, colorUsage } = result;
  const { showGrid, showColorCode, beadSize, title = '拼豆图纸' } = options;

  // 创建临时Canvas
  const canvas = document.createElement('canvas');
  const padding = 40;
  const headerHeight = 60;
  const footerHeight = 200;
  
  canvas.width = width * beadSize + padding * 2;
  canvas.height = height * beadSize + padding * 2 + headerHeight + footerHeight;
  
  const ctx = canvas.getContext('2d')!;

  // 白色背景
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 绘制标题
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(title, canvas.width / 2, 35);

  // 绘制图纸信息
  ctx.font = '14px Arial';
  ctx.textAlign = 'left';
  ctx.fillText(`尺寸: ${width} x ${height} 颗`, padding, 55);
  ctx.textAlign = 'right';
  ctx.fillText(`总计: ${width * height} 颗拼豆`, canvas.width - padding, 55);

  // 绘制拼豆图
  const offsetY = headerHeight + padding;
  pixels.forEach((row, y) => {
    row.forEach((pixel, x) => {
      const px = padding + x * beadSize;
      const py = offsetY + y * beadSize;

      // 绘制拼豆颜色
      ctx.fillStyle = pixel.color.hex;
      ctx.fillRect(px, py, beadSize, beadSize);

      // 绘制网格
      if (showGrid) {
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.lineWidth = 1;
        ctx.strokeRect(px, py, beadSize, beadSize);
      }

      // 绘制色号
      if (showColorCode && beadSize >= 20) {
        ctx.fillStyle = getContrastColor(pixel.color.hex);
        ctx.font = `${Math.floor(beadSize / 3)}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
          pixel.color.id.replace('P', ''),
          px + beadSize / 2,
          py + beadSize / 2
        );
      }
    });
  });

  // 绘制物料清单
  const materialY = offsetY + height * beadSize + padding + 20;
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'left';
  ctx.fillText('物料清单 (Material List)', padding, materialY);

  // 按用量排序
  const sortedColors = Array.from(colorUsage.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20); // 最多显示20种颜色

  ctx.font = '12px monospace';
  let listY = materialY + 25;
  const columnWidth = (canvas.width - padding * 2) / 4;

  sortedColors.forEach((entry, index) => {
    const [colorId, count] = entry;
    const palette = getColorPalette(72);
    const color = palette.find(c => c.id === colorId);
    
    if (color) {
      const column = index % 4;
      const row = Math.floor(index / 4);
      const x = padding + column * columnWidth;
      const y = listY + row * 25;

      // 颜色方块
      ctx.fillStyle = color.hex;
      ctx.fillRect(x, y - 10, 15, 15);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y - 10, 15, 15);

      // 色号和用量
      ctx.fillStyle = '#000000';
      ctx.textAlign = 'left';
      ctx.fillText(`${color.id}: ${count}颗`, x + 20, y);
    }
  });

  // 导出为PNG（浏览器不支持直接生成PDF，使用PNG代替）
  canvas.toBlob((blob) => {
    if (blob) {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'perler-bead-pattern.png';
      link.click();
      URL.revokeObjectURL(url);
    }
  });
}

/**
 * 导出物料清单（CSV格式）
 */
export function exportMaterialList(
  result: ConversionResult,
  filename: string = 'material-list.csv'
): void {
  const { colorUsage } = result;
  const palette = getColorPalette(72);

  // CSV头部
  let csv = '色号,颜色名称,十六进制,用量(颗)\n';

  // 按用量排序
  const sortedColors = Array.from(colorUsage.entries())
    .sort((a, b) => b[1] - a[1]);

  sortedColors.forEach(([colorId, count]) => {
    const color = palette.find(c => c.id === colorId);
    if (color) {
      csv += `${color.id},${color.name},${color.hex},${count}\n`;
    }
  });

  // 添加总计
  const total = Array.from(colorUsage.values()).reduce((sum, count) => sum + count, 0);
  csv += `\n总计,,,${total}\n`;

  // 下载CSV
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * 导出分色图层（每种颜色单独一张图）
 */
export function exportColorLayers(
  result: ConversionResult,
  beadSize: number
): void {
  const { pixels, width, height, colorUsage } = result;
  const palette = getColorPalette(72);

  colorUsage.forEach((count, colorId) => {
    const color = palette.find(c => c.id === colorId);
    if (!color) return;

    // 创建Canvas
    const canvas = document.createElement('canvas');
    canvas.width = width * beadSize;
    canvas.height = height * beadSize;
    const ctx = canvas.getContext('2d')!;

    // 白色背景
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 只绘制当前颜色
    pixels.forEach((row, y) => {
      row.forEach((pixel, x) => {
        if (pixel.color.id === colorId) {
          ctx.fillStyle = pixel.color.hex;
          ctx.fillRect(x * beadSize, y * beadSize, beadSize, beadSize);
          
          // 绘制网格
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
          ctx.lineWidth = 1;
          ctx.strokeRect(x * beadSize, y * beadSize, beadSize, beadSize);
        }
      });
    });

    // 导出
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `layer-${color.id}-${color.name}.png`;
        link.click();
        URL.revokeObjectURL(url);
      }
    });
  });
}

/**
 * 获取对比色
 */
function getContrastColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? '#000000' : '#FFFFFF';
}

/**
 * 保存预设到localStorage
 */
export interface UserPreset {
  name: string;
  beadSize: number;
  colorCount: 24 | 48 | 72;
  canvasWidth: number;
  canvasHeight: number;
  removeIsolated: boolean;
  smoothColors: boolean;
  showGrid: boolean;
  showColorCode: boolean;
}

export function savePreset(preset: UserPreset): void {
  const presets = loadPresets();
  const index = presets.findIndex(p => p.name === preset.name);
  
  if (index >= 0) {
    presets[index] = preset;
  } else {
    presets.push(preset);
  }
  
  localStorage.setItem('perler-presets', JSON.stringify(presets));
}

export function loadPresets(): UserPreset[] {
  const data = localStorage.getItem('perler-presets');
  return data ? JSON.parse(data) : [];
}

export function deletePreset(name: string): void {
  const presets = loadPresets().filter(p => p.name !== name);
  localStorage.setItem('perler-presets', JSON.stringify(presets));
}

/**
 * 保存历史记录
 */
export interface HistoryItem {
  id: string;
  timestamp: number;
  thumbnail: string; // base64
  width: number;
  height: number;
  colorCount: number;
}

export function saveHistory(item: HistoryItem): void {
  const history = loadHistory();
  history.unshift(item);
  
  // 最多保存20条历史
  if (history.length > 20) {
    history.pop();
  }
  
  localStorage.setItem('perler-history', JSON.stringify(history));
}

export function loadHistory(): HistoryItem[] {
  const data = localStorage.getItem('perler-history');
  return data ? JSON.parse(data) : [];
}

export function clearHistory(): void {
  localStorage.removeItem('perler-history');
}
