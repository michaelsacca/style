// Comment or uncomment this for production / dev
// console.log = function(){};
var bgPage = window.bgPage = chrome.extension.getBackgroundPage(),
// the instagram API
    InstaAPI = window.InstaAPI = bgPage.InstaAPI,
// the localStorage API:
    Data = window.Data = bgPage.Data;


// make all logs to any related consoles show up in this tab:
bgPage.console.log = function () {
    window.console.log('bg:', arguments);
};

/** 
 * RETURN key binding for Knockout.js 
 */
ko.bindingHandlers.executeOnEnter = {
    init:function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var allBindings = allBindingsAccessor(),
            context = {},
            onlySubmitOnce = utils.debounce(function () {
                allBindings.executeOnEnter.call(viewModel, context);
            }, 2000, true);

        $(element).keypress(function (event) {
            context = this;
            var keyCode = (event.which ? event.which : event.keyCode);
            if (keyCode === 13) {
                onlySubmitOnce();
                return false;
            }
            return true;
        });
    }
};

function ModalViewModel() {
    var self = this;

    self.modalContainer = $('.modalContainer');
    // the currently active modal item
    self.activeModal = ko.mapping.fromJS({
        caption:{
            text:""
        },
        comments:{
            data:[]
        }
    });

    self.active = ko.observable(false);

    self.addNewComment = function (input) {
        var $input = $(input);
        InstaAPI.sendComment(this.id(), $input.val(), function (res) {
            if (res && !res.error) {
                // add the new comment to the comment list
                self.activeModal.comments.data.push(res.data);
                // Scroll to bottom of div to view comment 
                $(".comments").scrollTop($(".comments")[0].scrollHeight);
                // and remove any text from input:
                $input.val('');
            }
        });
    };
}
// view models container for the page:
function AppViewModels() {
    var self = this;
    self.modalContainer = $('.modalContainer');

    self.feedItems = ko.observableArray([]);

    // set all the child view models:
    self.modal = ko.observable(new ModalViewModel());
    self.userFeedItems = ko.observableArray([]);
    self.setActiveModal = function (feedItem) {
        InstaAPI.getFeedItem(feedItem.id, function (res) {

            console.log('getting individual feed item:, ', res);
            ko.mapping.fromJS(res, self.modal().activeModal);

            self.modal().activeModal.comments.data(res.comments.data);
            self.modal().active(true);
            $('body').css('overflow', 'hidden');
            var height = self.modal().modalContainer.height();

            // Get Following Information
            var status = 'unresolved',
                relationship = $('.relationship'),
                id = res.user.id;
            
            insta.getRelationship(id, function (data) {
                console.log(data);

                //success was called:
                if (data.data.outgoing_status == 'follows') {
                    relationship.addClass('follows');
                } else if (data.data.outgoing_status == 'none' && data.data.target_user_is_private === true) {
                    relationship.addClass('followsNotPrivate');
                } else if (data.data.outgoing_status == 'none' && data.data.target_user_is_private === false) {
                    relationship.addClass('followsNot');
                }
            });

            $(".comments").scrollTop($(".comments")[0].scrollHeight);
        });

    };
}
var mainViewModel = new AppViewModels();
ko.applyBindings(mainViewModel);

var showing = 0,
    showInput = $('#searchDisplay'),
    hashTagLink = $('.caption a'),
    postCount = $('#post-count'),
    postCountNum = Data.get('_postCounts'),

// Page Count for lazy load
    nextPage = localStorage.getItem('nextPage'),
    page = 1;


