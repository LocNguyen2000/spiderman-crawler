import { Crawlers, Outputs } from "../model/index.mjs";

export const getOuputByCode = async (req, res) => {
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
    
        const outputData = await Outputs.find({crawlerCode})
    
        return res.status(200).json(outputData)
    } catch (error) {
        console.log(error);
        return res.status(500).json('Lỗi của server. Xin liên hệ dev để xử lý vấn đề này')
    }
}

export const updateOuputByCode = async (req, res) => {
    try {
        const { output } = req.body;



        return res.status(200).json(output)
        
    } catch (error) {
        console.log(error);
        return res.status(500).json('Lỗi của server. Xin liên hệ dev để xử lý vấn đề này')
    }
}