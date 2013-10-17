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
        // MUSIC.load_resource();
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
    },

    /*
     * 从本地缓存读取资源
     * 
     */
    'load_resource' : function() {
        $('.acgindex_link a').each(function() {
            var self = $(this),
                url = '',
                ep_unique = self.data('ep-unique');

            storage.get( ep_unique, function(obj) {
                if( utility.is_object_empty(obj) ) {
                    // 没有本地数据时就发起ajax查询
                    MUSIC.get_resource(self);
                } else {
                    url = obj[ep_unique];
                    // 修改资源链接
                    if( url != '-1' ) {
                        self.attr('href', url);
                    } else {
                        self.addClass('acgindex_disabled');
                    }
                }
            });
        });
    },

    /*
     * ajax查询资源
     * 
     */
    'get_resource' : function(self) {
        // 调用每种资源站各自的查询函数
        switch(self.attr('source')) {
            case 'moefm' : MUSIC.get_from_moefm(self); break;
            case 'xiami' : MUSIC.get_from_xiami(self); break;
            case 'baidu' : MUSIC.get_from_baidu(self); break;
        }
    },

    /*
     * 搜索萌否电台
     * 
     */
    'get_from_moefm' : function(self) {
        var api = self.data('api'),
            query = self.data('bgmid'),
            ep_unique = self.data('ep-unique');

        // 5秒超时。就算查不到也没有任何影响，所以不处理任何error情况
        $.ajax({
            'url'     : api + query,
            'timeout' : 5000,
            'type'    : 'json',
            'success' : function(json) {
                var data = json['response'],
                    obj = {};

                // 根据返回值修改资源链接
                if( data['has_mp3'] == true ) {
                    self.attr('href', data['url']);
                    obj[ep_unique] = data['url'];
                } else {
                    self.addClass('acgindex_disabled');
                    obj[ep_unique] = '-1';
                }

                // 储存结果到本地
                storage.set(obj);
            }
        });
    },

    /*
     * 搜索虾米
     * 
     */
    'get_from_xiami' : function(self) {
        var api = self.data('api'),
            query = self.data('music-title'),
            ep_unique = self.data('ep-unique');

        // 5秒超时。就算查不到也没有任何影响，所以不处理任何error情况
        $.ajax({
            'url'     : api + query,
            'timeout' : 5000,
            'success' : function(html) {
                var pattern = /loc = \"(.+?)\"/g,
                    match = pattern.exec(html),
                    obj = {};

                // 根据返回值修改资源链接
                if( match ) {
                    self.attr('href', match[1]);
                    obj[ep_unique] = match[1];
                } else {
                    self.addClass('acgindex_disabled');
                    obj[ep_unique] = '-1';
                }

                // 储存结果到本地
                storage.set(obj);
            }
        });
    },

    /*
     * 搜索百度
     * 
     */
    'get_from_baidu' : function(self) {

    }
}