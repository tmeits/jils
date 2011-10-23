var rl = require('readline'),
    sys = require('sys'),
	parse = require('./lib/parse');

var term = rl.createInterface(process.stdin, process.stdout, null);
term.question('jils> ', function(input) {
    var pre = "\033[1;36m", post = "\033[m";
	if (!input) return term.question('jils> ',arguments.callee);
    if (input == ':q') process.exit(0);
    console.log(pre+parse(input)+post);
   	term.question('jils> ',arguments.callee);
});
