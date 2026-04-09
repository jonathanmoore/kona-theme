//#region theme/frontend/lib/island-demo.js
/**
* Shared hydration callback for all island-demo-* components.
* Toggles classes and sets timestamp/status text on the host element.
*/
function hydrate(el) {
	const now = /* @__PURE__ */ new Date();
	const timestamp = [
		now.getHours(),
		now.getMinutes(),
		now.getSeconds()
	].map((n) => String(n).padStart(2, "0")).join(":") + "." + String(now.getMilliseconds()).padStart(3, "0");
	el.classList.add("is-hydrated");
	const indicator = el.querySelector("[data-demo-indicator]");
	if (indicator) indicator.classList.add("is-active");
	const ts = el.querySelector("[data-demo-timestamp]");
	if (ts) ts.textContent = timestamp;
	const status = el.querySelector("[data-demo-status]");
	if (status) {
		status.textContent = "Hydrated";
		status.dataset.hydrated = "";
	}
}
//#endregion
export { hydrate as t };
