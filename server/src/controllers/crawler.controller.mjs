import { Crawlers, Selectors, Data } from "../model/index.mjs";
import { scraper } from "../services/crawler.mjs";
import { generateCrawlerCode } from "../utils/tools.mjs";

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
        const { crawlerCode } = req.params;

        const crawlerData = await Crawlers.findOne({ crawlerCode })
        const selectorsData = await Selectors.find({ crawlerCode })

        if (!crawlerData) return res.status(404).json("Không tồn tại Crawler")

        let result = {
            crawler: crawlerData,
            selectors: selectorsData
        }

        return res.status(200).json(result)
    } catch (error) {
        console.error(error);
        return res.status(500).json("Lỗi của Server. Xin liên hệ dev để xử lý vấn đề này")
    }
}
export const deleteCrawler = async (req, res) => {
    try {
        const { crawlerCode } = req.params

        if (!crawlerCode) {
            return res.status(404).json('Trường thông tin gửi không được để trống')
        }

        const crawlerData = await Crawlers.findOne({ crawlerCode })

        if (!crawlerData) {
            return res.status(404).json('Crawler không tồn tại')
        }

        await Crawlers.deleteOne({ crawlerCode })
        await Selectors.deleteMany({ crawlerCode })

        return res.status(200).json("Đã xóa thành công")
    } catch (error) {
        console.error(error);
        return res.status(404).json(`Request có vấn đề: ${error.message}`)
    }
}

// Tạo mới 2 dữ liệu crawler và element
export const addCrawler = async (req, res) => {
    try {
        let { crawler, selectors } = req.body

        // validate dữ liệu 
        const crawlerData = await Crawlers.findOne({ crawlerCode: crawler.crawlerCode })

        if (crawlerData) return res.status(400).json("Crawler đã tồn tại")
        else {
            // đủ thì tạo mới dữ liệu
            const newCrawler = new Crawlers(crawler)
            await newCrawler.save()

            // tạo mới nhiều selectors
            selectors.map(async (selector) => {
                selector.crawlerCode = crawler.crawlerCode

                const newSelector = new Selectors(selector)
                await newSelector.save()
            })
        }
        return res.status(201).json("Tạo mới Crawler thành công")
    } catch (error) {
        console.error(error);
        return res.status(400).json(`Lỗi tạo mới Crawerl: ${error.message}`)
    }
}

// Cập nhật theo 2 dữ liệu crawler và selector
export const updateCrawler = async (req, res) => {
    try {
        const { crawlerCode } = req.params
        let { crawler, selectors } = req.body

        if (!crawler) {
            return res.status(404).json('Trường thông tin còn thiếu')
        }

        // kiểm tra crawler tồn tại
        let crawlerData = await Crawlers.findOne({ crawlerCode })
        if (!crawlerData) {
            return res.status(404).json('Không tồn tại crawler')
        }

        // kiểm tra mã crawler cập nhật có tồn tại 
        if (crawler.crawlerCode && crawlerCode != crawlerData.crawlerCode){
            crawlerData = await Crawlers.findOne({ crawlerCode: crawler.crawlerCode })
            if (crawlerData){
                return res.status(404).json('Mã crawler cập nhật đã tồn tại')
            }
        }

        // cập nhật dựa trên tên của crawler
        crawlerData = await Crawlers.updateOne({
            crawlerCode
        }, crawler)

        // cập nhật nhiều selectors (xóa hết r tạo lại)      
        await Selectors.deleteMany({ crawlerCode: crawler.crawlerCode })

        // tạo mới nhiều selectors
        selectors.map(async (selector) => {
            selector.crawlerCode = crawlerData.crawlerCode

            const newElement = new Selectors(selector)
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

/**
* Mô tả : Crawl dữ liệu bằng selector đang có
* selector - xpath
* Created by: Nguyễn Hữu Lộc - MF1099
* Created date: 15:39 10/04/2022
*/

export const runCrawler = async (req, res) => {
    try {
        const { crawlerCode } = req.params

        // validate dữ liệu
        if (!crawlerCode) {
            return res.status(400).json('Không tìm thấy mã crawler đầu vào')
        }

        // kiểm tra crawler tồn tại
        let crawlerData = await Crawlers.findOne({ crawlerCode })
        if (!crawlerData) {
            return res.status(404).json('Không tồn tại crawler')
        }

        // lấy dữ liệu selector của crawler
        let selectorsData = await Selectors.find({ crawlerCode })

        // không đủ dữ liệu
        if (selectorsData.length <= 0) {
            return res.status(400).json('Không đủ dữ liệu để crawl. Cần crawl dữ liệu selector trước')
        }

        let output = await scraper(crawlerData.selectorType, crawlerData.urls, selectorsData)
        
        // save dữ liệu
        let data = new Data ({
            crawlerCode,
            data: output
        })
        await data.save()

        return res.status(200).json(data)
    } catch (error) {
        console.error(error);
        return res.status(400).json(`Có vấn đề với request: ${error.message}`)
    }
}
