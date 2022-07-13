export const checkCrawlerCode = (crawlerCode) => {
    let pattern = /^CRWL-[0-9]{4}$/i

    let result = crawlerCode.match(pattern)
    return result
}

export const generateCrawlerCode = (dataLength) => {
    let code = ""

    dataLength = String(dataLength + 1)
    code = dataLength.padStart(4, '0')

    return code
}

export const processOutput = (arr) =>  {
    let final = []

    arr.map(obj => {
        let keys = Object.keys(obj)
        for (let i = 0; i < obj[keys[0]].length; i++) {
            let result = {}
            for (let key of keys){
                result[key] = obj[key][i]
            }
            final.push(result)
        } 
    })
    return final;
}