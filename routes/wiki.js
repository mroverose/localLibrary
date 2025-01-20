
const express = require("express");
const router = express.Router();


router.get("/",(req,res) => {
    res.send("维基主页");
});

router.get("/about",(req,res) => {
    res.send("关于此维基");
});

module.exports = router;