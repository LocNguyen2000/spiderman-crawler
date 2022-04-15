import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'

import crawlerRouter from './routes/crawler.routes.mjs'
import elementRouter from './routes/element.routes.mjs'
import outputRouter from './routes/output.routes.mjs'

const app = express()
const port = 4000 || process.env.PORT

mongoose.connect('mongodb://localhost:27017/crawlers')

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())

app.use('/crawler', crawlerRouter)
app.use('/element', elementRouter)
app.use('/output', outputRouter)

app.listen(port, () => {
    console.log(`App connected successfully on port ${port}`)
})
