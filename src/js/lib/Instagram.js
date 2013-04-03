/*The instagram API that handles OAuth and such*/

(function () {
    var client_id = 'ae3dcf48bd7543778a31707248781bdd',
        redirect_uri = 'http://clients.tinyfactory.co/instagram',
        response_type = 'token',
        scope = 'likes+comments+relationships',
        api_url = 'https://api.instagram.com/v1',
        authorize_url = 'https://api.instagram.com/oauth/authorize/';

    var InstaAPI = {
        authorize:function () {
            var url = authorize_url +
                '?client_id=' + client_id +
                '&redirect_uri=' + redirect_uri +
                '&response_type=' + response_type +
                '&scope=' + scope;

            var authorizeWindow = window.open(url, 'AuthorizingInstagram');
            console.log(authorizeWindow);
        },

        getAccessToken:function () {
            return Data.getAccessToken();
        },

        setAccessToken:function (token) {
            Data.remove(Data.StorageKeys.Feed);
            Data.remove(Data.StorageKeys.User);
            Data.setAccessToken(token);
        },

        getUser:function (cb) {
            // check to see if we have cached the user data
            if (!Data.isCacheValid(Data.StorageKeys.User)) {
                // grab the users data
                InstaAPI.apiCall({
                    path:'/users/self/',
                    callback:function (res) {
                        if (res && res.data) {
                            Data.setUser(res.data);
                        }
                        cb(res);
                    }
                });
                return;
            }
            cb({
                data:Data.getUser()
            });
        },

        // gets the comments for a particular media item
        getComments:function (mediaID, cb) {
            InstaAPI.apiCall({
                path:'/media/' + mediaID + '/comments',
                callback:cb
            });
        },

        // sends a comment with the specified text
        sendComment:function (mediaID, commentText, cb) {
            InstaAPI.apiCall({
                path:'/media/' + mediaID + '/comments',
                ajaxType:'post',
                callback:cb,
                params:{
                    text:commentText
                }
            });
        },

        // deletes a comment
        deleteComment:function (mediaID, commentID, cb) {
            InstaAPI.apiCall({
                path:'/media/' + mediaID + '/comments/' + commentID,
                ajaxType:'delete',
                callback:cb,
                params:{
                    text:commentText
                }
            });
        },

        getFeedItem:function (mediaID, cb) {
            // check cache to see if this specific item is
            // already cached
            var feedItem = {
                error:'could not find image'
            };
            if (Data.isCacheValid(Data.StorageKeys.Feed)) {
                var feed = Data.get(Data.StorageKeys.Feed);
                for (var i = 0; i < feed.length; i++) {
                    if (feed[i].id === mediaID) {
                        feedItem = feed[i];
                        break;
                    }
                }
            }

            // if the item could not be found in cache request it:
            if (feedItem.error) {
                InstaAPI.apiCall({
                    path:'/media/' + mediaID,
                    callback:function (res) {
                        cb(res.data);
                    }
                });
                return;
            }

            window.setTimeout(function () {
                cb(feedItem);
            }, 0);
        },

        getPopularFeed:function (cb) {
            InstaAPI.apiCall({
                path:'/media/popular?client_id=' + client_id,
                callback:function (res) {
                    cb(res);
                }
            });
        },

        getTagFeed:function (tag, cb) {
            InstaAPI.apiCall({
                path:'/tags/' + tag + '/media/recent' + (!Data.getAccessToken() ? '?client_id=' + client_id : ''),
                callback:function (res) {
                    // cache for one minute:
                    cb(res.data);
                }
            });

        },

        getUserFeed:function (cb) {
            InstaAPI.apiCall({
                path:'/users/self/feed',
                callback:function (res) {
                    cb(res);
                }
            });
        },
        addUserFeed:function (max_id, cb) {
            InstaAPI.apiCall({
                path:'/users/self/feed',
                params:{
                    max_id:max_id
                },
                callback:function (res) {
                    cb(res);
                }
            });
        },

        searchUsers:function (query, cb) {
            InstaAPI.apiCall({
                path:'/users/search?q=' + query,
                callback:function (res) {
                    cb(res.data);
                }
            });
        },

        getFriendFeed:function (userID, cb) {
            InstaAPI.apiCall({
                path:'/users/' + userID + '/feed',
                callback:function (res) {
                    cb(res.data);
                }
            });
        },

        getRelationship:function (userID, cb) {
            InstaAPI.apiCall({
                path:'/users/' + userID + '/relationship',
                callback:function (res) {
                    cb(res.data);
                }
            });
        },

        // sends a request to follow
        relationshipAction:function (userID, action, cb) {
            InstaAPI.apiCall({
                path:'/users/' + userID + '/relationship',
                ajaxType:'post',
                callback:cb,
                params:{
                    action:action
                }
            });
        },

        apiCall:function (options) {
            var api = $.extend({
                path:'/',
                ajaxType:'get',
                params:{

                },
                callback:function () {
                }
            }, options);

            // get access token:
            if (Data.getAccessToken()) {
                api.params.access_token = Data.getAccessToken();
            }


            // make api call to instagram
            if (api.ajaxType === 'get' || api.ajaxType == 'post') {
                $[api.ajaxType](api_url + api.path, api.params, Success, 'json').error(function (err) {
                    api.callback(err);
                });
            }
            else {
                //PUT OR DELETE needs special function because jquery does not support natively
                api.ajaxType = api.ajaxType.toUpperCase();
                $.ajax({
                    url:api_url + api.path + (api.path.indexOf('?') > -1 ? (api.path.indexOf('&') > -1 ? "&" : "") : "?") + 'access_token=' + Data.getAccessToken(),
                    data:api.params,
                    type:api.ajaxType,
                    success:Success,
                    dataType:'json'
                }).error(function (err) {
                        api.callback(err);
                    });
            }


            function Success(response) {
                // if there was an error authorizing the access token then try to regrab it:
                if (response && response.error && response.error.type &&
                    (response.error.message == 'Invalid OAuth access token.' ||
                        response.error.message.indexOf('Error validating access token') > -1)) {
                    InstaAPI.authorize();
                }
                else {
                    api.callback(response);
                }
            }
        }
    };

    window.InstaAPI = InstaAPI;

})();