const fs = require('fs');
const path = require('path');
const https = require('https');
var arguments = process.argv.splice(2);
// console.log(arguments);
if(arguments.length < 1){
	console.log('node deploy.js path');
	process.exit(1);
}
var root = arguments[0];
// console.log("root path:", root);
if(!fs.existsSync(root)){
	console.log('root dir not exist '+ root);
	process.exit(1);
}
var indexPath=path.join(root,"index.html");
// console.log(indexPath);
if(!fs.existsSync(indexPath)){
    console.log('index.html not exist');
    process.exit(1);
}
var dist = path.join(root,'dist');
// mkdir dist
if(!fs.existsSync(dist)){
	fs.mkdirSync(dist);
}

var downloadNotExist = function (url, p) {
	if (!fs.existsSync(p)) {
		console.log('download ', url);
		console.log('path ', p);
		var writer = fs.createWriteStream(p);
		https.get(url, (res) => {
			res.on('data', (d) => {
				// console.log(p, d);
				writer.write(d, 'utf-8');
			}).on('end',(e)=>{
				// console.log('end',p);
				writer.close();
			})
		}).on('error', (e) => {
			console.error('error:',e);
		})
	}
}
var nebulas = path.join(dist,'nebulas.min.js');
var nebPay = path.join(dist,'nebPay.min.js');
downloadNotExist('https://raw.githubusercontent.com/aijingsun6/cocos_deploy/master/neb/nebulas.min.js',nebulas);
downloadNotExist('https://raw.githubusercontent.com/aijingsun6/cocos_deploy/master/neb/nebPay.min.js',nebPay);
var data = fs.readFileSync(indexPath,'utf-8');
// console.log(data);
var str = '<script type="text/javascript" src="./dist/nebulas.min.js"></script>'
+'<script type="text/javascript" src="./dist/nebPay.min.js"></script>'
+'<script type="text/javascript">'
+'var HttpRequest = require("nebulas").HttpRequest;'
+'var Neb = require("nebulas").Neb;'
+'var Account = require("nebulas").Account;'
+'var Transaction = require("nebulas").Transaction;'
+'var Unit = require("nebulas").Unit;'
+'var NebPay = require("nebpay");'
+'</script>';
// console.log(str);
if(data.indexOf('nebulas') == -1){
	data = data.replace('</body>',str +'</body>');
	fs.writeFileSync(indexPath,data);	
}else {
	console.log('already deploy');
}
