export const checkCrawlerCode = (crawlerCode) => {
    let pattern = /^CRWL-[0-9]{4}$/i

    let result = crawlerCode.match(pattern)
    return result
}
export const generateCrawlerCode = (dataLength) => {
    let code = ""
    let prefix = "CRWL-"

    dataLength = String(dataLength + 1)
    code = dataLength.padStart(4, '0')

    code = prefix + code;

    if (!checkCrawlerCode(code)) {
        return 'error'
    }
    return code
}
export const convertPathSelector = (pathSelectors) => {
    let result = ''
    pathSelectors.map(slt => {
        result += `${slt} `
    })
    result = result.slice(0, -1);
    console.log(result);
    return result

}

export const mappingOutput = (crawlerCode, crawlOutput) => {
    let result = {
        crawlerCode,
        headers: [],
        body: []
    }

    crawlOutput.map(output => {
        // Thêm header
        if (output.metadata === '' || output.metadata == null){
            result.headers.push(output.index)
        }
        // Thêm body
        result.body.push(output.value)
    })
    return result
}
