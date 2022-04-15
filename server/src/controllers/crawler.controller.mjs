import { Crawlers, Elements, Outputs } from "../model/index.mjs";
import crawlerService from "../services/crawler.service.mjs";
import { generateCrawlerCode, mappingOutput } from "../utils/tools.mjs";

export const generateNewCrawlerCode = async (req, res) => {
    try {
        const crawlerData = await Crawlers.find()

        const newCode = generateCrawlerCode(crawlerData.length)

        console.log(newCode);

        return res.status(200).json(newCode)
    } catch (error) {
        console.log(error);
        return res.status(500).json("Lỗi của Server. Xin liên hệ dev để xử lý vấn đề này")

    }
}

export const getAllCrawlers = async (req, res) => {
    try {
        const crawlerData = await Crawlers.find()
        if (crawlerData.length < 0) return res.status(200).json([])

        return res.status(200).json(crawlerData)
    } catch (error) {
        console.error(error);
        return res.status(500).json("Lỗi của Server. Xin liên hệ dev để xử lý vấn đề này")
    }
}
export const getCrawlerByCode = async (req, res) => {
    try {
        const { crawlerCode } = req.query;

        const crawlerData = await Crawlers.findOne({ crawlerCode })

        if (!crawlerData) return res.status(404).json("Không tồn tại Crawler")

        return res.status(200).json(crawlerData)
    } catch (error) {
        console.error(error);
        return res.status(500).json("Lỗi của Server. Xin liên hệ dev để xử lý vấn đề này")
    }
}
export const deleteCrawler = async (req, res) => {
    try {
        const { crawlerCode } = req.query

        if (!crawlerCode) {
            return res.status(404).json('Trường thông tin gửi không được để trống')
        }

        const crawlerData = await Crawlers.findOne({ crawlerCode })

        if (!crawlerData) {
            return res.status(404).json('Crawler không tồn tại')
        }

        await Crawlers.deleteOne({ crawlerCode })
        await Elements.deleteMany({ crawlerCode })

        return res.status(200).json("Đã xóa thành công")
    } catch (error) {
        console.error(error);
        return res.status(404).json(`Request có vấn đề: ${error.message}`)
    }
}

// Tạo mới 2 dữ liệu crawler và element
export const addCrawler = async (req, res) => {
    try {
        let { crawler, elements } = req.body

        // validate dữ liệu 
        const crawlerData = await Crawlers.findOne({ crawlerCode: crawler.crawlerCode })

        if (crawlerData) return res.status(400).json("Crawler đã tồn tại")
        else {
            // đủ thì tạo mới dữ liệu
            const newCrawler = new Crawlers(crawler)
            await newCrawler.save()

            // tạo mới nhiều elements
            elements.map(async (element) => {
                element.crawlerCode = crawler.crawlerCode

                // validate element
                // ...

                const newElement = new Elements(element)
                await newElement.save()
            })
        }
        return res.status(201).json("Tạo mới Crawler thành công")
    } catch (error) {
        console.error(error);
        return res.status(400).json(`Lỗi tạo mới Crawerl: ${error.message}`)
    }
}

// Cập nhật theo 2 dữ liệu crawler và element
export const updateCrawler = async (req, res) => {
    try {
        // lấy tham số trong body của request
        let { crawler, elements } = req.body

        if (!crawler) {
            return res.status(404).json('Trường thông tin còn thiếu')
        }

        // kiểm tra crawler tồn tại
        let crawlerData = await Crawlers.findOne({ crawlerCode: crawler.crawlerCode })
        if (!crawlerData) {
            return res.status(404).json('Không tồn tại crawler')
        }

        // cập nhật dựa trên tên của crawler
        crawlerData = await Crawlers.updateOne({
            crawlerCode: crawler.crawlerCode
        }, crawler)

        // cập nhật nhiều elements (xóa hết r tạo lại)      
        await Elements.deleteMany({ crawlerCode: crawler.crawlerCode })
        // tạo mới nhiều elements
        elements.map(async (element) => {
            element.crawlerCode = crawlerData.crawlerCode

            // validate element
            // ...

            const newElement = new Elements(element)
            await newElement.save()
        })

        // log ra crawler đã được cập nhật
        console.log("Cập nhật crawler:", crawlerData);

        return res.status(200).json("Cập nhật thành công")
    } catch (error) {
        console.log(error);
        return res.status(400).json(`Request có vấn đề ${error.message}`)
    }
}

// Cập nhật theo 1 dữ liệu Element
/**
 * Hàm chạy api để lấy element bằng hàm lưu sự kiện user
 * @param req: Chứa url cần để chạy method  
 */
export const getPageElement = async (req, res) => {
    try {
        // 1. Lấy page Url
        let { crawlerCode } = req.body

        if (!crawlerCode) {
            return res.status(404).json('Trường thông tin còn thiếu')
        }

        let crawlerData = await Crawlers.findOne({ crawlerCode })
        if (!crawlerData) {
            return res.status(404).json('Không tồn tại crawler')
        }

        // 2. chạy hàm 
        let elements = await crawlerService.recordUserEvent(crawlerData.urlSingle)
        console.log(elements);

        if (elements.length == 0) return res.status(200).json([])

        // cập nhật nhiều elements (xóa hết r tạo lại)      
        await Elements.deleteMany({ crawlerCode })
        // tạo mới nhiều elements
        elements.map(async (element) => {
            element.crawlerCode = crawlerData.crawlerCode

            // validate element
            // ...

            const newElement = new Elements(element)
            await newElement.save()
        })

        // Truy vấn lại crawler đã được cập nhật
        console.log("Cập nhật crawler:", crawlerData);

        return res.status(200).json("Lấy element thành công")
    } catch (error) {
        console.error(error);
        return res.status(400).json(`Lỗi lấy element của trang: ${error.message}`)
    }
}

/**
* Mô tả : Crawl dữ liệu bằng element đang có
* Created by: Nguyễn Hữu Lộc - MF1099
* Created date: 15:39 10/04/2022
*/

export const runCrawler = async (req, res) => {
    try {
        const { crawler } = req.body;

        // validate dữ liệu
        if (!crawler) {
            return res.status(400).json('Trường thông tin còn thiếu')
        }

        // kiểm tra crawler tồn tại
        let crawlerData = await Crawlers.findOne({ crawlerCode: crawler.crawlerCode })
        if (!crawlerData) {
            return res.status(404).json('Không tồn tại crawler')
        }

        // lấy dữ liệu element của crawler
        let elementsData = await Elements.find({crawlerCode: crawler.crawlerCode})

        // không đủ dữ liệu
        if (elementsData.length <= 0) {
            return res.status(400).json('Không đủ dữ liệu để crawl. Cần crawl dữ liệu element trước')
        }

        let output = await crawlerService.crawlData(crawler, elementsData)
        console.log(output);

        // biến đổi dạng dữ liệu và lưu vào DB
        const mappedOutput = mappingOutput(crawler.crawlerCode, output)
        
        const outputData = new Outputs(mappedOutput)
        await outputData.save()

        return res.status(200).json("Crawl dữ liệu thành công")
    } catch (error) {
        console.error(error);
        return res.status(400).json(`Có vấn đề với request: ${error.message}`)
    }
}
