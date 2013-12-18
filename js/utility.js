/*
 * 这里负责定义一些无关主题的方法，省得main看着乱
 * 
 */
var UTILITY = {
	// 检查对象是否为空
	is_object_empty : function(obj) {
		for( key in obj ) 
			return false;
		return true;
	},

	// 显示消息用的
	hide_msg_delay : 1000,
	hide_msg_timeout : null,
	show_msg : function( input ) {
		clearTimeout(UTILITY.hide_msg_timeout);
		if( typeof(input) == 'object' ) {
			// 自动从DOM上获取提示文本
			flag = $(this).attr('class');
			msg = $(this).data('msg');
		} else {
			// 人工传入文本
			flag = 'acgindex_msg_active';
			msg = input;
		}
		var mbox = $('#acgindex_msg'), text_len = msg.length;
		mbox.text(msg).css({
			'left': (275-mbox.width())/2 + 'px'
		}).attr('class', flag);
	},
	hide_msg : function( immediately ) {
		UTILITY.hide_msg_timeout = setTimeout(function() {
			$('#acgindex_msg').attr('class', '');
		}, (immediately === true ? 1 : UTILITY.hide_msg_delay));
	},

	// 全局状态
	enable_ext : function() {
		$('.acgindex_global_disabled').removeClass('acgindex_global_disabled');
		$('.acgindex_msg_active_flag').removeClass('acgindex_msg_active_flag').addClass('acgindex_msg_active');

		UTILITY.hide_msg(true);
	},
	disable_ext : function( msg ) {
		$('.acgindex_link a').addClass('acgindex_global_disabled');
		$('.acgindex_msg_active').removeClass('acgindex_msg_active').addClass('acgindex_msg_active_flag');

		if( typeof(msg) == 'string' ) UTILITY.show_msg(msg)
	}

}




/*
 * 负责与储存相关的事务
 * 
 */
var STORAGE = {
	// 保存数据，并带上时间戳
	// @data = { key : { 'value' : value, 'timestamp' : timestamp } }
	'save' : function( key, data, callback ) {
		// 数据不能为空
		if( typeof data == 'undefined' || !data || UTILITY.is_object_empty(data) )
			return false;

		// 给数据加上时间戳
		var time = new Date().getTime();
		data['timestamp'] = time;

		var obj = {};
		obj[key] = data;

		// 写入数据
		if( callback && typeof callback == 'function' )
			storage.set(obj, callback);
		else
			storage.set(obj);
	}
}


/**
 * 增加一些jquery方法
 * 
 */
$.fn.disable = function() {
	$(this).addClass('acgindex_disabled');
	return $(this);
}
$.fn.enable = function() {
	$(this).removeClass('acgindex_disabled');
	return $(this);
}