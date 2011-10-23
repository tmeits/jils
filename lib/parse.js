module.exports = parse;

var core = require('./core'),
	env = require('./env'), 
	tokenize = require('./tokenize'), 
    read = require('./read'), 
    evaluate = require('./evaluate');

function parse(input){
    var global = new env(core,this);
    return evaluate(read(tokenize(input)),global);
}
