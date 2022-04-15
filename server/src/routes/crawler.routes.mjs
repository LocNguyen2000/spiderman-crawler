import { Router } from "express";

import { getAllCrawlers, getCrawlerByCode, addCrawler, deleteCrawler, updateCrawler, generateNewCrawlerCode, runCrawler } from "../controllers/crawler.controller.mjs";

const router = Router()

router.get('/newCrawlerCode', generateNewCrawlerCode)
router.get('/', getAllCrawlers)
router.get('/:crawlerCode', getCrawlerByCode)

router.delete('/:crawlerCode', deleteCrawler)

router.post('/', addCrawler)
router.post('/run', runCrawler)

router.put('/:crawlerCode', updateCrawler)



export default router