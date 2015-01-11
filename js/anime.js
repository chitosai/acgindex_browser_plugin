/*
 * 这里负责数据的获取与分发
 *
 */
var ANIME = {
    /*
     * 初始化!!!
     * 
     */
    'init' : function(type) {
        ANIME.init_dom();
        ANIME.init_event(type);
        UTILITY.init_msg();
    },

    /*
     * 插入资源链接
     * 
     */
    'init_dom' : function() {
        // 生成获取视频地址链接
        acgindex = $('<div>').addClass('acgindex_anime');

        // 加入about信息
        $('<p class="acgindex_about">').text('相关资源').append(
            $('<a>').text('Powered by ACGINDEX.US').attr({
                'class' : 'acgindex_about_link',
                'target': '_blank',
                'href'  : 'http://acgindex.us/'
            })
        ).appendTo(acgindex);

        // 资源链接所在div
        // 因为后面还经常会引用到，所以干脆写成全局变量了
        acgindex_link = $('<div>').addClass('acgindex_link');

        // 创建资源链接
        for(source in SOURCES['anime']) {
            $('<a>').attr({
                // 'title' : SOURCES['anime'][source].title,
                'source': source,
                'href'  : '*థ౪థ 液！',
                'target': '_blank',
            }).appendTo(acgindex_link);
        }
        acgindex_link.appendTo(acgindex);


        // 自从bangumi使用了rocket script，现在必须等cluetip异步加载完才能插入了
        var insert_acgindex_layer = setInterval(function(){
            var cluetip = $('#cluetip-outer');
            if( cluetip.length ) {
                // 把获取地址的链接插入cluetip悬浮层
                $('#cluetip-outer').append(acgindex);
                clearInterval(insert_acgindex_layer);
            }
        }, 300);
        
    },

    /*
     * 初始化事件
     * 
     */
    'init_event' : function(type) {
        // 番组表的hover时读取本地数据
        switch(type) {
            // 首页
            case 'home' : $('#columnHomeA').on('mouseenter', 'a.load-epinfo', ANIME.local);
            // 条目页
            case 'subject' : $('#subject_detail').on('mouseenter', 'a.load-epinfo', ANIME.local);
        }
        
        // 获取资源链接点击事件
        acgindex_link.on('click', 'a', ANIME.get);
    },

    /*
     * 当用户hover在某个li上时，读取被选中的ep的本地数据
     * 
     */
    'local' : function() {
        // 获取选中的番组信息
        var a = $(this),
            bgmid = a.attr('subject_id'),
            epid = a.text(),
            ep_unique = a.attr('href').replace('/ep/', '');

        // 首页和条目页获取bgmid的位置不同
        // 如果没有取到bgmid需要重新获取一下
        if( !bgmid ) {
            bgmid = $(this).parent().parent().parent().children('a')
                           .attr('href').replace('/subject/', '').replace('/ep', '');
        }

        // 第一格不是01时，epid要减掉第一格的实际话数
        // 例： bgmid = 77706 
        // 第一格实际话数为 26，因此 epid = epid - 26 + 1
        var ep_revise = parseInt(a.parent().parent().children(':first').children().text());
        // 正篇之后还有SP，SP话数是单独从01话开始计数的，所以这里判断一下，epid小于ep_revise的应该是SP，不要减去ep_revise
        if( ep_revise != 1 && ep_revise < epid) 
            epid = parseInt(epid) - ep_revise + 1;

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
                // 先把链接重置
                self.attr({
                    'class' : '',
                    'href'  : '*థ౪థ 液！',
                }).removeAttr('msg');

                if( !UTILITY.is_object_empty(obj) ) {
                    // 如果有本地数据就填进去
                    var _class = '',
                        _href = '*థ౪థ 液！',
                        timestamp = obj[key]['timestamp'],
                        data = obj[key]['value'];

                    // "没有找到资源"状态
                    if( data == '' || data == '-1' ) {
                        // 判断是否是新番
                        var last_get_time = new Date(timestamp),
                            boardcast_time = ANIME.get_boardcast_date();
                        // 如果最后获取时间减去首播时间不到resource_not_found_time_too_short，就判定是新番
                        // 此时提示重新获取
                        if( boardcast_time && ( last_get_time - boardcast_time < resource_not_found_time_too_short ) ) {
                            self.attr('msg', TIP.RESOURCE_NOT_FOUND_RETRY);
                        } 
                        // 否则认为是旧番，正常显示“没有找到资源”
                        else {
                            self.attr('msg', TIP.RESOURCE_NOT_FOUND);
                        }
                        // disabled it
                        _class += 'acgindex_disabled';
                    } else {
                        // 找到了资源的情况
                        // 判断是否需要登录
                        if( data[0] == 'x' ) {
                            data = data.substr(1);
                            self.attr('msg', TIP.RESOURCE_NEED_LOGIN);
                        }
                        _href = SOURCES['anime'][source].url + data;
                        _class += 'acgindex_real_url';
                    }
                    // 写入属性
                    self.attr({
                        'class' : _class,
                        'href'  : _href,
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
            request_data = [acgindex_link.data('bid'), acgindex_link.data('eid'), source];

        // 先确认是否可点
        if(self.hasClass('acgindex_global_disabled')) return false;
        // 在可点的情况下，如果是已有数据就直接打开新页面
        if(self.hasClass('acgindex_real_url')) return true;

        // 隐藏a本身带的状态提示
        self.removeAttr('msg');

        $.ajax({
            'url': acgindex_core + request_data.join('/'), 
            'timeout': 5000, 
            'beforeSend': function() {
                self.addClass('acgindex_loading');
                UTILITY.disable_ext('少女读取中', 5000, true);
            },
            'error': function(xhr, errorType, error) {
                // xhr.status == 0 表示超时
                switch(xhr.status) {
                    case 0   : var msg = '0 - 请求超时'; break;
                    case 404 : var msg = '404 - 连接不上目录娘'; break;
                    case 500 : var msg = '500 - 目录娘身体不舒服 QAQ'; break;
                    default  : var msg = '? - 遇到了无法理解的问题... ' + xhr.status;
                }

                self.removeClass('acgindex_loading')
                    .addClass('acgindex_error acgindex_disabled')
                    .attr('msg', msg);
                UTILITY.enable_ext();
                
                // 显示返回值状态
                UTILITY.show_msg( msg );
            },
            'success': function(raw, status, xhr) {
                // ajax获取结果比从localstorage中取值要多一些显示查询结果的代码
                // 所以不方便提取出去通用的样子
                
                // 移除loading动画
                self.removeClass('acgindex_loading');

                // 解析json
                var data = JSON.parse(raw),
                    value = data['value'],
                    return_msg = '';

                // 处理正常情况
                if( data['status'] == 'OK' ) {

                    if( value == '' || value == '-1' ) {
                        // 没有找到资源
                        // 总之先默认填上没有找到资源的返回提示
                        self.attr('msg', TIP.RESOURCE_NOT_FOUND).disable();
                        return_msg = TIP.RESOURCE_NOT_FOUND;

                        // 判断是否是新番
                        var boardcast_time = ANIME.get_boardcast_date();
                        if( boardcast_time ) {
                            var now = new Date();
                            // 首播日期晚于当前时间，应该是还未播出的番
                            if( now < boardcast_time ) {
                                self.attr('msg', TIP.RESOURCE_NOT_BOARDCASTED);
                                return_msg = TIP.RESOURCE_NOT_BOARDCASTED;
                            } 
                            // 如果当前时间减去首播时间不到resource_not_found_time_too_short，就判定是新番
                            else if( ( now - boardcast_time < resource_not_found_time_too_short ) 
                                && ( now - boardcast_time > 0 ) ) {
                                self.attr('msg', TIP.RESOURCE_NOT_FOUND_TIME_TOO_SHORT);
                                return_msg = TIP.RESOURCE_NOT_FOUND_TIME_TOO_SHORT;
                            } 
                        }

                        // 普通的没有找到资源提示显示 2s
                        // 其他特殊状态为了让用户看清显示久一点 4s
                        UTILITY.show_msg( return_msg, return_msg === TIP.RESOURCE_FOUND ? 2000 : 4000 );

                    } else {
                        // 需要登录提示
                        if( source == 'bili' && value[0] == 'x' ) {
                            value = value.substr(1);
                            self.attr('msg', TIP.RESOURCE_NEED_LOGIN);
                        }

                        // 找到了资源的情况
                        var url = SOURCES['anime'][source].url + value;

                        self.attr({
                            'href'   : url,
                            'class'  : 'acgindex_real_url'
                        });
                        return_msg = TIP.RESOURCE_FOUND;
                    }
                    // 正常状态可以保存下来
                    var obj = {};
                    obj['value'] = value; 
                    STORAGE.save( self.data('ep-unique') + ':' + source, obj);

                    // 获取完毕的提示2s就够了
                    UTILITY.show_msg( return_msg, 2000 );

                } else {

                    // 异常状态
                    switch( value ) {
                        case '-10' : return_msg = '发出的参数有误，不要随意改动参数哦'; break;
                        case '-20' : return_msg = '点的太快目录娘会受不了的啦 >_<'; break;
                        default    : return_msg = '收到了不正常的回复 Σ( °Д °) : ' + value; break;
                    }
                    self.addClass('acgindex_error').attr('msg', value).disable();

                    // 异常状态也稍微久一点 4s
                    UTILITY.show_msg( return_msg, 4000 );

                }

                UTILITY.enable_ext();
            }
        });

        return false;
    },

    /**
     * 获取当前的弹层的“首播日期”字段
     *
     * @return new Date(year, month, date) if matched
     * @return false if not matched
     */
    get_boardcast_date : function() {
        var tip_content = acgindex.prev().children().children('.tip').text(),
            match, 
            boardcast_time = false;

        // 读取.tip中的文本，然后正则查找内容
        if( tip_content ) {
            match = /首播:(\d{4})-(\d{1,2})-(\d{1,2})/.exec(tip_content);
            // 检查是否有匹配值
            if( match && match.length > 1 ) {
                boardcast_time = new Date(match[1], parseInt(match[2])-1, match[3]);
            }
        }

        return boardcast_time;
    }
}