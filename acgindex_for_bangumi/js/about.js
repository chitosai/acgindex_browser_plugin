document.addEventListener('DOMContentLoaded', init);

function init() {
	// 显示缓存占用空间
	chrome.storage.local.getBytesInUse( null, function(BytesInUse) {
		document.getElementById('storage-usage').innerHTML = BytesInUse/1000 + 'kb';
	});

	// 清空缓存
	document.getElementById('storage-clear').addEventListener('click', function(){
		chrome.storage.local.clear(function(){
			document.getElementById('storage-usage').innerHTML = '0 k';
			alert('缓存已清空 _(:3ゝ∠)_');
		});
	});
}