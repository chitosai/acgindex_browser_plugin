var acgindex_link = null,
    acgindex_core = 'http://acgindex.us/haruka/',
    acgindex_id   = chrome.runtime.id;

var storage = chrome.storage.local;

// “没有找到资源”状态的过期时间 - 12小时
var resource_not_found_state_expire_period = 100 * 3600 * 12;

var TIP = {
    RESOURCE_FOUND                   : '获取完毕 (<ゝω·)',
    RESOURCE_NOT_FOUND               : '找不到资源 （；´д｀）',
    // RESOURCE_NOT_FOUND_STATE_EXPIRED : '数据已过期，您可以点击重新获取',
    RESOURCE_NEED_LOGIN              : '似乎需要登录才能观看 (・∀・)',
}

var SOURCES = {
    'anime' : {
        'bili' : {
            'title' : 'bilibili在线观看',
            'url'   : 'http://www.bilibili.tv/video/av'
        },
        'bt':{
            'title' : 'BT下载',
            'url'   : 'http://bt.ktxp.com'
        }
    },
    'music_album': {
        'moefm' : {
                'title'  : '萌否电台',
                /*'url'    : 'http://moe.fm/search?q=',*/
                'url'    : 'http://moe.fm/search/direct?title=',
                'api'    : 'http://moe.fm/search/direct?api=json&listen=1&bgm_id=',
        },
        'xiami' : {
                'title'  : '虾米',
                'url'    : 'http://www.xiami.com/search/find?album=',
                'api'    : 'http://www.xiami.com/search/find?album='
        },
    },
    'music_single': {
        'moefm' : {
                'title'  : '萌否电台',
                'url'    : 'http://moe.fm/search/song?q=',
                /*'url'    : 'http://moe.fm/search/direct?title=',*/
                'api'    : 'http://moe.fm/search/direct?api=json&listen=1&title=',
        },
        'xiami' : {
                'title'  : '虾米',
                'url'    : 'http://www.xiami.com/search/find?song=',
                'api'    : 'http://www.xiami.com/search/find?song='
        },
        'baidu' : {
                'title'  : '百度音乐',
                'url'    : 'http://music.baidu.com/search?key=',
        }
    }   
}