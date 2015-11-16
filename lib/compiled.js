(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports={
  "ConsumerKey": "b0DJtpEj9zDZxQt1r71OI2qVe",
  "ConsumerSecret": "a7QzlRYsXOoOs2PkIJhpXnYsKNSy5JLF1woNi4ScHvovNLNp1b"
}

},{}],2:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Request = (function () {
  function Request(key, secret) {
    _classCallCheck(this, Request);

    this.consumerKey = key;
    this.consumerSecret = secret;
  }

  _createClass(Request, [{
    key: 'checkTokenInStorage',
    value: function checkTokenInStorage() {
      return localStorage.getItem('token');
    }
  }, {
    key: 'saveTokenInStorage',
    value: function saveTokenInStorage(token) {
      return localStorage.setItem('token', token);
    }
  }, {
    key: 'requestToken',
    value: function requestToken() {
      var _this = this;

      var promise = new Promise(function (resolve, reject) {
        var encodedConsumerKey = encodeURIComponent(_this.consumerKey);
        var encodedConsumerSecret = encodeURIComponent(_this.consumerSecret);
        var encodedKeys = btoa(encodedConsumerKey + ':' + encodedConsumerSecret);

        var xhttp = new XMLHttpRequest();

        xhttp.open('POST', 'https://api.twitter.com/oauth2/token', true);
        xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
        xhttp.setRequestHeader('Authorization', 'Basic ' + encodedKeys);
        xhttp.withCredentials = true;
        xhttp.send('grant_type=client_credentials');

        xhttp.onload = function () {
          if (xhttp.status === 200) {
            var res = JSON.parse(xhttp.response);
            _this.saveTokenInStorage(res.access_token);
            resolve(res.access_token);
          } else {
            reject('Error >> ', xhttp);
          }
        };

        xhttp.onerror = function () {
          reject('Error >> ', xhttp);
        };
      });

      return promise;
    }
  }, {
    key: 'getToken',
    value: function getToken() {
      var _this2 = this;

      var promise = new Promise(function (resolve, reject) {
        var token = _this2.checkTokenInStorage();

        if (token) {
          resolve(token);
        } else {
          _this2.requestToken().then(resolve).catch(reject);
        }
      });

      return promise;
    }
  }, {
    key: 'loadMore',
    value: function loadMore() {}
  }, {
    key: 'search',
    value: function search(str) {
      var _this3 = this;

      var promise = new Promise(function (resolve, reject) {
        _this3.getToken().then(function (token) {
          var xhttp = new XMLHttpRequest();

          xhttp.open('GET', 'https://api.twitter.com/1.1/search/tweets.json?q=' + encodeURIComponent(str), true);
          xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
          xhttp.setRequestHeader('Authorization', 'Bearer ' + token);
          xhttp.send('grant_type=client_credentials');
          xhttp.onload = function () {
            if (xhttp.status === 200) {
              var res = JSON.parse(xhttp.response);
              resolve(res.statuses);
            } else {
              reject('Error >> ', xhttp);
            }
          };

          xhttp.onerror = function () {
            reject('Error >> ', xhttp);
          };
        });
      });

      return promise;
    }
  }]);

  return Request;
})();

exports.default = Request;

},{}],3:[function(require,module,exports){
'use strict';

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _request = require('./request');

var _request2 = _interopRequireDefault(_request);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var request = new _request2.default(_config2.default.ConsumerKey, _config2.default.ConsumerSecret);

var resultsContainer = document.querySelector('.results');
var searchBtn = document.querySelector('.search-btn');
var searchInput = document.querySelector('.search-input');

var search = {
  handleError: function handleError(err) {
    resultsContainer.innerHTML = '<div class="results-error">' + err + '</div>';
  },
  createTableView: function createTableView(statuses) {
    if (!statuses.length) {
      search.handleError('No results found');
      return false;
    }

    var view = '\n      <table class="results-table">\n        <thead>\n          <tr>\n            <th colspan="2">User</th>\n            <th>Text</th>\n            <th>Created at</th>\n          </tr>\n        </thead>\n        <tbody>\n    ';

    statuses.map(function (status) {
      var created_at = new Date(status.created_at);
      view = view + ('\n          <tr>\n            <td><img class="results-userImage" src="' + status.user.profile_image_url + '" /></td>\n            <td>' + status.user.screen_name + '</td>\n            <td>' + status.text + '</td>\n            <td>' + created_at.toDateString() + '</td>\n          </tr>\n        ');
    });

    view = view + '</tbody></table';
    resultsContainer.innerHTML = view;
  },
  doSearch: function doSearch() {
    var searchVal = searchInput.value;

    if (!searchVal.length) {
      search.handleError('Please enter a string');
      return false;
    }

    if (searchVal.split(' ').length > 10) {
      search.handleError('Please enter less than 10 keywords');
      return false;
    }

    request.search(searchVal).then(search.createTableView);
  }
};

searchBtn.addEventListener('click', search.doSearch);
searchInput.addEventListener('keypress', function (e) {
  var key = e.which || e.keyCode;

  if (key === 13) {
    search.doSearch();
  }
});

},{"./config":1,"./request":2}]},{},[3]);
