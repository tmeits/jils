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
		if (exp.length === 2){
			var ref = exp[0], 
				value = evaluate(exp[1],env);
			return env.scope[ref] = value;
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
