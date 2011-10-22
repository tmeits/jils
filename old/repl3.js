var core = {
	'+': function(){ return arguments[1] ? [].slice.call(arguments).reduce(function(a,b){ return a+b }) : arguments[0] },
	'-': function(){ return arguments[1] ? [].slice.call(arguments).reduce(function(a,b){ return a-b }) : arguments[0] },
	'*': function(){ return arguments[1] ? [].slice.call(arguments).reduce(function(a,b){ return a*b }) : arguments[0] },
	'/': function(){ return arguments[1] ? [].slice.call(arguments).reduce(function(a,b){ return a/b }) : arguments[0] },
	'%': function(){ return arguments[1] ? [].slice.call(arguments).reduce(function(a,b){ return a%b }) : arguments[0] },	
	'def': function(){ return this[arguments[0]] = [].slice.call(arguments,1) },
	'car': function(){ return [].slice.call(arguments,0,1) },
	'cdr': function(){ return [].slice.call(arguments,1) },
	'list': function(){ return [].slice.call(arguments) },
	'defn': function(){ return new func([].slice.call(arguments,1)) }
}

function env(parent){
	return {
		parent: parent,
		find: function(ref){
			if (ref in parent) return parent;
			else return this;
		},
		load: function(refs){
			for(ref in refs) this[ref] = refs[ref];
			return this;
		}
	}
}

global = new env(core);

function debug(){
	var pre = "\033[1;31m", post = "\033[m";
	console.log(pre+arguments[0]+': ',arguments[1],post);
}

function func(args,exp){
	debug('func',args,exp);
}


function interp(atoms){
	debug('interp-atoms',atoms);
	if (atoms.length){
		debug('interp-atoms-length',atoms.length);
		var atom = '';
		if (atoms.shift){
			atom = atoms.shift();
			debug('interp-atoms-shift',atom);
		} if (atom.push){
			debug('push',atom);
			return interp.call(global,atom);
		} else if (atom.apply){
			debug('apply',atoms);
			if (!atoms.push) atoms = [atoms];
			return atom.apply(global,interp(atoms));
		} else if (atom === "'"){
			debug('interp-quote',atoms);
			atom = atoms.shift();
			return [atom].concat(interp(atoms)); 
		} if (atom in global.find(atom)) {
			var ref = global.find(atom)[atom],
				expanded = interp(atoms);
			if (ref.apply && expanded.push){
				debug('ref-apply',atom,atoms);
				return ref.apply(global,expanded);
			} else if (ref.push){
				debug('ref-push',atom,atoms);
				return expanded;
			} else {
				debug('ref-call',atom,atoms);
				debug('ref-call-atoms',atoms);
				debug('ref-call-res',[ref].concat(expanded));
				if (expanded) return [ref].concat(expanded);
				else return ref;
			};
		} else {
			if (atom){
				atoms.unshift(atom);
				debug('interp-return-atoms',atoms);
				return atoms;
			}
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


function read(tokens){
	var quoted;
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




// Repl

// var global = env();

var rl = require('readline'),
    sys = require('sys');

var term = rl.createInterface(process.stdin, process.stdout, null);
term.question('jils> ', function(input) {
    var pre = "\033[1;36m", post = "\033[m";
	if (!input) return term.question('jils> ',arguments.callee);
    if (input == ':q') process.exit(0);
    console.log(pre+interp(read(tokenize(input)))+post);
   	term.question('jils> ',arguments.callee);
});
