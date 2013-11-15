// 显示扩展图标
chrome.extension.sendRequest({}, function(response) {});

// 插入扩展样式
$('<link>').attr({
	'rel': 'stylesheet', 
	'type': 'text/css', 
	'href': 'chrome-extension://' + acgindex_id + '/acgindex_link.css'
}).appendTo($('head'));


// 根据页面类型调用相关方法...
var page_type = $('#navMenuNeue .focus').attr('href');
switch(page_type) {
	case '/' : ANIME.init('home'); break;
	case '/anime' : ANIME.init('subject'); break;
	case '/music' : MUSIC.init(); break;
}