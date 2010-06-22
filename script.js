(function($) {

jqtDir = 'lib/jqtouch'

if (location.search == "?clear") {
	localStorage.clear();
}

// localStorageの初期値設定
if (!localStorage.entries) {
	localStorage.entries = JSON.stringify({
		"entry1" : 'This is first entry.', 
		"entry2" : 'This is second entry.', 
		"Markdown" : '#title\n\n* list\n* list2'
	});
}
var entries = JSON.parse(localStorage.entries);

if (!localStorage.theme) {
	localStorage.theme = 'apple';
}

if (!localStorage.search) {
	localStorage.search = 'none';
}

var jQT = $.jQTouch();

var converter = new Showdown.converter()

// onload後にやる初期化と各種イベントの設定
$(function() {

	$('#wiki5_searchForm').css('display', localStorage.search);

	initHome();

	$('#wiki5_settingButton').bind('tap', function() {
		jQT.goTo('#wiki5_setting', 'flip');
	});

	$('#wiki5_theme').change(function() {
		var link = document.getElementById('wiki5_themeCss');
		link.href = jqtDir + '/themes/' + this.value +'/theme.css';
		localStorage.theme = this.value;
	})
	.val(localStorage.theme).trigger('change');	 // 初期設定

	$('#wiki5_newButton').bind('tap', function() {
		$('#wiki5_new h1').html('New Entry');
		$('#wiki5_new .back').html('Home');
		jQT.goTo('#wiki5_new', 'slideup');
		$('#wiki5_title').focus();
//		$('#wiki5_title').val('');
//		$('#wiki5_content').val('');
	});

	$('#wiki5_title').blur(function() {
		if (entries && entries[this.value]) {
			$('#wiki5_content').val(entries[this.value]);
		}
	});

	$('#wiki5_submit').bind('tap', function() {
		var title = $('#wiki5_title').val();
		if (!entries) {
			entries = {};
		}
		entries[title] = $('#wiki5_content').val();
		localStorage.entries = JSON.stringify(entries);
		$('#wiki5_title').val('');
		$('#wiki5_content').val('');
		initHome();
//		jQT.goBack(); // 次の画面でHomeを押すとnewに戻ってきちゃう
		jQT.goTo('#home', 'slide');
	});

	$('#wiki5_reset').bind('tap', function() {
		$('#wiki5_newForm').get(0).reset();
	});

	$('#wiki5_initButton').bind('tap', function() {
		if (confirm('Delete All Data?')) {
			entries = {};
			localStorage.entries = JSON.stringify(entries);
			localStorage.search = 'none';
			$('#wiki5_searchForm').css('display', localStorage.search);
			$('#wiki5_theme').val('apple').change();
			initHome();
		} else {
			$(this).children('a').removeClass('active');
		}
	});

	$('#wiki5_importButton').bind('tap', function() {
//		$('#wiki5_importData').val('');
		jQT.goTo('#wiki5_import', 'slideup');
	});

	$('#wiki5_importSubmit').bind('tap', function() {

		var tmpStorage = localStorage.entries;
		var tmpEntries = entries;
		try {
			if ($('#wiki5_importData').val() && confirm('Import OK?')) {
				localStorage.entries = $('#wiki5_importData').val();
				entries = JSON.parse(localStorage.entries);
				$('#wiki5_importData').val('');
				initHome();
			}
		} catch (e) {
			entries = tmpEntries;
			localStorage.entries = tmpStorage;
			initHome();
		}
	});

	$('#wiki5_importReset').bind('tap', function() {
		$('#wiki5_importForm').get(0).reset();
	});
	$('#wiki5_exportButton').bind('tap', function() {
		$('#wiki5_exportData').val(localStorage.entries);
		jQT.goTo('#wiki5_export', 'slideup');
	});

	$('#wiki5_searchButton').bind('tap', function() {
		localStorage.search = $('#wiki5_searchForm').toggle().css('display');
	});

	$('#wiki5_searchText').keyup(function() {
		var text = this.value;
		$('#home > ul#wiki5_entry li').each(function() {
			if ($(this).text().match(text)) {
				this.style.display = 'block';
			} else {
				this.style.display = 'none';
			}
		});
	});

	$('#home').bind('pageAnimationEnd', function(e, info) {
//		if (info.direction == 'in') {
			$(this).find('a.active').removeClass('active');
//		};
	});


})

// home画面（リスト）の（再）生成
function initHome() {

	var body = $(document.body);
	var home = $('#home > ul#wiki5_entry').html('');

	for (var title in entries) {
		home.append('<li><a href="' + title + '">' + title + '</a></li>');
	}

	home.children('li').each(function() {

		// jQTouch -- 画面遷移の前にデータ処理
		// http://www.studio-bloom.net/archives/2240
//		$(this).tap(function() {
		$(this).bind('tap', function() {
			var title = $(this).text();
			var content = entries[title];

			var div = $('#' + title);

			// 存在しなければページを作る
			if (div.length < 1) {
				div = $('<div id="' + title + '"><div class="toolbar"><h1>' + title + '</h1><a class="back" href="">Home</a><a class="button slideup editButton" href="">edit</a></div><h2></h2><p></p><ul><li>' + title + '</li><li></li></ul><ul class="individual"><li><a href="" class="copyButton">copy</a></li><li><a href="" class="deleteButton">delete</a></li></ul></div>');
				body.append(div);

				div.find('.editButton').bind('tap', function(e) {
					$('#wiki5_new h1').html('Edit Entry');
					$('#wiki5_new .back').html(title);
					$('#wiki5_title').val(title);
					$('#wiki5_content').val(entries[title]);
					$('#wiki5_title').focus();
					jQT.goTo('#wiki5_new', 'slideup');
				});

				div.find('.copyButton').bind('tap', function(e) {
					$('#wiki5_new h1').html('Copy Entry');
					$('#wiki5_new .back').html(title);
					$('#wiki5_title').val(title + '-copy');
					$('#wiki5_content').val(entries[title]);
					$('#wiki5_title').focus();
					jQT.goTo('#wiki5_new', 'slideup');
				});

				div.find('.deleteButton').bind('tap', function(e) {
					$('#wiki5_new h1').html('Copy Entry');
					$('#wiki5_new .back').html(title);
					$('#wiki5_title').val(title + '-copy');
					$('#wiki5_content').val(entries[title]);
					$('#wiki5_title').focus();
					jQT.goTo('#wiki5_new', 'slideup');
				});

			}

			// コンテンツを最新に更新
			var htmlContent = converter.makeHtml(content);
			div.find('ul:eq(0) > li:eq(1)').html(htmlContent);

			// 遷移
			jQT.goTo('#' + title, 'slide');
		});

	});

}


})(jQuery);
