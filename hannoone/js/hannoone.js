/* ==========================================================================
   hannoone 뼈대의 움직임 (테마 토글 · 서랍 여닫기는 v2 app.js)
     · 읽은 만큼 막대 · 내려가면 상단바를 낮춘다
     · 좁은 화면 검색 — 돋보기를 누르면 펼치고, 펼친 상태에서 누르면 찾는다
     · 넓게보기 — 사이드바를 숨기고 본문을 넓힌다 (기억하지 않는다)
     · 가로 메뉴 드롭다운(게시판 · 로그인) — 바깥을 누르면 닫는다
   ========================================================================== */
(function () {
	'use strict';

	var header = document.getElementById('hn-header');
	var bar    = document.getElementById('hn-progress');
	var ticking = false;

	function onScroll() {
		ticking = false;
		var el  = document.documentElement;
		var max = el.scrollHeight - el.clientHeight;
		if (bar) bar.style.width = (max > 0 ? Math.min(100, window.scrollY / max * 100) : 0) + '%';
		if (header) header.classList.toggle('is-shrink', window.scrollY > 50);
	}
	window.addEventListener('scroll', function () {
		if (ticking) return;
		ticking = true;
		requestAnimationFrame(onScroll);
	}, { passive: true });
	onScroll();

	var search = document.getElementById('hn-search');
	if (search) {
		var input = search.querySelector('input');
		search.querySelector('.hn-search-open').addEventListener('click', function () {
			var shown = window.getComputedStyle(input).display !== 'none';
			if (shown && input.value.trim() !== '') {
				search.submit();
			} else if (!shown) {
				search.classList.add('is-open');
				input.focus();
			} else {
				input.focus();
			}
		});
		search.querySelector('.hn-search-close').addEventListener('click', function () {
			search.classList.remove('is-open');
		});
	}

	// 가로 메뉴의 게시판 · 로그인 드롭다운 — 바깥을 누르면 닫는다
	document.addEventListener('click', function (e) {
		document.querySelectorAll('#hn-gnb details[open]').forEach(function (d) { if (!d.contains(e.target)) d.removeAttribute('open'); });
	});
	// 메뉴 칸(.kh-gnb-scroll) 안의 게시판 목록 — 칸이 가로 스크롤이라 그 안에 두면 잘린다.
	// 펼칠 때 화면 기준(fixed)으로 "게시판" 바로 아래에 띄우고, 페이지를 밀면 따라 옮긴다. 칸을 밀면 닫는다
	document.querySelectorAll('.kh-gnb-scroll').forEach(function (el) {
		var place = function () {
			el.querySelectorAll('details[open]').forEach(function (d) {
				var r = d.querySelector('summary').getBoundingClientRect(), ul = d.querySelector('ul');
				ul.style.position = 'fixed';
				if (document.dir === 'rtl') ul.style.right = (document.documentElement.clientWidth - r.right) + 'px';   // ar: 오른쪽 끝에 맞춘다
				else ul.style.left = r.left + 'px';
				ul.style.top = r.bottom + 'px';
			});
		};
		el.querySelectorAll('details').forEach(function (d) { d.addEventListener('toggle', place); });
		window.addEventListener('scroll', place, { passive: true });
		window.addEventListener('resize', place);
		el.addEventListener('scroll', function () {
			el.querySelectorAll('details[open]').forEach(function (d) { d.removeAttribute('open'); });
		}, { passive: true });
	});

	document.querySelectorAll('.hn-wide-btn').forEach(function (btn) {
		btn.addEventListener('click', function () {
			var wide = document.body.classList.toggle('hn-wide');
			btn.setAttribute('aria-pressed', wide ? 'true' : 'false');
		});
	});
})();
