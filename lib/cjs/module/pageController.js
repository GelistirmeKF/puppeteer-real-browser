const { createCursor } = require('ghost-cursor');
const { checkTurnstile } = require('./turnstile.js');
const kill = require('tree-kill');

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// https://github.com/eshao731/puppeteer-real-browser
function generateFingerprint() {
    const gpuConfigs = {
        nvidia: {
            vendor: 'Google Inc. (NVIDIA)',
            renderers: [
                'ANGLE (NVIDIA GeForce RTX 4090 Direct3D11 vs_5_0 ps_5_0)',
                'ANGLE (NVIDIA GeForce RTX 4080 Direct3D11 vs_5_0 ps_5_0)',
                'ANGLE (NVIDIA GeForce RTX 4070 Ti Direct3D11 vs_5_0 ps_5_0)',
                'ANGLE (NVIDIA GeForce RTX 4070 Direct3D11 vs_5_0 ps_5_0)',
                'ANGLE (NVIDIA GeForce RTX 4060 Ti Direct3D11 vs_5_0 ps_5_0)',
                'ANGLE (NVIDIA GeForce RTX 4060 Direct3D11 vs_5_0 ps_5_0)',
                'ANGLE (NVIDIA GeForce RTX 3090 Ti Direct3D11 vs_5_0 ps_5_0)',
                'ANGLE (NVIDIA GeForce RTX 3090 Direct3D11 vs_5_0 ps_5_0)',
                'ANGLE (NVIDIA GeForce RTX 3080 Ti Direct3D11 vs_5_0 ps_5_0)',
                'ANGLE (NVIDIA GeForce RTX 3080 Direct3D11 vs_5_0 ps_5_0)',
                'ANGLE (NVIDIA GeForce RTX 3070 Ti Direct3D11 vs_5_0 ps_5_0)',
                'ANGLE (NVIDIA GeForce RTX 3070 Direct3D11 vs_5_0 ps_5_0)',
                'ANGLE (NVIDIA GeForce RTX 3060 Ti Direct3D11 vs_5_0 ps_5_0)',
                'ANGLE (NVIDIA GeForce RTX 3060 Direct3D11 vs_5_0 ps_5_0)',
                'ANGLE (NVIDIA GeForce RTX 2080 Ti Direct3D11 vs_5_0 ps_5_0)',
                'ANGLE (NVIDIA GeForce RTX 2080 Super Direct3D11 vs_5_0 ps_5_0)',
                'ANGLE (NVIDIA GeForce RTX 2070 Super Direct3D11 vs_5_0 ps_5_0)',
                'ANGLE (NVIDIA GeForce RTX 2060 Super Direct3D11 vs_5_0 ps_5_0)',
                'ANGLE (NVIDIA GeForce GTX 1660 Ti Direct3D11 vs_5_0 ps_5_0)',
                'ANGLE (NVIDIA GeForce GTX 1660 Super Direct3D11 vs_5_0 ps_5_0)',
                'ANGLE (NVIDIA GeForce GTX 1650 Super Direct3D11 vs_5_0 ps_5_0)',
                'ANGLE (NVIDIA GeForce GTX 1080 Ti Direct3D11 vs_5_0 ps_5_0)',
                'ANGLE (NVIDIA GeForce GTX 1080 Direct3D11 vs_5_0 ps_5_0)',
                'ANGLE (NVIDIA GeForce GTX 1070 Ti Direct3D11 vs_5_0 ps_5_0)',
            ]
        },
        amd: {
            vendor: 'Google Inc. (AMD)',
            renderers: [
                'ANGLE (AMD Radeon RX 7900 XTX Direct3D11 vs_5_0 ps_5_0)',
                'ANGLE (AMD Radeon RX 7900 XT Direct3D11 vs_5_0 ps_5_0)',
                'ANGLE (AMD Radeon RX 7800 XT Direct3D11 vs_5_0 ps_5_0)',
                'ANGLE (AMD Radeon RX 7700 XT Direct3D11 vs_5_0 ps_5_0)',
                'ANGLE (AMD Radeon RX 7600 Direct3D11 vs_5_0 ps_5_0)',
                'ANGLE (AMD Radeon RX 6950 XT Direct3D11 vs_5_0 ps_5_0)',
                'ANGLE (AMD Radeon RX 6900 XT Direct3D11 vs_5_0 ps_5_0)',
                'ANGLE (AMD Radeon RX 6800 XT Direct3D11 vs_5_0 ps_5_0)',
                'ANGLE (AMD Radeon RX 6800 Direct3D11 vs_5_0 ps_5_0)',
                'ANGLE (AMD Radeon RX 6750 XT Direct3D11 vs_5_0 ps_5_0)',
                'ANGLE (AMD Radeon RX 6700 XT Direct3D11 vs_5_0 ps_5_0)',
                'ANGLE (AMD Radeon RX 6650 XT Direct3D11 vs_5_0 ps_5_0)',
                'ANGLE (AMD Radeon RX 6600 XT Direct3D11 vs_5_0 ps_5_0)',
                'ANGLE (AMD Radeon RX 5700 XT Direct3D11 vs_5_0 ps_5_0)',
                'ANGLE (AMD Radeon RX 5600 XT Direct3D11 vs_5_0 ps_5_0)',
                'ANGLE (AMD Radeon RX 5500 XT Direct3D11 vs_5_0 ps_5_0)',
            ]
        },
        intel: {
            vendor: 'Google Inc. (Intel)',
            renderers: [
                'ANGLE (Intel(R) Arc(TM) A770 Graphics Direct3D11 vs_5_0 ps_5_0)',
                'ANGLE (Intel(R) Arc(TM) A750 Graphics Direct3D11 vs_5_0 ps_5_0)',
                'ANGLE (Intel(R) Arc(TM) A580 Graphics Direct3D11 vs_5_0 ps_5_0)',
                'ANGLE (Intel(R) Iris(R) Xe Graphics Direct3D11 vs_5_0 ps_5_0)',
                'ANGLE (Intel(R) Iris(R) Plus Graphics Direct3D11 vs_5_0 ps_5_0)',
                'ANGLE (Intel(R) UHD Graphics 770 Direct3D11 vs_5_0 ps_5_0)',
                'ANGLE (Intel(R) UHD Graphics 730 Direct3D11 vs_5_0 ps_5_0)',
                'ANGLE (Intel(R) UHD Graphics 630 Direct3D11 vs_5_0 ps_5_0)',
                'ANGLE (Intel(R) UHD Graphics 620 Direct3D11 vs_5_0 ps_5_0)',
                'ANGLE (Intel(R) UHD Graphics 610 Direct3D11 vs_5_0 ps_5_0)',
                'ANGLE (Intel(R) HD Graphics 630 Direct3D11 vs_5_0 ps_5_0)',
                'ANGLE (Intel(R) HD Graphics 530 Direct3D11 vs_5_0 ps_5_0)',
            ]
        }
    };

    const gpuKeys = Object.keys(gpuConfigs);
    const selectedGpu = gpuConfigs[gpuKeys[Math.floor(Math.random() * gpuKeys.length)]];
    
    const deviceMemoryOptions = [2, 4, 8, 16, 32, 64];
    const hardwareConcurrencyOptions = [2, 4, 6, 8, 10, 12, 14, 16, 20, 24, 32];
    
    const screenResolutions = [
        { width: 1366, height: 768 },
        { width: 1440, height: 900 },
        { width: 1536, height: 864 },
        { width: 1600, height: 900 },
        { width: 1680, height: 1050 },
        { width: 1920, height: 1080 },
        { width: 1920, height: 1200 },
        { width: 2560, height: 1080 },
        { width: 2560, height: 1440 },
        { width: 3440, height: 1440 },
        { width: 3840, height: 2160 },
    ];
    
    const timezones = [
        'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
        'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Moscow',
        'Asia/Tokyo', 'Asia/Shanghai', 'Asia/Singapore', 'Asia/Dubai',
        'Australia/Sydney', 'Pacific/Auckland',
    ];
    
    const languages = [
        ['en-US', 'en'], ['en-GB', 'en'], ['zh-CN', 'zh'], ['zh-TW', 'zh'],
        ['ja-JP', 'ja'], ['ko-KR', 'ko'], ['de-DE', 'de'], ['fr-FR', 'fr'],
        ['es-ES', 'es'], ['pt-BR', 'pt'], ['ru-RU', 'ru'], ['it-IT', 'it'],
    ];
    
    const resolution = screenResolutions[Math.floor(Math.random() * screenResolutions.length)];
    const language = languages[Math.floor(Math.random() * languages.length)];
    
    return {
        webglVendor: selectedGpu.vendor,
        webglRenderer: selectedGpu.renderers[Math.floor(Math.random() * selectedGpu.renderers.length)],
        deviceMemory: deviceMemoryOptions[Math.floor(Math.random() * deviceMemoryOptions.length)],
        hardwareConcurrency: hardwareConcurrencyOptions[Math.floor(Math.random() * hardwareConcurrencyOptions.length)],
        screenWidth: resolution.width,
        screenHeight: resolution.height,
        colorDepth: [24, 30, 32][Math.floor(Math.random() * 3)],
        timezone: timezones[Math.floor(Math.random() * timezones.length)],
        languages: language,
        canvasNoise: Math.random() * 0.5 + 0.5,
    };
}

