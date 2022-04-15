import { Crawlers, Elements } from "../model/index.mjs";

export const getElementsByCode = async (req, res) => {
    try {
        const { crawlerCode } = req.query

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


export const updateElements = async (req, res) => {
    try {
        const { crawlerCode, elements } = req.body

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