var insta = {
    buildFeed:function (feed) {
        // cache the requested feed and only cache for one minute:
        if (page === 1) {
            if (!Data.isCacheValid(Data.StorageKeys.Feed)) {
                Data.set(Data.StorageKeys.Feed, feed, 1000 * 60);
            }
        }

        //Set Default Post Count
        postCountNum = +postCountNum || 20;

        // set the template for the main feed with the specific post counts
        if (!feed) {
            // todo: handle null feeds better:
            return;
        }

        var feedData = feed.data || feed; // set the feed based on if we got a data-only response

        if (page === 1) {
            mainViewModel.feedItems(feedData.slice(0, postCountNum));
            
        } else {
            // you can't push an array to an observablearray, you must go through each item
            // and add it individually
            for (var i = 0; feedData && i < feedData.length; i++) {
                mainViewModel.feedItems.push(feedData[i]);
            }
        }

        //insert add into a random position 2 per 20
        var minRand = 4;
        var maxRand = 10;
        var ad = 'C6BDC';

        var min2Rand = 14;
        var max2Rand = 20;
        var ad2 = 'C6BDC';

        var injectAd = function (min, max, ad) {
            var rand = Math.random(); //return a decimal between 0 and 1
            var randSpan = rand * (max - min);
            var floor = Math.floor(randSpan);
            var pos = floor + min + ((page - 1) * 20);

            console.log('inject ad');

            // Insert Add Code Here
            $.ajax({
                type:'get',
                url:'https://srv.buysellads.com/ads/' + ad + '.json',
                success:Success,
                error:Error,
                dataType:'jsonp'
            });
            function Success(res) {

                console.log(res);

                if (!res.ads[0].instagramId) {
                    _gaq.push(['_trackEvent', 'ads', 'api no response', ad]);
                    return;
                }

                var adId = res.ads[0].instagramId,
                    clickUrl = res.ads[0].statlink_default,
                    clickId = clickUrl.substring(clickUrl.lastIndexOf('/') + 1);

                InstaAPI.getFeedItem(adId, function (res) {
                    mainViewModel.feedItems.splice(pos, 0, res);
                    $('#picsList li').eq(pos).attr('data-clickid', clickId).addClass('featured');
                     _gaq.push(['_trackEvent', 'ads', 'api called', ad]);
                });
            }

            function Error(response) {
                console.log('calling error', response);

            }
        };
        if (InstaAPI.getAccessToken()) {
            console.log('call ad injection');
            injectAd(minRand, maxRand, ad);
            _gaq.push(['_trackEvent', 'ads', 'api called', ad]);
        }
    },

    buildUsers:function (list) {
        mainViewModel.userFeedItems(list);
        if ($('.userResultsHldr').height() >= $(document).height()) {
            console.log('results checked', list);
            $('.userResultsHldr').height($(document).height() - 50);
        }
    },

    userNameContainer:$('#userName'),
    buildUser:function (user) {
        var info = '<img class="avatar" src="' + user.profile_picture + '"/>' +
            '   <div class="name">' + user.username + '</div>';
        //'   <div class="stats">' + user.counts.followed_by + ' followers / ' + user.counts.media + ' Photos</div>';

        this.userNameContainer.html(info);
    },
    like:function (id, success) {
        InstaAPI.apiCall({
            path:'/media/' + id + '/likes',
            ajaxType:'post',
            callback:function (data) {

                // only call success if this was actually successful:
                if (data.meta || data.meta.code === 200) {
                    console.log('like called:', data);
                    Data.remove(Data.StorageKeys.Feed);
                    success && $.isFunction(success) && success(data);
                }
            }
        });
    },
    unlike:function (id, success) {
        InstaAPI.apiCall({
            path:'/media/' + id + '/likes',
            ajaxType:'DELETE',
            callback:function (data) {

                // only call success if this was actually successful:
                if (data.meta || data.meta.code === 200) {
                    Data.remove(Data.StorageKeys.Feed);
                    success && $.isFunction(success) && success(data);
                }
                Data.remove(Data.StorageKeys.Feed);
            }
        });
    },
    getTag:function (tag) {
        InstaAPI.getTagFeed(tag, function (data) {
            insta.buildFeed(data);

        });
    },
    getUserList:function (query) {
        InstaAPI.searchUsers(query, function (data) {
            insta.buildUsers(data);
        });
    },
    getRelationship:function (id, success) {
        InstaAPI.apiCall({
            path:'/users/' + id + '/relationship',
            ajaxType:'get',
            callback:function (data) {
                // only call success if this was actually successful:
                if (data.meta || data.meta.code === 200) {
                    success && $.isFunction(success) && success(data);
                }
            }
        });
    },
    relationshipAction:function (userID, action) {
        InstaAPI.relationshipAction(userID, action, function () {
        });
    }
};

