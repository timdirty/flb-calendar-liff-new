const puppeteer = require('puppeteer');

async function testManualLiquidLoading() {
    console.log('🧪 開始測試液態玻璃載入動畫（手動版）...');
    
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
        
        // 手動創建模態框和載入動畫
        console.log('🎬 手動創建模態框和載入動畫...');
        await page.evaluate(() => {
            // 創建模態框
            const modal = document.createElement('div');
            modal.className = 'attendance-modal-content';
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
            `;
            document.body.appendChild(modal);
            
            // 創建液態玻璃載入遮罩
            const loadingOverlay = document.createElement('div');
            loadingOverlay.id = 'optimized-loading-overlay';
            loadingOverlay.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(135deg, 
                    rgba(255, 255, 255, 0.1) 0%, 
                    rgba(255, 255, 255, 0.05) 50%,
                    rgba(255, 255, 255, 0.1) 100%);
                backdrop-filter: blur(25px);
                -webkit-backdrop-filter: blur(25px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                z-index: 1000;
                opacity: 0;
                transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
                box-shadow: 
                    0 8px 32px rgba(0, 0, 0, 0.1),
                    inset 0 1px 0 rgba(255, 255, 255, 0.3);
            `;
            
            // 創建液態玻璃載入容器
            const loadingContainer = document.createElement('div');
            loadingContainer.style.cssText = `
                background: linear-gradient(135deg, 
                    rgba(255, 255, 255, 0.25) 0%, 
                    rgba(255, 255, 255, 0.1) 50%,
                    rgba(255, 255, 255, 0.2) 100%);
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.3);
                border-radius: 24px;
                padding: 40px 32px;
                box-shadow: 
                    0 12px 40px rgba(0, 0, 0, 0.15),
                    0 4px 12px rgba(0, 0, 0, 0.1),
                    inset 0 1px 0 rgba(255, 255, 255, 0.4),
                    inset 0 -1px 0 rgba(0, 0, 0, 0.05);
                text-align: center;
                position: relative;
                overflow: hidden;
                min-width: 280px;
                transform: scale(0.9);
                transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
            `;
            
            // 創建背景流動效果
            const liquidBackground = document.createElement('div');
            liquidBackground.style.cssText = `
                position: absolute;
                top: -50%;
                left: -50%;
                width: 200%;
                height: 200%;
                background: linear-gradient(45deg, 
                    rgba(74, 144, 226, 0.1) 0%,
                    rgba(80, 200, 120, 0.1) 25%,
                    rgba(255, 193, 7, 0.1) 50%,
                    rgba(255, 107, 107, 0.1) 75%,
                    rgba(138, 43, 226, 0.1) 100%);
                animation: liquidFlow 8s ease-in-out infinite;
                opacity: 0.6;
            `;
            
            // 創建液態載入器
            const liquidLoader = document.createElement('div');
            liquidLoader.style.cssText = `
                width: 80px;
                height: 80px;
                margin: 0 auto 24px;
                position: relative;
                transform: translateZ(0);
            `;
            
            // 創建外層液態環
            const outerRing = document.createElement('div');
            outerRing.style.cssText = `
                width: 100%;
                height: 100%;
                border: 3px solid transparent;
                border-top: 3px solid rgba(74, 144, 226, 0.3);
                border-right: 3px solid rgba(80, 200, 120, 0.3);
                border-radius: 50%;
                animation: liquidSpin 2s linear infinite;
                position: absolute;
                top: 0;
                left: 0;
            `;
            
            // 創建中層液態環
            const middleRing = document.createElement('div');
            middleRing.style.cssText = `
                width: 70%;
                height: 70%;
                border: 2px solid transparent;
                border-bottom: 2px solid rgba(255, 193, 7, 0.4);
                border-left: 2px solid rgba(255, 107, 107, 0.4);
                border-radius: 50%;
                animation: liquidSpin 1.5s linear infinite reverse;
                position: absolute;
                top: 15%;
                left: 15%;
            `;
            
            // 創建內層液態環
            const innerRing = document.createElement('div');
            innerRing.style.cssText = `
                width: 40%;
                height: 40%;
                border: 2px solid transparent;
                border-top: 2px solid rgba(138, 43, 226, 0.5);
                border-right: 2px solid rgba(74, 144, 226, 0.5);
                border-radius: 50%;
                animation: liquidSpin 1s linear infinite;
                position: absolute;
                top: 30%;
                left: 30%;
            `;
            
            // 創建中心液態球
            const centerBall = document.createElement('div');
            centerBall.style.cssText = `
                width: 16px;
                height: 16px;
                background: linear-gradient(135deg, 
                    rgba(74, 144, 226, 0.8) 0%,
                    rgba(80, 200, 120, 0.8) 50%,
                    rgba(255, 193, 7, 0.8) 100%);
                border-radius: 50%;
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                animation: liquidPulse 1.5s ease-in-out infinite;
                box-shadow: 
                    0 0 20px rgba(74, 144, 226, 0.4),
                    inset 0 1px 0 rgba(255, 255, 255, 0.3);
            `;
            
            // 創建載入文字
            const loadingText = document.createElement('div');
            loadingText.innerHTML = `
                <div style="
                    font-size: 18px;
                    font-weight: 600;
                    color: rgba(255, 255, 255, 0.9);
                    margin-bottom: 8px;
                    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
                    letter-spacing: 0.5px;
                ">載入學生資料中</div>
                <div style="
                    font-size: 14px;
                    color: rgba(255, 255, 255, 0.7);
                    margin-bottom: 20px;
                    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
                ">正在從資料庫載入學生名單...</div>
            `;
            
            // 創建液態進度條
            const progressContainer = document.createElement('div');
            progressContainer.style.cssText = `
                width: 200px;
                height: 6px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 3px;
                overflow: hidden;
                margin: 0 auto;
                position: relative;
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.2);
            `;
            
            const progressFill = document.createElement('div');
            progressFill.style.cssText = `
                height: 100%;
                background: linear-gradient(90deg, 
                    rgba(74, 144, 226, 0.8) 0%,
                    rgba(80, 200, 120, 0.8) 50%,
                    rgba(255, 193, 7, 0.8) 100%);
                border-radius: 3px;
                width: 0%;
                transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                position: relative;
                overflow: hidden;
                box-shadow: 0 0 10px rgba(74, 144, 226, 0.3);
            `;
            
            // 創建進度條光效
            const progressShimmer = document.createElement('div');
            progressShimmer.style.cssText = `
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, 
                    transparent 0%,
                    rgba(255, 255, 255, 0.4) 50%,
                    transparent 100%);
                animation: shimmer 2s ease-in-out infinite;
            `;
            
            // 添加CSS動畫
            const style = document.createElement('style');
            style.textContent = `
                @keyframes liquidSpin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                @keyframes liquidPulse {
                    0%, 100% { 
                        transform: translate(-50%, -50%) scale(1);
                        opacity: 0.8;
                    }
                    50% { 
                        transform: translate(-50%, -50%) scale(1.2);
                        opacity: 1;
                    }
                }
                
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(200%); }
                }
                
                @keyframes liquidFlow {
                    0%, 100% { transform: rotate(0deg) scale(1); }
                    25% { transform: rotate(90deg) scale(1.1); }
                    50% { transform: rotate(180deg) scale(1); }
                    75% { transform: rotate(270deg) scale(1.1); }
                }
            `;
            document.head.appendChild(style);
            
            // 組裝載入動畫
            liquidLoader.appendChild(outerRing);
            liquidLoader.appendChild(middleRing);
            liquidLoader.appendChild(innerRing);
            liquidLoader.appendChild(centerBall);
            
            progressFill.appendChild(progressShimmer);
            progressContainer.appendChild(progressFill);
            
            loadingContainer.appendChild(liquidBackground);
            loadingContainer.appendChild(liquidLoader);
            loadingContainer.appendChild(loadingText);
            loadingContainer.appendChild(progressContainer);
            
            loadingOverlay.appendChild(loadingContainer);
            modal.appendChild(loadingOverlay);
            
            // 顯示動畫
            requestAnimationFrame(() => {
                loadingOverlay.style.opacity = '1';
                loadingContainer.style.transform = 'scale(1)';
            });
            
            // 模擬進度
            let progress = 0;
            const progressInterval = setInterval(() => {
                progress += Math.random() * 12 + 3;
                if (progress > 95) progress = 95;
                progressFill.style.width = progress + '%';
            }, 300);
            
            // 存儲清理函數
            window.clearManualLoading = () => {
                clearInterval(progressInterval);
                if (loadingOverlay && loadingOverlay.parentNode) {
                    loadingOverlay.style.opacity = '0';
                    loadingContainer.style.transform = 'scale(0.9)';
                    setTimeout(() => {
                        if (loadingOverlay.parentNode) {
                            loadingOverlay.parentNode.removeChild(loadingOverlay);
                        }
                        if (modal.parentNode) {
                            modal.parentNode.removeChild(modal);
                        }
                    }, 500);
                }
            };
            
            console.log('✅ 液態玻璃載入動畫已創建');
        });
        
        // 等待動畫顯示
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 檢查載入動畫是否顯示
        console.log('🔍 檢查載入動畫...');
        const loadingInfo = await page.evaluate(() => {
            const overlay = document.querySelector('#optimized-loading-overlay');
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
            const overlay = document.querySelector('#optimized-loading-overlay');
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
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // 測試隱藏動畫
        console.log('🔄 測試隱藏動畫...');
        await page.evaluate(() => {
            if (window.clearManualLoading) {
                window.clearManualLoading();
            }
        });
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log('✅ 液態玻璃載入動畫測試完成');
        
    } catch (error) {
        console.error('❌ 測試過程中發生錯誤:', error);
    } finally {
        await browser.close();
    }
}

// 執行測試
testManualLiquidLoading().catch(console.error);
