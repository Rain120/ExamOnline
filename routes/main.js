/**
 * Created by Rainy on 2017/9/19.
 */
var express = require('express');
var router = express.Router();

router.get('/', function(req, res){
    res.render('./login_signup');
});
module.exports = router;