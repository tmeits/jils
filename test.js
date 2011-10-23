var parse = require('./lib/parse'),
	debug = require('./lib/debug');

lines = [
	'1',
	'(+ 1 2 3 4)',
	'(+ 1 2 3 (- 1 2))',
	'(+ 1 2 3 (- 1))',
	'(Math.pow 3 2)',
	'(defvar a 2)',
	'(+ a a)',
	'(defvar a 4)',
	'(+ a a)',
	'(- a a)',
	'(+ a a (- a))',
	'(+ a a (- a a))',
	'(* a a)',
	'(/ a a)',
	'(* a a (/ a a))',
	'(defvar a)',
	'(a)',
	'(defvar)',
	'(defvar fn (lambda (a b) (+ 1 2)))',
	'(fn 1 2)',
	'(defvar fn (lambda (a b) (+ a b)))',
	'(fn 5 7)',
	'(defun fancy-fun (a b) (+ a b))',
	'(fancy-fun 5 7)',
	'(car 1 2 3 4)',
	'(cdr 1 2 3 4)',
];

for(var i=0,l=lines.length;i<l;i++)
	debug(lines[i],parse(lines[i]));
