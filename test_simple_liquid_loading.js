const puppeteer = require('puppeteer');

async function testSimpleLiquidLoading() {
    console.log('🧪 開始測試液態玻璃載入動畫（簡化版）...');
    
    const browser = await puppeteer.launch({ 
        headless: false,
        defaultViewport: { width: 375, height: 812 },
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    try {
        // 導航到頁面
        console.log('📱 導航到頁面...');
        await page.goto('http://localhost:3000/public/perfect-calendar.html', { 
            waitUntil: 'networkidle0',
            timeout: 30000 
        });
        
        // 等待頁面載入完成
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 直接觸發載入動畫
        console.log('🎬 直接觸發載入動畫...');
        await page.evaluate(() => {
            // 檢查是否有載入動畫函數
            console.log('🔍 檢查可用的函數...');
            console.log('showOptimizedLoadingAnimation:', typeof showOptimizedLoadingAnimation);
            console.log('showStudentLoadingState:', typeof showStudentLoadingState);
            console.log('window.showOptimizedLoadingAnimation:', typeof window.showOptimizedLoadingAnimation);
            console.log('window.showStudentLoadingState:', typeof window.showStudentLoadingState);
            
            if (typeof showOptimizedLoadingAnimation === 'function') {
                console.log('✅ 找到 showOptimizedLoadingAnimation 函數');
                showOptimizedLoadingAnimation();
            } else if (typeof showStudentLoadingState === 'function') {
                console.log('✅ 找到 showStudentLoadingState 函數');
                showStudentLoadingState();
            } else if (typeof window.showOptimizedLoadingAnimation === 'function') {
                console.log('✅ 找到 window.showOptimizedLoadingAnimation 函數');
                window.showOptimizedLoadingAnimation();
            } else if (typeof window.showStudentLoadingState === 'function') {
                console.log('✅ 找到 window.showStudentLoadingState 函數');
                window.showStudentLoadingState();
            } else {
                console.log('❌ 未找到載入動畫函數');
                // 嘗試手動創建模態框
                const modalContent = document.querySelector('.attendance-modal-content');
                if (modalContent) {
                    console.log('✅ 找到模態框，手動創建載入動畫');
                    // 這裡可以手動創建載入動畫
                } else {
                    console.log('❌ 未找到模態框');
                }
            }
        });
        
        // 等待動畫顯示
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 檢查載入動畫是否顯示
        console.log('🔍 檢查載入動畫...');
        const loadingInfo = await page.evaluate(() => {
            const overlay = document.querySelector('.student-loading-overlay') || document.querySelector('#optimized-loading-overlay');
            if (!overlay) {
                return { found: false, message: '未找到載入動畫' };
            }
            
            const styles = window.getComputedStyle(overlay);
            const container = overlay.querySelector('div');
            const containerStyles = container ? window.getComputedStyle(container) : null;
            
            return {
                found: true,
                overlay: {
                    display: styles.display,
                    opacity: styles.opacity,
                    backdropFilter: styles.backdropFilter,
                    background: styles.background,
                    border: styles.border,
                    boxShadow: styles.boxShadow
                },
                container: containerStyles ? {
                    backdropFilter: containerStyles.backdropFilter,
                    background: containerStyles.background,
                    border: containerStyles.border,
                    borderRadius: containerStyles.borderRadius,
                    boxShadow: containerStyles.boxShadow,
                    transform: containerStyles.transform
                } : null,
                liquidElements: {
                    rings: overlay.querySelectorAll('div[style*="border-radius: 50%"]').length,
                    background: overlay.querySelector('div[style*="liquidFlow"]') ? true : false,
                    centerBall: overlay.querySelector('div[style*="liquidPulse"]') ? true : false
                }
            };
        });
        
        console.log('📊 載入動畫檢查結果:');
        if (loadingInfo.found) {
            console.log('✅ 載入動畫已找到');
            console.log('🎨 遮罩效果:');
            console.log(`  顯示: ${loadingInfo.overlay.display}`);
            console.log(`  透明度: ${loadingInfo.overlay.opacity}`);
            console.log(`  背景模糊: ${loadingInfo.overlay.backdropFilter}`);
            console.log(`  背景: ${loadingInfo.overlay.background}`);
            console.log(`  邊框: ${loadingInfo.overlay.border}`);
            console.log(`  陰影: ${loadingInfo.overlay.boxShadow}`);
            
            if (loadingInfo.container) {
                console.log('🎨 容器效果:');
                console.log(`  背景模糊: ${loadingInfo.container.backdropFilter}`);
                console.log(`  背景: ${loadingInfo.container.background}`);
                console.log(`  邊框: ${loadingInfo.container.border}`);
                console.log(`  圓角: ${loadingInfo.container.borderRadius}`);
                console.log(`  陰影: ${loadingInfo.container.boxShadow}`);
                console.log(`  變換: ${loadingInfo.container.transform}`);
            }
            
            console.log('🎬 液態元素:');
            console.log(`  環形數量: ${loadingInfo.liquidElements.rings}`);
            console.log(`  背景流動: ${loadingInfo.liquidElements.background ? '✅' : '❌'}`);
            console.log(`  中心球: ${loadingInfo.liquidElements.centerBall ? '✅' : '❌'}`);
            
        } else {
            console.log(`❌ ${loadingInfo.message}`);
        }
        
        // 檢查動畫是否運行
        console.log('🎬 檢查動畫運行狀態...');
        const animationStatus = await page.evaluate(() => {
            const overlay = document.querySelector('.student-loading-overlay') || document.querySelector('#optimized-loading-overlay');
            if (!overlay) return { running: false, count: 0 };
            
            const animatedElements = overlay.querySelectorAll('*');
            let runningCount = 0;
            const animations = [];
            
            animatedElements.forEach((el, index) => {
                const styles = window.getComputedStyle(el);
                if (styles.animation && styles.animation !== 'none') {
                    runningCount++;
                    animations.push({
                        index,
                        animation: styles.animation,
                        element: el.tagName
                    });
                }
            });
            
            return {
                running: runningCount > 0,
                count: runningCount,
                animations: animations.slice(0, 5) // 只顯示前5個
            };
        });
        
        console.log(`🎬 動畫狀態: ${animationStatus.running ? '✅ 正在運行' : '❌ 未運行'}`);
        console.log(`🎬 動畫數量: ${animationStatus.count}`);
        if (animationStatus.animations && animationStatus.animations.length > 0) {
            console.log('🎬 動畫詳情:');
            animationStatus.animations.forEach((anim, index) => {
                console.log(`  ${index + 1}. ${anim.element}: ${anim.animation}`);
            });
        }
        
        // 等待一段時間觀察動畫
        console.log('⏳ 觀察動畫效果...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 測試隱藏動畫
        console.log('🔄 測試隱藏動畫...');
        await page.evaluate(() => {
            if (typeof hideOptimizedLoadingAnimation === 'function') {
                hideOptimizedLoadingAnimation();
            } else if (typeof hideStudentLoadingState === 'function') {
                hideStudentLoadingState();
            }
        });
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 檢查動畫是否隱藏
        const hiddenStatus = await page.evaluate(() => {
            const overlay = document.querySelector('.student-loading-overlay') || document.querySelector('#optimized-loading-overlay');
            if (!overlay) return { hidden: true, message: '動畫已移除' };
            
            const styles = window.getComputedStyle(overlay);
            return {
                hidden: styles.display === 'none' || styles.opacity === '0',
                display: styles.display,
                opacity: styles.opacity
            };
        });
        
        console.log(`🔄 隱藏狀態: ${hiddenStatus.hidden ? '✅ 已隱藏' : '❌ 仍顯示'}`);
        if (!hiddenStatus.hidden) {
            console.log(`  顯示: ${hiddenStatus.display}`);
            console.log(`  透明度: ${hiddenStatus.opacity}`);
        }
        
        console.log('✅ 液態玻璃載入動畫測試完成');
        
    } catch (error) {
        console.error('❌ 測試過程中發生錯誤:', error);
    } finally {
        await browser.close();
    }
}

// 執行測試
testSimpleLiquidLoading().catch(console.error);
