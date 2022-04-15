import { Router } from "express";

import { getOuputByCode, updateOuputByCode } from "../controllers/output.controller.mjs";

const router = Router()

router.get('/:crawlerCode', getOuputByCode)
router.put('/', updateOuputByCode)

export default router