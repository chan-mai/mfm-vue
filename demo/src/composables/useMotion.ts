import gsap from 'gsap';

export function prefersReducedMotion(): boolean {
	return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// 要素を下から順に表示
export function revealIn(targets: gsap.TweenTarget, delay = 0) {
	if (prefersReducedMotion()) return;
	gsap.from(targets, {
		y: 16,
		autoAlpha: 0,
		duration: 0.8,
		delay,
		ease: 'expo.out',
		stagger: 0.08,
		clearProps: 'transform,opacity,visibility',
	});
}

// Transitionのjsフック用, 高さの開閉
export function expand(el: Element, done: () => void) {
	if (prefersReducedMotion()) return done();
	gsap.fromTo(el, { height: 0, autoAlpha: 0 }, { height: 'auto', autoAlpha: 1, duration: 0.45, ease: 'expo.out', onComplete: done, clearProps: 'height' });
}

export function collapse(el: Element, done: () => void) {
	if (prefersReducedMotion()) return done();
	gsap.to(el, { height: 0, autoAlpha: 0, duration: 0.25, ease: 'power2.in', onComplete: done });
}
