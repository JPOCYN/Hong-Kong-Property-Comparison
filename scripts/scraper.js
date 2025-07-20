const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

// District mapping for school nets
const districtSchoolNetMap = {
  // Hong Kong Island
  '中西區': '11',
  '灣仔': '12',
  '東區': '14',
  '南區': '16',
  
  // Kowloon
  '油尖旺': '31',
  '深水埗': '32',
  '九龍城': '34',
  '黃大仙': '35',
  '觀塘': '36',
  
  // New Territories
  '荃灣': '40',
  '屯門': '41',
  '元朗': '42',
  '北區': '43',
  '大埔': '44',
  '西貢': '45',
  '沙田': '46',
  '葵青': '47',
  '離島': '48'
};

// User agents for rotation
const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15'
];

// District regions mapping
const districtRegionMap = {
  '中西區': '港島',
  '灣仔': '港島',
  '東區': '港島',
  '南區': '港島',
  '油尖旺': '九龍',
  '深水埗': '九龍',
  '九龍城': '九龍',
  '黃大仙': '九龍',
  '觀塘': '九龍',
  '荃灣': '新界',
  '屯門': '新界',
  '元朗': '新界',
  '北區': '新界',
  '大埔': '新界',
  '西貢': '新界',
  '沙田': '新界',
  '葵青': '新界',
  '離島': '新界'
};

class HongKongPropertyScraper {
  constructor() {
    this.browser = null;
    this.page = null;
    this.estates = [];
    this.currentUserAgentIndex = 0;
  }

  async init() {
    console.log('🚀 Initializing scraper...');
    
    this.browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });

    this.page = await this.browser.newPage();
    
    // Set viewport
    await this.page.setViewport({ width: 1920, height: 1080 });
    
    // Set user agent
    await this.rotateUserAgent();
    
    console.log('✅ Scraper initialized successfully');
  }

  async rotateUserAgent() {
    const userAgent = userAgents[this.currentUserAgentIndex];
    await this.page.setUserAgent(userAgent);
    this.currentUserAgentIndex = (this.currentUserAgentIndex + 1) % userAgents.length;
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async scrapeDistrict(district) {
    console.log(`🏢 Scraping district: ${district}`);
    
    try {
      // Navigate to Centadata
      const url = `https://hk.centadata.com/pslx/P060.aspx?type=2&district=${encodeURIComponent(district)}`;
      await this.page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      
      // Wait for content to load
      await this.delay(2000);
      
      // Check if page loaded successfully
      const pageTitle = await this.page.title();
      if (pageTitle.includes('Error') || pageTitle.includes('404')) {
        console.log(`⚠️  Page not found for district: ${district}`);
        return [];
      }

      // Extract estate data
      const estates = await this.page.evaluate((districtName) => {
        const estateElements = document.querySelectorAll('.estate-item, .property-item, [data-estate]');
        const estates = [];

        estateElements.forEach((element) => {
          try {
            // Extract estate name
            const nameElement = element.querySelector('.estate-name, .property-name, h3, h4');
            const name = nameElement ? nameElement.textContent.trim() : '';

            // Extract address
            const addressElement = element.querySelector('.address, .location, .estate-address');
            const address = addressElement ? addressElement.textContent.trim() : '';

            // Extract building age
            const ageElement = element.querySelector('.building-age, .age, .estate-age');
            let buildingAge = 0;
            if (ageElement) {
              const ageText = ageElement.textContent.trim();
              const ageMatch = ageText.match(/(\d+)/);
              buildingAge = ageMatch ? parseInt(ageMatch[1]) : 0;
            }

            // Extract price per ft
            const priceElement = element.querySelector('.price-per-ft, .price, .estate-price');
            let pricePerFt = 0;
            if (priceElement) {
              const priceText = priceElement.textContent.trim();
              const priceMatch = priceText.match(/[\$]?([\d,]+)/);
              if (priceMatch) {
                pricePerFt = parseInt(priceMatch[1].replace(/,/g, ''));
              }
            }

            if (name) {
              estates.push({
                name,
                address: address || `${districtName}區`,
                district: districtName,
                region: districtName.includes('港島') ? '港島' : 
                       districtName.includes('九龍') ? '九龍' : '新界',
                buildingAge,
                pricePerFt,
                schoolNet: districtSchoolNetMap[districtName] || '00'
              });
            }
          } catch (error) {
            console.error('Error parsing estate element:', error);
          }
        });

        return estates;
      }, district);

      console.log(`✅ Found ${estates.length} estates in ${district}`);
      return estates;

    } catch (error) {
      console.error(`❌ Error scraping district ${district}:`, error.message);
      return [];
    }
  }

  async scrapeAllDistricts() {
    const districts = Object.keys(districtSchoolNetMap);
    console.log(`📋 Starting to scrape ${districts.length} districts...`);

    for (let i = 0; i < districts.length; i++) {
      const district = districts[i];
      
      // Rotate user agent every 5 requests
      if (i % 5 === 0) {
        await this.rotateUserAgent();
      }

      const districtEstates = await this.scrapeDistrict(district);
      this.estates.push(...districtEstates);

      // Rate limiting
      await this.delay(1000);

      // Progress update
      console.log(`📊 Progress: ${i + 1}/${districts.length} districts completed`);
    }
  }

  async saveData() {
    const outputPath = path.join(__dirname, '../public/estateData.json');
    
    // Remove duplicates based on name and district
    const uniqueEstates = this.estates.filter((estate, index, self) => 
      index === self.findIndex(e => e.name === estate.name && e.district === estate.district)
    );

    // Sort by district and name
    uniqueEstates.sort((a, b) => {
      if (a.district !== b.district) {
        return a.district.localeCompare(b.district);
      }
      return a.name.localeCompare(b.name);
    });

    // Format data for output
    const formattedEstates = uniqueEstates.map(estate => ({
      name: estate.name,
      address: estate.address,
      district: estate.district,
      region: estate.region,
      buildingAge: estate.buildingAge.toString(),
      schoolNet: estate.schoolNet,
      pricePerFt: estate.pricePerFt > 0 ? `$${estate.pricePerFt.toLocaleString()}` : '$0'
    }));

    try {
      await fs.writeFile(outputPath, JSON.stringify(formattedEstates, null, 2), 'utf8');
      console.log(`💾 Saved ${formattedEstates.length} estates to ${outputPath}`);
      return formattedEstates.length;
    } catch (error) {
      console.error('❌ Error saving data:', error);
      throw error;
    }
  }

  async run() {
    try {
      console.log('🏠 Hong Kong Property Scraper Starting...');
      console.log('📅', new Date().toLocaleString());
      
      await this.init();
      await this.scrapeAllDistricts();
      const savedCount = await this.saveData();
      
      console.log('🎉 Scraping completed successfully!');
      console.log(`📊 Total estates collected: ${savedCount}`);
      
    } catch (error) {
      console.error('❌ Scraping failed:', error);
      throw error;
    } finally {
      if (this.browser) {
        await this.browser.close();
        console.log('🔒 Browser closed');
      }
    }
  }
}

