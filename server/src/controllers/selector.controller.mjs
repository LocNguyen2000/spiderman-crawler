import { Crawlers, Selectors } from "../model/index.mjs";
import { recorder } from "../services/recorder.mjs";

export const getSelectorsByCode = async (req, res) => {
    try {
        const { crawlerCode } = req.params

        // validate crawler code
        if (!crawlerCode) {
            return res.status(404).json('Trường thông tin gửi không được để trống')
        }

        const crawlerData = await Crawlers.findOne({ crawlerCode })

        if (!crawlerData) {
            return res.status(404).json('Crawler không tồn tại')
        }

        // lấy selector
        const selectors = await Selectors.find({crawlerCode})

        console.log(selectors);
        
        return res.status(200).json(selectors)
    } catch (error) {
        console.log(error);
        return res.status(500).json("Lỗi của Server. Xin liên hệ dev để xử lý vấn đề này")
    }
}

// Cập nhật theo 1 dữ liệu Element
/**
 * Hàm chạy api để lấy selector bằng hàm lưu sự kiện user
 * @param req: Chứa url cần để chạy method  
 */
 export const getPageSelectors = async (req, res) => {
    try {
        // 1. Lấy page Url
        const { crawlerCode } = req.params

        if (!crawlerCode) {
            return res.status(404).json('Trường thông tin còn thiếu')
        }

        let crawlerData = await Crawlers.findOne({ crawlerCode })
        if (!crawlerData) {
            return res.status(404).json('Không tồn tại crawler')
        }

        // 2. chạy hàm 
        let extractedSelectors = await recorder.run(crawlerData.urls[0])
        
        console.log('Lấy selectors của trang...');
        console.log(extractedSelectors);

        if (extractedSelectors.length == 0) return res.status(200).json([])

        // cập nhật nhiều selectors (xóa hết r tạo lại)      
        await Selectors.deleteMany({ crawlerCode })
        
        // tạo mới nhiều selectors
        extractedSelectors.map(async (selector) => {
            selector.crawlerCode = crawlerData.crawlerCode
            selector.modifiedDate = new Date()

            console.log(selector);

            const newElement = new Selectors(selector)
            await newElement.save()
        })

        return res.status(200).json(extractedSelectors)
    } catch (error) {
        console.error(error);
        return res.status(400).json(`Lỗi lấy selector của trang: ${error.message}`)
    }
}

export const updateElements = async (req, res) => {
    try {
        const { crawlerCode } = req.params
        const { selectors } = req.body

        // validate crawler code
        if (!crawlerCode) {
            return res.status(404).json('Trường thông tin gửi không được để trống')
        }

        const crawlerData = await Crawlers.findOne({ crawlerCode })

        if (!crawlerData) {
            return res.status(404).json('Crawler không tồn tại')
        }
        
        // cập nhật nhiều selectors (xóa hết r tạo lại)   
        await Selectors.deleteMany({ crawlerCode: crawlerData.crawlerCode })
        
        // tạo mới nhiều selectors

        selectors.map(async (selector) => {
            selector.crawlerCode = crawlerData.crawlerCode
            selector.modifiedDate = new Date()

            const newElement = new Selectors(selector)
            await newElement.save()
        })

        return res.status(200).json("Cập nhật selector thành công")
    } catch (error) {
        console.log(error);
        return res.status(400).json("Lỗi request dữ liệu", error.message)
    }
}