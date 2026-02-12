import { BeadColor, findClosestBeadColor, getColorPalette } from './colorPalette';

export interface ConversionOptions {
  beadSize: number; // 拼豆尺寸（mm）
  colorCount: 24 | 48 | 72; // 色卡颜色数量
  canvasWidth: number; // 画布宽度（拼豆颗粒数）
  canvasHeight: number; // 画布高度（拼豆颗粒数）
  removeIsolated: boolean; // 移除孤立像素
  smoothColors: boolean; // 平滑色块
}

export interface BeadPixel {
  x: number;
  y: number;
  color: BeadColor;
}

export interface ConversionResult {
  pixels: BeadPixel[][];
  width: number;
  height: number;
  colorUsage: Map<string, number>; // 色号 -> 使用数量
}

/**
 * 图片转拼豆图核心算法
 */
export class ImageConverter {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true })!;
  }

  /**
   * 转换图片为拼豆图
   */
  async convertImage(
    imageFile: File,
    options: ConversionOptions
  ): Promise<ConversionResult> {
    // 1. 加载图片
    const img = await this.loadImage(imageFile);

    // 2. 调整图片尺寸到目标画布大小
    this.resizeImage(img, options.canvasWidth, options.canvasHeight);

    // 3. 获取图片像素数据
    const imageData = this.ctx.getImageData(0, 0, options.canvasWidth, options.canvasHeight);

    // 4. 转换为拼豆颜色
    const palette = getColorPalette(options.colorCount);
    const pixels = this.convertToBeadColors(imageData, palette, options);

    // 5. 后处理优化
    if (options.removeIsolated) {
      this.removeIsolatedPixels(pixels);
    }
    if (options.smoothColors) {
      this.smoothColorBlocks(pixels);
    }

    // 6. 统计颜色用量
    const colorUsage = this.calculateColorUsage(pixels);

    return {
      pixels,
      width: options.canvasWidth,
      height: options.canvasHeight,
      colorUsage,
    };
  }

  /**
   * 加载图片文件
   */
  private loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * 调整图片尺寸
   */
  private resizeImage(img: HTMLImageElement, targetWidth: number, targetHeight: number): void {
    this.canvas.width = targetWidth;
    this.canvas.height = targetHeight;

    // 使用高质量缩放
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';

    // 计算缩放比例，保持宽高比
    const scale = Math.min(targetWidth / img.width, targetHeight / img.height);
    const scaledWidth = img.width * scale;
    const scaledHeight = img.height * scale;

    // 居中绘制
    const x = (targetWidth - scaledWidth) / 2;
    const y = (targetHeight - scaledHeight) / 2;

    // 清空画布
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.fillRect(0, 0, targetWidth, targetHeight);

    // 绘制图片
    this.ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
  }

  /**
   * 转换像素为拼豆颜色
   */
  private convertToBeadColors(
    imageData: ImageData,
    palette: BeadColor[],
    options: ConversionOptions
  ): BeadPixel[][] {
    const { width, height } = imageData;
    const pixels: BeadPixel[][] = [];

    for (let y = 0; y < height; y++) {
      const row: BeadPixel[] = [];
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        const r = imageData.data[index];
        const g = imageData.data[index + 1];
        const b = imageData.data[index + 2];
        const a = imageData.data[index + 3];

        // 处理透明像素
        if (a < 128) {
          // 透明像素使用白色
          const whiteColor = palette.find(c => c.id === 'P01') || palette[0];
          row.push({ x, y, color: whiteColor });
        } else {
          // 找到最接近的拼豆颜色
          const closestColor = findClosestBeadColor([r, g, b], palette);
          row.push({ x, y, color: closestColor });
        }
      }
      pixels.push(row);
    }

    return pixels;
  }

  /**
   * 移除孤立像素（降噪）
   */
  private removeIsolatedPixels(pixels: BeadPixel[][]): void {
    const height = pixels.length;
    const width = pixels[0].length;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const currentColor = pixels[y][x].color.id;
        
        // 检查周围8个像素
        const neighbors: string[] = [];
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            const ny = y + dy;
            const nx = x + dx;
            if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
              neighbors.push(pixels[ny][nx].color.id);
            }
          }
        }

        // 如果周围没有相同颜色，替换为最常见的邻居颜色
        const sameColorCount = neighbors.filter(c => c === currentColor).length;
        if (sameColorCount === 0 && neighbors.length > 0) {
          const colorCounts = new Map<string, number>();
          neighbors.forEach(c => {
            colorCounts.set(c, (colorCounts.get(c) || 0) + 1);
          });
          
          let maxCount = 0;
          let mostCommonColorId = currentColor;
          colorCounts.forEach((count, colorId) => {
            if (count > maxCount) {
              maxCount = count;
              mostCommonColorId = colorId;
            }
          });

          // 从调色板中找到对应颜色
          const palette = getColorPalette(72); // 使用完整色卡查找
          const newColor = palette.find(c => c.id === mostCommonColorId);
          if (newColor) {
            pixels[y][x].color = newColor;
          }
        }
      }
    }
  }

  /**
   * 平滑色块（减少颜色碎片）
   */
  private smoothColorBlocks(pixels: BeadPixel[][]): void {
    const height = pixels.length;
    const width = pixels[0].length;
    const smoothed: BeadPixel[][] = JSON.parse(JSON.stringify(pixels));

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        // 3x3邻域
        const neighborhood: string[] = [];
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            neighborhood.push(pixels[y + dy][x + dx].color.id);
          }
        }

        // 统计颜色频率
        const colorCounts = new Map<string, number>();
        neighborhood.forEach(c => {
          colorCounts.set(c, (colorCounts.get(c) || 0) + 1);
        });

        // 找到最常见的颜色
        let maxCount = 0;
        let dominantColorId = pixels[y][x].color.id;
        colorCounts.forEach((count, colorId) => {
          if (count > maxCount) {
            maxCount = count;
            dominantColorId = colorId;
          }
        });

        // 如果主导颜色占比超过50%，使用主导颜色
        if (maxCount >= 5) {
          const palette = getColorPalette(72);
          const dominantColor = palette.find(c => c.id === dominantColorId);
          if (dominantColor) {
            smoothed[y][x].color = dominantColor;
          }
        }
      }
    }

    // 复制平滑后的结果
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        pixels[y][x].color = smoothed[y][x].color;
      }
    }
  }

  /**
   * 统计颜色用量
   */
  private calculateColorUsage(pixels: BeadPixel[][]): Map<string, number> {
    const usage = new Map<string, number>();

    pixels.forEach(row => {
      row.forEach(pixel => {
        const colorId = pixel.color.id;
        usage.set(colorId, (usage.get(colorId) || 0) + 1);
      });
    });

    return usage;
  }

  /**
   * 渲染拼豆图到Canvas
   */
  renderToCanvas(
    result: ConversionResult,
    targetCanvas: HTMLCanvasElement,
    options: {
      showGrid: boolean;
      showColorCode: boolean;
      beadSize: number;
    }
  ): void {
    const { pixels, width, height } = result;
    const { showGrid, showColorCode, beadSize } = options;

    // 设置画布尺寸
    targetCanvas.width = width * beadSize;
    targetCanvas.height = height * beadSize;

    const ctx = targetCanvas.getContext('2d')!;

    // 绘制拼豆
    pixels.forEach((row, y) => {
      row.forEach((pixel, x) => {
        // 绘制拼豆颜色
        ctx.fillStyle = pixel.color.hex;
        ctx.fillRect(x * beadSize, y * beadSize, beadSize, beadSize);

        // 绘制网格
        if (showGrid) {
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
          ctx.lineWidth = 1;
          ctx.strokeRect(x * beadSize, y * beadSize, beadSize, beadSize);
        }

        // 绘制色号（仅当拼豆尺寸足够大时）
        if (showColorCode && beadSize >= 20) {
          ctx.fillStyle = this.getContrastColor(pixel.color.hex);
          ctx.font = `${Math.floor(beadSize / 3)}px monospace`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(
            pixel.color.id.replace('P', ''),
            x * beadSize + beadSize / 2,
            y * beadSize + beadSize / 2
          );
        }
      });
    });
  }

  /**
   * 获取对比色（用于文字显示）
   */
  private getContrastColor(hex: string): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#FFFFFF';
  }
}
