import { n as removeTrapFocus, r as trapFocus } from "@theme/a11y";
//#region theme/frontend/islands/details-modal.js
var DetailsModal = class extends window.HTMLElement {
	constructor() {
		super();
		this.detailsContainer = this.querySelector("details");
		this.summaryToggle = this.querySelector("summary");
		this.summaryToggle.setAttribute("role", "button");
	}
	connectedCallback() {
		this.controller = new AbortController();
		const { signal } = this.controller;
		this.detailsContainer.addEventListener("keyup", (event) => event.code.toUpperCase() === "ESCAPE" && this.close(), { signal });
		this.summaryToggle.addEventListener("click", this.onSummaryClick.bind(this), { signal });
		this.querySelector("button[type=\"button\"]").addEventListener("click", this.close.bind(this), { signal });
	}
	disconnectedCallback() {
		this.controller?.abort();
	}
	isOpen() {
		return this.detailsContainer.hasAttribute("open");
	}
	onSummaryClick(event) {
		event.preventDefault();
		event.target.closest("details").hasAttribute("open") ? this.close() : this.open(event);
	}
	onBodyClick(event) {
		if (!this.contains(event.target) || event.target.classList.contains("modal-overlay")) this.close(false);
	}
	open(event) {
		this.onBodyClickEvent = this.onBodyClickEvent || this.onBodyClick.bind(this);
		event.target.closest("details").setAttribute("open", true);
		document.body.addEventListener("click", this.onBodyClickEvent);
		document.body.classList.add("overflow-hidden");
		trapFocus(this.detailsContainer.querySelector("[tabindex=\"-1\"]"), this.detailsContainer.querySelector("input:not([type=\"hidden\"])"));
	}
	close(focusToggle = true) {
		removeTrapFocus(focusToggle ? this.summaryToggle : null);
		this.detailsContainer.removeAttribute("open");
		document.body.removeEventListener("click", this.onBodyClickEvent);
		document.body.classList.remove("overflow-hidden");
	}
};
window.customElements.define("details-modal", DetailsModal);
//#endregion
export { DetailsModal as default };
