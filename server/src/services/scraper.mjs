import puppeteer from 'puppeteer'

/**
 * Crawl dữ liệu bằng selector được cho
 */
export const scraper = {
    browser: null,
    async initBrowser(){
        try {
            const browser = await puppeteer.launch({
                headless: false,
                args: ['--window-size=1920,1080'],
                defaultViewport: {
                    width: 1920,
                    height: 1080
                }
            })
            return browser;
        } catch (error) {
            console.log('Error when open browser');
        }
    },

    async run(type, urls, selectors) {
        let startTimer = performance.now()
        try {
            let resultData = []
            /**
             * Khởi tạo browser bằng puppeteer
             */
            this.browser = await this.initBrowser()
    
            const page = await this.browser.newPage();
            await page.setViewport({
                width: 1920,
                height: 1080
            })

            let pageOpenTimer = performance.now();
            let pagePfm = ((pageOpenTimer - startTimer)/ 1000).toPrecision(4)
            console.log('Browser & page open after %d', pagePfm);
    
            switch (type) {
                case 'xpath': {
                    for (let url of urls) {
                        let scrapeStartTimer = performance.now()

                        let resultObject = {}
    
                        await page.goto(url, { waitUntil: "networkidle2" });
    
                        selectors.map(async (slt) => {
    
                            await page.waitForXPath(slt.selectorXPath)
    
                            let elements = await page.$x(slt.selectorXPath);
                            let element = elements[0]
                            
                            elements.map(elm => {
                                console.log(elm);
                            });
    
                            let text;
                            switch(slt.tag){
                                case 'a': {
                                    text = await page.evaluate(element => element.href, element)
                                    break;
                                }
                                default: {
                                    text = await page.evaluate(element => element.textContent, element);
                                    break;
                                }
                            }
    
                            let meta = slt.metadata === '' ? `field_${slt.index}` : slt.metadata
                            resultObject[meta] = (text != null ? text : '' )

                        })
                        resultData.push(resultObject);

                        let scrapeEndTimer = performance.now()
                        let scrapePfm = ((scrapeEndTimer - scrapeStartTimer)/1000).toPrecision(4)
                        console.log(`Scrape ${url} after %d second...`, scrapePfm);
                    }
    
                    console.log('Crawl Data (XPath)')
                    console.log(resultData)
                    break
                }
    
                case 'css': {
                    for (let url of urls) {
                        let scrapeStartTimer = performance.now()

                        let resultObject = {}
    
                        await page.goto(url, { waitUntil: "networkidle2" });
    
                        selectors.map(async (slt) => {
    
                            await page.waitForSelector(slt.selectorCSS)
    
                            let text = await page.evaluate(sltObj => {
                                let dom = document.querySelectorAll(sltObj.selectorCSS)
                                let result
                                if (dom.length > 1){
                                    result = []
                                    switch(sltObj.tag){
                                        case 'a':{
                                            for (let index = 0; index < dom.length; index++) {
                                                result.push(dom[index].href)
                                            }
                                            break;
                                        }
                                        default: {
                                            for (let index = 0; index < dom.length; index++) {
                                                result.push(dom[index].textContent)
                                            }
                                            break;
                                        }
                                    }
                                }
                                else{
                                    result = (dom.length > 0 ? dom[0] : '')
                                }
                                return result
                            }, slt)
    
                            let meta = slt.metadata === '' ? `field_${slt.index}` : slt.metadata

                            resultObject[meta] = (text != null ? text : '' )
                        })
                        resultData.push(resultObject);

                        let scrapeEndTimer = performance.now()
                        let scrapePfm = ((scrapeEndTimer - scrapeStartTimer)/1000).toPrecision(4)
                        console.log(`Scrape ${url} after %d second...`, scrapePfm);
                    }
    
                    console.log('Crawl Data (CSS)')
                    console.log(resultData)
                    break
                }
            }
            let endTimer = performance.now()
            let pfm = ((endTimer - startTimer)/ 1000).toPrecision(4)
            console.log('Crawl data done in %d second.', pfm);
            
            await this.browser.close()
    
            return {data: resultData, performance: pfm}
        } catch (error) {
            console.log(error.message)
            throw error
        }
    }
}

