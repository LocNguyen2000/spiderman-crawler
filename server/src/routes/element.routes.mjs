import { Router } from "express";

import { getElementsByCode, getPageElement, updateElements } from "../controllers/element.controller.mjs"

const router = Router()

router.get('/:crawlerCode', getElementsByCode)

router.put('/extract/:crawlerCode', getPageElement)
router.put('/:crawlerCode', updateElements)

export default router

