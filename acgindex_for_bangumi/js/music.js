/*
 * 与音乐相关的事务
 * 
 */
var MUSIC = {
    /*
     * 初始化!!!
     * 
     */
    'init' : function() {
        // 插入链接
        var acgindex = $('<div>').addClass('acgindex_music');
        // 资源链接所在div
        var acgindex_link = $('<div>').addClass('acgindex_link');
        $('<span>').text('试听：').appendTo(acgindex_link);

        // 准备数据
        var music_title = $('.nameSingle a').text();

        // 萌否电台链接
        var moefm_link = $('<a>').attr({
            'source' : 'moefm',
            'href'   : 'http://moe.fm/search/direct?title=' + encodeURIComponent(music_title),
            'target' : '_blank',
            'class'  : 'acgindex_real_url',
            'title'  : '萌否电台'
        }).appendTo(acgindex_link);

        // 虾米链接
        var xiami_link = $('<a>').attr({
            'source' : 'xiami',
            'href'   : "http://www.xiami.com/search/find?album=" + encodeURIComponent(music_title),
            'target' : '_blank',
            'class'  : 'acgindex_real_url',
            'title'  : '虾米'
        }).appendTo(acgindex_link);

        // 百度
        var baidu_link = $('<a>').attr({
            'source' : 'baidu',
            'href'   : "http://music.baidu.com/search?key=" + encodeURIComponent(music_title),
            'target' : '_blank',
            'class'  : 'acgindex_real_url',
            'title'  : '百度音乐'
        }).appendTo(acgindex_link);

        // 插入！
        acgindex.append(acgindex_link);
        $('.nameSingle').after(acgindex);
    },

    /*
     * 链接模板系列
     * 
     */
    'tpl' : {
        'moefm' : function(title) {
            return $('<a>').attr({
                'class'  : 'acgindex_moefm',
                'href'   : 'http://moe.fm/search/direct?title=' + encodeURIComponent(title),
                'target' : '_blank',
                'class'  : 'acgindex_real_url',
                'title'  : '萌否电台'
            });
        },
        'xiami' : function(title) {
            return $('<a>').attr({
                'class'  : 'acgindex_xiami',
                'href'   : "http://www.xiami.com/search/find?album=" + encodeURIComponent(title),
                'target' : '_blank',
                'class'  : 'acgindex_real_url',
                'title'  : '虾米'
            });
        },
        'baidu' : function(title) {
            return $('<a>').attr({
                'class'  : 'acgindex_baidu',
                'href'   : "http://music.baidu.com/search?key=" + encodeURIComponent(title),
                'target' : '_blank',
                'class'  : 'acgindex_real_url',
                'title'  : '百度音乐'
            });
        }
    }
}