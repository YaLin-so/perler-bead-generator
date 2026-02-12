import { test, expect } from '@playwright/test';

test.describe('拼豆图生成器 UI 测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('页面加载测试', async ({ page }) => {
    // 检查页面标题
    await expect(page).toHaveTitle(/拼豆图生成器/);
    
    // 检查主要元素是否存在
    await expect(page.locator('text=拼豆图生成器')).toBeVisible();
    await expect(page.locator('[data-testid="upload-area"]')).toBeVisible();
    await expect(page.locator('[data-testid="control-panel"]')).toBeVisible();
    await expect(page.locator('[data-testid="preview-canvas"]')).toBeVisible();
    
    console.log('✅ 页面加载测试通过');
  });

  test('核心UI元素检查', async ({ page }) => {
    // 上传区域
    const uploadArea = page.locator('[data-testid="upload-area"]');
    await expect(uploadArea).toBeVisible();
    
    // 控制面板
    const controlPanel = page.locator('[data-testid="control-panel"]');
    await expect(controlPanel).toBeVisible();
    
    // 拼豆规格选择
    await expect(page.locator('select').first()).toBeVisible();
    
    // 色卡档位按钮
    await expect(page.locator('text=24色')).toBeVisible();
    await expect(page.locator('text=48色')).toBeVisible();
    await expect(page.locator('text=72色')).toBeVisible();
    
    // 画布尺寸滑块
    const slider = page.locator('[data-testid="canvas-size-slider"]');
    await expect(slider).toBeVisible();
    
    // 转换按钮
    await expect(page.locator('text=开始转换')).toBeVisible();
    
    // 预览画布
    const previewCanvas = page.locator('[data-testid="preview-canvas"]');
    await expect(previewCanvas).toBeVisible();
    
    console.log('✅ 核心UI元素检查通过');
  });

  test('响应式布局测试 - 桌面端', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    // 检查布局
    const controlPanel = page.locator('[data-testid="control-panel"]');
    const previewCanvas = page.locator('[data-testid="preview-canvas"]');
    
    await expect(controlPanel).toBeVisible();
    await expect(previewCanvas).toBeVisible();
    
    // 检查是否有横向溢出
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const windowWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(windowWidth);
    
    console.log('✅ 桌面端布局测试通过');
  });

  test('响应式布局测试 - 移动端', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    // 检查元素是否可见
    await expect(page.locator('[data-testid="upload-area"]')).toBeVisible();
    await expect(page.locator('[data-testid="control-panel"]')).toBeVisible();
    
    // 检查是否有横向溢出
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const windowWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(windowWidth + 10); // 允许10px误差
    
    console.log('✅ 移动端布局测试通过');
  });

  test('响应式布局测试 - 平板', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    
    // 检查元素是否可见
    await expect(page.locator('[data-testid="upload-area"]')).toBeVisible();
    await expect(page.locator('[data-testid="control-panel"]')).toBeVisible();
    
    // 检查是否有横向溢出
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const windowWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(windowWidth + 10);
    
    console.log('✅ 平板布局测试通过');
  });

  test('交互功能测试 - 色卡切换', async ({ page }) => {
    // 点击48色按钮
    await page.locator('text=48色').click();
    await expect(page.locator('text=48色')).toHaveClass(/bg-purple-200/);
    
    // 点击72色按钮
    await page.locator('text=72色').click();
    await expect(page.locator('text=72色')).toHaveClass(/bg-purple-200/);
    
    console.log('✅ 色卡切换测试通过');
  });

  test('交互功能测试 - 滑块调整', async ({ page }) => {
    const slider = page.locator('input[type="range"]').first();
    
    // 获取初始值
    const initialValue = await slider.inputValue();
    
    // 调整滑块
    await slider.fill('75');
    
    // 验证值已改变
    const newValue = await slider.inputValue();
    expect(newValue).toBe('75');
    expect(newValue).not.toBe(initialValue);
    
    console.log('✅ 滑块调整测试通过');
  });

  test('交互功能测试 - 复选框', async ({ page }) => {
    const checkbox = page.locator('input[type="checkbox"]').first();
    
    // 获取初始状态
    const initialState = await checkbox.isChecked();
    
    // 切换状态
    await checkbox.click();
    
    // 验证状态已改变
    const newState = await checkbox.isChecked();
    expect(newState).not.toBe(initialState);
    
    console.log('✅ 复选框测试通过');
  });

  test('控制台错误检查', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    page.on('pageerror', error => {
      errors.push(error.message);
    });
    
    // 等待页面完全加载
    await page.waitForTimeout(2000);
    
    // 检查是否有错误
    if (errors.length > 0) {
      console.warn('⚠️ 发现控制台错误:', errors);
    } else {
      console.log('✅ 控制台无错误');
    }
    
    expect(errors.length).toBe(0);
  });

  test('UI自检日志验证', async ({ page }) => {
    const logs: string[] = [];
    
    page.on('console', msg => {
      logs.push(msg.text());
    });
    
    // 等待自检完成
    await page.waitForTimeout(1000);
    
    // 检查是否有自检日志
    const hasUICheck = logs.some(log => log.includes('UI自检'));
    expect(hasUICheck).toBeTruthy();
    
    // 检查是否通过
    const hasPassed = logs.some(log => log.includes('UI全量自检合格'));
    if (hasPassed) {
      console.log('✅ UI自检通过');
    } else {
      console.warn('⚠️ UI自检未完全通过，请查看日志');
    }
  });
});

test.describe('截图测试', () => {
  test('全页面截图 - 桌面端', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ 
      path: 'screenshots/desktop-full.png', 
      fullPage: true 
    });
    console.log('✅ 桌面端截图已保存');
  });

  test('全页面截图 - 移动端', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ 
      path: 'screenshots/mobile-full.png', 
      fullPage: true 
    });
    console.log('✅ 移动端截图已保存');
  });

  test('全页面截图 - 平板', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ 
      path: 'screenshots/tablet-full.png', 
      fullPage: true 
    });
    console.log('✅ 平板截图已保存');
  });
});
