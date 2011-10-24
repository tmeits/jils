
module.exports = tokenize;

var filters = {
	empty: function(it){ return it !== '' }
};

var extractions = {
	'single-quoted': /'([^']+)'/g,
	'double-quoted': /"([^"]+)"/g
};

var transforms = {
	'new-lines': function(){
		return this.split("\n").join("");
	},
	'tabs': function(){
		return this.split("\t").join("");
	},
	'pad-left-paren': function(){
		return this.split("(").join(" ( ");
	},
	'pad-right-paren': function(){
		return this.split(")").join(" ) ");
	},
	'split-space': function(){
        return this.split(" ");
    }
};

function id(prefix,val,extracted){
	extracted.push(val);
	return [prefix+(extracted.length-1),extracted];
}

function extract(){
	var input = this, prefixes = {};
	for(var i=0,l=arguments.length;i<l;i++){
		var prefix = arguments[i], rule = extractions[prefix];
		prefixes[prefix] = [];
		input = input.replace(rule, function(all, val){
			var replaced = id('_'+prefix+'_',val,prefixes[prefix]);
			prefixes[prefix] = replaced[1];
			return replaced[0];
		}); 
	} 
	return [input,prefixes];
}

function inject(prefixes){
	var input = this;
	for(var prefix in prefixes){
		var current = prefixes[prefix], id = '_'+prefix+'_';
		for(var p=0,pl=current.length;p<pl;p++){
			for(var t=0,tl=input.length;t<tl;t++){
				input[t] = input[t].replace(id+p,current[p]);
			}
		}
	} return input;
}

function transform(){
	var input = this;
	for(var i=0,l=arguments.length;i<l;i++)
		input = transforms[arguments[i]].call(input);
	return input;
}

function filter(){
	var input = this;
	for(var i=0,l=arguments.length;i<l;i++)
		input = input.filter(filters[arguments[i]]);
	return input;
}

function tokenize(src){ 
	var extractions = ['single-quoted','double-quoted'],
		transforms = [
			'new-lines','tabs','pad-left-paren',
			'pad-right-paren','split-space'],
		filters = ['empty'];

	var processed = extract.apply(src,extractions),
		source = processed[0], extracted = processed[1],
		transformed = transform.apply(source,transforms),
		filtered = filter.apply(transformed,filters),
		tokens = inject.call(filtered,extracted);

	return tokens;
}
