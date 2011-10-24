var assert = require('assert'),
	parse = require('../lib/parse'),
	tests = {
		core: require('./test-core').tests,
		basic: require('./test-basic').tests,
	};

for (suite in tests){
	console.log('running *'+suite+'* norvig tests...')
	for (var test=0;test<tests[suite].length;test++){
		var curr = tests[suite][test];
		var parsed = parse(curr[0]);
		var equal = true;
		if (parsed && parsed.push){
			if (assert.deepEqual(parsed,curr[1])){
				equal = false;
			}
		} else {
			if (parsed !== curr[1]){
				equal = false
			}
		} if (equal){
			process.stdout.write('.');
		} else {
			console.log('failed: ',curr[0]);
			console.log('expected: ',curr[1]);
			console.log('got: ',parsed);
		}
	} process.stdout.write("\n");
}
		
