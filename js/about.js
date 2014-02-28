$(document).ready(init);

function init() {
	// 显示缓存占用空间
	storage.getBytesInUse( null, function(BytesInUse) {
		$('#storage-usage').text(BytesInUse/1000 + 'kb');
	});

	// 清空缓存
	$('#storage-clear').on('click', function(){
		storage.clear(function(){
			$('#storage-usage').text('0 k');
			alert('缓存已清空 _(:3ゝ∠)_');
		});
	});

	// 读取设置
	config.get('user-config', function(data){
		var tmp;
		if( !UTILITY.is_object_empty(data) ) {
			tmp = data['user-config'];
		} else {
			tmp = default_config;
		}
		// 把设置显示到弹出页上
		show_config(tmp);
	});
	
	// 更新设置
	$('input, select').change(update_config);
}

function show_config(config){
	var key, value, dom;
	for( key in config ) {
		dom = $('#' + key);
		if( !dom.length ) continue;

		value = config[key];
		// 根据value的类型判断如何设置
		if( typeof value == 'boolean' ) {
			if( value ) {
				dom.attr('checked', 'checked');
				$('*[master=' + key + ']').removeAttr('disabled');
			} else {
				dom.removeAttr('checked');
				$('*[master=' + key + ']').attr('disabled', true);
			}
		} else {
			dom.val(value);
		}
	}
}

function update_config(){
	var self = $(this),
		key = self.attr('id'),
		value = self.val();

	// 获取input[type=checkbox]的值
	if( value == 'on' ) {
		value = self.prop('checked') ? true : false;
		if(value) {
			$('*[master=' + key + ']').removeAttr('disabled');
		} else {
			$('*[master=' + key + ']').attr('disabled', true);
		}
	}

	// 检查input[type=number]的值是否越界
	if( self.attr('type') == 'number' ) {
		var min = parseInt(self.attr('min')), max = parseInt(self.attr('max'));
		if( value > max ) {
			value = max;
			self.val(max);
		} else if( value < min ) {
			value = min;
			self.val(min);
		}
	}

	config.get('user-config', function(data) {
		var c = {};
		if( !UTILITY.is_object_empty(data) ) {
			c = data['user-config'];
		} else {
			c = default_config;
		}
		c[key] = value;

		// 保存
		var tmp = {'user-config' : c};
		console.log(tmp);
		chrome.storage.sync.set(tmp);
	});
}