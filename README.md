# Single page app Ember Browser Tests

$ npm install

# will default run the test in chrome
$ npm run test

#if respective browser drivers are installed and added in path can run in other browsers
$ npm run test -- --browser=firefox

```


## README

- `page.js` - provides an abstraction layer for the HTML template. All the code required to access elements from the DOM is found within this file. 
The XPaths used to locate elements

- `testOperations.js` - provides common functions 
- `test.js` - the actual test case logic here 
- `allTest.js` - A simple file that locates all of the framework examples, and runs the tests for each.


