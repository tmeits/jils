module.exports = evaluate;

function evaluate(exp,env){
    if (exp && exp.length){
        if (exp[0] in env.find(exp[0])){
            var def = env.find(exp[0])[exp[0]];
			if (typeof def === 'function'){
	            return def(evaluate,env,exp.slice(1));
			} else {
				return def;
			}
        } else if (typeof exp[0] === 'function'){
			return exp[0].apply(this,evaluate(exp.slice(1),env));
		} else {
			for(var e=1,l=exp.length;e<l;e++){
				exp[e] = evaluate(exp[e],env);
			}
		}
    } return exp;
}
