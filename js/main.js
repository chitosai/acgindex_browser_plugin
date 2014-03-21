// 显示扩展图标
chrome.extension.sendRequest({}, function(response) {});

// 插入扩展样式
$('<link>').attr({
	'rel': 'stylesheet', 
	'type': 'text/css', 
	'href': 'chrome-extension://' + acgindex_id + '/acgindex_link.css'
}).appendTo($('head'));

// 读取设置
config.get('user-config', function(data) {
    if( !UTILITY.is_object_empty(data) ) {
        CONFIG = data['user-config'];
    } else {
        CONFIG = default_config;
    }

    // 根据页面类型调用相关方法...
    var page_flag = $('#navMenuNeue .focus');
    if( page_flag.length ) {
        page_type = page_flag.attr('href');
    } else {
        page_type = '/home'
    }
    switch(page_type) {
        case '/home'  : ANIME.init('home'); break;
        case '/anime' : ANIME.init('subject'); break;
        case '/music' : MUSIC.init(); break;
        case '/group' : GROUP.init(); break;
    }
});
