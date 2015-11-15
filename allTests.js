'use strict';

var testSuite = require('./test.js');
var argv = require('optimist').default('laxMode', false).default('browser', 'chrome').argv;

var rootUrl = 'http://todomvc.com';


	testSuite.todoMVCTest(
		'emberjs',
		rootUrl  , true,false, argv.browser);

