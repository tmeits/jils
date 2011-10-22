function env(defs, outer){
    var ret = {}, slice = Array.prototype.slice, N = Number;
	// operators
	ret['+'] = function(){ return slice.call(arguments).reduce(function(a,b){ return N(a) + N(b) }) };
	ret['-'] = function(){ return slice.call(arguments).reduce(function(a,b){ return N(a) - N(b) }) };
	ret['*'] = function(){ return slice.call(arguments).reduce(function(a,b){ return N(a) * N(b) }) };
	ret['/'] = function(){ return slice.call(arguments).reduce(function(a,b){ return N(a) / N(b) }) };
	ret['%'] = function(){ return slice.call(arguments).reduce(function(a,b){ return N(a) % N(b) }) };
	// predefined
	ret['car'] = function(){ return slice.call(arguments,0,1) };
	ret['cdr'] = function(){ return slice.call(arguments,1) };
	ret['type'] = function(){ return typeof arguments[0] };
	ret['is?'] = function(){ return arguments[0] instanceof(arguments[1]) };
	ret['eq?'] = function(){ return arguments[0] === arguments[1] };
	ret['if'] = function(){ return arguments[0] ? arguments[1] : arguments[2] };
	ret['concat'] = ret['++'] = function(){ 
		console.log(arguments);
		var res = [];
		slice.call(arguments).map(function(a){ 
			res = res.concat(a);
		});	return res;
	};
	// declarative
	ret['def'] = function(){ return ret[arguments[0]] = arguments[1] };
	ret['list'] = function(){ return slice.call(arguments) };
	ret['quote'] = function(){ return '('+slice.call(arguments).join(' ')+')' };
	ret['fn'] = function(){ 
		var args = slice.call(arguments);
		return function(){
			var fnenv = env([],ret),
				rdargs = read(tokenize(args[0]), fnenv),
				fnargs = slice.call(arguments);
			if (!rdargs.push) rdargs = [rdargs];
			for(var idx=0;idx<fnargs.length;idx++){
				if (rdargs[idx]){
					if (rdargs[idx].substr(-1,1) === "*"){
						fnenv[rdargs[idx].slice(0,-1)] = fnargs;
					} else { 
						fnenv[rdargs[idx]] = fnargs[idx];
					}
				}
			};
			var fnbody = read(tokenize(args[1]),fnenv);
			return take(fnbody,fnenv);
		}
	};
    defs = defs || [];
	defs.map(function(def){
    	ret['args'] = ret['args'] || [];
		ret['args'].push(def);
    }); 
	ret.outer = outer || {}; 
	ret.find = function(x){
		if (!(x in ret)){
			if (ret.outer.find){
				return ret.outer.find(x);
			} else {
				var _ret = {};
				_ret[x] = x;
				return _ret;
			}
		} return ret;
	}
	return ret;
}

function take(readed, env){
	for (var r=0,l=readed.length;r<l;r++){
		var it = readed[r];
		if (it.push) readed[r] = take(it, env);
	}
	for (var r=0,l=readed.length;r<l;r++){
		var it = readed[r];
		if (it.call){
			var callargs = readed.slice(1);
			if (callargs[0].push) 
				readed[r] = it.apply(env,callargs[0]);
			else readed[r] = it.apply(env,callargs);
		}
	}
	for (var r=0,l=readed.length;r<l;r++){
		var it = readed[r];
		if (it in env.find(it)){
			var defn = env.find(it)[it];
			if (!defn.call) readed[r] = defn;
		} 
	}
	for (var r=0,l=readed.length;r<l;r++){
		var it = readed[r];
		if (it in env.find(it)){
			var defn = env.find(it)[it];
			if (defn.call){ 
				var callargs = readed.slice(1);
				if (callargs[0].push) 
					return defn.apply(env,callargs[0]);
				else return defn.apply(env,callargs);
			} else return defn;
		} 
	} return readed;
}

function tokenize(src){
	return src.split("'(").join("(quote ")
		.split('(').join(' ( ').split(')').join(' ) ').split(' ')
			.filter(function(it){ return it !== '' });
}

function read(tokens,env){
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
			return atom(token,env);
		}
	}
}

function atom(it,env){
	var number = Number(it);
	if (!isNaN(number)) return number;
	try {
		return eval(it);
	} catch(e) {
		try {
			return env.find(it)[it];
		} catch(e) {
			return it;
		}
	}
}

// Repl

var global = env();

var rl = require('readline'),
    sys = require('sys');

var term = rl.createInterface(process.stdin, process.stdout, null);
term.question('jils> ', function(input) {
    var pre = "\033[1;36m", post = "\033[m";
	if (!input) return term.question('jils> ',arguments.callee);
    if (input == ':q') process.exit(0);
    console.log(pre+take(read(tokenize(input),global),global)+post);
   	term.question('jils> ',arguments.callee);
});
