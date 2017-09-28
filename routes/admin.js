/**
 * Created by Rainy on 2017/9/19.
 */
var express = require('express');
var router = express.Router();

router.get('/user', function(req, res){
    res.render('./index');
});
module.exports = router;