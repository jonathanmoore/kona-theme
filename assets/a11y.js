//#region theme/frontend/lib/a11y.js
function getFocusableElements(container) {
	return Array.from(container.querySelectorAll("summary, a[href], button:enabled, [tabindex]:not([tabindex^='-']), [draggable], area, input:not([type=hidden]):enabled, select:enabled, textarea:enabled, object, iframe")).filter((element) => !!(element.offsetWidth || element.offsetHeight || element.getClientRects().length));
}
var trapFocusHandlers = {};
function trapFocus(container, elementToFocus = container) {
	const elements = getFocusableElements(container);
	const first = elements[0];
	const last = elements[elements.length - 1];
	removeTrapFocus();
	trapFocusHandlers.focusin = (event) => {
		if (event.target !== container && event.target !== last && event.target !== first) return;
		document.addEventListener("keydown", trapFocusHandlers.keydown);
	};
	trapFocusHandlers.focusout = function() {
		document.removeEventListener("keydown", trapFocusHandlers.keydown);
	};
	trapFocusHandlers.keydown = function(event) {
		if (event.code.toUpperCase() !== "TAB") return;
		if (event.target === last && !event.shiftKey) {
			event.preventDefault();
			first.focus();
		}
		if ((event.target === container || event.target === first) && event.shiftKey) {
			event.preventDefault();
			last.focus();
		}
	};
	document.addEventListener("focusout", trapFocusHandlers.focusout);
	document.addEventListener("focusin", trapFocusHandlers.focusin);
	elementToFocus.focus();
}
function removeTrapFocus(elementToFocus = null) {
	document.removeEventListener("focusin", trapFocusHandlers.focusin);
	document.removeEventListener("focusout", trapFocusHandlers.focusout);
	document.removeEventListener("keydown", trapFocusHandlers.keydown);
	if (elementToFocus) elementToFocus.focus();
}
function onKeyUpEscape(event) {
	if (event.code.toUpperCase() !== "ESCAPE") return;
	const openDetailsElement = event.target.closest("details[open]");
	if (!openDetailsElement) return;
	const summaryElement = openDetailsElement.querySelector("summary");
	openDetailsElement.removeAttribute("open");
	summaryElement.setAttribute("aria-expanded", false);
	summaryElement.focus();
}
function initDisclosureWidgets(summaries) {
	summaries.forEach((summary) => {
		summary.setAttribute("role", "button");
		summary.setAttribute("aria-expanded", summary.parentNode.hasAttribute("open"));
		if (summary.nextElementSibling.getAttribute("id")) summary.setAttribute("aria-controls", summary.nextElementSibling.id);
		summary.addEventListener("click", (event) => {
			event.currentTarget.setAttribute("aria-expanded", !event.currentTarget.closest("details").hasAttribute("open"));
		});
		summary.parentElement.addEventListener("keyup", onKeyUpEscape);
	});
}
//#endregion
export { removeTrapFocus as n, trapFocus as r, initDisclosureWidgets as t };
