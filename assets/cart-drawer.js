import { n as removeTrapFocus, r as trapFocus } from "@theme/a11y";
import { r as listen, t as Events } from "@theme/events";
//#region theme/frontend/islands/cart-drawer.js
var CartDrawer = class extends window.HTMLElement {
	connectedCallback() {
		this.controller = new AbortController();
		const { signal } = this.controller;
		this.addEventListener("keyup", (evt) => evt.code === "Escape" && this.close(), { signal });
		this.querySelector("#CartDrawer-Overlay").addEventListener("click", this.close.bind(this), { signal });
		this.setHeaderCartIconAccessibility();
		this.eventControllers = [listen(document, Events.CART_ADDED, this.onCartAdded.bind(this)), listen(document, Events.CART_UPDATED, this.onCartUpdated.bind(this))];
	}
	disconnectedCallback() {
		this.controller?.abort();
		for (const c of this.eventControllers ?? []) c.abort();
	}
	onCartAdded(event) {
		const { sections, activeElement } = event.detail;
		this.classList.remove("is-empty");
		if (activeElement) this.setActiveElement(activeElement);
		this.renderContents(sections);
	}
	onCartUpdated(event) {
		const { itemCount } = event.detail;
		this.classList.toggle("is-empty", itemCount === 0);
	}
	setHeaderCartIconAccessibility() {
		const cartLink = document.querySelector("#cart-icon-bubble");
		if (!cartLink) return;
		const { signal } = this.controller;
		cartLink.setAttribute("role", "button");
		cartLink.setAttribute("aria-haspopup", "dialog");
		cartLink.addEventListener("click", (event) => {
			event.preventDefault();
			this.open(cartLink);
		}, { signal });
		cartLink.addEventListener("keydown", (event) => {
			if (event.code.toUpperCase() === "SPACE") {
				event.preventDefault();
				this.open(cartLink);
			}
		}, { signal });
	}
	open(triggeredBy) {
		if (triggeredBy) this.setActiveElement(triggeredBy);
		setTimeout(() => {
			this.classList.add("active");
		});
		this.addEventListener("transitionend", () => {
			trapFocus(document.getElementById("CartDrawer"), this.querySelector("[tabindex=\"-1\"]"));
		}, { once: true });
		document.body.classList.add("overflow-hidden");
	}
	close() {
		this.classList.remove("active");
		removeTrapFocus(this.activeElement);
		document.body.classList.remove("overflow-hidden");
	}
	renderContents(sections) {
		for (const section of this.getSectionsToRender()) {
			const sectionElement = section.selector ? document.querySelector(section.selector) : document.getElementById(section.id);
			sectionElement.innerHTML = this.getSectionInnerHTML(sections[section.id], section.selector);
		}
		setTimeout(() => {
			this.querySelector("#CartDrawer-Overlay").addEventListener("click", this.close.bind(this), { signal: this.controller.signal });
			this.open();
		});
	}
	getSectionInnerHTML(html, selector = ".shopify-section") {
		return new window.DOMParser().parseFromString(html, "text/html").querySelector(selector).innerHTML;
	}
	getSectionsToRender() {
		return [{
			id: "cart-drawer",
			selector: "#CartDrawer"
		}, { id: "cart-icon-bubble" }];
	}
	setActiveElement(element) {
		this.activeElement = element;
	}
};
window.customElements.define("cart-drawer", CartDrawer);
//#endregion
