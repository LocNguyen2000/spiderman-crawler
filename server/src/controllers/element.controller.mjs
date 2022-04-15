import { Crawlers, Elements } from "../model/index.mjs";
import crawlerService from "../services/crawler.service.mjs";

export const getElementsByCode = async (req, res) => {
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

        // lấy element
        const elements = await Elements.find({crawlerCode})

        console.log(elements);
        
        return res.status(200).json(elements)
    } catch (error) {
        console.log(error);
        return res.status(500).json("Lỗi của Server. Xin liên hệ dev để xử lý vấn đề này")
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
        const { crawlerCode } = req.params

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

export const updateElements = async (req, res) => {
    try {
        const { crawlerCode } = req.params
        const { elements } = req.body

        // validate crawler code
        if (!crawlerCode) {
            return res.status(404).json('Trường thông tin gửi không được để trống')
        }

        const crawlerData = await Crawlers.findOne({ crawlerCode })

        if (!crawlerData) {
            return res.status(404).json('Crawler không tồn tại')
        }
        
        // cập nhật nhiều elements 
        // (xóa hết r tạo lại)      
        await Elements.deleteMany({ crawlerCode: crawlerData.crawlerCode })
        
        // tạo mới nhiều elements
        elements.map(async (element) => {
            element.crawlerCode = crawlerData.crawlerCode

            // validate element
            // ...

            const newElement = new Elements(element)
            await newElement.save()
        })

        return res.status(200).json("Cập nhật elements thành công")
    } catch (error) {
        console.log(error);
        return res.status(400).json("Lỗi request dữ liệu", error.message)
    }
}