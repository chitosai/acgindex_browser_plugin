var acgindex_link = null,
    acgindex_core = 'http://acgindex.us/haruka/',
    acgindex_id   = chrome.runtime.id;

var storage = chrome.storage.local;

var tip = {
    RESOURCE_FOUND     : '获取完毕 (<ゝω·)',
    RESOURCE_NOT_FOUND : '找不到资源 （；´д｀）',
    RESOURCE_NEED_LOGIN: '似乎需要登录才能观看 (・∀・)'
}

var sources = {
    'bili' : {
        'title' : 'bilibili在线观看',
        'source': 'bili',
        'link'  : 'http://www.bilibili.tv/video/av'
    },
    'bt':{
        'title' : 'BT下载',
        'source': 'bt',
        'link'  : 'http://bt.ktxp.com'
    }
}