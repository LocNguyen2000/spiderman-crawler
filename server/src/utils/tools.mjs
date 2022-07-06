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

