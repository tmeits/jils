// jils
// 
// mini-lisp implementation based on 
// lis.py by Peter Norvig
// http://norvig.com/lis.py 
//

// Pythonic

function zip(){
	var ret = [];
	if (arguments.length > 1){
		for (var r = 0,rl = arguments[0].length; r<rl; r++){
			var curr = [];
			for (var c = 0,cl = arguments.length; c<cl; c++){
				var curv = arguments[c][r] === undefined ?
					undefined : arguments[c][r];
				curr.push(curv);
			}
			ret.push(curr);
		}
	} else if (arguments.length) 
		ret.push(arguments[0]);
	return ret;
}

function dict(list){
	list = list || [];
	var ret = {};
	list.map(function(curr){
		if (curr.length == 2)
			ret[curr[0]] = curr[1];
	}); return ret;
}

// Class

function Env(params, arguments, outer){
	params = params || [];
	arguments = arguments || [];
	var self = dict(zip(params,arguments));
	self.outer = outer;
	self.find = function(param){
		return (param in this ?
			this : this.outer ?	
				this.outer.find(param) :
					{} );
	}; return self;
}

function addOperators(env){
	var operators = {
		infix: [
			'+', '-', '*', '/', 
			'!=', '>', '<', '>=',
			'<=', '=', '=='
		], prefix: [ 'typeof' ]
	};
	function makeOp(env,operators,type,pos){
		var l = operators[type].length;
		for(var i = 0,l; i<l; i++){
			var op = operators[type][i];
			env[op] = (function(op){
				return function(n1,n2){
					return eval(pos ? n1+op+n2 : op+n1);
				};
			})(op);
		}
		return env;
	}
	for(var type in operators){
		if (type == 'infix'){
			env = makeOp(env,operators,type,1);
		}
		else if (type == 'prefix'){
			env = makeOp(env,operators,type,1);
		}
	}
	return env;
}

function addDefined(env){
	var defined = {
		'car': function(x){ return x.slice(0,1) },
		'cdr': function(x){ return x.slice(1) },
		'list': function(x){ return [x] },
		'list?': function(x){ return !!x.push },
		'null?': function(x){ return x === null },
		'undef?': function(x){ return x === undefined },
		'symbol?': function(x){ return x instanceof(Symbol) }
	}
	function makeDef(env,defined){
		for (var name in defined)
			env[name] = defined[name];
		return env;
	}
	env = makeDef(env,defined);
	return env;
	
}

function addGlobals(env){
	env = addOperators(env);
	env = addDefined(env);
	return env;
}

var globalEnv = new Env;
globalEnv = addGlobals(globalEnv);

// Eval

function take(x, env){
	var search = x.length ? env.find(x[0]) : {};
	if (x[0] && x[0] in search){
		// variable reference
		return env.find(x)[x];
	} else if (!isNaN(x)) {
		// constant literal
		return x;
	} else if (!(x instanceof(Array))) {
		// constant literal
		return JSON.parse(x);
	} else if (x[0] == 'quote'){
		// (quote exp)
		return x[1];
	} else if (x[0] == 'if'){
		// (if test conseq alt)
		return take(take(x[1], env) ? 
			x[2] : x[3], env);
	} else if (x[0] == 'set!'){
		// (set! var exp)
		return env.find(x[1])[x[1]] = x[2];
	} else if (x[0] == 'def'){
		// (def var exp)
		env[x[1]] = take(x.slice(2), env);
		console.log(typeof env.test)
	} else if (x[0] == 'fn'){
		// (fn (var*) exp)
		return (function(x,env){ 
			return function(){ 
				var local = new Env(x[1], arguments, env);
				return take(readFrom(x.slice(2)), local);
			};
		})(x,env);
	} else if (x[0] == 'begin'){
		// (begin exp*)
		var val, len = x.slice(1).length; 
		for(var i=1; i<len; i++){
			val = take(x[i], env);
		} return val;
	} else {
		// (proc exp*)
		var exps = [];
		for(var i=0,l=x.length; i<l; i++){
			var currv = take(x[i], env);
			exps.push(currv);
		}
		var proc = exps.shift()
		proc = proc.apply ? proc : env.find(proc)[proc];
		return proc.apply(env, exps);
	}	
}

// Parse & Read

function parse(src){
	function cleans(it){ return it !== " " && it !== "" }
	return readFrom(tokenize(src).filter(cleans));
}

function tokenize(src){
	var src = src
		.split(')')
		.join(' ) ')
		.split('(') 
	 	.join('( ') // jswtf.
		.split(' ');
	console.log(src);
	return src;
}

function readFrom(tokens){
	if (!tokens.length){
		throw new Error('unexpected EOF while reading');
	} 
	var token = tokens.shift();
	if ('(' === token){
		var list = [];
		while (tokens[0] !== ')'){
			list = list.concat([readFrom(tokens)]);
		} tokens.shift();
		return list;
	} else if (')' === token){
		throw new Error('unexpected \')\'')
	} else {
		return Atom(token);
	}
}

// Atom

function Atom(token){
	var number = Number(token).toPrecision();
	if (!isNaN(number)) return Number(number);
	return token;
}

// Repl

var rl = require('readline'),
	sys = require('sys');

var term = rl.createInterface(process.stdin, process.stdout, null);
term.question('jils> ', function(input) {
	var pre = "\033[1;36m", post = "\033[m";
	if (!input) return term.question('jils> ',arguments.callee);
	if (input == ':q') process.exit(0);
	sys.print(pre+take(parse(input),globalEnv)+post);
	term.question('jils> ',arguments.callee);
});
