import { Router } from "express";

import { getElementsByCode, updateElements } from "../controllers/element.controller.mjs"

const router = Router()

router.get('/:crawlerCode', getElementsByCode)
router.put('/', updateElements)

export default router

