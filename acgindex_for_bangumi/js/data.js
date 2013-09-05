/*
 * 这里负责数据的获取与分发
 *
 */
var data = {

    /*
     * 当用户hover在某个li上时，读取被选中的ep的本地数据
     */
    'local' : function() {
        // 获取选中的番组信息
        var a = $(this).children('a'),
            bgmid = a.attr('subject_id'),
            epid = a.text(),
            ep_unique = a.attr('href').replace('/ep/', '');

        // 首页和条目页获取bgmid的位置不同
        // 如果没有取到bgmid需要重新获取一下
        if( !bgmid ) 
            bgmid = $(this).parent().parent().children('a').attr('href').replace('/subject/', '').replace('/ep', '');

        // 把这些数据写到acgindex_link的DOM上
        acgindex_link.data({'bid': bgmid, 'eid': epid});
        // ep-unique-id写到具体链接上
        acgindex_link.children('a').data('ep-unique', ep_unique)
        // 根据ep-unique-id和source-type检查是否有本地数据
        .each(function() {
            var self = $(this),
                source = self.attr('source'),
                key = ep_unique + ':' + source;

            storage.get( key, function(obj) {
                if( utility.is_object_empty(obj) ) {
                    // 没有本地数据时将链接重置
                    self.attr({
                        'class' : '',
                        'href'  : '*థ౪థ 液！'
                    }).data('msg', '');
                } else {
                    // 如果有本地数据就填进去
                    var _class = '',
                        _href = '*థ౪థ 液！',
                        data = obj[key];

                    // 没有找到资源的情况
                    if( data == '' || data == '-1' ) {
                        _class += 'acgindex_msg_active acgindex_disabled';
                        self.data('msg', tip.RESOURCE_NOT_FOUND );
                    } else {
                        // 找到了资源的情况
                        // 先判断是否需要登录
                        if(obj[key][0] == 'x') {
                            data = data.substr(1);
                            self.data('msg', tip.RESOURCE_NEED_LOGIN);
                            _class = 'acgindex_msg_active ';
                        }
                        _href = sources[source].link + data;
                        _class += 'acgindex_real_url';
                    }
                    self.attr({
                        'class' : _class,
                        'href'  : _href
                    });
                }
            });
        });
    },

    /*
     * 用户点击ep时
     * 如果有数据就直接打开资源链接 / 无数据则向服务端发起查询
     */
    'get' : function() {
        var self = $(this), 
            source = self.attr('source'),
            request_data = $.param({
            'b'      : acgindex_link.data('bid'),
            'e'      : acgindex_link.data('eid'),
            'source' : source
        });

        // 先确认是否可点
        if(self.hasClass('acgindex_global_disabled')) return false;
        // 在可点的情况下，如果是已有数据就直接打开新页面
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

                self.removeClass('acgindex_loading')
                    .addClass('acgindex_msg_active acgindex_error acgindex_disabled')
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
                    data = original_data;
                if( data[0] == 'x' ) {
                    need_login = true;
                    data = data.substr(1);
                }

                // parseInt('')会搞出一个NaN对象没法判断...
                var data_int = 0;
                if( data == '' ) data_int = -1;
                else data_int = parseInt(data);

                var return_msg = '';

                // 处理正常情况
                if( data_int >= -1 ) {
                    if( data_int == -1 ) {
                        // 没有找到资源
                        self.addClass('acgindex_msg_active acgindex_disabled').data('msg', tip.RESOURCE_NOT_FOUND);
                        return_msg = tip.RESOURCE_NOT_FOUND;
                    } else {
                        // 找到了资源的情况
                        var url = sources[source].link + data;

                        self.attr({
                            'href'   : url,
                            'class'  : 'acgindex_real_url'
                        });
                        return_msg = tip.RESOURCE_FOUND;

                        // 附上需要登录提示
                        if( need_login ) 
                            self.addClass('acgindex_msg_active').data('msg', tip.RESOURCE_NEED_LOGIN);
                    }
                    // 正常状态可以保存下来
                    var obj = {};
                    obj[self.data('ep-unique') + ':' + source] = original_data; 
                    storage.set( obj, function() {
                        console.log(obj, '已保存到本地');
                    });
                    
                } else {
                    // 异常状态
                    switch(data_int) {
                        case -10 : return_msg = '发出的参数有误，不要随意改动参数哦'; break;
                        case -20 : 
                        case -30 : return_msg = '查询数据库时出错 : ' + data; break;
                        default  : return_msg = '收到了不正常的回复 Σ( °Д °) : ' + data; break;
                    }
                    self.addClass('acgindex_msg_active acgindex_error').data('msg', return_msg);
                }

                utility.enable_ext();
                // 显示一个定时提示，utility.hide_msg_delay后自动消失
                utility.show_msg( return_msg );
                utility.hide_msg();
            }
        });

        return false;
    }
}