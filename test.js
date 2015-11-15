'use strict';

var webdriver = require('selenium-webdriver');
var chrome = require('selenium-webdriver/chrome');
var test = require('selenium-webdriver/testing');
var Page = require('./page');
var PageLaxMode = require('./pageLaxMode');
var TestOperations = require('./testOperations');

module.exports.todoMVCTest = function (frameworkName, baseUrl, speedMode, laxMode, browserName) {
	test.describe('TodoMVC - ' + frameworkName, function () {
		var TODO_ITEM_ONE = 'Go to Flinder street';
		var TODO_ITEM_TWO = 'Goto to Domain interchange';
		var TODO_ITEM_THREE = 'Catch the tram 55';
		var browser, testOps, page;

		// a number of tests use this set of ToDo items.
		function createStandardItems() {
			page.enterItem(TODO_ITEM_ONE);
			page.enterItem(TODO_ITEM_TWO);
			page.enterItem(TODO_ITEM_THREE);
		}

		function launchBrowser() {
			var chromeOptions = new chrome.Options();
			chromeOptions.addArguments('no-sandbox');

			if (process.env.CHROME_PATH !== undefined) {
				chromeOptions.setChromeBinaryPath(process.env.CHROME_PATH);
			}

			browser = new webdriver.Builder()
			.withCapabilities({
				browserName: browserName
			})
			.setChromeOptions(chromeOptions)
			.build();

			browser.get(baseUrl);
            browser.findElement(webdriver.By.linkText('Ember.js')).click();
			page = laxMode ? new PageLaxMode(browser) : new Page(browser);
			testOps = new TestOperations(page);

			// for apps that use require, we have to wait a while for the dependencies to
			// be loaded. There must be a more elegant solution than this!
			browser.sleep(200);
		}

		function closeBrowser() {
			browser.quit();
		}

		if (speedMode) {
			test.before(function () {
				launchBrowser();
			});
			test.after(function () {
				closeBrowser();
			});
			test.beforeEach(function () {
				page.getItemElements().then(function (items) {
					if (items.length > 0) {
						// find any items that are not complete
						page.getNonCompletedItemElements().then(function (nonCompleteItems) {
							if (nonCompleteItems.length > 0) {
								page.clickMarkAllCompletedCheckBox();
							}
							page.clickClearCompleteButton();
						});
					}
				});
			});
		} 

		

		test.describe('Adding New Todo items', function () {
			test.it('should allow me to add todo items', function () {
				page.enterItem(TODO_ITEM_ONE);
				testOps.assertItems([TODO_ITEM_ONE]);

				page.enterItem(TODO_ITEM_TWO);
				testOps.assertItems([TODO_ITEM_ONE, TODO_ITEM_TWO]);
			});

			

			
		});

		test.describe('Marking  all todos completed', function () {
			test.beforeEach(function () {
				createStandardItems();
			});

			test.it('should allow me to mark all items as completed', function () {
				page.clickMarkAllCompletedCheckBox();

				testOps.assertItemAtIndexIsCompleted(0);
				testOps.assertItemAtIndexIsCompleted(1);
				testOps.assertItemAtIndexIsCompleted(2);
			});

			test.it('should allow me to clear the completion state of all items', function () {
				page.clickMarkAllCompletedCheckBox();
				page.clickMarkAllCompletedCheckBox();

				testOps.assertItemAtIndexIsNotCompleted(0);
				testOps.assertItemAtIndexIsNotCompleted(1);
				testOps.assertItemAtIndexIsNotCompleted(2);
			});

			test.it('complete all checkbox should update state when items are completed / cleared', function () {
				page.clickMarkAllCompletedCheckBox();

				testOps.assertCompleteAllIsChecked();

				// all items are complete, now mark one as not-complete
				page.toggleItemAtIndex(0);
				testOps.assertCompleteAllIsClear();

				// now mark as complete, so that once again all items are completed
				page.toggleItemAtIndex(0);
				testOps.assertCompleteAllIsChecked();
			});
		});

		test.describe('Items', function () {
			test.it('should allow me to mark items as complete', function () {
				page.enterItem(TODO_ITEM_ONE);
				page.enterItem(TODO_ITEM_TWO);

				page.toggleItemAtIndex(0);
				testOps.assertItemAtIndexIsCompleted(0);
				testOps.assertItemAtIndexIsNotCompleted(1);

				page.toggleItemAtIndex(1);
				testOps.assertItemAtIndexIsCompleted(0);
				testOps.assertItemAtIndexIsCompleted(1);
			});

			test.it('should allow me to un-mark items as complete', function () {
				page.enterItem(TODO_ITEM_ONE);
				page.enterItem(TODO_ITEM_TWO);

				page.toggleItemAtIndex(0);
				testOps.assertItemAtIndexIsCompleted(0);
				testOps.assertItemAtIndexIsNotCompleted(1);

				page.toggleItemAtIndex(0);
				testOps.assertItemAtIndexIsNotCompleted(0);
				testOps.assertItemAtIndexIsNotCompleted(1);
			});
		});

		test.describe('Editing todo item ', function () {
			

			 test.it('should save edits on todo on enter', function () {
			 		createStandardItems();
				page.doubleClickItemAtIndex(1);
			 	page.editItemAtIndex(1, 'Catch tram 8' + webdriver.Key.ENTER);

			 	testOps.assertItems([TODO_ITEM_ONE, 'Catch tram 8', TODO_ITEM_THREE]);
			 });


			
		});

	


		test.describe('Clear completed button', function () {
			test.beforeEach(function () {
				createStandardItems();
			});

			

			test.it('remove completed todo by pressing the clear completed button', function () {
				page.toggleItemAtIndex(1);
				page.clickClearCompleteButton();
				testOps.assertItemCount(2);
				testOps.assertItems([TODO_ITEM_ONE, TODO_ITEM_THREE]);
			});

			
		});



		test.describe('filters', function () {
			test.beforeEach(function () {
				createStandardItems();
			});
			

			test.it('filter by completed todo items', function () {
				page.toggleItemAtIndex(1);
				page.filterByCompletedItems();

				testOps.assertItems([TODO_ITEM_TWO]);
			});

			test.it('should allow me to display all items', function () {
				page.toggleItemAtIndex(1);

				// apply the other filters first, before returning to the 'all' state
				page.filterByActiveItems();
				page.filterByCompletedItems();
				page.filterByAllItems();

				testOps.assertItems([TODO_ITEM_ONE, TODO_ITEM_TWO, TODO_ITEM_THREE]);
			});

			
		});
	});
};
