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

	// 显示返回值消息
	init_msg : function() {
        // 插一个消息提示层
        acgindex_msg = $('<div>').attr('id', 'acgindex_msg').appendTo($('body'));
        // 这个层一直跟着鼠标移动
        $(document).mousemove(function(e) {
        	acgindex_msg.css({
        		top: e.pageY,
        		left: e.pageX + 20
        	});
        });
	},
	show_msg : function( msg, hide_delay, loading ) {
		// 移除原有消息
		var prev = acgindex_msg.children('p');
		prev.addClass('acgindex_msg_slide_out');
		setTimeout(function(){
			prev.remove();
		}, 500);

		// 创建新消息
		var m = $('<p>').addClass('acgindex_msg_slide_in').text(msg);
		// 如果是读取状态要加上读取状态特殊标识
		if( loading ) m.addClass('acgindex_msg_loading');
		// 加入DOM
		m.appendTo(acgindex_msg);

		// 滑进来
		setTimeout(function() {
			m.removeClass('acgindex_msg_slide_in');
		}, 10);
		
		// 没有被新消息移除的话，hide_delay后自动消失
		setTimeout(function() {
			if(m) {
				// 消失动画
				m.addClass('acgindex_msg_slide_out');
				// 300ms后移除DOM
				setTimeout(function(){
					m.remove();
				}, 300);
			}
		}, hide_delay ? hide_delay : hide_msg_delay);
	},

	// 全局状态
	enable_ext : function() {
		$('.acgindex_global_disabled').removeClass('acgindex_global_disabled');
	},
	disable_ext : function( msg, hide_delay, loading ) {
		$('.acgindex_link a').addClass('acgindex_global_disabled');
		UTILITY.show_msg(msg, hide_delay, loading);
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
$.fn.pop = function() {
    var top = this.get(-1);
    this.splice(this.length-1,1);
    return $(top);
};
$.fn.shift = function() {
    var bottom = this.get(0);
    this.splice(0,1);
    return $(bottom);
};