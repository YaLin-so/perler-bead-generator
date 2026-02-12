// 拼豆色卡数据 - PERLER官方色卡
export interface BeadColor {
  id: string;
  name: string;
  hex: string;
  rgb: [number, number, number];
  lab: [number, number, number];
}

// PERLER 24色基础色卡
export const PERLER_24_COLORS: BeadColor[] = [
  { id: 'P01', name: '白色', hex: '#FFFFFF', rgb: [255, 255, 255], lab: [100, 0, 0] },
  { id: 'P02', name: '奶油色', hex: '#FFF5E1', rgb: [255, 245, 225], lab: [96, 0, 8] },
  { id: 'P03', name: '黄色', hex: '#FFD700', rgb: [255, 215, 0], lab: [87, 5, 88] },
  { id: 'P04', name: '橙色', hex: '#FF8C00', rgb: [255, 140, 0], lab: [68, 45, 75] },
  { id: 'P05', name: '红色', hex: '#DC143C', rgb: [220, 20, 60], lab: [47, 71, 38] },
  { id: 'P06', name: '泡泡糖粉', hex: '#FF69B4', rgb: [255, 105, 180], lab: [65, 65, -10] },
  { id: 'P07', name: '紫色', hex: '#9370DB', rgb: [147, 112, 219], lab: [54, 35, -45] },
  { id: 'P08', name: '深蓝', hex: '#00008B', rgb: [0, 0, 139], lab: [20, 50, -65] },
  { id: 'P09', name: '浅蓝', hex: '#87CEEB', rgb: [135, 206, 235], lab: [79, -15, -25] },
  { id: 'P10', name: '深绿', hex: '#006400', rgb: [0, 100, 0], lab: [35, -45, 40] },
  { id: 'P11', name: '浅绿', hex: '#90EE90', rgb: [144, 238, 144], lab: [87, -45, 35] },
  { id: 'P12', name: '棕色', hex: '#8B4513', rgb: [139, 69, 19], lab: [37, 25, 45] },
  { id: 'P13', name: '灰色', hex: '#808080', rgb: [128, 128, 128], lab: [54, 0, 0] },
  { id: 'P14', name: '黑色', hex: '#000000', rgb: [0, 0, 0], lab: [0, 0, 0] },
  { id: 'P15', name: '桃红', hex: '#FFB6C1', rgb: [255, 182, 193], lab: [81, 30, 5] },
  { id: 'P16', name: '薰衣草', hex: '#E6E6FA', rgb: [230, 230, 250], lab: [91, 5, -10] },
  { id: 'P17', name: '青色', hex: '#00CED1', rgb: [0, 206, 209], lab: [76, -40, -20] },
  { id: 'P18', name: '蓝绿', hex: '#20B2AA', rgb: [32, 178, 170], lab: [66, -40, -5] },
  { id: 'P19', name: '金黄', hex: '#FFD700', rgb: [255, 215, 0], lab: [87, 5, 88] },
  { id: 'P20', name: '珊瑚', hex: '#FF7F50', rgb: [255, 127, 80], lab: [67, 45, 45] },
  { id: 'P21', name: '浅灰', hex: '#D3D3D3', rgb: [211, 211, 211], lab: [85, 0, 0] },
  { id: 'P22', name: '深灰', hex: '#696969', rgb: [105, 105, 105], lab: [45, 0, 0] },
  { id: 'P23', name: '米色', hex: '#F5F5DC', rgb: [245, 245, 220], lab: [96, -2, 10] },
  { id: 'P24', name: '巧克力', hex: '#D2691E', rgb: [210, 105, 30], lab: [55, 30, 55] },
];

