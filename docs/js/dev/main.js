import { c as slideDown, d as uniqArray, i as bodyLockToggle, r as bodyLockStatus, t as attLog, u as slideUp } from "./common.min.js";
//#region \0vite/modulepreload-polyfill.js
(function polyfill() {
	const relList = document.createElement("link").relList;
	if (relList && relList.supports && relList.supports("modulepreload")) return;
	for (const link of document.querySelectorAll("link[rel=\"modulepreload\"]")) processPreload(link);
	new MutationObserver((mutations) => {
		for (const mutation of mutations) {
			if (mutation.type !== "childList") continue;
			for (const node of mutation.addedNodes) if (node.tagName === "LINK" && node.rel === "modulepreload") processPreload(node);
		}
	}).observe(document, {
		childList: true,
		subtree: true
	});
	function getFetchOpts(link) {
		const fetchOpts = {};
		if (link.integrity) fetchOpts.integrity = link.integrity;
		if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
		if (link.crossOrigin === "use-credentials") fetchOpts.credentials = "include";
		else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
		else fetchOpts.credentials = "same-origin";
		return fetchOpts;
	}
	function processPreload(link) {
		if (link.ep) return;
		link.ep = true;
		const fetchOpts = getFetchOpts(link);
		fetch(link.href, fetchOpts);
	}
})();
//#endregion
//#region src/components/layout/menu/menu.js
var desktop$1 = window.matchMedia("(min-width: 1100.98px)");
var isOpen = () => document.documentElement.hasAttribute("data-att-menu-open");
function menuToggle() {
	if (!bodyLockStatus) return;
	bodyLockToggle();
	const open = document.documentElement.toggleAttribute("data-att-menu-open");
	document.querySelectorAll("[data-att-menu]").forEach((button) => button.setAttribute("aria-expanded", open));
}
function menuInit() {
	document.addEventListener("click", function(e) {
		if (e.target.closest("[data-att-menu]")) return menuToggle();
		if (isOpen() && e.target.classList.contains("menu")) menuToggle();
	});
	document.addEventListener("keydown", (e) => {
		if (e.key === "Escape" && isOpen()) menuToggle();
	});
	desktop$1.addEventListener("change", () => isOpen() && menuToggle());
}
document.querySelector("[data-att-menu]") && window.addEventListener("load", menuInit);
//#endregion
//#region src/components/layout/header/header.js
var desktop = window.matchMedia("(min-width: 1100.98px)");
var subLink = (item) => item.querySelector(":scope > .menu__link");
function subToggle(item, open = !item.classList.contains("--sub-open"), duration = 500) {
	const sub = item.querySelector(".menu__sub");
	if (!desktop.matches) {
		if (sub.classList.contains("--slide")) return;
		open ? slideDown(sub, duration) : slideUp(sub, duration);
	}
	item.classList.toggle("--sub-open", open);
	subLink(item).setAttribute("aria-expanded", open);
}
function subReset() {
	document.querySelectorAll(".menu__item--sub").forEach((item) => {
		item.classList.remove("--sub-open");
		subLink(item).setAttribute("aria-expanded", false);
		item.querySelector(".menu__sub").hidden = !desktop.matches;
	});
}
function subCloseOutside(target) {
	document.querySelectorAll(".menu__item--sub.--sub-open").forEach((item) => {
		if (!target || !item.contains(target)) subToggle(item, false);
	});
}
document.addEventListener("click", (e) => {
	const link = e.target.closest(".menu__item--sub > .menu__link");
	if (link) {
		e.preventDefault();
		return subToggle(link.parentElement);
	}
	if (desktop.matches) subCloseOutside(e.target);
}, true);
document.addEventListener("keydown", (e) => {
	if (e.key === "Escape" && desktop.matches) subCloseOutside();
});
desktop.addEventListener("change", subReset);
subReset();
//#endregion
//#region src/components/layout/header/plugins/scroll/scroll.js
function headerScroll() {
	const header = document.querySelector("[data-att-header-scroll]");
	header.dataset.attHeaderScrollShow && header.dataset.attHeaderScrollShow;
	const startPoint = header.dataset.attHeaderScroll ? header.dataset.attHeaderScroll : 1;
	let timer;
	document.addEventListener("scroll", function(e) {
		const scrollTop = window.scrollY;
		clearTimeout(timer);
		if (scrollTop >= startPoint) !header.classList.contains("--header-scroll") && header.classList.add("--header-scroll");
		else header.classList.contains("--header-scroll") && header.classList.remove("--header-scroll");
	});
}
document.querySelector("[data-att-header-scroll]") && window.addEventListener("load", headerScroll);
//#endregion
//#region src/components/layout/footer/footer.js
var loadMap = (block) => {
	if (block.dataset.footerMapLoaded) return;
	block.dataset.footerMapLoaded = "true";
	const iframe = document.createElement("iframe");
	iframe.src = block.dataset.footerMap;
	iframe.title = block.dataset.footerMapTitle || "Google Maps";
	iframe.width = "636";
	iframe.height = "400";
	iframe.loading = "lazy";
	iframe.referrerPolicy = "strict-origin-when-cross-origin";
	iframe.setAttribute("allowfullscreen", "");
	block.append(iframe);
};
var mapBlocks = document.querySelectorAll("[data-footer-map]");
if (mapBlocks.length) {
	if ("IntersectionObserver" in window) {
		const observer = new IntersectionObserver((entries, obs) => {
			entries.forEach((entry) => {
				if (!entry.isIntersecting) return;
				obs.unobserve(entry.target);
				loadMap(entry.target);
			});
		}, { rootMargin: "500px" });
		mapBlocks.forEach((block) => observer.observe(block));
	} else mapBlocks.forEach(loadMap);
}
//#endregion
//#region src/components/forms/form/form.js
function formInit() {
	function formSubmit() {
		const forms = document.forms;
		if (forms.length) for (const form of forms) form.addEventListener("submit", function(e) {
			const form = e.target;
			formSubmitAction(form, e);
		});
		async function formSubmitAction(form, e) {
			if (form.dataset.attForm === "ajax") {
				e.preventDefault();
				const formAction = form.getAttribute("action") ? form.getAttribute("action").trim() : "#";
				const formMethod = form.getAttribute("method") ? form.getAttribute("method").trim() : "GET";
				const formData = new FormData(form);
				form.classList.add("--sending");
				const response = await fetch(formAction, {
					method: formMethod,
					body: formData
				});
				if (response.ok) {
					let responseResult = await response.json();
					form.classList.remove("--sending");
					formSent(form, responseResult);
				} else {
					attLog("_ATT_FORM_AJAX_ERR");
					form.classList.remove("--sending");
				}
			} else if (form.dataset.attForm === "dev") {
				e.preventDefault();
				formSent(form);
			}
		}
		function formSent(form, responseResult = ``) {
			document.dispatchEvent(new CustomEvent("formSent", { detail: { form } }));
			const formWrapper = form.closest("[data-att-form-wrapper]");
			if (formWrapper) {
				formWrapper.classList.add("--form-sent");
				const formMessage = formWrapper.querySelector("[data-att-form-message]");
				formMessage && formMessage.focus({ preventScroll: true });
				clearTimeout(formWrapper.formSentTimer);
				formWrapper.formSentTimer = setTimeout(() => {
					formWrapper.classList.remove("--form-sent");
				}, 1e4);
			}
			form.reset();
			attLog(`_ATT_FORM_SEND`);
		}
	}
	formSubmit();
}
document.querySelector("[data-att-form]") && window.addEventListener("load", formInit);
//#endregion
//#region src/components/effects/watcher/watcher.js
var ScrollWatcher = class {
	constructor(props) {
		let defaultConfig = { logging: true };
		this.config = Object.assign(defaultConfig, props);
		this.observer;
		!document.documentElement.hasAttribute("data-att-watch") && this.scrollWatcherRun();
	}
	scrollWatcherUpdate() {
		this.scrollWatcherRun();
	}
	scrollWatcherRun() {
		document.documentElement.setAttribute("data-att-watch", "");
		this.scrollWatcherConstructor(document.querySelectorAll("[data-att-watcher]"));
	}
	scrollWatcherConstructor(items) {
		if (items.length) uniqArray(Array.from(items).map(function(item) {
			if (item.dataset.attWatcher === "navigator" && !item.dataset.attWatcherThreshold) {
				let valueOfThreshold;
				if (item.clientHeight > 2) {
					valueOfThreshold = window.innerHeight / 2 / (item.clientHeight - 1);
					if (valueOfThreshold > 1) valueOfThreshold = 1;
				} else valueOfThreshold = 1;
				item.setAttribute("data-att-watcher-threshold", valueOfThreshold.toFixed(2));
			}
			return `${item.dataset.attWatcherRoot ? item.dataset.attWatcherRoot : null}|${item.dataset.attWatcherMargin ? item.dataset.attWatcherMargin : "0px"}|${item.dataset.attWatcherThreshold ? item.dataset.attWatcherThreshold : 0}`;
		})).forEach((uniqParam) => {
			let uniqParamArray = uniqParam.split("|");
			let paramsWatch = {
				root: uniqParamArray[0],
				margin: uniqParamArray[1],
				threshold: uniqParamArray[2]
			};
			let groupItems = Array.from(items).filter(function(item) {
				let watchRoot = item.dataset.attWatcherRoot ? item.dataset.attWatcherRoot : null;
				let watchMargin = item.dataset.attWatcherMargin ? item.dataset.attWatcherMargin : "0px";
				let watchThreshold = item.dataset.attWatcherThreshold ? item.dataset.attWatcherThreshold : 0;
				if (String(watchRoot) === paramsWatch.root && String(watchMargin) === paramsWatch.margin && String(watchThreshold) === paramsWatch.threshold) return item;
			});
			let configWatcher = this.getScrollWatcherConfig(paramsWatch);
			this.scrollWatcherInit(groupItems, configWatcher);
		});
	}
	getScrollWatcherConfig(paramsWatch) {
		let configWatcher = {};
		if (document.querySelector(paramsWatch.root)) configWatcher.root = document.querySelector(paramsWatch.root);
		configWatcher.rootMargin = paramsWatch.margin;
		if (paramsWatch.margin.indexOf("px") < 0 && paramsWatch.margin.indexOf("%") < 0) return;
		if (paramsWatch.threshold === "prx") {
			paramsWatch.threshold = [];
			for (let i = 0; i <= 1; i += .005) paramsWatch.threshold.push(i);
		} else paramsWatch.threshold = paramsWatch.threshold.split(",");
		configWatcher.threshold = paramsWatch.threshold;
		return configWatcher;
	}
	scrollWatcherCreate(configWatcher) {
		this.observer = new IntersectionObserver((entries, observer) => {
			entries.forEach((entry) => {
				this.scrollWatcherCallback(entry, observer);
			});
		}, configWatcher);
	}
	scrollWatcherInit(items, configWatcher) {
		this.scrollWatcherCreate(configWatcher);
		items.forEach((item) => this.observer.observe(item));
	}
	scrollWatcherIntersecting(entry, targetElement) {
		if (entry.isIntersecting) !targetElement.classList.contains("--view") && targetElement.classList.add("--view");
		else targetElement.classList.contains("--view") && targetElement.classList.remove("--view");
	}
	scrollWatcherOff(targetElement, observer) {
		observer.unobserve(targetElement);
	}
	scrollWatcherCallback(entry, observer) {
		const targetElement = entry.target;
		this.scrollWatcherIntersecting(entry, targetElement);
		targetElement.hasAttribute("data-att-watcher-once") && entry.isIntersecting && this.scrollWatcherOff(targetElement, observer);
		document.dispatchEvent(new CustomEvent("watcherCallback", { detail: { entry } }));
	}
};
document.querySelector("[data-att-watcher]") && window.addEventListener("load", () => new ScrollWatcher({}));
//#endregion
