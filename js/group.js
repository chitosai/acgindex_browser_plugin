/**
 * 给小组讨论加一些特殊效果
 * 
 */
var GROUP = {
    'cl' : null,
    'total_page' : 0,
    'pid' : 0,

    'init' : function() {
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
        var cl = $('#comment_list > .row_reply'),
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
        console.log(typeof pid)
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
}