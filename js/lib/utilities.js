//Get links, hashes & handles
String.prototype.trim = function () {
    return this.replace(/^\s+|\s+$/g, "");
};

String.prototype.parseURL = function () {
    return this.replace(/[A-Za-z]+:\/\/[A-Za-z0-9-_]+\.[A-Za-z0-9-_:%&~\?\/.=]+/g, function (url) {
        return url.link(url);
    });
};

String.prototype.parseUsername = function () {
    return this.replace(/[@]+[A-Za-z0-9-_]+/g, function (u) {
        var username = u.replace("@", "");
        return u.link("http://instagram.com/" + username);
    });
};

String.prototype.parseHashtag = function () {
    return this.replace(/[#]+[A-Za-z0-9-_]+/g, function (t) {
        var tag = t.replace("#", "%23");
        return t.link('#');
    });
};

/* String trunc */
String.prototype.trunc = function (value) {
    return this.substr(0, value - 1) + (this.length > value ? '...' : '');
};

(function (u) {
    u.debounce = function (func, wait, immediate) {
        var timeout, result;
        return function () {
            var context = this, args = arguments;
            var later = function () {
                timeout = null;
                if (!immediate) result = func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) result = func.apply(context, args);
            return result;
        };
    };
})(window.utils = window.utils || {});

// ellipsis
(function ($) {
    $.fn.ellipsis = function () {
        return this.each(function () {
            var el = $(this);

            if (el.css("overflow") == "hidden") {
                var text = el.html();
                var multiline = el.hasClass('multiline');
                var t = $(this.cloneNode(true))
                        .hide()
                        .css('position', 'absolute')
                        .css('overflow', 'visible')
                        .width(multiline ? el.width() : 'auto')
                        .height(multiline ? 'auto' : el.height())
                    ;

                el.after(t);

                function height() {
                    return t.height() > el.height();
                };
                function width() {
                    return t.width() > el.width();
                };

                var func = multiline ? height : width;

                while (text.length > 0 && func()) {
                    text = text.substr(0, text.length - 1);
                    t.html(text + "...\"");
                }

                el.html(t.html());
                t.remove();
            }
        });
    };
})(jQuery);

// JavaScript Document

