const express = require('express');
const app = express();
const path = require('path');
const router = express.Router();

router.get('/', function(req, res){
    res.sendFile(path.join(__dirname+'/index.html'));
})

app.get('/param/:name/:nameGithub',function(req,res){
    res.send("<h1> Hello my name is " + req.params.name + "</h1>" + "<p>My github is " + req.params.nameGithub + "</p>");
})

app.use('/',router);
app.listen(process.env.port || 3000)