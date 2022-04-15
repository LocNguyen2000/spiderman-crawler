import puppeteer from 'puppeteer'

import { computedElementToSelector } from "../utils/tools.mjs"

/**
 * Crawl dữ liệu bằng element được cho
 * ĐÃ VALIDATE DỮ LIỆU
 */
 const crawlData = async (crawler, elements) => {
    let computedSelectors = computedElementToSelector(elements)
    console.log('-RUN-CRAWLER: SELECTORS-----\n', computedSelectors);
    try {
        /**
         * Khởi tạo browser bằng puppeteer
         */
        const browser = await puppeteer.launch({
            headless: false,
            defaultViewport: null,
            args: ['--start-maximized'],
        })
        const page = await browser.newPage();
        await page.setViewport({
            width: 1560,
            height: 1000,
        })

        /**
         * Chạy đến trang
         */
        await page.goto(crawler.urlSingle)

        let resultData = await page.evaluate((selectors) => {
            let data = [];

            for (let slt of selectors){
                let html = document.querySelector(slt.selector)
                let value = ''
                if (html){
                     value = html.textContent
                }

                data.push({
                    index: slt.index,
                    metadata: slt.metadata,
                    value
                })
            }

            return data
        }, computedSelectors)

        await browser.close()

        return resultData
    } catch (error) {
        console.log(error.message)
        throw error.message
    }
}


/**
 * Hàm lưu sự kiện người dùng
 * @param url 
 */
const recordUserEvent = async (url) => {
    let elementData = []
    try {
        /**
         * Khởi tạo browser bằng puppeteer
         */
        const browser = await puppeteer.launch({
            headless: false,
            defaultViewport: null,
            args: ['--start-maximized'],
        })
        const page = await browser.newPage();
        await page.setViewport({
            width: 1560,
            height: 1000,
        })

        /**
         * Tiêm vào window 1 hàm của module recordEvent2
         * dùng để lưu các kết quả là element mà người dùng đã chọn
         */
        await page.exposeFunction('saveEvent', response => {
            // console.log(response)
            elementData.push(...response)
        });

        /**
         * Truyền vào page hàm sự kiện để lưu các hành vi người dùng
         */
        await page.evaluateOnNewDocument(() => {
            /**
             * @param context
             * Sinh ra selector của element hiện tại
             * Trả về thẻ tag, tên class, id của đối tượng
             */
            function generateSelector(context, elementIndex) {
                let elements = []

                if (!context) console.log('not an dom reference');
                
                for (const path of context.path) {
                    let elementObject = {
                        index: elementIndex,
                        metadata: "",
                        tag: path.localName,
                        className: path.className,
                        id: path.id,
                    }
                    elements.push(elementObject)
                }
                while (elements.length > 1) {
                    elements.pop()
                }
                console.log(elements);
                return elements
            }

            /**
             * @param event
             *  xử lý sự kiện hover của chuột 
             *  để hiển thị thẻ tag hiện tại muốn chỉ tới
             */
            function hoverHandler(event) {
                if (event.type == "mouseover") {
                    event.target.style.outline = "2px dashed #019160";
                }
                else if (event.type == "mouseout") {
                    event.target.style.outline = "none";
                }
            }

            /**
             * Truyền hàm sự kiện DOM khi đã load xong page
             */
            document.addEventListener("DOMContentLoaded", () => {
                /**
                 * Bắt sự kiện click
                 * Lưu lại selector của element
                 */
                let elementIndex = 0;
                document.body.addEventListener("click", (event) => {
                    let result = generateSelector(event, elementIndex);
                    elementIndex += 1;
                    window.saveEvent(result);
                    alert('Lưu thành công dữ liệu của element')
                });
                /**
                 * Bắt sự kiện chuột di chuyển ra và vào div
                 */
                document.body.onmouseover = document.body.onmouseout = hoverHandler
            })
        });

        await page.goto(url)
        await page
            .waitForNavigation()
            .then(async () => {
                await browser.close()
            })
            .catch((error) => {
                console.log('Navigation done')
            })
    } catch (error) {
        console.log(error.message)
        throw error.message
    } finally {
        return elementData
    }
}

/**
 * Validate dữ liệu crawler 
 */
const validateRequiredCrawler = (crawler) => {
    const { crawlerCode, crawlerName, urlSingle } = crawler
    if (crawlerCode && crawlerName && urlSingle) {
        // cần validate thêm

        // trả về crawler.
        return crawler
    }
    return null
}

export default {
    recordUserEvent, validateRequiredCrawler, crawlData
}