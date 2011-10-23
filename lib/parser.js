module.exports = function(src){	
	return read(tokenize(src));
}

function read(tokens){
	if (!tokens.push){
		return tokens;
	} else if (tokens.length){
		var token = tokens.shift();
		if (token === '('){
			var list = [];
			while (tokens[0] !== ')'){
				list.push(read(tokens));
			} tokens.shift();
			return list;
		} else if (token !== ')') {
			return atom(token);
		}
	}
}

function atom(it){
	var number = Number(it);
	if (!isNaN(number)) return number;
	try {
		return eval(it);
	} catch(e) {
		return it;
	}
}

function tokenize(src){
	function clean(it){ 
		return it !== '' 
	}
	return src
	.split("'")
	.join("' ")
	.split('(')
	.join(' ( ')
	.split(')')
	.join(' ) ')
	.split(' ')
	.filter(clean);
}
