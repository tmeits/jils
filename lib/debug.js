module.exports = function(){
	var pre = "\033[1;31m", post = "\033[m";
	console.log(pre+arguments[0]+': ',arguments[1],post);
}
