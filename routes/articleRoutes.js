import { Router } from 'express'
import { createArticle, getAllArticles } from '../controllers/articleController.js'
import  protect, {adminOnly}  from '../middleware/verifyToken.js'

const router = Router()

router.get('/all', getAllArticles)
router.post('/createArticle',  protect, adminOnly , createArticle)

export default router