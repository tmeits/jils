var debug = require('./debug');

module.exports = (function(root){
	var global = env(root,interp); 
	return function(input){
		return interp(input, global);
	};
})(this);

function interp(atoms,local){
	if (atoms && atoms.length){
		if (atoms[0].apply) 
			return atoms[0].apply(this,interp(atoms.slice(1),local));
		if (atoms[0] in local.find(atoms[0])){
			var atom = atoms[0];
			if (atom === "'") return atom;
			var ref = local.find(atom)[atom];
			if (typeof ref === 'function'){
				var args = atoms.length ? interp(atoms.slice(1),local) : [];
				return ref.apply(local,args);
			} else {
				if (atoms.length > 1) 
					return [ref,interp(atoms.slice(1),local)];
				else return ref;
			}
		} else {
			return atoms;
		}
	}	
}

function env(parent,interp){
	var scope = {};
	// simple operators
	for (var op in { '+':'+', '-':'-', '*':'*', '/':'/', '%':'%' }){
		scope[op] = (function(op){
			return function(){ 
				var args = [].slice.call(arguments),
					reducefn = Function('a,b','return a'+op+'b');
				return args[1] ? interp(args,this).reduce(reducefn) : interp(args[0],this) 
			};
		})(op);
	}	
	// builtin
	scope['def'] = function(){ return this.scope[arguments[0]] = define.call(this,arguments[1])};
	scope['car'] = function(){ return interp([].slice.call(arguments,0,1),this) };
	scope['cdr'] = function(){ return interp([].slice.call(arguments,1),this) };
	scope['list'] = function(){ return interp([].slice.call(arguments),this) };
	scope['lambda'] = function(){ return func.apply(this,arguments) };
	// 
	return {
		parent: parent,
		scope: scope,
		find: function(ref){
			if (ref in this.scope){
				return this.scope;
			} else if (this.parent.find && 
				ref in this.parent.find(ref)){
					return this.parent.scope;
			} else if (ref in this.parent){
				return this.parent;
			} return this.scope;
		},
		load: function(refs){
			for(ref in refs)
				this.scope[ref] = refs[ref];
			return this;
		}
	}
}

function func(args,exp){
	return function(){
		var local = new env(this);
		console.log(arguments);
		for(var i=0;i<arguments.length;i++){
			local.scope[args[i]] = arguments[i];
		}
		return interp(exp,local)
	}
}

function define(func){
	var all = [].slice.call(arguments),
		args = all.slice(1);
	if (typeof func === 'function'){
		return (function(){
			args = args.concat(arguments);
			func.apply(this,args);
		}).bind(this); 
	} else {
		if (all.length === 1)
			return all[0].push ? 
				interp(all[0],this) : all[0];
		else return interp(all,this);
	}
}
