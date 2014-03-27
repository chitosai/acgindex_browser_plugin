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
        MUSIC.init_album();
        MUSIC.init_single();
    },

    /*
     * 插入标题上的资源链接
     * 
     */
    'init_album' : function() {
        // 插入链接
        var acgindex = $('<div>').addClass('acgindex_music');
        // 资源链接所在div
        var acgindex_link = $('<div>').addClass('acgindex_link');
        $('<span>').text('试听：').appendTo(acgindex_link);

        // 专辑标题
        var music_title = $('.nameSingle a').text();

        // bgm id
        var bgm_id = $('.nameSingle a').attr('href').replace('/subject/', '');

        // 创建链接
        for(source in SOURCES['music_album']) {
            $('<a>').attr({
                'title'  : SOURCES['music_album'][source].title,
                'href'   : SOURCES['music_album'][source].url + encodeURIComponent(music_title),
                'source' : source,
                'target' : '_blank',
                'class'  : 'acgindex_real_url'
            }).data({
                'ep-unique'   : bgm_id + ':' + source,
                'music-title' : music_title,
                'bgmid'       : bgm_id,
                'api'         : SOURCES['music_album'][source].api,
            }).appendTo(acgindex_link);
        }

        // 插入！
        acgindex.append(acgindex_link);
        $('.nameSingle').after(acgindex);
    },

    /*
     * 为每首单曲插入链接
     * 
     */
    'init_single' : function() {
        // 这个选择器兼容 概览 / 章节 两种列表
        var singles = $('.line_detail li'),
            prefix = /^\d+[\s\.]/;

        singles.each(function() {
            var self = $(this);

            // 专辑标题
            var music_title = self.children('h6').children('a').text();
            // 如果取不到标题说明这一行不是单曲名，不处理这行
            if( !music_title || music_title == '' ) return true;
            // 有的单曲格式是 { 序号 曲名 } 这样的，所以需要去掉序号和空格，取出曲名
            music_title = music_title.replace(prefix, '');

            // 取ep
            var ep_unique = self.children('cite').children('a').attr('href')
                                .replace('/ep/', '').replace('#comment_list', '');

            // 插入链接
            var acgindex = $('<div>').addClass('acgindex_music_single');
            // 资源链接所在div
            var acgindex_link = $('<div>').addClass('acgindex_link');

            // 创建链接
            for(source in SOURCES['music_single']) {
                $('<a>').attr({
                    'title'  : SOURCES['music_single'][source].title,
                    'href'   : SOURCES['music_single'][source].url + encodeURIComponent(music_title),
                    'source' : source,
                    'target' : '_blank',
                    'class'  : 'acgindex_real_url',
                }).data({
                    'ep-unique'   : ep_unique + ':' + source,
                    'music-title' : music_title,
                    'api'         : SOURCES['music_single'][source].api,
                }).appendTo(acgindex_link);
            }

            // 插入！
            acgindex.append(acgindex_link);
            self.children('cite').append(acgindex);
        });
    }
}