var emoji = Array("😄", "😊", "😃", "☺", "😉", "😍", "😘", "😚", "😳", "😌", "😁", "😜", "😝", "😒", "😏", "😓", "😔", "😞", "😖", "😥", "😰", "😨", "😣", "😢", "😭", "😂", "😲", "😱", "😠", "😡", "😪", "😷", "👿", "👽", "💛", "💙", "💜", "💗", "💚", "❤", "💔", "💓", "💘", "✨", "🌟", "💢", "❕", "❔", "💤", "💨", "💦", "🎶", "🎵", "🔥", "💩", "👍", "👎", "👌", "👊", "✊", "✌", "👋", "✋", "👐", "👆", "👇", "👉", "👈", "🙌", "🙏", "☝", "👏", "💪", "🚶", "🏃", "👫", "💃", "👯", "🙆", "🙅", "💁", "🙇", "💏", "💑", "💆", "💇", "💅", "👦", "👧", "👩", "👨", "👶", "👵", "👴", "👱", "👲", "👳", "👷", "👮", "👼", "👸", "💂", "💀", "👣", "💋", "👄", "👂", "👀", "👃", "☀", "☔", "☁", "⛄", "🌙", "⚡", "🌀", "🌊", "🐱", "🐶", "🐭", "🐹", "🐰", "🐺", "🐸", "🐯", "🐨", "🐻", "🐷", "🐮", "🐗", "🐵", "🐒", "🐴", "🐎", "🐫", "🐑", "🐘", "🐍", "🐦", "🐤", "🐔", "🐧", "🐛", "🐙", "🐠", "🐟", "🐳", "🐬", "💐", "🌸", "🌷", "🍀", "🌹", "🌻", "🌺", "🍁", "🍃", "🍂", "🌴", "🌵", "🌾", "🐚", "🎍", "💝", "🎎", "🎒", "🎓", "🎏", "🎆", "🎇", "🎐", "🎑", "🎃", "👻", "🎅", "🎄", "🎁", "🔔", "🎉", "🎈", "💿", "📀", "📷", "🎥", "💻", "📺", "📱", "📠", "☎", "💽", "📼", "🔊", "📢", "📣", "📻", "📡", "➿", "🔍", "🔓", "🔒", "🔑", "✂", "🔨", "💡", "📲", "📩", "📫", "📮", "🛀", "🚽", "💺", "💰", "🔱", "🚬", "💣", "🔫", "💊", "💉", "🏈", "🏀", "⚽", "⚾", "🎾", "⛳", "🎱", "🏊", "🏄", "🎿", "♠", "♥", "♣", "♦", "🏆", "👾", "🎯", "🀄", "🎬", "📝", "📖", "🎨", "🎤", "🎧", "🎺", "🎷", "🎸", "〽", "👟", "👡", "👠", "👢", "👕", "👔", "👗", "👘", "👙", "🎀", "🎩", "👑", "👒", "🌂", "💼", "👜", "💄", "💍", "💎", "☕", "🍵", "🍺", "🍻", "🍸", "🍶", "🍴", "🍔", "🍟", "🍝", "🍛", "🍱", "🍣", "🍙", "🍘", "🍚", "🍜", "🍲", "🍞", "🍳", "🍢", "🍡", "🍦", "🍧", "🎂", "🍰", "🍎", "🍊", "🍉", "🍓", "🍆", "🍅", "🏠", "🏫", "🏢", "🏣", "🏥", "🏦", "🏪", "🏩", "🏨", "💒", "⛪", "🏬", "🌇", "🌆", "🏯", "🏰", "⛺", "🏭", "🗼", "🗻", "🌄", "🌅", "🌃", "🗽", "🌈", "🎡", "⛲", "🎢", "🚢", "🚤", "⛵", "✈", "🚀", "🚲", "🚙", "🚗", "🚕", "🚌", "🚓", "🚒", "🚑", "🚚", "🚃", "🚉", "🚄", "🚅", "🎫", "⛽", "🚥", "⚠", "🚧", "🔰", "🏧", "🎰", "🚏", "💈", "♨", "🏁", "🎌", "🇯🇵", "🇰🇷", "🇨🇳", "🇺🇸", "🇫🇷", "🇪🇸", "🇮🇹", "🇷🇺", "🇬🇧", "🇩🇪", "1⃣", "2⃣", "3⃣", "4⃣", "5⃣", "6⃣", "7⃣", "8⃣", "9⃣", "0⃣", "#⃣", "⬆", "⬇", "⬅", "➡", "↗", "↖", "↘", "↙", "◀", "▶", "⏪", "⏩", "🆗", "🆕", "🔝", "🆙", "🆒", "🎦", "🈁", "📶", "🈵", "🈳", "🉐", "🈹", "🈯", "🈺", "🈶", "🈚", "🈷", "🈸", "🈂", "🚻", "🚹", "🚺", "🚼", "🚭", "🅿", "♿", "🚇", "🚾", "㊙", "㊗", "🔞", "🆔", "✳", "✴", "💟", "🆚", "📳", "📴", "💹", "💱", "♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓", "⛎", "🔯", "🅰", "🅱", "🆎", "🅾", "🔲", "🔴", "🔳", "🕛", "🕐", "🕑", "🕒", "🕓", "🕔", "🕕", "🕖", "🕗", "🕘", "🕙", "🕚", "⭕", "❌", "©", "®", "™");


function to_hex(str) {
    var hex, i;
    hex = '';
    for (i = 0; i < str.length; i++) {
        hex += str.charCodeAt(i).toString(16);
    }
    return hex;
}


String.prototype.emoji = function (size) {
    var oldHtml = this,
        newHtml;
    for (var j = 0; j < emoji.length; j++) {
        // For block/background style
        // oldHtml = oldHtml.replace(emoji[j], '<span style="display: inline-block; background-image: url(img/' + to_hex(emoji[j]) + '.png); background-size: ' + size + 'px; height: ' + size + 'px; width: ' + size + 'px;"></span>');
        // For classic img style
        oldHtml = oldHtml.replace(emoji[j], '<img class="emoji" src="css/img/emoji/' + to_hex(emoji[j]) + '.png" height="' + size + '" width="' + size + '" />');
    }
    newHtml = oldHtml;
    return newHtml;
};
