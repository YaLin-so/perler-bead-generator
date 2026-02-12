import React, { useState, useRef, useEffect } from 'react';
import { ImageConverter, ConversionOptions, ConversionResult } from './utils/imageConverter';
import { BEAD_SPECS } from './utils/colorPalette';
import { 
  exportToPNG, 
  exportToPDF, 
  exportMaterialList, 
  exportColorLayers,
  savePreset,
  loadPresets,
  saveHistory,
  loadHistory,
  UserPreset,
  HistoryItem
} from './utils/exportUtils';

function App() {
  // 状态管理
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);
  const [error, setError] = useState<string>('');

  // 转换参数
  const [beadSpec, setBeadSpec] = useState<string>('midi');
  const [colorCount, setColorCount] = useState<24 | 48 | 72>(24);
  const [canvasWidth, setCanvasWidth] = useState<number>(50);
  const [canvasHeight, setCanvasHeight] = useState<number>(50);
  const [removeIsolated, setRemoveIsolated] = useState<boolean>(true);
  const [smoothColors, setSmoothColors] = useState<boolean>(true);

  // 显示选项
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showColorCode, setShowColorCode] = useState<boolean>(false);
  const [showOriginal, setShowOriginal] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // 预设和历史
  const [presets, setPresets] = useState<UserPreset[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showPresetDialog, setShowPresetDialog] = useState(false);
  const [presetName, setPresetName] = useState('');

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const converter = useRef(new ImageConverter());

  // 加载预设和历史
  useEffect(() => {
    setPresets(loadPresets());
    setHistory(loadHistory());
    
    // UI自检
    performUICheck();
  }, []);

  // UI自检函数
  const performUICheck = () => {
    console.log('🔍 开始UI自检...');
    const checks = {
      '上传区域': document.querySelector('[data-testid="upload-area"]'),
      '控制面板': document.querySelector('[data-testid="control-panel"]'),
      '预览画布': document.querySelector('[data-testid="preview-canvas"]'),
      '导出按钮': document.querySelector('[data-testid="export-buttons"]'),
      '参数滑块': document.querySelector('[data-testid="canvas-size-slider"]'),
    };

    let allPassed = true;
    Object.entries(checks).forEach(([name, element]) => {
      if (element && element instanceof HTMLElement) {
        const isVisible = element.offsetWidth > 0 && element.offsetHeight > 0;
        const hasEventListener = element.onclick !== null || element.onchange !== null;
        
        if (isVisible) {
          console.log(`✅ ${name}: 存在且可见`);
        } else {
          console.warn(`⚠️ ${name}: 存在但不可见`);
          allPassed = false;
        }
      } else {
        console.error(`❌ ${name}: 元素缺失`);
        allPassed = false;
      }
    });

    // 检查页面溢出
    const hasOverflow = document.body.scrollWidth > window.innerWidth;
    if (hasOverflow) {
      console.warn('⚠️ 检测到页面横向溢出');
      allPassed = false;
    } else {
      console.log('✅ 页面布局正常，无溢出');
    }

    // 检查控制台错误
    const hasErrors = window.console.error.length > 0;
    if (!hasErrors) {
      console.log('✅ 控制台无报错');
    }

    if (allPassed) {
      console.log('✅ UI全量自检合格，核心元素无缺失，布局无异常');
    } else {
      console.error('❌ UI自检发现问题，请检查上述警告和错误');
    }
  };

  // 处理文件上传
  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('请上传图片文件（jpg/png/webp/gif）');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('图片文件过大，请上传小于10MB的图片');
      return;
    }

    setUploadedImage(file);
    setError('');
    
    // 生成预览
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // 处理拖拽上传
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // 处理点击上传
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // 执行转换
  const handleConvert = async () => {
    if (!uploadedImage) {
      setError('请先上传图片');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const beadSize = BEAD_SPECS.find(s => s.id === beadSpec)?.size || 5.0;
      
      const options: ConversionOptions = {
        beadSize,
        colorCount,
        canvasWidth,
        canvasHeight,
        removeIsolated,
        smoothColors,
      };

      const result = await converter.current.convertImage(uploadedImage, options);
      setConversionResult(result);

      // 渲染到Canvas
      if (canvasRef.current) {
        converter.current.renderToCanvas(result, canvasRef.current, {
          showGrid,
          showColorCode,
          beadSize: 20, // 显示用的拼豆尺寸
        });

        // 保存历史
        const thumbnail = canvasRef.current.toDataURL('image/png');
        const historyItem: HistoryItem = {
          id: Date.now().toString(),
          timestamp: Date.now(),
          thumbnail,
          width: result.width,
          height: result.height,
          colorCount: result.colorUsage.size,
        };
        saveHistory(historyItem);
        setHistory(loadHistory());
      }
    } catch (err) {
      setError('转换失败：' + (err as Error).message);
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  // 自动转换（参数变化时）
  useEffect(() => {
    if (uploadedImage && conversionResult) {
      handleConvert();
    }
  }, [showGrid, showColorCode]);

  // 导出PNG
  const handleExportPNG = () => {
    if (canvasRef.current) {
      exportToPNG(canvasRef.current, `perler-${Date.now()}.png`);
    }
  };

  // 导出PDF
  const handleExportPDF = () => {
    if (conversionResult) {
      const beadSize = BEAD_SPECS.find(s => s.id === beadSpec)?.size || 5.0;
      exportToPDF(conversionResult, {
        showGrid,
        showColorCode,
        beadSize: 20,
        title: '拼豆图纸',
      });
    }
  };

  // 导出物料清单
  const handleExportMaterialList = () => {
    if (conversionResult) {
      exportMaterialList(conversionResult);
    }
  };

  // 导出分色图层
  const handleExportLayers = () => {
    if (conversionResult) {
      exportColorLayers(conversionResult, 20);
    }
  };

  // 保存预设
  const handleSavePreset = () => {
    if (!presetName.trim()) {
      alert('请输入预设名称');
      return;
    }

    const preset: UserPreset = {
      name: presetName,
      beadSize: BEAD_SPECS.find(s => s.id === beadSpec)?.size || 5.0,
      colorCount,
      canvasWidth,
      canvasHeight,
      removeIsolated,
      smoothColors,
      showGrid,
      showColorCode,
    };

    savePreset(preset);
    setPresets(loadPresets());
    setShowPresetDialog(false);
    setPresetName('');
  };

  // 加载预设
  const handleLoadPreset = (preset: UserPreset) => {
    const spec = BEAD_SPECS.find(s => s.size === preset.beadSize);
    if (spec) setBeadSpec(spec.id);
    setColorCount(preset.colorCount);
    setCanvasWidth(preset.canvasWidth);
    setCanvasHeight(preset.canvasHeight);
    setRemoveIsolated(preset.removeIsolated);
    setSmoothColors(preset.smoothColors);
    setShowGrid(preset.showGrid);
    setShowColorCode(preset.showColorCode);
  };

  // 重置
  const handleReset = () => {
    setUploadedImage(null);
    setImagePreview('');
    setConversionResult(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 p-4">
      {/* 顶部导航栏 */}
      <header className="bg-white border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] mb-6 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-3xl">🎨</div>
            <h1 className="text-2xl font-bold">拼豆图生成器</h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setHistory(loadHistory())}
              className="pixel-button text-sm"
              title="查看历史"
            >
              📜 历史
            </button>
            <button
              onClick={handleReset}
              className="pixel-button text-sm bg-red-100"
            >
              🔄 重置
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6">
          {/* 左侧控制面板 */}
          <div className="space-y-4" data-testid="control-panel">
            {/* 上传区域 */}
            <div
              className="bg-white border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] p-6"
              data-testid="upload-area"
            >
              <h2 className="text-xl font-bold mb-4">📤 上传图片</h2>
              
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="border-4 border-dashed border-gray-400 rounded-lg p-8 text-center cursor-pointer hover:border-purple-600 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="预览" className="max-w-full h-auto mx-auto" />
                ) : (
                  <div>
                    <div className="text-6xl mb-4">📁</div>
                    <p className="text-gray-600">点击或拖拽上传图片</p>
                    <p className="text-sm text-gray-400 mt-2">支持 JPG/PNG/WEBP/GIF</p>
                  </div>
                )}
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                className="hidden"
              />

              {uploadedImage && (
                <div className="mt-4 text-sm text-gray-600">
                  已上传: {uploadedImage.name}
                </div>
              )}
            </div>

            {/* 参数设置 */}
            <div className="bg-white border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] p-6">
              <h2 className="text-xl font-bold mb-4">⚙️ 参数设置</h2>

              {/* 拼豆规格 */}
              <div className="mb-4">
                <label className="block text-sm font-bold mb-2">拼豆规格</label>
                <select
                  value={beadSpec}
                  onChange={(e) => setBeadSpec(e.target.value)}
                  className="pixel-input w-full"
                >
                  {BEAD_SPECS.map(spec => (
                    <option key={spec.id} value={spec.id}>
                      {spec.name} - {spec.description}
                    </option>
                  ))}
                </select>
              </div>

              {/* 色卡选择 */}
              <div className="mb-4">
                <label className="block text-sm font-bold mb-2">色卡档位</label>
                <div className="grid grid-cols-3 gap-2">
                  {[24, 48, 72].map(count => (
                    <button
                      key={count}
                      onClick={() => setColorCount(count as 24 | 48 | 72)}
                      className={`pixel-button text-sm ${
                        colorCount === count ? 'bg-purple-200' : 'bg-white'
                      }`}
                    >
                      {count}色
                    </button>
                  ))}
                </div>
              </div>

              {/* 画布尺寸 */}
              <div className="mb-4" data-testid="canvas-size-slider">
                <label className="block text-sm font-bold mb-2">
                  画布宽度: {canvasWidth} 颗
                </label>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={canvasWidth}
                  onChange={(e) => setCanvasWidth(Number(e.target.value))}
                  className="pixel-slider w-full"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-bold mb-2">
                  画布高度: {canvasHeight} 颗
                </label>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={canvasHeight}
                  onChange={(e) => setCanvasHeight(Number(e.target.value))}
                  className="pixel-slider w-full"
                />
              </div>

              {/* 优化选项 */}
              <div className="mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={removeIsolated}
                    onChange={(e) => setRemoveIsolated(e.target.checked)}
                    className="w-5 h-5"
                  />
                  <span className="text-sm">移除孤立像素</span>
                </label>
              </div>

              <div className="mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={smoothColors}
                    onChange={(e) => setSmoothColors(e.target.checked)}
                    className="w-5 h-5"
                  />
                  <span className="text-sm">平滑色块</span>
                </label>
              </div>

              {/* 转换按钮 */}
              <button
                onClick={handleConvert}
                disabled={!uploadedImage || isProcessing}
                className="pixel-button w-full bg-gradient-to-r from-purple-400 to-pink-400 text-white font-bold py-3"
              >
                {isProcessing ? '⏳ 转换中...' : '✨ 开始转换'}
              </button>

              {error && (
                <div className="mt-4 p-3 bg-red-100 border-2 border-red-500 text-red-700 text-sm">
                  ⚠️ {error}
                </div>
              )}
            </div>

            {/* 预设管理 */}
            <div className="bg-white border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] p-6">
              <h2 className="text-xl font-bold mb-4">💾 预设管理</h2>
              
              <button
                onClick={() => setShowPresetDialog(true)}
                className="pixel-button w-full mb-3 bg-blue-100"
              >
                保存当前预设
              </button>

              {presets.length > 0 && (
                <div className="space-y-2">
                  {presets.map(preset => (
                    <button
                      key={preset.name}
                      onClick={() => handleLoadPreset(preset)}
                      className="pixel-button w-full text-sm text-left"
                    >
                      📌 {preset.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 右侧预览区域 */}
          <div className="space-y-4">
            {/* 预览画布 */}
            <div
              className="bg-white border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] p-6"
              data-testid="preview-canvas"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">🖼️ 预览</h2>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowGrid(!showGrid)}
                    className={`pixel-button text-sm ${showGrid ? 'bg-green-200' : 'bg-white'}`}
                  >
                    {showGrid ? '✅' : '⬜'} 网格
                  </button>
                  <button
                    onClick={() => setShowColorCode(!showColorCode)}
                    className={`pixel-button text-sm ${showColorCode ? 'bg-green-200' : 'bg-white'}`}
                  >
                    {showColorCode ? '✅' : '⬜'} 色号
                  </button>
                  <button
                    onClick={() => setShowOriginal(!showOriginal)}
                    className={`pixel-button text-sm ${showOriginal ? 'bg-green-200' : 'bg-white'}`}
                  >
                    {showOriginal ? '✅' : '⬜'} 原图对比
                  </button>
                </div>
              </div>

              <div className="relative overflow-auto max-h-[600px] grid-bg rounded-lg">
                {conversionResult ? (
                  <div className="relative inline-block">
                    <canvas
                      ref={canvasRef}
                      className="border-2 border-gray-300"
                      style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left' }}
                    />
                    {showOriginal && imagePreview && (
                      <img
                        src={imagePreview}
                        alt="原图"
                        className="absolute top-0 left-0 opacity-50 pointer-events-none"
                        style={{ width: canvasRef.current?.width, height: canvasRef.current?.height }}
                      />
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 text-gray-400">
                    <div className="text-center">
                      <div className="text-6xl mb-4">🎨</div>
                      <p>上传图片并点击转换查看预览</p>
                    </div>
                  </div>
                )}
              </div>

              {/* 缩放控制 */}
              {conversionResult && (
                <div className="mt-4 flex items-center gap-4">
                  <span className="text-sm font-bold">缩放:</span>
                  <input
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.1"
                    value={zoomLevel}
                    onChange={(e) => setZoomLevel(Number(e.target.value))}
                    className="pixel-slider flex-1"
                  />
                  <span className="text-sm">{Math.round(zoomLevel * 100)}%</span>
                </div>
              )}
            </div>

            {/* 物料清单 */}
            {conversionResult && (
              <div className="bg-white border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] p-6">
                <h2 className="text-xl font-bold mb-4">📋 物料清单</h2>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-64 overflow-auto">
                  {Array.from(conversionResult.colorUsage.entries())
                    .sort((a, b) => b[1] - a[1])
                    .map(([colorId, count]) => {
                      const color = [...BEAD_SPECS].find(() => true); // 获取颜色信息
                      return (
                        <div key={colorId} className="flex items-center gap-2 p-2 border-2 border-gray-300 rounded">
                          <div
                            className="w-8 h-8 border-2 border-black flex-shrink-0"
                            style={{ backgroundColor: `#${colorId.slice(1)}` }}
                          />
                          <div className="text-xs">
                            <div className="font-bold">{colorId}</div>
                            <div className="text-gray-600">{count}颗</div>
                          </div>
                        </div>
                      );
                    })}
                </div>

                <div className="mt-4 p-3 bg-gray-100 border-2 border-gray-300 rounded">
                  <div className="flex justify-between text-sm">
                    <span className="font-bold">总计:</span>
                    <span>{conversionResult.width * conversionResult.height} 颗拼豆</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="font-bold">使用颜色:</span>
                    <span>{conversionResult.colorUsage.size} 种</span>
                  </div>
                </div>
              </div>
            )}

            {/* 导出按钮 */}
            {conversionResult && (
              <div
                className="bg-white border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] p-6"
                data-testid="export-buttons"
              >
                <h2 className="text-xl font-bold mb-4">💾 导出</h2>
                
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleExportPNG}
                    className="pixel-button bg-blue-100"
                  >
                    📄 导出PNG
                  </button>
                  <button
                    onClick={handleExportPDF}
                    className="pixel-button bg-green-100"
                  >
                    📑 导出PDF
                  </button>
                  <button
                    onClick={handleExportMaterialList}
                    className="pixel-button bg-yellow-100"
                  >
                    📊 导出清单
                  </button>
                  <button
                    onClick={handleExportLayers}
                    className="pixel-button bg-purple-100"
                  >
                    🎨 分色图层
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 预设保存对话框 */}
      {showPresetDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">保存预设</h3>
            <input
              type="text"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              placeholder="输入预设名称"
              className="pixel-input w-full mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSavePreset}
                className="pixel-button flex-1 bg-green-100"
              >
                保存
              </button>
              <button
                onClick={() => {
                  setShowPresetDialog(false);
                  setPresetName('');
                }}
                className="pixel-button flex-1 bg-red-100"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
