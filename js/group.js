/**
 * 给小组讨论加一些特殊效果
 * 
 */
var GROUP = {
    'cl' : null,
    'total_page' : 0,
    'pid' : 0,

    'init' : function() {
        // 先缓存一下评论列表
        GROUP.cl = $('#comment_list');
        GROUP.init_pager();
        GROUP.init_quick_reply();
    },

    // 初始化评论分页
    'init_pager' : function() {
        if( CONFIG.group_pager_enable ) {
            // 去掉那个滑动条
            $('#sliderContainer').remove();

            // 评论分页
            GROUP.divide_comments();

            // 检查hash中是否有高亮
            var hash = document.location.hash.replace('#', ''),
                pid = 1;

            if( hash != '' ) {
                var comment = $('#' + hash);
                if( comment.length ) {
                    // 获取高亮评论所在页的pid
                    pid = comment.parents().filter('.acgindex_page').attr('acgindex_page_id');

                    // 翻到高亮评论所在页
                    GROUP.page(pid);

                    // 滚到高亮评论附近
                    var y = comment.offset().top - 200;
                    $('body, html').animate({'scrollTop' : y});
                }
            }

            if( pid == 1 )
                GROUP.page(1);
        }
    },

    // 强行给评论分页
    'divide_comments' : function() {
        var cl = GROUP.cl.children('.row_reply'),
            new_cl = $('<div>').attr('id', 'comment_list'),
            total_page = 0;

        // 强行给评论分页
        while( cl.length > 0 ) {
            // 总页数++
            total_page++;

            // 生成每一页
            var page = $('<div>').addClass('acgindex_page'),
                i = 0,
                c = null;

            // 填入每一页的评论
            while( i < CONFIG.group_pager_comments_per_page && cl.length > 0 ) {
                i++;
                // 根据用户设置的排序方式依次取回复
                if( CONFIG.group_pager_order_by == 'desc')
                    c = cl.pop();
                else
                    c = cl.shift();
                // 插入当前页
                c.appendTo(page);
                // 计算这层有多少个子回复
                i += c.find('.sub_reply_bg').length;
            }

            // 插入新的评论列表
            page.attr('acgindex_page_id', total_page).appendTo(new_cl);
        }

        // 保存引用
        GROUP.total_page = total_page;
        GROUP.cl = new_cl;

        // 替换DOM
        $('#comment_list').replaceWith(new_cl);
    },

    // 翻页
    'page' : function(pid) {
        var is_change_page = false;
        if( typeof pid == 'object' || !pid ) {
            is_change_page = true;
            pid = $(this).attr('acgindex_page_id');
            if( !pid || pid == '' || pid == GROUP.pid )
                return false;
        }
        pid = parseInt(pid);
        
        // 换页面
        $('.acgindex_page').hide();
        $('.acgindex_page[acgindex_page_id=' + pid + ']').show();

        // 重新生成翻页器
        GROUP.pager(pid, is_change_page);

        // 记录当前页
        GROUP.pid = pid;

        // 取消单击事件
        return false;
    },

    // 生成翻页器
    'pager' : function(pid, is_change_page) {
        var total = GROUP.total_page,
            start = pid - 5, last = pid + 5, i;
        if( start < 1 ) start = 1;
        if( last > total ) last = total;

        // DOM DOM DOM DOM DO D ..
        var pager = $('<div>').addClass('page_inner');

        // 生成固定按钮
        // 翻到第一页
        $('<a>').attr({
            'href': '(´･ω･`)', 
            'acgindex_page_id': '1'
        }).addClass('p').text('|‹').appendTo(pager);

        // 翻到上一页
        $('<a>').attr({
            'href': '(´･ω･`)', 
            'acgindex_page_id': pid > 1 ? pid - 1 : 1
        }).addClass('p').text('‹‹').appendTo(pager);

        // 普通页
        for( i = start; i <= last; i++ ) {
            if( i == pid ) 
                $('<strong>').attr('acgindex_page_id', i).addClass('p_cur').text(i).appendTo(pager);
            else
                $('<a>').attr({
                    'href': '(´･ω･`)',
                    'acgindex_page_id': i
                }).addClass('p').text(i).appendTo(pager);
        }

        // 后面还有的标志
        if( total > last ) {
            $('<a>').addClass('p').text('...').appendTo(pager);
        }

        // 翻到下一页
        $('<a>').attr({
            'href': '(´･ω･`)', 
            'acgindex_page_id': pid < total ? pid + 1 : total
        }).addClass('p').text('››').appendTo(pager);

        // 翻到最后页
        $('<a>').attr({
            'href': '(´･ω･`)', 
            'acgindex_page_id': total
        }).addClass('p').text('›|').appendTo(pager);

        // 总页码
        $('<span>').addClass('p_edge').text('( ' + pid + ' / ' + total + ' )').appendTo(pager);

        // 给他妈绑好事件
        pager.on('click', 'a', GROUP.page);

        // 插入
        // 评论区以上
        var pager_1 = $('#acgindex_pager_1');
        if( pager_1.length ) {
            pager_1.empty().append(pager);
        } else {
            $('<div>').addClass('clearit acgindex_pager').attr('id', 'acgindex_pager_1')
                      .append(pager).insertBefore($('#comment_list'));
        }
        // 评论区以下
        var pager_2 = $('#acgindex_pager_2');
        if( pager_2.length ) {
            pager_2.empty().append(pager.clone(true));
        } else {
            $('<div>').addClass('clearit acgindex_pager').attr('id', 'acgindex_pager_2')
                      .append(pager.clone(true)).insertAfter($('#comment_list'));
        }

        // 如果本次是翻页，则需要重新计算屏幕位置
        if( is_change_page ) {
            var y = $('#acgindex_pager_1').offset().top - 150;
            $('body, html').animate({'scrollTop' : y});
        }
    },

    // 初始化快速回复
    'init_quick_reply' : function() {
        var cl = GROUP.cl.find('.row_reply'),
            slash = $('<span>').text(' / ');

        // 创建按钮
        cl.each(function(){
            var self = $(this).children('.re_info').children('small');
            slash.clone().appendTo(self);
            $('<a>').text('+1').addClass('acgindex_quick_reply').attr('href', 'Hdaisuki').appendTo(self);
            slash.clone().appendTo(self);
            $('<a>').text('赞').addClass('acgindex_quick_reply').attr('href', 'Hdaisuki').appendTo(self);
        });

        // 绑定事件
        GROUP.cl.on('click', '.acgindex_quick_reply', function(){
            // 触发回复事件
            GROUP.quick_reply(this);

            // 刷新页面前不允许重复回复同一楼层
            var tip = '你已经 ' + $(this).text() + ' 过了';
            $(this).removeClass('acgindex_quick_reply').css('color', '#ccc').removeAttr('href').attr('title', tip);

            return false;
        })
    },

    // 快速回复
    'quick_reply' : function(dom) {
        // 快速回复本体需要4个参数，可以从DOM中读取出来
        var params_source = $(dom).parents().filter('.row_reply').find('.icons_cmt').attr('onclick');
        // 正则提取一下参数
        var match = /subReply\('\w+',(\d+),(\d+),\d+,(\d+),(\d+),\d+\)/.exec(params_source);

        // 验证用的另外2个参数
        var formhash = $('input[name=formhash]').val(),
            lastview = $('input[name=lastview]').val();

        // 检查是否正确取到参数
        if( !match || !formhash || !lastview ) {
            alert('参数错误！');
            return false;
        }

        // 包装参数
        var params = {
            'topic_id'      : match[1],
            'related'       : match[2],
            'sub_reply_uid' : match[3],
            'post_uid'      : match[4],
            'related_photo' : 0,
            'submit'        : 'submit',
            'formhash'      : formhash,
            'lastview'      : lastview,
            'content'       : $(dom).text() + '[size=0]+1[/size]',
        }

        // 提交
        $.post('/group/topic/' + params['topic_id'] + '/new_reply?ajax=1', $.param(params), function(data){
            // 手动添加一个回复
            GROUP.add_reply(dom, data['posts']['sub'][params['related']][0], true);
        }, 'json');
    },

    // 插入一个新回复
    'add_reply' : function(dom, data, collapsed) {
        // 找到插入新回复的位置
        var parent = $(dom).parents().filter('.row_reply').find('.topic_sub_reply');

        // 生成新回复DOM结构
        var reply = $('<div>').addClass('sub_reply_bg clearit').attr('id', 'post_' + data['pst_id']);
        if( collapsed ) reply.addClass('sub_reply_collapse');
        // 回复时间
        $('<div>').addClass('re_info').append($('<small>').text(data['dateline'])).appendTo(reply);
        // 用户头像
        var user_home = 'http://' + document.location.host + '/' + data['username'];
        $('<a>').addClass('avatar').attr('href', user_home)
                .append(
                    $('<img>').addClass('avatar ll').attr('src', data['avatar'])
                )
                .appendTo(reply);
        // 回复内容
        $('<div>').addClass('inner').append(
            $('<strong>').addClass('userName')
                         .append(
                            $('<a>').attr({
                                'id' : data['pst_id'],
                                'href' : user_home,
                                'class' : 'l'
                            }).text(data['nickname'])
                        )
        ).append(
            $('<div>').addClass('cmt_sub_content').html('&nbsp;' + data['pst_content'])
        ).appendTo(reply);
        // 插入DOM
        parent.append(reply);
    },
}