async function pageController({ browser, page, proxy, turnstile, xvfbsession, pid, plugins, killProcess = false, chrome }) {

    let solveStatus = turnstile

    page.on('close', () => {
        solveStatus = false
    });


    browser.on('disconnected', async () => {
        solveStatus = false
        if (killProcess === true) {
            if (xvfbsession) try { xvfbsession.stopSync() } catch (err) { }
            if (chrome) try { chrome.kill() } catch (err) { console.log(err); }
            if (pid) try { kill(pid, 'SIGKILL', () => { }) } catch (err) { }
        }
    });

    async function turnstileSolver() {
        while (solveStatus) {
            await checkTurnstile({ page }).catch(() => { });
            await new Promise(r => setTimeout(r, 1000));
        }
        return
    }

    turnstileSolver()

    if (proxy.username && proxy.password) await page.authenticate({ username: proxy.username, password: proxy.password });

    if (plugins.length > 0) {
        for (const plugin of plugins) {
            plugin.onPageCreated(page)
        }
    }

    const fingerprint = generateFingerprint();
    
    
    await page.evaluateOnNewDocument((fp) => {
        const getParameterProxy = new Proxy(WebGLRenderingContext.prototype.getParameter, {
            apply(target, thisArg, args) {
                const param = args[0];
                if (param === 37445) return fp.webglVendor;
                if (param === 37446) return fp.webglRenderer;
                return Reflect.apply(target, thisArg, args);
            }
        });
        WebGLRenderingContext.prototype.getParameter = getParameterProxy;
        if (typeof WebGL2RenderingContext !== 'undefined') {
            WebGL2RenderingContext.prototype.getParameter = getParameterProxy;
        }
        
        // Canvas 指纹随机化
        const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
        HTMLCanvasElement.prototype.toDataURL = function(type) {
            if (this.width > 16 && this.height > 16) {
                try {
                    const ctx = this.getContext('2d');
                    if (ctx) {
                        const imageData = ctx.getImageData(0, 0, this.width, this.height);
                        for (let i = 0; i < imageData.data.length; i += 4) {
                            imageData.data[i] = Math.max(0, Math.min(255, imageData.data[i] + (Math.random() - 0.5) * fp.canvasNoise));
                            imageData.data[i + 1] = Math.max(0, Math.min(255, imageData.data[i + 1] + (Math.random() - 0.5) * fp.canvasNoise));
                            imageData.data[i + 2] = Math.max(0, Math.min(255, imageData.data[i + 2] + (Math.random() - 0.5) * fp.canvasNoise));
                        }
                        ctx.putImageData(imageData, 0, 0);
                    }
                } catch (e) {}
            }
            return originalToDataURL.apply(this, arguments);
        };
        
        Object.defineProperty(navigator, 'deviceMemory', { get: () => fp.deviceMemory, configurable: true });
        Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => fp.hardwareConcurrency, configurable: true });
        
        Object.defineProperty(screen, 'width', { get: () => fp.screenWidth, configurable: true });
        Object.defineProperty(screen, 'height', { get: () => fp.screenHeight, configurable: true });
        Object.defineProperty(screen, 'availWidth', { get: () => fp.screenWidth, configurable: true });
        Object.defineProperty(screen, 'availHeight', { get: () => fp.screenHeight - 40, configurable: true }); // 减去任务栏高度
        Object.defineProperty(screen, 'colorDepth', { get: () => fp.colorDepth, configurable: true });
        Object.defineProperty(screen, 'pixelDepth', { get: () => fp.colorDepth, configurable: true });
        
        const originalDateTimeFormat = Intl.DateTimeFormat;
        Intl.DateTimeFormat = function(locales, options) {
            options = options || {};
            options.timeZone = options.timeZone || fp.timezone;
            return new originalDateTimeFormat(locales, options);
        };
        Intl.DateTimeFormat.prototype = originalDateTimeFormat.prototype;
        Intl.DateTimeFormat.supportedLocalesOf = originalDateTimeFormat.supportedLocalesOf;
        
        const timezoneOffsets = {
            'America/New_York': 300, 'America/Chicago': 360, 'America/Denver': 420, 'America/Los_Angeles': 480,
            'Europe/London': 0, 'Europe/Paris': -60, 'Europe/Berlin': -60, 'Europe/Moscow': -180,
            'Asia/Tokyo': -540, 'Asia/Shanghai': -480, 'Asia/Singapore': -480, 'Asia/Dubai': -240,
            'Australia/Sydney': -660, 'Pacific/Auckland': -780,
        };
        const offset = timezoneOffsets[fp.timezone] || 0;
        Date.prototype.getTimezoneOffset = function() { return offset; };
    }, fingerprint);

    await page.evaluateOnNewDocument(() => {
        Object.defineProperty(MouseEvent.prototype, 'screenX', {
            get: function () {
                return this.clientX + window.screenX;
            }
        });

        Object.defineProperty(MouseEvent.prototype, 'screenY', {
            get: function () {
                return this.clientY + window.screenY;
            }
        });

    });

    const cursor = createCursor(page);
    page.realCursor = cursor
    page.realClick = cursor.click

    return page
}

module.exports = { pageController }