// Fallback data for when scraping fails
const fallbackData = [
  {
    "name": "泓都",
    "address": "西營盤第三街",
    "district": "中西區",
    "region": "港島",
    "buildingAge": "15",
    "schoolNet": "11",
    "pricePerFt": "$22,651"
  },
  {
    "name": "帝后華庭",
    "address": "灣仔軒尼詩道",
    "district": "灣仔",
    "region": "港島",
    "buildingAge": "18",
    "schoolNet": "12",
    "pricePerFt": "$24,500"
  },
  {
    "name": "太古城",
    "address": "鰂魚涌英皇道",
    "district": "東區",
    "region": "港島",
    "buildingAge": "35",
    "schoolNet": "14",
    "pricePerFt": "$18,200"
  },
  {
    "name": "海怡半島",
    "address": "鴨脷洲海怡路",
    "district": "南區",
    "region": "港島",
    "buildingAge": "28",
    "schoolNet": "16",
    "pricePerFt": "$16,800"
  },
  {
    "name": "凱旋門",
    "address": "尖沙咀柯士甸道",
    "district": "油尖旺",
    "region": "九龍",
    "buildingAge": "16",
    "schoolNet": "31",
    "pricePerFt": "$28,500"
  },
  {
    "name": "擎天半島",
    "address": "九龍灣宏光道",
    "district": "觀塘",
    "region": "九龍",
    "buildingAge": "12",
    "schoolNet": "46",
    "pricePerFt": "$15,200"
  },
  {
    "name": "日出康城",
    "address": "將軍澳康城路",
    "district": "西貢",
    "region": "新界",
    "buildingAge": "8",
    "schoolNet": "95",
    "pricePerFt": "$12,800"
  },
  {
    "name": "愉景灣",
    "address": "大嶼山愉景灣",
    "district": "離島",
    "region": "新界",
    "buildingAge": "25",
    "schoolNet": "3",
    "pricePerFt": "$14,500"
  },
  {
    "name": "沙田第一城",
    "address": "沙田銀城街",
    "district": "沙田",
    "region": "新界",
    "buildingAge": "35",
    "schoolNet": "91",
    "pricePerFt": "$13,200"
  },
  {
    "name": "荃灣中心",
    "address": "荃灣青山公路",
    "district": "荃灣",
    "region": "新界",
    "buildingAge": "30",
    "schoolNet": "62",
    "pricePerFt": "$11,800"
  }
];

// Main execution
async function main() {
  const scraper = new HongKongPropertyScraper();
  
  try {
    await scraper.run();
  } catch (error) {
    console.error('❌ Scraping failed, using fallback data...');
    
    // Save fallback data
    const outputPath = path.join(__dirname, '../public/estateData.json');
    await fs.writeFile(outputPath, JSON.stringify(fallbackData, null, 2), 'utf8');
    console.log(`💾 Saved ${fallbackData.length} fallback estates to ${outputPath}`);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { HongKongPropertyScraper, fallbackData }; 