(function () {

    // local storage access:
    var Data = new function () {
        var self = this;

        // Constants:
        // default cache time is 5 minutes:
        var DEFAULT_CACHE_TIME = 1000 * 60 * 5;

        // Storage keys:
        var StorageKeys = self.StorageKeys = {
            AccessToken:'AccessToken',
            User:'User',
            AppVersion:'AppVersion',
            Feed:'Feed'
        };

        // the access token for Instagram
        self.getAccessToken = function () {
            return self.get(StorageKeys.AccessToken) || false;
        };
        self.setAccessToken = function (token) {
            // remove if setting to null or false:
            if (typeof token === 'undefined' || !token) {
                self.remove(StorageKeys.AccessToken);
            } else {
                self.set(StorageKeys.AccessToken, token);
            }
        };

        self.getUser = function () {
            return self.get(StorageKeys.User) || null;
        };
        self.setUser = function (userData) {
            if (typeof userData === 'undefined' || !userData) {
                self.remove(StorageKeys.User);
            }
            else {
                // cache for an hour:
                self.set(StorageKeys.User, userData, 1000 * 60 * 60);
            }
        };

        /*Localstorage API helpers:*/

        //clears the entire cache:
        self.clear = function () {
            localStorage.clear();
        };

        // sets the value and caching info for this value:
        self.set = function (key, value, cacheTime) {
            // if we set to empty that means we actually want to remove the item:
            if (typeof value === 'undefined') {
                self.remove(key);
                return;
            }

            // pass all data through JSON.stringify since local storage does not support objects:
            value = typeof value === 'string' ? value : JSON.stringify(value);

            // set the data first:
            localStorage['_data' + key] = value;

            // then we set the caching info:
            cacheTime = typeof cacheTime !== 'undefined' && cacheTime || DEFAULT_CACHE_TIME;
            var cachingInfo = {
                cachedDate:new Date(),
                expiryTime:cacheTime
            };
            localStorage['_cachingInfo' + key] = JSON.stringify(cachingInfo);
        };

        // checks to see if a particular item is cached and if the cache is still valid:
        self.isCacheValid = function (key) {
            var value = self.get(key),
                cachingInfo = self.getCachingInfo(key);
            if (value && cachingInfo && cachingInfo.cachedDate) {
                // check against current time and make sure still valid:
                var currentDate = new Date();
                cachingInfo.cachedDate.setMilliseconds(cachingInfo.cachedDate.getMilliseconds() + cachingInfo.expiryTime);

                // cache is still valid:
                if (cachingInfo.cachedDate > currentDate) {
                    return true;
                }
            }
            // cache is not valid anymore:
            return false;
        };

        self.getCachingInfo = function (key) {
            var cachingInfo = localStorage['_cachingInfo' + key] ? JSON.parse(localStorage['_cachingInfo' + key]) : null;
            // convert string to actual date:
            if (cachingInfo && cachingInfo.cachedDate) {
                cachingInfo.cachedDate = new Date(cachingInfo.cachedDate);
            }
            return cachingInfo;
        };

        self.get = function (key) {
            var value = localStorage['_data' + key];
            try {
                return value && value !== 'undefined' ? JSON.parse(value) : false;
            }
            catch (ex) {
                return value;
            }

        };

        self.remove = function (key) {
            localStorage.removeItem('_data' + key);
            localStorage.removeItem('_cachingInfo' + key);
        };
    };

    window.Data = Data;
})();