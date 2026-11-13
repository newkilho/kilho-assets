/* ==========================================================================
   Kilho.net - 프론트 스크립트
   jQuery / Porto theme.js 의존을 모두 걷어낸 바닐라 JS.
   ========================================================================== */
(function () {
	'use strict';

	var root = document.documentElement;

	/* ----------------------------------------------------------------------
	   1. 라이트 / 다크 테마 토글
	   최초 테마 결정은 head.php 인라인 스크립트에서 이미 끝나 있다.
	   ---------------------------------------------------------------------- */
	function initThemeToggle() {
		document.addEventListener('click', function (event) {
			var button = event.target.closest('.js-theme-toggle');
			if (!button) return;

			var next = root.getAttribute('data-theme') === 'kilho-dark' ? 'kilho' : 'kilho-dark';
			root.setAttribute('data-theme', next);

			try { localStorage.setItem('kilho-theme', next); } catch (e) { /* 저장 불가 환경 */ }
		});
	}

	/* ----------------------------------------------------------------------
	   2. 모바일 사이드바 열고 닫기
	   표시 자체는 css/app.css 의 body.nav-open 규칙이 담당하고,
	   여기서는 그 클래스만 관리한다.
	   ---------------------------------------------------------------------- */
	function initNav() {
		var body = document.body;

		function setOpen(open) {
			body.classList.toggle('nav-open', open);

			var toggles = document.querySelectorAll('.js-nav-toggle');
			for (var i = 0; i < toggles.length; i++) {
				toggles[i].setAttribute('aria-expanded', open ? 'true' : 'false');
			}
		}

		document.addEventListener('click', function (event) {
			if (event.target.closest('.js-nav-toggle')) {
				setOpen(!body.classList.contains('nav-open'));
				return;
			}

			/* 오버레이 클릭 또는 사이드바 안의 링크 클릭 → 닫기 */
			if (event.target.closest('#nav-overlay') || event.target.closest('#sidebar a')) {
				setOpen(false);
			}
		});

		document.addEventListener('keydown', function (event) {
			if (event.key === 'Escape') setOpen(false);
		});
	}

	/* ----------------------------------------------------------------------
	   2-1. 현재 앱을 메뉴에 보이게 스크롤
	   앱이 12개라 목록이 사이드바 높이를 넘는다. 아래쪽 앱(ktimer, imgdb …)에
	   들어오면 메뉴가 맨 위에 머물러 있어서 지금 어디인지 보이지 않았다.

	   목록만 스크롤한다. 페이지 자체는 건드리지 않아야 하므로
	   scrollIntoView() 를 쓰지 않는다 (부모까지 따라 스크롤된다).
	   ---------------------------------------------------------------------- */
	function initNavScroll() {
		/* 스크롤하는 앱 목록 — 위의 고정 목록(ul.nav-sites, 블로그)은 빼고 (2026-09-25) */
		var list   = document.querySelector('#sidebar > nav > ul:not(.nav-sites)');
		/* 켜진 항목이 없으면 kilho.top 이 표시한 "지금 보는 글의 프로그램"(data-kh-current)까지 — 켜지는 않는다 (2026-09-26) */
		var active = list && (list.querySelector('.nav-link.active') || list.querySelector('[data-kh-current] > .nav-link'));

		if (!list || list.scrollHeight <= list.clientHeight) return;

		/* 사이드바에서 눌러 넘어왔으면 누른 항목을 누른 그 높이에 (2026-09-27).
		   누를 때 항목(data-app · data-site)과 목록 안 높이를 쿠키 두 개로 남긴다 — 같은 사이트
		   (kilho.net 과 *.kilho.net 앱 페이지, kilho.top 과 gnu.kilho.top, kilho.saju.club …)의 다음 페이지가 받는다.
		   도메인이 다르면 쿠키가 건너가지 못해 아래(켜진 항목을 가운데)로 간다. 한 번 쓰면 지운다. */
		var navItem = navCookie('kh_nav_item');
		var navTop  = parseFloat(navCookie('kh_nav_top'));
		navCookieClear();
		if (navItem && !isNaN(navTop)) {
			var clicked = list.querySelector('li[data-app="' + navItem + '"], li[data-site="' + navItem + '"]');
			if (clicked) {
				list.scrollTop += (clicked.getBoundingClientRect().top - list.getBoundingClientRect().top) - navTop;
				return;
			}
		}

		if (!active) return;

		/* offsetTop 은 offsetParent 가 무엇이냐에 따라 달라진다.
		   화면 좌표 차이로 구하면 그 영향을 받지 않는다. */
		var listRect   = list.getBoundingClientRect();
		var activeRect = active.getBoundingClientRect();

		list.scrollTop += (activeRect.top - listRect.top)
			- (listRect.height - activeRect.height) / 2;
	}

	/* 누른 항목 기억 — 새 창(target=_blank)·수정키 클릭은 이 탭이 넘어가지 않으므로 남기지 않는다 */
	function initNavRemember() {
		var list = document.querySelector('#sidebar > nav > ul:not(.nav-sites)');
		if (!list) return;
		list.addEventListener('click', function (event) {
			var link = event.target.closest('a.nav-link');
			var item = link && link.closest('li[data-app], li[data-site]');
			if (!item || link.target === '_blank' || event.button !== 0
				|| event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
			var key = item.getAttribute('data-app') || item.getAttribute('data-site');
			var top = Math.round(item.getBoundingClientRect().top - list.getBoundingClientRect().top);
			navCookieSet('kh_nav_item', key);
			navCookieSet('kh_nav_top', String(top));
		});
	}

	/* 쿠키는 이 사이트에서 가장 넓은 도메인에 — 짧은 것부터 심어 보고 읽히는 첫 도메인을 쓴다
	   (공용 접미사 co.kr · top 같은 곳은 브라우저가 거부한다). 1분이면 사라진다 */
	var navDomain = null;
	function navCookieDomain() {
		if (navDomain !== null) return navDomain;
		var parts = location.hostname.split('.');
		for (var i = parts.length - 2; i >= 0; i--) {
			var d = parts.slice(i).join('.');
			document.cookie = 'kh_nav_probe=1; path=/; max-age=5; domain=.' + d;
			if (navCookie('kh_nav_probe') === '1') {
				document.cookie = 'kh_nav_probe=; path=/; max-age=0; domain=.' + d;
				return navDomain = '; domain=.' + d;
			}
		}
		return navDomain = '';
	}
	function navCookieSet(name, value) {
		document.cookie = name + '=' + encodeURIComponent(value) + '; path=/; max-age=60; SameSite=Lax' + navCookieDomain();
	}
	function navCookieClear() {
		['kh_nav_item', 'kh_nav_top'].forEach(function (name) {
			document.cookie = name + '=; path=/; max-age=0' + navCookieDomain();
		});
	}
	function navCookie(name) {
		var m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
		return m ? decodeURIComponent(m[1]) : '';
	}

	/* ----------------------------------------------------------------------
	   3. 언어 선택 (option 의 value 가 이동할 URL)
	   ---------------------------------------------------------------------- */
	function initLanguageSelect() {
		document.addEventListener('change', function (event) {
			var select = event.target.closest('.js-lang-select');
			if (select && select.value) window.location.href = select.value;
		});
	}

	/* ----------------------------------------------------------------------
	   4. 후원 감사 띠 — 한 사람씩 4초마다 위로 넘긴다 (head.php #sponsor-ticker)
	   한 줄 높이(1.25rem)씩 올리고, 끝에 첫 줄 사본을 붙여 되감기 없이 이어 돈다.
	   ---------------------------------------------------------------------- */
	function initSponsorTicker() {
		var list = document.getElementById('sponsor-ticker');
		if (!list || list.children.length < 2) return;

		var count = list.children.length;
		var index = 0;
		var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		var copy = list.firstElementChild.cloneNode(true);
		copy.setAttribute('aria-hidden', 'true');
		copy.querySelector('a').setAttribute('tabindex', '-1');
		list.appendChild(copy);

		setInterval(function () {
			index++;
			list.style.transition = still ? 'none' : 'translate .5s ease';
			list.style.translate = '0 ' + (-1.25 * index) + 'rem';
			if (index === count) {
				setTimeout(function () {
					list.style.transition = 'none';
					list.style.translate = 'none';
					index = 0;
				}, 600);
			}
		}, 4000);
	}

	function init() {
		initThemeToggle();
		initNav();
		initNavScroll();
		initNavRemember();
		initLanguageSelect();
		initSponsorTicker();
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
})();