/* Decision Tree */
var ui = {
    init:function () {

        var inputVal = Data.get('_searchValue');

        /* Set input value
         if (inputVal !== '' && inputVal !== 'undefined' && inputVal !== false) {
         showInput.val(inputVal)
         }*/

        // Show user data
        if (InstaAPI.getAccessToken()) {
            $('.loginHldr, #settingsAuth').hide();
            $('#userName').show();
            $("#navigation .following").css('display', 'inline-block');
            InstaAPI.getUser(function (res) {
                insta.buildUser(res.data);
            });
        }

        ui.setFeed();
    },

    /* ===========================
     *
     * Handles all feed items (initialization & updates)
     *
     * todo: handle next_max_id undefined error
     *
     * =========================== */

    setFeed:function (from, page, forceRefresh) {
        var curr = localStorage.getItem('current'),
            from = from || curr,
            page = page || 1,
            next_id = localStorage.getItem('next_id');

        if (forceRefresh) { // forces refresh of the feed so we can get the latest version of the user's feed
            console.log('Forcing refresh');
            Data.set(Data.StorageKeys.Feed);
        }

        if (from === 'popular' || !InstaAPI.getAccessToken()) {
            if (page === 1) {
                $('#navigation li.popular').addClass('active');
            }
            InstaAPI.getPopularFeed(function (data) {
                insta.buildFeed(data);
            });
        } else {
            if (page === 1) {
                InstaAPI.getUserFeed(function (res) {
                    $('#navigation li.following').addClass('active');
                    if (res.pagination.next_max_id === window.localStorage.getItem('next_id')) {
                        return;
                    } else {
                        window.localStorage.setItem('next_id', res.pagination.next_max_id);
                    }
                    //var next_id = res.pagination.next_max_id;
                    insta.buildFeed(res.data);
                });
            } else {
                InstaAPI.addUserFeed(next_id, function (res) {
                    // Update Next ID
                    console.log('next id:', next_id);
                    //console.log('next id:', window.localStorage.getItem('next_id'));
                    if (next_id === 'undefined' || !next_id || next_id === 'null' || next_id === '' || res.pagination.next_max_id === window.localStorage.getItem('next_id')) {
                        // do nothing
                        console.log('caught dups');
                        return;
                    } else {
                        window.localStorage.setItem('next_id', res.pagination.next_max_id);
                        insta.buildFeed(res.data);
                    }

                });
            }
        }
    }
};

