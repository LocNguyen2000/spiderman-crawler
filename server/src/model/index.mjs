import mongoose from 'mongoose'

const elementSchema = new mongoose.Schema({
    crawlerCode: { type: String, required: true },
    index: { type: Number },
    metadata: { type: String },
    tag: { type: String },
    id: { type: String },
    className: { type: String },
    eventType: { type: String },
})

const outputSchema = new mongoose.Schema({
    crawlerCode: { type: String, required: true},
    headers: { type: Array },
    body: { type: Array }
})

const crawlerSchema = new mongoose.Schema({
    crawlerId: { type: mongoose.Types.ObjectId },
    crawlerCode: { type: String, required: true, unique: true},
    crawlerName: { type: String, required: true },
    urlSingle: { type: String, required: true },
    urlMany: { type: Array },
    isPaginated: {type: Boolean },
    startPage: { type: String },
    endPage: { type: String },
    description: {type: String },
    modifiedDate: { type: Date }
})

export const Crawlers = mongoose.model('crawler', crawlerSchema)
export const Elements = mongoose.model('element', elementSchema)
export const Outputs = mongoose.model('output', outputSchema)
