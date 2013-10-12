// 显示扩展图标
chrome.extension.sendRequest({}, function(response) {});

var acgindex, acgindex_link;

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
		'id'    : 'bili',
		'title' : 'bilibili在线观看',
		'source': 'bili',
		'link'  : 'http://www.bilibili.tv/video/av'
	},
	'bt':{
		'id'    : 'bt',
		'title' : 'BT下载',
		'source': 'bt',
		'link'  : 'http://bt.ktxp.com'
	}
}

/*
 * 插入扩展样式
 * 
 */
function insert_acgindex_stylesheet() {
	$('<link>').attr({
		'rel': 'stylesheet', 
		'type': 'text/css', 
		'href': 'chrome-extension://' + acgindex_id + '/acgindex_link.css'
	}).appendTo($('head'));
}

/*
 * 插入动画资源链接
 * 
 */
function insert_resource_anime() {
	// 生成获取视频地址链接
	acgindex = $('<div id="acgindex_anime">');

	// 加入about信息
	$('<p id="acgindex_about">').text('相关资源').append(
		$('<a>').text('Powered by ACGINDEX.US').attr({
			'id'    : 'acgindex_about_link',
			'target': '_blank',
			'href'  : 'http://acgindex.us/'
		})
	).appendTo(acgindex);

	// 资源链接所在div
	acgindex_link = $('<div id="acgindex_link">');

	// 创建资源链接
	var source;
	for(key in sources) {
		source = sources[key];
		$('<a>').attr({
			'id'    : 'acgindex_' + source.id,
			'title' : source.title,
			'source': source.source,
			'href'  : '*థ౪థ 液！',
			'target': '_blank',
		}).text('*థ౪థ 液！').appendTo(acgindex_link);
	}
	acgindex_link.appendTo(acgindex);

	// 插一个消息提示层
	$('<p id="acgindex_msg">').appendTo(acgindex);

	// 把获取地址的链接插入cluetip悬浮层
	$('#cluetip-outer').append(acgindex);
}
/*
 * 初始化动画资源的获取事件
 * 
 */
function bind_event_anime() {
	// 番组表的hover时读取本地数据
	$('.prg_list, .subject_prg ul').on('mouseenter', 'li', ANIME.init);
	// 获取资源链接点击事件
	acgindex_link.on('click', 'a', ANIME.get);
	// 悬浮提示
	acgindex_link.on('mouseenter', '.acgindex_msg_active', utility.show_msg)
				 .on('mouseleave', '.acgindex_msg_active', function() { utility.hide_msg(true); } );
}

/*
 * 插入音乐资源链接
 * 
 */
function insert_resource_music() {
	// 判断是否是音乐页面
	if( $('#navMenuNeue .focus').attr('href') != '/music' )
		return false;

	// 插入链接
	acgindex = $('<div id="acgindex_music">');
	// 资源链接所在div
	acgindex_link = $('<div id="acgindex_link">');
	$('<span>').text('试听：').appendTo(acgindex_link);

	// 准备数据
	var music_title = $('.nameSingle a').text();

	// 萌否电台链接
	var moefm_link = $('<a>').attr({
		'id'     : 'acgindex_moefm',
		'href'   : 'http://moe.fm/search/direct?title=' + encodeURIComponent(music_title),
		'target' : '_blank',
		'class'  : 'acgindex_real_url',
		'title'  : '萌否电台'
	}).appendTo(acgindex_link);

	// 虾米链接
	var xiami_link = $('<a>').attr({
		'id'     : 'acgindex_xiami',
		'href'   : "http://www.xiami.com/search/find?album=" + encodeURIComponent(music_title),
		'target' : '_blank',
		'class'  : 'acgindex_real_url',
		'title'  : '虾米'
	}).appendTo(acgindex_link);

	// 百度
	var baidu_link = $('<a>').attr({
		'id'     : 'acgindex_baidu',
		'href'   : "http://music.baidu.com/search?key=" + encodeURIComponent(music_title),
		'target' : '_blank',
		'class'  : 'acgindex_real_url',
		'title'  : '百度音乐'
	}).appendTo(acgindex_link);

	// 插入！
	acgindex.append(acgindex_link);
	$('.nameSingle').after(acgindex);
}

// Run
insert_acgindex_stylesheet();

// 插入资源图片/链接等
insert_resource_anime();
insert_resource_music();

// 绑定相关事件
bind_event_anime();