$(function () {
    var from = localStorage.getItem('current');
    ui.init();


    var body = $('body'),
        picsList = body.find('#picsList'),
        modalContainer = body.find('#modalOverlayContainer'),
        navigation = $('#navigation');

    // when like button is clicked:
    body.on('click', '.heart', function () {
        var heartButton = $(this),
            id = $(this).attr('rel'),
            likeCountLabel = heartButton.siblings('.likeCount'),
            likeCount = +likeCountLabel.text();
        if (!InstaAPI.getAccessToken()) {
            toastr.warning('Hey there shutterbug, why don\'t you login so you can like all the pictures');
            return;
        }
        if (heartButton.hasClass("liked")) {
            insta.unlike(id, function () {
                //success was called:
                heartButton.removeClass('liked');
                likeCountLabel.html(likeCount--).removeClass("liked");
            });
        } else {
            insta.like(id, function () {
                //success was called:
                heartButton.addClass('liked');
                likeCountLabel.html(++likeCount).addClass('liked');
            });
        }
    });


    // on hover of any image:
    picsList.on('hover', 'li', function () {
        var $this = $(this),
            captionContainer = $this.find('.caption');

        if($this.hasClass('featured')) {
            _gaq.push(['_trackEvent', 'ads', 'hovered featured', $this.attr('data-mediaid')]);
        }    

        if (captionContainer.height() > 75) {
            captionContainer.css('height', 75);
        }
        /*captionContainer.ellipsis();*/
        $this.find('.heart').addClass('activate');
        setTimeout(function () {
            $this.find('.heart').removeClass('activate');
        }, 500);
    });

    // settings button clicked:
    body.on('click', '.account', function () {
        $(".settingsPop").fadeIn(250);
        picsList.addClass('blur');
        $(".content").removeClass('out').addClass('in').show();
    });

    // click to close settings menu
    body.on('click', '.overlayBg', function () {
        $(".settingsPop").delay(150).fadeOut(250);
        picsList.removeClass('blur');
        $(".content").removeClass('in').addClass('out').css({
        });
    });

    body.on('hover', '.modalContainer', function () {
        $('#newCommentInput').autoGrow();
    });

    // popular and following link clicks:
    navigation.on('click', 'li', function () {
        var link = $(this),
            isPopLink = link.text().trim() === 'Popular';

        link.siblings().removeClass('active');
        link.addClass('active');
        $("html, body").animate({ scrollTop:0 }, 600);
        // flush cache and get the appropriate feed type:
        Data.set(Data.StorageKeys.Feed);
        if (isPopLink) {
            page = 1;
            ui.setFeed('popular', page, true);
            window.localStorage.setItem('current', 'popular');
        } else {
            page = 1;
            ui.setFeed('following', page, true);
            window.localStorage.setItem('current', 'following');
        }
    });

    /* ==============================
     *
     * Lazy Load Posts From Feed
     *
     * =========================== */

    addshots = setInterval(function () {

        a = $(document).height(),
            b = $(window).height(),
            c = $(window).scrollTop();
        diff = b + c;

        if (diff >= a - 805) {
            from = localStorage.getItem('current');
            //what = $("#what").text();
            _gaq.push(['_trackEvent', 'scoll', from, page]);
            page++;

            ui.setFeed(from, page);

        }
    }, 1200);

    $('.authInsta').click(function () {
        InstaAPI.authorize();
    });

    // Send ad click data to buy sell ads
    body.on('click', '.featured .userDetails a.link', function () {
        //console.log($(this));
        var clickId = $(this).parent().parent('.featured').attr('data-clickid'),
            mediaid = $(this).parent().parent('.featured').attr('data-mediaid');
        console.log('clickId: ' + clickId);

        _gaq.push(['_trackEvent', 'ads', 'clicked featured', mediaid]);
        
        $.ajax({
            type:'post',
            url:'https://srv.buysellads.com/ads/click/x/' + clickId,
            //success:Success,
            //error: Error,
            dataType:'jsonp'
        });
    });

    // Follow featured user
    body.on('click', '.featured .userDetails .usersAvatar .relationship', function () {
        //console.log($(this));
        var clickId = $(this).parent().parent().parent('.featured').attr('data-clickid'),
            mediaid = $(this).parent().parent().parent('.featured').attr('data-mediaid');
        console.log('clickId: ' + clickId);

        _gaq.push(['_trackEvent', 'ads', 'followed featured', mediaid]);

        $.ajax({
            type:'post',
            url:'https://srv.buysellads.com/ads/click/x/' + clickId,
            //success:Success,
            //error: Error,
            dataType:'jsonp'
        });
    });

    // Like featured image
    body.on('click', '.featured .heart', function () {
        var clickId = $(this).parent().parent('.featured').attr('data-clickid'),
        mediaid = $(this).parent().parent().parent('.featured').attr('data-mediaid');
        console.log('clickId Heart: ' + clickId);

        _gaq.push(['_trackEvent', 'ads', 'liked featured', mediaid]);

        $.ajax({
            type:'post',
            url:'https://srv.buysellads.com/ads/click/x/' + clickId,
            //success:Success,
            //error: Error,
            dataType:'jsonp'
        });
    });

    // click to close modal window
    body.on('click', '.modalOverlay', function () {
        var self = $(this);

        self.siblings('.modalContainer').addClass('out');
        $('body').css('overflow', 'auto');

        $(".modalOverlay").delay(150).fadeOut(250);

        setTimeout(function () {
            mainViewModel.modal().active(false);
        }, 600);
    });

    //Get Following Information
    picsList.on('mouseenter', '.usersAvatar', function () {
        var status = 'unresolved',
            $this = $(this),
            id = $this.attr('rel');

        insta.getRelationship(id, function (data) {
            //success was called:
            if (data.data.outgoing_status == 'follows') {
                $this.addClass('follows');
            } else if (data.data.outgoing_status == 'none' && data.data.target_user_is_private === true) {
                $this.addClass('followsNotPrivate');
            } else if (data.data.outgoing_status == 'none' && data.data.target_user_is_private === false) {
                $this.addClass('followsNot');
            }
        });
    });


    $('body').on('click', '.relationship', function () {
        var userID = mainViewModel.modal().activeModal.user.id(),
            $this = $(this),
            action = ''; 

            console.log(userID);
            console.log($this)

        if ($this.hasClass('follows')) {
            action = 'unfollow';
            $this.removeClass('follows').addClass('followsNot');
            insta.relationshipAction(userID, action);
        } else if ($this.hasClass('followsNot')) {
            action = 'follow';
            $this.removeClass('followsNot').addClass('follows');
            insta.relationshipAction(userID, action);
        } else if ($this.hasClass('followsNotPrivate')) {
            action = 'follow';
            $this.removeClass('followsNot').addClass('requested');
            insta.relationshipAction(userID, action);
        }
    });

});
