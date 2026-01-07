const express = require('express');
const router =express.Router();
const{ createRegionWithStructure,getAllRegionsWithStructure,createArticle,updateArticle,deleteArticle,
    getAllArticles,getArticleById,updateArticleStatus,updateRegionByName,deleteRegionByName,deleteArticleByTitle

} = require('../controllers/articles');

router.post('/create-region',createRegionWithStructure);
router.get('/all-regions', getAllRegionsWithStructure);
router.patch('/update-region/:name', updateRegionByName);
router.delete('/delete-region/:name', deleteRegionByName)
router.post('/create-article', createArticle);
router.patch('/update-article/:id', updateArticle);
router.delete('/delete-article/:id', deleteArticle);
router.delete('/delete-article-by-title/:title', deleteArticleByTitle);
router.get('/all-articles', getAllArticles);
router.get('/article/:id', getArticleById);
router.patch('/:id/status', updateArticleStatus);

module.exports = router;