const express = require("express");
const router = express.Router();
const {createComment, getAllComments,getCommentsByRefId, changeCommentStatus,deleteComment} = require("../controllers/comment");
const{authenticate} =require("../middleware/auth");

router.post("/create/comment",authenticate, createComment);
router.get("/all/comment", getAllComments);
router.get("/comments/:refId",getCommentsByRefId)
router.put("/change-status/comment", changeCommentStatus);
router.delete("/delete/comment/:name/:content/:email", deleteComment);


module.exports = router;