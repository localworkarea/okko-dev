//#region src/components/custom/heromap/heromap-parallax.js
var motionAllowed = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
var strength = 30;
var smoothing = .05;
document.querySelectorAll("[data-att-heromap]").forEach((hero) => {
	const gradient = hero.querySelector(".heromap__gradient");
	if (!gradient || hero.dataset.heromapParallax) return;
	hero.dataset.heromapParallax = "true";
	let frame = 0;
	let pointerX = 0;
	let pointerY = 0;
	let hovered = false;
	let currentX = 0;
	let currentY = 0;
	const render = () => {
		frame = 0;
		if (!motionAllowed.matches) return;
		let targetX = 0;
		let targetY = 0;
		if (hovered) {
			const bounds = hero.getBoundingClientRect();
			if (!bounds.width || !bounds.height) return;
			targetX = (Math.max(0, Math.min(1, (pointerX - bounds.left) / bounds.width)) - .5) * 2 * strength;
			targetY = (Math.max(0, Math.min(1, (pointerY - bounds.top) / bounds.height)) - .5) * 2 * strength;
		}
		currentX += (targetX - currentX) * smoothing;
		currentY += (targetY - currentY) * smoothing;
		const moving = Math.abs(targetX - currentX) > .01 || Math.abs(targetY - currentY) > .01;
		if (!moving) {
			if (!hovered) return reset();
			currentX = targetX;
			currentY = targetY;
		}
		gradient.style.setProperty("--heromap-parallax-x", `${currentX.toFixed(2)}%`);
		gradient.style.setProperty("--heromap-parallax-y", `${currentY.toFixed(2)}%`);
		if (moving) frame = requestAnimationFrame(render);
	};
	const reset = () => {
		cancelAnimationFrame(frame);
		frame = 0;
		hovered = false;
		currentX = 0;
		currentY = 0;
		gradient.style.removeProperty("--heromap-parallax-x");
		gradient.style.removeProperty("--heromap-parallax-y");
	};
	const returnToStart = () => {
		if (!hovered) return;
		hovered = false;
		if (!frame) frame = requestAnimationFrame(render);
	};
	hero.addEventListener("pointermove", (event) => {
		if (event.pointerType !== "mouse" || !motionAllowed.matches) return;
		pointerX = event.clientX;
		pointerY = event.clientY;
		hovered = true;
		if (!frame) frame = requestAnimationFrame(render);
	}, { passive: true });
	hero.addEventListener("pointerleave", returnToStart);
	hero.addEventListener("pointercancel", returnToStart);
	motionAllowed.addEventListener("change", reset);
});
//#endregion
