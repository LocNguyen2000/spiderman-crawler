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

    if (checkCrawlerCode(code)) {
        return code
    }
    else return 'error'
}
export const computedElementToSelector = (elements) => {
    let computedElements = []


    // combine selector at each element
    for (let i = 0; i < elements.length; i++) {
        const element = elements[i];

        let selector = ""

        // thêm mới selector
        if (element.tag) {
            selector += `${element.tag}`
        }
        element.id.split(' ').map((str) => {
            if (str) {
                selector += `.${str}`
            }
        })

        element.className.split(' ').map((str) => {
            if (str) {
                selector += `.${str}`
            }
        })
        computedElements.push({
            index: element.index,
            crawlerCode: element.crawlerCode,
            metadata: element.metadata,
            selector
        })
    }

    return computedElements;
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

// console.log(computedElementToSelector([
//     {
//         "_id": "6255648f921fe6462116c447",
//         "crawlerCode": "CRWL-0001",
//         "index": 0,
//         "metadata": "",
//         "tag": "div",
//         "id": "",
//         "className": "product-price__current-price",
//         "__v": 0
//     },
//     {
//         "_id": "6255648f921fe6462116c448",
//         "crawlerCode": "CRWL-0001",
//         "index": 1,
//         "metadata": "",
//         "tag": "h1",
//         "id": "",
//         "className": "title",
//         "__v": 0
//     },
//     {
//         "_id": "6255648f921fe6462116c449",
//         "crawlerCode": "CRWL-0001",
//         "index": 2,
//         "metadata": "",
//         "tag": "p",
//         "id": "",
//         "className": "styles__SelectedOption-sc-1dwa5s5-1 HFIkz option-name",
//         "__v": 0
//     }
// ]));