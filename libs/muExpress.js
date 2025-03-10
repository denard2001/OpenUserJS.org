'use strict';

// Define some pseudo module globals
var isPro = require('../libs/debug').isPro;
var isDev = require('../libs/debug').isDev;
var isDbg = require('../libs/debug').isDbg;

//
var mu = require('mu2');

mu.root = __dirname + '/../views';

function renderFile(aRes, aPath, aOptions) {
  // If you need to render a file with a different content
  // type, do it directly on the response object
  if (isDev || isDbg) {
    mu.clearCache();

    aOptions.isDbg = isDbg;
    aOptions.isDev = isDev;
  }

  // Hide task for any reminder... See #484
  // NOTE: This code structure and CSS is always active for future reminders
  //   so please do not remove unless refactoring in a new issue as a whole.
  // Example Code task and sync UI with banner text/link at `./includes/headerReminders`:
  // if (aOptions.authedUser && aOptions.authedUser.strategies.indexOf('google') === -1) {
  //   aOptions.hideReminderThis = true;
  // }

  if (aRes.oujsOptions) {
    aOptions.DNT = aRes.oujsOptions.DNT;
    aOptions.hideReminderGDPR = aRes.oujsOptions.hideReminderGDPR;
    aOptions.showReminderListLimit = aRes.oujsOptions.showReminderListLimit;

    // Keep in sync with app.js and headerReminders.html
    aOptions.showInvalidAuth = aRes.oujsOptions.showInvalidAuth;
    aOptions.showStratFail = aRes.oujsOptions.showStratFail;
    aOptions.showNoConsent = aRes.oujsOptions.showNoConsent;
    aOptions.showNoName = aRes.oujsOptions.showNoName;
    aOptions.showTooLong = aRes.oujsOptions.showTooLong;
    aOptions.showUsernameFail = aRes.oujsOptions.showUsernameFail;
    aOptions.showROAuth = aRes.oujsOptions.showROAuth;
    aOptions.showRetryAuth = aRes.oujsOptions.showRetryAuth;
    aOptions.showAuthFail = aRes.oujsOptions.showAuthFail;
  }

  aRes.set('Content-Type', 'text/html; charset=UTF-8');
  mu.compileAndRender(aPath, aOptions).pipe(aRes);
}

// Express doesn't have stream support for rendering templates
// Hack express to add support for rendering a template with Mu
exports.renderFile = function (aApp) {
  var render = aApp.response.__proto__.render;

  aApp.response.__proto__.render = function (aView, aOptions, aFn) {
    var self = this;

    if (!aFn && aApp.get('view engine') === 'html') {
      aFn = function (aPath, aOptions) {
        renderFile(self, aPath, aOptions);
      };
    }

    render.call(self, aView, aOptions, aFn);
  };

  return (function (aPath, aOptions, aFn) {
    aFn(aPath, aOptions);
  });
};
