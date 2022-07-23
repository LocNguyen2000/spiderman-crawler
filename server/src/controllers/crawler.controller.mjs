import { Crawlers, Selectors, Data } from "../model/index.mjs";
import { scraper } from "../services/scraper.mjs";
import { generateCrawlerCode, processOutput } from "../utils/tools.mjs";


export const generateNewCrawlerCode = async (req, res) => {
    try {
        const crawlerData = await Crawlers.find()

        const newCode = generateCrawlerCode(crawlerData)

        console.log(newCode);

        return res.status(200).json(newCode)
    } catch (error) {
        console.log(error);
        return res.status(500).json("Lỗi của Server. Xin liên hệ dev để xử lý vấn đề này")

    }
}

export const getAllCrawlers = async (req, res) => {
    try {
        let TotalUrls = 0, TotalDataAmount = 0, totalPfmTime = 0, AveragePfmTime;
        let counter = 0;
        
        const crawlersInDB = await Crawlers.find()
        
        if (crawlersInDB.length < 0) return res.status(200).json([])
        
        const outputsInDB = await Data.find()

        crawlersInDB.map(crawler => {
            if (crawler.urls){
                TotalUrls += crawler.urls.length
            }
            if (crawler.performance){
                totalPfmTime += parseFloat(crawler.performance); 
                counter++
            }
        })

        AveragePfmTime = (totalPfmTime / counter).toPrecision(4);

        outputsInDB.map(output => {
            if (output.data){
                TotalDataAmount += output.data.length;
            }
        })

        return res.status(200).json({Data: crawlersInDB, TotalUrls, TotalDataAmount, AveragePfmTime })
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
        const outputsData = await Data.findOne({ crawlerCode })

        if (!crawlerData) return res.status(404).json("Không tồn tại Crawler")

        let result = {
            crawler: crawlerData,
            selectors: selectorsData,
            outputs: (outputsData != null) ? outputsData.data : []
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
        await Data.deleteOne({ crawlerCode })

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
            crawler.modifiedDate = new Date()

            const newCrawler = new Crawlers(crawler)
            await newCrawler.save()

            // tạo mới nhiều selectors
            selectors.map(async (selector) => {
                selector.crawlerCode = crawler.crawlerCode
                selector.modifiedDate = new Date()

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
            
        crawler.modifiedDate = new Date()
        
        // cập nhật dựa trên tên của crawler
        crawlerData = await Crawlers.updateOne({
            crawlerCode,
        }, crawler)
        
        // cập nhật nhiều selectors (xóa hết r tạo lại)      
        await Selectors.deleteMany({ crawlerCode: crawler.crawlerCode })

        // tạo mới nhiều selectors
        selectors.map(async (selector) => {
            selector.crawlerCode = crawlerCode
            selector.modifiedDate = new Date()

            const newElement = new Selectors(selector)
            await newElement.save()
        })

        // log ra crawler đã được cập nhật
        console.log("Cập nhật crawler thành công... \n", crawlerData);

        return res.status(200).json("Cập nhật thành công!")
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
            return res.status(404).json('Crawler must be saved before crawling data')
        }

        // lấy dữ liệu selector của crawler
        let selectorsData = await Selectors.find({ crawlerCode })

        // không đủ dữ liệu
        if (selectorsData.length <= 0) {
            return res.status(404).json('Selectors must be extracted before crawling data')
        }

        let output = await scraper.run(crawlerData.selectorType, crawlerData.urls, selectorsData)
        
        let result = processOutput(output.data);
        console.log('Processing Output...\n', result.length > 0 ? result[1] : result);
        
        // update hiệu năng crawler
        crawlerData.performance = output.performance;
        await Crawlers.findOneAndUpdate({crawlerCode}, crawlerData);

        // save dữ liệu
        let obj = {
            crawlerCode,
            data: result,
            modifiedDate: new Date()
        }

        let dataInDB = await Data.findOne({crawlerCode})
        if (dataInDB){
            await Data.updateOne({crawlerCode}, obj)
        }      
        else{
            let newData = new Data(obj);
            await newData.save()
        }

        return res.status(200).json(result)
    } catch (error) {
        console.error(error);
        return res.status(400).json(`Có vấn đề với request: ${error.message}`)
    }
}
