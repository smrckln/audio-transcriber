
var fs = require('fs');
var express = require('express');
var routes = require('./routes');
var path = require('path');

var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);





app.get('/', function(req, res){
	res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/youtube_dl/:video_id', routes.youtube_dl(io));

http.listen(3000, function(){
	console.log("Listening on port 3000");
})



