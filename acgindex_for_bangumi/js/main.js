// 显示扩展图标
chrome.extension.sendRequest({}, function(response) {});

var acgindex_link = null,
	acgindex_core = 'http://acgindex.us/haruka/',
	acgindex_id   = chrome.runtime.id,
	bili_link     = 'http://www.bilibili.tv/video/av';

var storage = chrome.storage.local;

var tip = {
	RESOURCE_FOUND     : '获取完毕 (<ゝω·)',
	RESOURCE_NOT_FOUND : '找不到资源 （；´д｀）',
	RESOURCE_NEED_LOGIN: '似乎需要登录才能观看 (・∀・)'
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

	// 加入bili链接
	$('<a>').attr({
		'id'　　: 'acgindex_bili',
		'title' : 'bilibili',
		'source': 'bili',
		'href'  : '*థ౪థ 液！',
		'target': '_blank',
	}).text("bili").appendTo(acgindex_link);

	acgindex_link.appendTo(acgindex);

	// 插一个消息提示层
	$('<p id="acgindex_msg">').appendTo(acgindex);

	// 把获取地址的链接插入cluetip悬浮层
	$('#cluetip-outer').append(acgindex);
}

// 当用户hover在某个li上时，更新选中的番组信息
function update_acgindex_link(){
	// 获取选中的番组信息
	var a = $(this).children('a'),
		bgmid = a.attr('subject_id'),
		epid = a.text(),
		ep_unique = a.attr('href').replace('/ep/', '');

	// 首页和条目页获取bgm id的位置不同，需要重新获取一下
	if( !bgmid ) bgmid = $(this).parent().parent().children('a').attr('href').replace('/subject/', '').replace('/ep', '');

	// 更新到acgindex_link上
	acgindex_link.data('bid', bgmid).data('eid', epid);
	// 以及ep unique id到具体链接上
	acgindex_link.children('a').data('ep-unique', ep_unique)
	// 根据ep-unique-id和source-type检查是否有本地数据
	.each(function(){
		var self = $(this),
			source = self.attr('source'),
			key = ep_unique + ':' + source;
		storage.get( key, function(obj){
			if( utility.is_object_empty(obj) ) {
				// 没有本地数据时将链接重置
				self.attr({
					'class' : '',
					'href'  : '*థ౪థ 液！'
				}).data('msg', '');
			} else {
				// 如果有本地数据就填进去
				var _class = '',
					_href = '*థ౪థ 液！';

				if( obj[key] == '' || obj[key] == '-1' ) {
					_class += 'acgindex_msg_active acgindex_disabled';
					self.data('msg', tip.RESOURCE_NOT_FOUND );
				} else {
					var data = obj[key], need_login = false;
					// 先判断需要登录
					if(data[0] == 'x') {
						data = data.substr(1);
						need_login = true;
					}
					switch(source){
						case 'bili' : _href = bili_link; break;
					}
					_href += data;
					_class = 'acgindex_real_url' + (need_login ? ' acgindex_msg_active' : '');
				}
				self.attr({
					'class' : _class,
					'href'  : _href
				});
				if(need_login) self.data('msg', tip.RESOURCE_NEED_LOGIN);
			}
		});
	});
}

// 用户点击获取链接时
function ajax_get_resource(){
	var self = $(this), source = self.attr('source');
	var request_data = $.param({
		'b'      : acgindex_link.data('bid'),
		'e'      : acgindex_link.data('eid'),
		'source' : source
	});

	// 先确认是否可点
	if(self.hasClass('acgindex_global_disabled')) return false;
	if(self.hasClass('acgindex_real_url')) return true;

	$.ajax({
		'url': acgindex_core + request_data, 
		'timeout': 5000, 
		'beforeSend': function(){
			self.addClass('acgindex_loading');
			utility.disable_ext('少女读取中');
		},
		'error': function(xhr, errorType, error){
			// xhr.status == 0 表示超时
			switch(xhr.status){
				case 0   : var msg = '0 - 请求超时'; break;
				case 404 : var msg = '404 - 无法连接上数据库'; break;
				case 500 : var msg = '500 - 目录娘身体不舒服 QAQ'; break;
				default  : var msg = '? - 遇到了无法理解的问题... ' + xhr.status;
			}
			console.log(xhr.status);
			self.removeClass('acgindex_loading').addClass('acgindex_msg_active acgindex_error acgindex_disabled')
				.data('msg', msg);
			utility.enable_ext();
			
			// 显示一个定时提示，utility.hide_msg_delay后自动消失
			utility.show_msg( msg );
			utility.hide_msg();
		},
		'success': function(original_data, status, xhr) {
			// 移除loading动画
			self.removeClass('acgindex_loading');

			// 先处理是否需要登录，把头给拿掉
			var need_login = false,
				data = null;
			if(original_data[0] == 'x') {
				need_login = true;
				data = original_data.substr(1);
			} else data = original_data;

			// parseInt('')会搞出一个NaN对象没法判断...
			var data_int = 0;
			if(data == '') data_int = -1;
			else data_int = parseInt(data);

			var return_msg = '';

			// 处理正常情况
			if( data_int >= -1 ){
				if( data_int == -1 ){
					// 没有找到资源
					self.addClass('acgindex_msg_active acgindex_disabled').data('msg', tip.RESOURCE_NOT_FOUND);
					return_msg = tip.RESOURCE_NOT_FOUND;
				} else {
					// 找到了资源的情况
					switch(source){
						case 'bili' : var url = bili_link + data; break;
					}
					self.attr({
						'href'   : url,
						'class'  : 'acgindex_real_url'
					});
					return_msg = tip.RESOURCE_FOUND;

					// 附上需要登录提示
					if(need_login) self.addClass('acgindex_msg_active').data('msg', tip.RESOURCE_NEED_LOGIN);
				}
				// 正常状态可以保存下来
				var obj = {};
				obj[self.data('ep-unique') + ':' + source] = original_data; 
				storage.set( obj, function() {
					console.log(obj, '已保存到本地');
				});
				
				utility.enable_ext();
			}
			// 异常状态
			else {
				switch(data) {
					case -10 : return_msg = '发出的参数有误，不要随意改动参数哦'; break;
					case -20 : 
					case -30 : return_msg = '查询数据库时出错 : ' + data; break;
					default  : return_msg = '收到了不正常的回复 Σ( °Д °) : ' + data; break;
				}
				self.addClass('acgindex_msg_active acgindex_error').data('msg', return_msg);

				utility.enable_ext();
			}

			// 显示一个定时提示，utility.hide_msg_delay后自动消失
			utility.show_msg( return_msg );
			utility.hide_msg();
		}
	});

	return false;
}

// 初始化事件绑定
function bind_event(){
	// 番组表的hover选中事件
	$('.prg_list, .subject_prg ul').on('mouseenter', 'li', update_acgindex_link);
	// 获取资源链接点击事件
	acgindex_link.on('click', 'a', ajax_get_resource);
	// 悬浮提示
	acgindex_link.on('mouseenter', '.acgindex_msg_active', utility.show_msg)
				 .on('mouseleave', '.acgindex_msg_active', utility.hide_msg);
}

// Run
insert_acgindex_stylesheet();
insert_acgindex_link()

bind_event()