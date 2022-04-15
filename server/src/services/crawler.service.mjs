import puppeteer from 'puppeteer'

import {convertPathSelector} from '../utils/tools.mjs'
/**
 * Crawl dữ liệu bằng element được cho
 */
const crawlData = async (type, url ,elements) => {
    try {
        let resultData = []
        console.log(`-RUN-CRAWLER: ${type}-----\n`, elements);
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
        await page.goto(url)

        elements.map(async (elem) => {
            let elHtml;
            if (type == 'xpath'){
                await page.waitForXPath(elem.xPath)

                elHtml = await page.$x(elem.xPath)
            }
            else {
                let selectorString = convertPathSelector(elem.selectorPath)
                await page.waitForSelector(selectorString)

                elHtml = await page.$(selectorString)
            }
            let elContent = await page.evaluate(elHtml => elHtml.textContent, elHtml[0]);
            resultData.push(elContent)
        })

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
            console.log(response)
            elementData.push(response)
        });

        /**
         * Truyền vào page hàm sự kiện để lưu các hành vi người dùng
         */
        await page.evaluateOnNewDocument(() => {
        /**
          * @param element 
          * lấy kết quả đường đi XPath của 1 element
          */
            function getXPathTo(element) {
                if (element.id !== '')
                    return 'id("' + element.id + '")';
                if (element === document.body)
                    return element.tagName;

                var ix = 0;
                var siblings = element.parentNode.childNodes;
                for (var i = 0; i < siblings.length; i++) {
                    var sibling = siblings[i];
                    if (sibling === element)
                        return getXPathTo(element.parentNode) + '/' + element.tagName + '[' + (ix + 1) + ']';
                    if (sibling.nodeType === 1 && sibling.tagName === element.tagName)
                        ix++;
                }
            }

            /**
             * @param event
             * Sinh ra selector của element hiện tại
             * Trả về thẻ tag, tên class, id của đối tượng
             */
            function generateElementData(event, index) {
                let element = {
                    index,
                    tag: event.path[0].localName,
                    className: event.path[0].className,
                    id: event.path[0].id,
                    selectorPath: [],
                    xPath: getXPathTo(event.target),
                    eventType: event.type,
                }

                for (const node of event.path) {
                    let tag = node.localName
                    let className = node.className
                    let id = node.id

                    let selectorString = ""
                    if (tag) {
                        selectorString += tag
                    }
                    if (id) {
                        selectorString += `#${id}`
                    }
                    if (className) {
                        className = className.replace(" ", ".")
                        className = "." + className
                        selectorString += className
                    }

                    element.selectorPath.push(selectorString)
                }
                while (element.selectorPath.length > 2) {
                    element.selectorPath.pop()
                }

                element.selectorPath.reverse()
                return element
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
                 * Disabled tất cả button
                 */
                document.body.querySelectorAll('button').forEach(button => {
                    button.setAttribute('disabled', true)
                })
                /**
                 * Disabled tất cả link a href
                 */
                document.body.querySelectorAll('a').forEach(link => {
                    link.onclick = function () { return false }
                })
                /**
                 * Bắt sự kiện click
                 * Lưu lại selector của element
                 */
                let elementCounter = 0
                document.body.addEventListener("click", (event) => {
                    let result = generateElementData(event, ++elementCounter);
                    window.saveEvent(result);
                    alert('Lưu thành công dữ liệu của element')
                });
                /**
                 *  Sự kiện chuột Hover
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
        console.log("FinalData:", elementData);
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