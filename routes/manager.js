/**
 * Created by Rainy on 2017/9/27.
 */
var express = require('express');
var router = express.Router();

router.get('/manager', function(req, res){
    res.render('./adminPage');
});
module.exports = router;