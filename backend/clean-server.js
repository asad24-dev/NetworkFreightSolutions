// NFS Logistics - Clean Track-Trace API Server
// Scrapes carrier tracking URLs from track-trace.com
const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, curl, or file://)
        if (!origin) return callback(null, true);
        
        // Allow any localhost origin
        if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
            return callback(null, true);
        }
        
        // Allow your domain when deployed
        if (origin.includes('your-domain.com')) {
            return callback(null, true);
        }
        
        return callback(null, true); // Allow all origins for development
    },
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    credentials: false
}));
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'NFS Logistics Track-Trace API',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Main tracking endpoint
app.post('/api/track-scrape', async (req, res) => {
    const { trackingNumber, customerName, customerEmail } = req.body;
    
    if (!trackingNumber) {
        return res.status(400).json({
            success: false,
            error: 'Tracking number is required'
        });
    }

    let browser;
    try {
        console.log(`🔍 Processing tracking request for AWB: ${trackingNumber}`);
        
        // Launch browser with enhanced anti-detection settings
        browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-web-security',
                '--disable-features=VizDisplayCompositor',
                '--disable-blink-features=AutomationControlled',
                '--no-first-run',
                '--no-default-browser-check',
                '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            ]
        });

        const page = await browser.newPage();
        
        // Enhanced browser simulation
        await page.setViewport({ width: 1366, height: 768 });
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        
        // Remove automation indicators
        await page.evaluateOnNewDocument(() => {
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined,
            });
        });
        
        // Set realistic headers
        await page.setExtraHTTPHeaders({
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
        });
        
        // Format AWB with proper dash for airline recognition
        let formattedAwb = trackingNumber;
        if (trackingNumber.length >= 11 && !trackingNumber.includes('-')) {
            formattedAwb = trackingNumber.substring(0, 3) + '-' + trackingNumber.substring(3);
            console.log(`📝 Formatted AWB: ${trackingNumber} -> ${formattedAwb}`);
        }

        // Go to track-trace.com and fill the form
        const trackTraceUrl = `https://www.track-trace.com/aircargo`;
        console.log(`🔗 Navigating to: ${trackTraceUrl}`);
        await page.goto(trackTraceUrl, { waitUntil: 'networkidle0', timeout: 15000 });
        
        // Wait for page to load
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Fill the AWB input field
        console.log(`📝 Filling AWB field with: ${formattedAwb}`);
        const inputFilled = await page.evaluate((awb) => {
            const selectors = [
                'input[name="awb"]',
                '#awb',
                'input[type="text"]',
                'input[placeholder*="AWB"]',
                'input[placeholder*="airway"]'
            ];
            
            for (const selector of selectors) {
                const input = document.querySelector(selector);
                if (input) {
                    input.value = awb;
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                    input.dispatchEvent(new Event('change', { bubbles: true }));
                    console.log(`Found input with selector: ${selector}`);
                    return true;
                }
            }
            return false;
        }, formattedAwb);
        
        if (!inputFilled) {
            throw new Error('Could not find AWB input field on track-trace.com');
        }
        
        // Wait for validation
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Wait for Track direct button
        await page.waitForSelector('#wc-multi-form-button_direct', { timeout: 15000 });
        console.log('✅ Track direct button found!');
        
        // Set up enhanced new tab listener before clicking
        const newTabPromise = new Promise((resolve) => {
            const timeout = setTimeout(() => resolve(null), 15000);
            
            browser.on('targetcreated', async (target) => {
                clearTimeout(timeout);
                
                if (target.type() === 'page') {
                    try {
                        const newPage = await target.page();
                        
                        // Transfer session cookies to new page
                        const cookies = await page.cookies();
                        if (cookies.length > 0) {
                            await newPage.setCookie(...cookies);
                        }
                        
                        // Set referrer header to track-trace.com
                        await newPage.setExtraHTTPHeaders({
                            'Referer': 'https://www.track-trace.com/aircargo',
                            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                            'Accept-Language': 'en-US,en;q=0.9',
                            'Accept-Encoding': 'gzip, deflate, br',
                            'DNT': '1',
                            'Connection': 'keep-alive',
                            'Upgrade-Insecure-Requests': '1',
                            'Sec-Fetch-Dest': 'document',
                            'Sec-Fetch-Mode': 'navigate',
                            'Sec-Fetch-Site': 'cross-site',
                            'Sec-Fetch-User': '?1'
                        });
                        
                        // Remove automation indicators
                        await newPage.evaluateOnNewDocument(() => {
                            Object.defineProperty(navigator, 'webdriver', {
                                get: () => undefined,
                            });
                        });
                        
                        await new Promise(resolve => setTimeout(resolve, 3000));
                        
                        let finalUrl = newPage.url();
                        
                        if (finalUrl === 'about:blank' || finalUrl.length < 10) {
                            try {
                                await newPage.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 8000 });
                                finalUrl = newPage.url();
                            } catch (navError) {
                                console.log('⚠️ Navigation timeout, using current URL');
                            }
                        }
                        
                        console.log(`🔗 Final carrier URL captured: ${finalUrl}`);
                        await newPage.close();
                        resolve(finalUrl);
                    } catch (error) {
                        console.log('❌ Error handling new page:', error.message);
                        resolve(target.url());
                    }
                } else {
                    resolve(null);
                }
            });
        });
        
        // Click the Track direct button
        console.log('🖱️ Clicking Track direct button...');
        await page.click('#wc-multi-form-button_direct');
        
        // Wait for new tab and get URL
        const carrierUrl = await newTabPromise;
        
        if (carrierUrl && !carrierUrl.includes('about:blank') && !carrierUrl.includes('track-trace.com')) {
            console.log(`🎉 Successfully extracted carrier URL: ${carrierUrl}`);
            
            // Detect carrier from URL
            let carrierName = 'External Tracking Site';
            if (carrierUrl.includes('emirates')) carrierName = 'Emirates SkyCargo';
            else if (carrierUrl.includes('thaiairways') || carrierUrl.includes('thaicargo')) carrierName = 'Thai Airways Cargo';
            else if (carrierUrl.includes('lufthansa')) carrierName = 'Lufthansa Cargo';
            else if (carrierUrl.includes('qatarairways')) carrierName = 'Qatar Airways Cargo';
            else if (carrierUrl.includes('etihad')) carrierName = 'Etihad Cargo';
            
            return res.json({
                success: true,
                awbNumber: trackingNumber,
                carrier: carrierName,
                directTrackingUrl: carrierUrl,
                method: 'track-trace-scrape',
                message: `Found carrier link! Redirecting to ${carrierName}...`,
                redirect: true,
                timestamp: new Date().toISOString()
            });
        } else {
            throw new Error('No valid carrier URL found');
        }

    } catch (error) {
        console.error('❌ Tracking error:', error.message);
        
        return res.status(500).json({
            success: false,
            error: 'Failed to extract tracking URL',
            details: error.message,
            fallbackUrl: `https://www.track-trace.com/aircargo?awb=${trackingNumber}`,
            timestamp: new Date().toISOString()
        });
    } finally {
        if (browser) {
            await browser.close();
        }
    }
});

// Start server
app.listen(PORT, () => {
    console.log('🚀 NFS Logistics Track-Trace API Server');
    console.log(`📡 Server running on port ${PORT}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
    console.log(`📦 Track endpoint: POST /api/track-scrape`);
    console.log('✅ Ready to process tracking requests!');
});

module.exports = app;
