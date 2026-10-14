import { t as __vitePreload } from "./heromap.min.js";
//#region src/components/layout/slider/slider.js
var sliders = document.querySelectorAll("[data-att-slider]");
if (sliders.length) {
	const observer = new IntersectionObserver((entries, io) => {
		entries.forEach((entry) => {
			if (!entry.isIntersecting) return;
			io.unobserve(entry.target);
			__vitePreload(async () => {
				const { createSlider } = await import("./swiper.core.min.js");
				return { createSlider };
			}, [], import.meta.url).then(({ createSlider }) => createSlider(entry.target));
		});
	}, { rootMargin: "500px" });
	sliders.forEach((slider) => observer.observe(slider));
}
//#endregion
