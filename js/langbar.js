/* 언어 제안 띠 (2026-11-12) — 자동 이동 대신
   head.php 맨 위 인라인 스크립트가 "브라우저 언어 ≠ 이 페이지 언어"라고 판단하면 이 파일을 불러 띄운다.
   자동 이동 대신 그 언어로 묻는다. 고르면 kilho-lang 쿠키에 남겨 다시 묻지 않는다.
     data-code   제안할 언어      data-cur   이 페이지 언어
     data-href   그 언어판 주소    data-flag  국기(css/flags.css .fi-<flag>)    data-dir  rtl 이면 'rtl'
   화면을 가리지 않게 아래쪽에 겹쳐 띄운다(레이아웃 밀림 없음). 봇에게는 인라인 쪽에서 아예 부르지 않는다. */
(function () {
	var me = document.currentScript;
	if (!me) return;
	var d = me.dataset;

	/* 질문 · 그 언어로 보기 · 그대로 보기 — 제안하는 언어로 쓴다 */
	var T = {
		ko: ['이 페이지를 한국어로 보시겠습니까?', '한국어로 보기', '그대로 보기'],
		en: ['View this page in English?', 'View in English', 'No thanks'],
		de: ['Diese Seite auf Deutsch anzeigen?', 'Auf Deutsch anzeigen', 'Nein, danke'],
		es: ['¿Ver esta página en español?', 'Ver en español', 'No, gracias'],
		fr: ['Afficher cette page en français ?', 'Afficher en français', 'Non merci'],
		id: ['Lihat halaman ini dalam Bahasa Indonesia?', 'Lihat dalam Bahasa Indonesia', 'Tidak, terima kasih'],
		it: ['Visualizzare questa pagina in italiano?', 'Visualizza in italiano', 'No, grazie'],
		ja: ['このページを日本語で表示しますか？', '日本語で表示', 'このまま表示'],
		nl: ['Deze pagina in het Nederlands bekijken?', 'Bekijken in het Nederlands', 'Nee, bedankt'],
		pl: ['Wyświetlić tę stronę po polsku?', 'Wyświetl po polsku', 'Nie, dziękuję'],
		pt: ['Ver esta página em português?', 'Ver em português', 'Não, obrigado'],
		ru: ['Открыть эту страницу на русском языке?', 'Открыть на русском', 'Нет, спасибо'],
		ar: ['هل تريد عرض هذه الصفحة باللغة العربية؟', 'العرض بالعربية', 'لا، شكرًا'],
		sv: ['Visa den här sidan på svenska?', 'Visa på svenska', 'Nej tack'],
		th: ['ต้องการดูหน้านี้เป็นภาษาไทยหรือไม่', 'ดูเป็นภาษาไทย', 'ไม่ ขอบคุณ'],
		tr: ['Bu sayfayı Türkçe görüntülemek ister misiniz?', 'Türkçe görüntüle', 'Hayır, teşekkürler'],
		vi: ['Xem trang này bằng tiếng Việt?', 'Xem bằng tiếng Việt', 'Không, cảm ơn'],
		zh: ['要以中文查看此页面吗？', '以中文查看', '不用了']
	};
	var t = T[d.code];
	if (!t) return;

	function keep(v) {
		document.cookie = 'kilho-lang=' + v + ';path=/;max-age=31536000;secure;samesite=lax';
	}

	function show() {
		var css = document.createElement('style');
		css.textContent =
			'#kh-langbar{position:fixed;inset-inline:0;bottom:0;z-index:60;display:flex;justify-content:center;padding:0 12px 12px;pointer-events:none;' +
			'transform:translateY(110%);transition:transform .25s ease-out}' +
			'#kh-langbar.on{transform:none}' +
			'#kh-langbar>div{pointer-events:auto;display:flex;flex-wrap:wrap;align-items:center;gap:10px 14px;max-width:44rem;width:100%;' +
			'padding:12px 14px;border:1px solid var(--color-base-300,#ddd);border-radius:8px;background:var(--color-base-100,#fff);' +
			'color:var(--color-base-content,#222);box-shadow:0 6px 24px rgba(0,0,0,.18);font-size:15px;line-height:1.4}' +
			'#kh-langbar .fi{width:1.5em;height:1.125em;flex:none;border-radius:2px;background-size:cover;box-shadow:0 0 0 1px rgba(0,0,0,.15)}' +
			'#kh-langbar p{margin:0;flex:1 1 14rem}' +
			'#kh-langbar span.b{display:flex;gap:8px;margin-inline-start:auto}' +
			'#kh-langbar button{cursor:pointer;border-radius:6px;padding:7px 14px;font:inherit;font-size:14px;white-space:nowrap;border:1px solid transparent}' +
			'#kh-langbar .y{background:var(--color-primary,#08c);color:var(--color-primary-content,#fff)}' +
			'#kh-langbar .n{background:transparent;color:inherit;border-color:var(--color-base-300,#ddd)}' +
			'@media (prefers-reduced-motion:reduce){#kh-langbar{transition:none}}';
		document.head.appendChild(css);

		var bar = document.createElement('div');
		bar.id = 'kh-langbar';
		bar.setAttribute('role', 'dialog');
		bar.setAttribute('aria-live', 'polite');
		bar.innerHTML = '<div><span class="fi"></span><p></p><span class="b"><button type="button" class="y"></button><button type="button" class="n"></button></span></div>';
		var box = bar.firstChild;
		box.setAttribute('lang', d.code);
		if (d.dir) box.setAttribute('dir', d.dir);
		box.querySelector('.fi').className = 'fi fi-' + d.flag;
		box.querySelector('p').textContent = t[0];
		box.querySelector('.y').textContent = t[1];
		box.querySelector('.n').textContent = t[2];

		box.querySelector('.y').onclick = function () { keep(d.code); location.href = d.href; };
		box.querySelector('.n').onclick = function () {
			keep(d.cur);
			bar.classList.remove('on');
			setTimeout(function () { bar.remove(); }, 300);
		};

		document.body.appendChild(bar);
		requestAnimationFrame(function () { requestAnimationFrame(function () { bar.classList.add('on'); }); });
	}

	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', show);
	else show();
})();