// PERLER 48色扩展色卡（包含24色基础色）
export const PERLER_48_COLORS: BeadColor[] = [
  ...PERLER_24_COLORS,
  { id: 'P25', name: '深红', hex: '#8B0000', rgb: [139, 0, 0], lab: [25, 50, 40] },
  { id: 'P26', name: '酒红', hex: '#800020', rgb: [128, 0, 32], lab: [23, 50, 20] },
  { id: 'P27', name: '玫瑰红', hex: '#FF007F', rgb: [255, 0, 127], lab: [55, 85, -10] },
  { id: 'P28', name: '樱花粉', hex: '#FFB7C5', rgb: [255, 183, 197], lab: [82, 30, 5] },
  { id: 'P29', name: '淡粉', hex: '#FFC0CB', rgb: [255, 192, 203], lab: [84, 25, 5] },
  { id: 'P30', name: '深紫', hex: '#4B0082', rgb: [75, 0, 130], lab: [20, 50, -60] },
  { id: 'P31', name: '紫罗兰', hex: '#8A2BE2', rgb: [138, 43, 226], lab: [45, 65, -70] },
  { id: 'P32', name: '天蓝', hex: '#00BFFF', rgb: [0, 191, 255], lab: [72, -25, -40] },
  { id: 'P33', name: '宝蓝', hex: '#4169E1', rgb: [65, 105, 225], lab: [50, 30, -65] },
  { id: 'P34', name: '海军蓝', hex: '#000080', rgb: [0, 0, 128], lab: [18, 48, -60] },
  { id: 'P35', name: '青绿', hex: '#00FA9A', rgb: [0, 250, 154], lab: [85, -65, 30] },
  { id: 'P36', name: '翠绿', hex: '#00FF7F', rgb: [0, 255, 127], lab: [88, -75, 50] },
  { id: 'P37', name: '草绿', hex: '#7CFC00', rgb: [124, 252, 0], lab: [88, -60, 85] },
  { id: 'P38', name: '橄榄绿', hex: '#808000', rgb: [128, 128, 0], lab: [52, -10, 60] },
  { id: 'P39', name: '深棕', hex: '#654321', rgb: [101, 67, 33], lab: [32, 10, 30] },
  { id: 'P40', name: '浅棕', hex: '#D2B48C', rgb: [210, 180, 140], lab: [75, 5, 25] },
  { id: 'P41', name: '土黄', hex: '#DAA520', rgb: [218, 165, 32], lab: [70, 10, 70] },
  { id: 'P42', name: '芥末黄', hex: '#FFDB58', rgb: [255, 219, 88], lab: [88, -5, 75] },
  { id: 'P43', name: '柠檬黄', hex: '#FFF44F', rgb: [255, 244, 79], lab: [95, -15, 85] },
  { id: 'P44', name: '荧光黄', hex: '#FFFF00', rgb: [255, 255, 0], lab: [97, -15, 93] },
  { id: 'P45', name: '荧光橙', hex: '#FF6600', rgb: [255, 102, 0], lab: [65, 55, 75] },
  { id: 'P46', name: '荧光粉', hex: '#FF1493', rgb: [255, 20, 147], lab: [60, 80, -10] },
  { id: 'P47', name: '荧光绿', hex: '#39FF14', rgb: [57, 255, 20], lab: [88, -75, 80] },
  { id: 'P48', name: '银色', hex: '#C0C0C0', rgb: [192, 192, 192], lab: [78, 0, 0] },
];

// PERLER 72色完整色卡（包含48色）
export const PERLER_72_COLORS: BeadColor[] = [
  ...PERLER_48_COLORS,
  { id: 'P49', name: '深粉', hex: '#FF1493', rgb: [255, 20, 147], lab: [60, 80, -10] },
  { id: 'P50', name: '浅紫', hex: '#DDA0DD', rgb: [221, 160, 221], lab: [73, 25, -20] },
  { id: 'P51', name: '深青', hex: '#008B8B', rgb: [0, 139, 139], lab: [52, -30, -15] },
  { id: 'P52', name: '浅青', hex: '#AFEEEE', rgb: [175, 238, 238], lab: [90, -20, -10] },
  { id: 'P53', name: '墨绿', hex: '#2F4F4F', rgb: [47, 79, 79], lab: [32, -15, -5] },
  { id: 'P54', name: '松绿', hex: '#20B2AA', rgb: [32, 178, 170], lab: [66, -40, -5] },
  { id: 'P55', name: '黄绿', hex: '#9ACD32', rgb: [154, 205, 50], lab: [77, -35, 70] },
  { id: 'P56', name: '春绿', hex: '#00FF7F', rgb: [0, 255, 127], lab: [88, -75, 50] },
  { id: 'P57', name: '深橙', hex: '#FF4500', rgb: [255, 69, 0], lab: [58, 70, 70] },
  { id: 'P58', name: '浅橙', hex: '#FFA07A', rgb: [255, 160, 122], lab: [75, 35, 30] },
  { id: 'P59', name: '深黄', hex: '#FFD700', rgb: [255, 215, 0], lab: [87, 5, 88] },
  { id: 'P60', name: '浅黄', hex: '#FFFFE0', rgb: [255, 255, 224], lab: [99, -5, 10] },
  { id: 'P61', name: '赤褐', hex: '#A0522D', rgb: [160, 82, 45], lab: [45, 20, 35] },
  { id: 'P62', name: '沙褐', hex: '#F4A460', rgb: [244, 164, 96], lab: [73, 20, 40] },
  { id: 'P63', name: '深米', hex: '#FFE4B5', rgb: [255, 228, 181], lab: [91, 5, 25] },
  { id: 'P64', name: '浅米', hex: '#FAEBD7', rgb: [250, 235, 215], lab: [94, 2, 12] },
  { id: 'P65', name: '炭灰', hex: '#36454F', rgb: [54, 69, 79], lab: [28, -5, -10] },
  { id: 'P66', name: '烟灰', hex: '#708090', rgb: [112, 128, 144], lab: [52, -5, -10] },
  { id: 'P67', name: '珍珠白', hex: '#F8F8FF', rgb: [248, 248, 255], lab: [98, 0, -2] },
  { id: 'P68', name: '象牙白', hex: '#FFFFF0', rgb: [255, 255, 240], lab: [99, -2, 5] },
  { id: 'P69', name: '金色', hex: '#FFD700', rgb: [255, 215, 0], lab: [87, 5, 88] },
  { id: 'P70', name: '铜色', hex: '#B87333', rgb: [184, 115, 51], lab: [55, 15, 45] },
  { id: 'P71', name: '青铜', hex: '#CD7F32', rgb: [205, 127, 50], lab: [60, 20, 55] },
  { id: 'P72', name: '古铜', hex: '#8B4513', rgb: [139, 69, 19], lab: [37, 25, 45] },
];

