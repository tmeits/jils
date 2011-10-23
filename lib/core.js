var infixOp = {
    '+': function(evaluate,env,exp){
		exp = exp.push ? exp.concat([0]) : [exp,0];
        return exp.reduce(function(a,b){
            return evaluate(a,env) + evaluate(b,env);
        });
    },
    '-': function(evaluate,env,exp){
		exp = exp.push ? exp : [exp];
		if (exp.length === 1) exp.unshift(0);
        return exp.reduce(function(a,b){
            return evaluate(a,env) - evaluate(b,env);
        });
    },
    '*': function(evaluate,env,exp){
		exp = exp.push ? exp.concat([1]) : [exp,1];
        return exp.reduce(function(a,b){
            return evaluate(a,env) * evaluate(b,env);
        });
    },
    '/': function(evaluate,env,exp){
		exp = exp.push ? exp.concat([1]) : [exp,1];
        return exp.reduce(function(a,b){
            return evaluate(a,env) / evaluate(b,env);
        });
    },
};

var sForms = {
	'defvar': function(evaluate,env,exp){
		if (exp.length){
			var ref = exp[0], 
				value = evaluate(exp[1],env);
			return env.scope[ref] = value;
		} return null;
	},
	'defun': function(evaluate,env,exp){
		if (exp.length){
			if('defvar' in env.find('defvar')){
				var defvar = env.find('defvar')['defvar'],
					lambda = ['lambda'].concat(exp.slice(1)),
					exp = [exp[0],lambda]; 
				return defvar(evaluate,env,exp);
			}
		} return null;
	},
	'lambda': function(evaluate,env,exp){
		if (exp.length){
			return function(evaluate,env,_exp){
				var env = new env.constructor({},env);
				for(var a=0,al=_exp.length;a<al;a++){
					env.scope[exp[0][a]] = _exp[a];
				} return evaluate(exp[1],env);
			}
		} return null;	
	},
	'begin': function(evaluate,env,exp){
		if (exp.length){
			var result;
			for(var e=0,l=exp.length;e<l;e++){
				result = evaluate(exp[e],env);
			} return result;
		} return null;
	},
	'cond': function(evaluate,env,exp){
		if (exp.length){
			return evaluate(exp[0],env) ? 
				evaluate(exp[1],env) : evaluate(exp[2],env);
		} return null;
	},
	'car': function(evaluate,env,exp){
		if (exp.length){
			return exp.slice(0,1);
		} return null;
	},
	'cdr': function(evaluate,env,exp){
		if (exp.length){
			return exp.slice(1);
		} return null;
	},
	'nil?': function(evaluate,env,exp){
		if (exp.length){
			return evaluate(exp[0],env) === null;
		} return null;
	},
	'eq?': function(evaluate,env,exp){
		if (exp.length){
			return evaluate(exp[0],env) === evaluate(exp[1],env);
		} return null;
	},
	'list?': function(evaluate,env,exp){
		if (exp.length){
			var evald = evaluate(exp[0],env);
			return !!(evald && evald.push);
		} return null;
	}
}

module.exports = (function(){
	var core = {};
	for(var i=0,l=arguments.length;i<l;i++){
		for(def in arguments[i]){
			core[def] = arguments[i][def];
		}
	} return core;
})(infixOp,sForms);
