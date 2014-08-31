var acgindex_link = null,
    acgindex_core = 'http://acgindex.us/bangumi/',
    acgindex_id   = chrome.runtime.id;

var storage = chrome.storage.local;
var config  = chrome.storage.sync;

// 新番播出后多少时间内提示“可能还没有资源”- 48小时
var resource_not_found_time_too_short = 1000 * 3600 * 48;

// 返回值消息多少ms后隐藏
var hide_msg_delay = 3000;

var TIP = {
    RESOURCE_FOUND                   : '获取完毕 (<ゝω·)',
    RESOURCE_NOT_FOUND               : '找不到资源 （；´д｀）',
    // RESOURCE_NOT_FOUND_STATE_EXPIRED : '数据已过期，您可以点击重新获取',
    RESOURCE_NEED_LOGIN              : '似乎需要登录才能观看 (・∀・)',
    RESOURCE_NOT_FOUND_TIME_TOO_SHORT: '这话刚刚播出不到48小时，似乎还没出资源，过几个小时再来看看吧 (・∀・)',
    RESOURCE_NOT_BOARDCASTED         : '诶，这话似乎还没有播出啊 (´･ω･`)',
    RESOURCE_NOT_FOUND_RETRY         : '再点我一下试试，说不定资源已经出了呢 (・∀・)',
}

var SOURCES = {
    'anime' : {
        'bili' : {
            'title' : 'bilibili在线观看',
            'url'   : 'http://www.bilibili.com/video/av'
        },
        'bt':{
            'title' : 'BT下载',
            'url'   : 'http://bt.ktxp.com'
        }
    },
    'music_album': {
        'xiami' : {
            'title'  : '虾米',
            'url'    : 'http://www.xiami.com/search/find?album=',
            'api'    : 'http://www.xiami.com/search/find?album='
        },
        'netease' : {
            'title': '网易云音乐',
            'url'  : 'http://music.163.com/#/search/m/?type=10&s=',
        },
        'moefm' : {
            'title'  : '萌否电台',
            /*'url'    : 'http://moe.fm/search?q=',*/
            'url'    : 'http://moe.fm/search/direct?title=',
            'api'    : 'http://moe.fm/search/direct?api=json&listen=1&bgm_id=',
        },
    },
    'music_single': {
        'xiami' : {
            'title'  : '虾米',
            'url'    : 'http://www.xiami.com/search/find?song=',
            'api'    : 'http://www.xiami.com/search/find?song='
        },
        'netease' : {
            'title' : '网易云音乐',
            'url'   : 'http://music.163.com/#/search/m/?type=1&s='
        },
        'baidu' : {
            'title'  : '百度音乐',
            'url'    : 'http://music.baidu.com/search?key=',
        },
        'moefm' : {
            'title'  : '萌否电台',
            'url'    : 'http://moe.fm/search/song?q=',
            /*'url'    : 'http://moe.fm/search/direct?title=',*/
            'api'    : 'http://moe.fm/search/direct?api=json&listen=1&title=',
        },
    }   
}

// 默认设置
var default_config = {
    'group_pager_enable'            : true,
    'group_pager_comments_per_page' : 20,
    'group_pager_order_by'          : 'asc'
}
var CONFIG;