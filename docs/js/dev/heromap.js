import { a as bodyUnlock, n as bodyLock, s as loadDesktopEffect } from "./common.min.js";
//#region \0vite/preload-helper.js
var scriptRel = "modulepreload";
var assetsURL = function(dep, importerUrl) {
	return new URL(dep, importerUrl).href;
};
var seen = {};
var isCssPreloadUrl = function isCssPreloadUrl(url) {
	return url.pathname.endsWith(".css");
};
var __vitePreload = function preload(baseModule, deps, importerUrl) {
	let promise = Promise.resolve();
	if (deps && deps.length > 0) {
		let preloadedHrefs;
		const cspNonceMeta = document.querySelector("meta[property=csp-nonce]");
		const cspNonce = cspNonceMeta?.nonce || cspNonceMeta?.getAttribute("nonce");
		function allSettled(promises) {
			return Promise.all(promises.map((p) => Promise.resolve(p).then((value) => ({
				status: "fulfilled",
				value
			}), (reason) => ({
				status: "rejected",
				reason
			}))));
		}
		function importMetaResolve(specifier) {
			if (import.meta.resolve) return new URL(import.meta.resolve(specifier));
			return new URL(
				specifier,
				/** #__KEEP__ */
				import.meta.url
			);
		}
		promise = allSettled(deps.map((depString) => {
			depString = assetsURL(depString, importerUrl);
			const dep = importMetaResolve(depString);
			if (dep.href in seen) return;
			seen[dep.href] = true;
			const isCss = isCssPreloadUrl(dep);
			if (preloadedHrefs === void 0) {
				preloadedHrefs = {
					all: /* @__PURE__ */ new Set(),
					styles: /* @__PURE__ */ new Set()
				};
				const links = document.getElementsByTagName("link");
				for (let i = links.length - 1; i >= 0; i--) {
					const link = links[i];
					preloadedHrefs.all.add(link.href);
					if (link.rel === "stylesheet") preloadedHrefs.styles.add(link.href);
				}
			}
			if ((isCss ? preloadedHrefs.styles : preloadedHrefs.all).has(dep.href)) return;
			const link = document.createElement("link");
			link.rel = isCss ? "stylesheet" : scriptRel;
			if (!isCss) link.as = "script";
			link.crossOrigin = "";
			link.href = dep.href;
			if (cspNonce) link.setAttribute("nonce", cspNonce);
			document.head.appendChild(link);
			if (isCss) return new Promise((res, rej) => {
				link.addEventListener("load", res);
				link.addEventListener("error", () => rej(/* @__PURE__ */ new Error(`Unable to preload CSS for ${dep}`)));
			});
		}).filter((p) => p !== void 0));
	}
	function handlePreloadError(err) {
		const e = new Event("vite:preloadError", { cancelable: true });
		e.payload = err;
		window.dispatchEvent(e);
		if (!e.defaultPrevented) throw err;
	}
	return promise.then((res) => {
		for (const item of res || []) {
			if (item.status !== "rejected") continue;
			handlePreloadError(item.reason);
		}
		return baseModule().catch(handlePreloadError);
	});
};
//#endregion
//#region src/components/custom/heromap/heromap.js
loadDesktopEffect(() => __vitePreload(() => import("./_parallax.min.js"), [], import.meta.url));
var closeDelay = 200;
var fadeTime = 300;
var show = (el) => {
	el.hidden = false;
	el.getBoundingClientRect();
	el.classList.add(`${el.classList[0]}--open`);
};
var hide = (el) => {
	const openClass = `${el.classList[0]}--open`;
	el.classList.remove(openClass);
	setTimeout(() => {
		if (!el.classList.contains(openClass)) el.hidden = true;
	}, fadeTime);
};
document.querySelectorAll("[data-att-heromap]").forEach((hero) => {
	const pins = [...hero.querySelectorAll(".heromap__pin")];
	const backdrop = hero.querySelector(".heromap__backdrop");
	if (!pins.length || hero.dataset.heromapBranches) return;
	hero.dataset.heromapBranches = "true";
	let current = null;
	let closeTimer = 0;
	let locked = false;
	let pointerType = "";
	const cardOf = (pin) => document.getElementById(pin.getAttribute("aria-controls"));
	const isPopup = (card) => getComputedStyle(card).position === "fixed";
	const focusables = (card) => [...card.querySelectorAll("a[href], button")].filter((el) => el.getClientRects().length);
	const place = ({ pin, card }) => {
		const p = pin.getBoundingClientRect();
		const h = hero.getBoundingClientRect();
		card.style.setProperty("--heromap-branch-x", `${p.left + p.width / 2 - h.left}px`);
		card.style.setProperty("--heromap-branch-y", `${p.top + p.height / 2 - h.top}px`);
	};
	const close = (returnFocus = false) => {
		clearTimeout(closeTimer);
		if (!current) return;
		const { pin, card } = current;
		current = null;
		hide(card);
		pin.setAttribute("aria-expanded", "false");
		if (backdrop && locked) hide(backdrop);
		if (locked) {
			bodyUnlock(0);
			locked = false;
		}
		if (returnFocus) pin.focus();
	};
	const open = (pin, moveFocus = false) => {
		clearTimeout(closeTimer);
		if (current?.pin === pin) return;
		close();
		const card = cardOf(pin);
		if (!card) return;
		current = {
			pin,
			card
		};
		pin.setAttribute("aria-expanded", "true");
		if (isPopup(card)) {
			card.setAttribute("aria-modal", "true");
			if (backdrop) show(backdrop);
			show(card);
			bodyLock(0);
			locked = true;
			card.querySelector(".heromap__close")?.focus();
		} else {
			card.removeAttribute("aria-modal");
			place(current);
			show(card);
			if (moveFocus) focusables(card)[0]?.focus();
		}
	};
	const scheduleClose = () => {
		clearTimeout(closeTimer);
		closeTimer = setTimeout(close, closeDelay);
	};
	pins.forEach((pin) => {
		const card = cardOf(pin);
		if (!card) return;
		const hoverMode = (event) => event.pointerType === "mouse" && !isPopup(card);
		pin.addEventListener("pointerdown", (event) => pointerType = event.pointerType);
		pin.addEventListener("pointerenter", (event) => hoverMode(event) && open(pin));
		pin.addEventListener("click", (event) => {
			const byMouse = event.detail > 0 && pointerType === "mouse";
			if (current?.pin === pin && byMouse && !isPopup(card)) return;
			if (current?.pin === pin) close();
			else open(pin, event.detail === 0);
		});
		for (const el of [pin, card]) el.addEventListener("pointerleave", (event) => hoverMode(event) && current?.pin === pin && scheduleClose());
		card.addEventListener("pointerenter", () => clearTimeout(closeTimer));
		card.querySelector(".heromap__close")?.addEventListener("click", () => close(true));
	});
	backdrop?.addEventListener("click", () => close());
	document.addEventListener("click", (event) => {
		if (!current || current.card.contains(event.target) || event.target.closest(".heromap__pin") === current.pin) return;
		close();
	});
	document.addEventListener("keydown", (event) => {
		if (event.key === "Escape" && current) close(true);
	});
	hero.addEventListener("keydown", (event) => {
		if (event.key !== "Tab" || !current || !isPopup(current.card)) return;
		const items = focusables(current.card);
		const first = items[0];
		const last = items[items.length - 1];
		if (event.shiftKey && document.activeElement === first) {
			event.preventDefault();
			last.focus();
		} else if (!event.shiftKey && document.activeElement === last) {
			event.preventDefault();
			first.focus();
		}
	});
	hero.addEventListener("focusout", (event) => {
		const next = event.relatedTarget;
		if (!current || !next || isPopup(current.card)) return;
		if (next === current.pin || current.card.contains(next)) return;
		close();
	});
	window.addEventListener("resize", () => {
		if (!current) return;
		if (isPopup(current.card) !== locked) close();
		else if (!locked) place(current);
	}, { passive: true });
});
//#endregion
export { __vitePreload as t };