// 拼豆规格配置
export interface BeadSpec {
  id: string;
  name: string;
  size: number; // 单位：mm
  description: string;
}

export const BEAD_SPECS: BeadSpec[] = [
  { id: 'mini', name: '迷你豆', size: 2.6, description: '2.6mm - 适合精细作品' },
  { id: 'midi', name: '标准豆', size: 5.0, description: '5.0mm - 最常用规格' },
  { id: 'maxi', name: '大号豆', size: 10.0, description: '10.0mm - 适合儿童和大型作品' },
];

// 颜色距离计算（LAB色彩空间）
export function calculateColorDistance(lab1: [number, number, number], lab2: [number, number, number]): number {
  const [l1, a1, b1] = lab1;
  const [l2, a2, b2] = lab2;
  return Math.sqrt(
    Math.pow(l1 - l2, 2) +
    Math.pow(a1 - a2, 2) +
    Math.pow(b1 - b2, 2)
  );
}

// RGB转LAB色彩空间
export function rgbToLab(rgb: [number, number, number]): [number, number, number] {
  let [r, g, b] = rgb.map(v => v / 255);

  // RGB to XYZ
  r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

  let x = (r * 0.4124 + g * 0.3576 + b * 0.1805) * 100;
  let y = (r * 0.2126 + g * 0.7152 + b * 0.0722) * 100;
  let z = (r * 0.0193 + g * 0.1192 + b * 0.9505) * 100;

  // XYZ to LAB
  x /= 95.047;
  y /= 100.000;
  z /= 108.883;

  x = x > 0.008856 ? Math.pow(x, 1/3) : (7.787 * x) + 16/116;
  y = y > 0.008856 ? Math.pow(y, 1/3) : (7.787 * y) + 16/116;
  z = z > 0.008856 ? Math.pow(z, 1/3) : (7.787 * z) + 16/116;

  const L = (116 * y) - 16;
  const A = 500 * (x - y);
  const B = 200 * (y - z);

  return [L, A, B];
}

// 找到最接近的拼豆颜色
export function findClosestBeadColor(rgb: [number, number, number], palette: BeadColor[]): BeadColor {
  const targetLab = rgbToLab(rgb);
  let minDistance = Infinity;
  let closestColor = palette[0];

  for (const color of palette) {
    const distance = calculateColorDistance(targetLab, color.lab);
    if (distance < minDistance) {
      minDistance = distance;
      closestColor = color;
    }
  }

  return closestColor;
}

// 获取指定色卡
export function getColorPalette(colorCount: 24 | 48 | 72): BeadColor[] {
  switch (colorCount) {
    case 24:
      return PERLER_24_COLORS;
    case 48:
      return PERLER_48_COLORS;
    case 72:
      return PERLER_72_COLORS;
    default:
      return PERLER_24_COLORS;
  }
}
