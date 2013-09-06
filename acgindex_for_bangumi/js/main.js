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
	'ktxp':{
		'id'    : 'bt',
		'title' : 'BT下载',
		'source': 'bt'
	}
}

// 插入样式表
function insert_acgindex_stylesheet(){
	$('<link>').attr({
		'rel': 'stylesheet', 
		'type': 'text/css', 
		'href': 'chrome-extension://' + acgindex_id + '/acgindex_link.css'
	}).appendTo($('head'));
}

// 在cluetip浮层里加入我们的链接
function insert_acgindex_link(){
	// 生成获取视频地址链接
	acgindex = $('<div id="acgindex">');

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

// 初始化事件绑定
function bind_event(){
	// 番组表的hover时读取本地数据
	$('.prg_list, .subject_prg ul').on('mouseenter', 'li', data.local);
	// 获取资源链接点击事件
	acgindex_link.on('click', 'a', data.get);
	// 悬浮提示
	acgindex_link.on('mouseenter', '.acgindex_msg_active', utility.show_msg)
				 .on('mouseleave', '.acgindex_msg_active', function() { utility.hide_msg(true); } );
}

// Run
insert_acgindex_stylesheet();
insert_acgindex_link()

bind_event()