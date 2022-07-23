export const checkCrawlerCode = (crawlerCode) => {
    let pattern = /^CRWL-[0-9]{4}$/i

    let result = crawlerCode.match(pattern)
    return result
}

export const generateCrawlerCode = (data) => {
    let code = ""
    let max = 0
    // dataLength = String(dataLength + 1)
    data.map(obj => {
        let value = obj.crawlerCode.replace( /^\D+/g, '')

        value = parseInt(value)

        if (value > max){
            max = value;
        }
    })


    code = (max+1).toString().padStart(4, '0')

    return code
}

export const processOutput = (arr) =>  {
    let final = []

    arr.map(obj => {
        let keys = Object.keys(obj)
        for (let i = 0; i < obj[keys[0]].length; i++) {
            let result = {}
            for (let key of keys){
                if (obj[key][i] != null || obj[key][i] != undefined){
                    result[key] = obj[key][i]
                }
                else {
                    result[key] = ""
                }
            }
            final.push(result)
        } 
    })
    return final;
}