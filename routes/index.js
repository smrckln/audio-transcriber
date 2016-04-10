var fs = require('fs');
var youtubedl = require('youtube-dl');
var watson = require('watson-developer-cloud');
var exec = require('child_process').exec;
var glob = require('glob');
var async = require('async');

exports.youtube_dl = function(io){
	return function(req, res){
	
		var speech_to_text = watson.speech_to_text({
				username: "035172f9-ef54-4de8-88d8-457dd543589f",
				password: "2yVXL8wkASVJ",
				version: 'v1',
				url: "https://stream.watsonplatform.net/speech-to-text/api"
		});
		
		var url = 'http://www.youtube.com/watch?v=' + req.params.video_id;
		var outFile = req.params.video_id + '.m4a';
		
		youtubedl.exec(url, ['-x', '--audio-format', 'm4a', '-o', outFile], {}, function(err, output) {
			if (err) throw err;
			
			var cmd = 'ffmpeg -i ' + req.params.video_id + '.m4a -f flac ' + req.params.video_id + '.flac';
			var file = req.params.video_id + '.flac';
			
			var cmd2 = 'ffmpeg -i ' + file + ' -f segment -segment_time 300 -c copy out%03d.flac';
			
		
			exec(cmd, function(error, stdout, stderr){
				exec(cmd2, function(error, stdout, stderr){
					res.status(200).send();
					fs.unlink(file);
					fs.unlink(req.params.video_id+'.m4a');
					if(error){
						console.log(error);
					}
					
					glob('out[0-9]*.flac', function(er, files){
						var tasks = [];
						
						files.forEach(function(value, index){
							
							tasks.push(function(callback){
								var params = {
									content_type: 'audio/flac',
									continuous: true,
									interim_results: true
								};
							
								var recognizeStream = speech_to_text.createRecognizeStream(params);
							
								fs.createReadStream(value).pipe(recognizeStream);
								var transcription = fs.createWriteStream('transcription.txt');
							
								recognizeStream.pipe(transcription);
								recognizeStream.setEncoding('utf8');
								
								var text = "";
							
								recognizeStream.on('data', function(data){
									text+= data;
									console.log('Socket Emit');
									io.sockets.emit('data', text);
								});
								
								recognizeStream.on('end', function(){
									console.log('Socket Final Emit');
									io.sockets.emit('data final', text);
									callback(null, text);
									fs.unlink(value);
								});
							});
							
						});
						async.series(tasks);
					});
				});
			});
		});
		
	}
}

module.exports = exports;