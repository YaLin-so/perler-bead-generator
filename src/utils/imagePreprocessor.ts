// 图片预处理工具类
export interface ImageAdjustments {
  brightness: number; // -100 to 100
  contrast: number; // -100 to 100
  saturation: number; // -100 to 100
  rotation: number; // 0, 90, 180, 270
  scale: number; // 0.1 to 3
  cropArea: { x: number; y: number; width: number; height: number } | null;
}

export class ImagePreprocessor {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private originalImage: HTMLImageElement | null = null;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true })!;
  }

  /**
   * 加载原始图片
   */
  async loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.originalImage = img;
        resolve(img);
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * 应用所有调整并返回处理后的图片
   */
  applyAdjustments(adjustments: ImageAdjustments): HTMLCanvasElement {
    if (!this.originalImage) {
      throw new Error('请先加载图片');
    }

    const img = this.originalImage;
    
    // 1. 处理旋转
    const rotated = this.applyRotation(img, adjustments.rotation);
    
    // 2. 处理裁剪
    const cropped = adjustments.cropArea 
      ? this.applyCrop(rotated, adjustments.cropArea)
      : rotated;
    
    // 3. 处理缩放
    const scaled = this.applyScale(cropped, adjustments.scale);
    
    // 4. 处理颜色调整
    const adjusted = this.applyColorAdjustments(scaled, {
      brightness: adjustments.brightness,
      contrast: adjustments.contrast,
      saturation: adjustments.saturation,
    });

    return adjusted;
  }

  /**
   * 旋转图片
   */
  private applyRotation(img: HTMLImageElement | HTMLCanvasElement, rotation: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    const isRotated = rotation === 90 || rotation === 270;
    canvas.width = isRotated ? img.height : img.width;
    canvas.height = isRotated ? img.width : img.height;

    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.drawImage(img, -img.width / 2, -img.height / 2);

    return canvas;
  }

  /**
   * 裁剪图片
   */
  private applyCrop(
    img: HTMLCanvasElement,
    cropArea: { x: number; y: number; width: number; height: number }
  ): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    canvas.width = cropArea.width;
    canvas.height = cropArea.height;

    ctx.drawImage(
      img,
      cropArea.x,
      cropArea.y,
      cropArea.width,
      cropArea.height,
      0,
      0,
      cropArea.width,
      cropArea.height
    );

    return canvas;
  }

  /**
   * 缩放图片
   */
  private applyScale(img: HTMLCanvasElement, scale: number): HTMLCanvasElement {
    if (scale === 1) return img;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    canvas.width = img.width * scale;
    canvas.height = img.height * scale;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    return canvas;
  }

  /**
   * 应用颜色调整（亮度/对比度/饱和度）
   */
  private applyColorAdjustments(
    img: HTMLCanvasElement,
    adjustments: { brightness: number; contrast: number; saturation: number }
  ): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // 计算调整系数
    const brightnessFactor = adjustments.brightness / 100;
    const contrastFactor = (adjustments.contrast + 100) / 100;
    const saturationFactor = (adjustments.saturation + 100) / 100;

    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      // 应用亮度
      r += brightnessFactor * 255;
      g += brightnessFactor * 255;
      b += brightnessFactor * 255;

      // 应用对比度
      r = ((r / 255 - 0.5) * contrastFactor + 0.5) * 255;
      g = ((g / 255 - 0.5) * contrastFactor + 0.5) * 255;
      b = ((b / 255 - 0.5) * contrastFactor + 0.5) * 255;

      // 应用饱和度
      const gray = 0.2989 * r + 0.587 * g + 0.114 * b;
      r = gray + (r - gray) * saturationFactor;
      g = gray + (g - gray) * saturationFactor;
      b = gray + (b - gray) * saturationFactor;

      // 限制范围
      data[i] = Math.max(0, Math.min(255, r));
      data[i + 1] = Math.max(0, Math.min(255, g));
      data[i + 2] = Math.max(0, Math.min(255, b));
    }

    ctx.putImageData(imageData, 0, 0);
    return canvas;
  }

  /**
   * 重置为原始图片
   */
  reset(): HTMLImageElement | null {
    return this.originalImage;
  }

  /**
   * 获取原始图片
   */
  getOriginalImage(): HTMLImageElement | null {
    return this.originalImage;
  }
}
