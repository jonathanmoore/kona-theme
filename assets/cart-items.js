import { r as trapFocus } from "@theme/a11y";
import { n as fetchConfig, t as debounce } from "@theme/utils";
import { n as createEvent, t as Events } from "@theme/events";
//#region theme/frontend/islands/cart-items.js
var CartItems = class extends window.HTMLElement {
	constructor() {
		super();
		this.lineItemStatusElement = document.getElementById("shopping-cart-line-item-status") || document.getElementById("CartDrawer-LineItemStatus");
		this.currentItemCount = Array.from(this.querySelectorAll("[name=\"updates[]\"]")).reduce((total, quantityInput) => total + parseInt(quantityInput.value), 0);
		this.debouncedOnChange = debounce((event) => {
			this.onChange(event);
		}, 300);
	}
	connectedCallback() {
		this.controller = new AbortController();
		this.addEventListener("change", this.debouncedOnChange, { signal: this.controller.signal });
	}
	disconnectedCallback() {
		this.controller?.abort();
	}
	onChange(event) {
		this.updateQuantity(event.target.dataset.index, event.target.value, document.activeElement.getAttribute("name"));
	}
	getSectionsToRender() {
		return [
			{
				id: "main-cart-items",
				section: document.getElementById("main-cart-items").dataset.id,
				selector: ".js-contents"
			},
			{
				id: "cart-icon-bubble",
				section: "cart-icon-bubble",
				selector: ".shopify-section"
			},
			{
				id: "cart-live-region-text",
				section: "cart-live-region-text",
				selector: ".shopify-section"
			},
			{
				id: "cart-subtotal",
				section: "cart-subtotal",
				selector: ".shopify-section"
			}
		];
	}
	async updateQuantity(line, quantity, name) {
		this.enableLoading(line);
		const body = JSON.stringify({
			line,
			quantity,
			sections: this.getSectionsToRender().map((section) => section.section),
			sections_url: window.location.pathname
		});
		try {
			const state = await (await fetch(`${window.routes.cart_change_url}`, {
				...fetchConfig(),
				body,
				signal: this.controller.signal
			})).text();
			const parsedState = JSON.parse(state);
			this.classList.toggle("is-empty", parsedState.item_count === 0);
			const cartDrawerWrapper = document.querySelector("cart-drawer");
			document.dispatchEvent(createEvent(Events.CART_UPDATED, {
				source: this.localName,
				itemCount: parsedState.item_count,
				sections: parsedState.sections
			}));
			for (const section of this.getSectionsToRender()) {
				const elementToReplace = document.getElementById(section.id).querySelector(section.selector) || document.getElementById(section.id);
				elementToReplace.innerHTML = this.getSectionInnerHTML(parsedState.sections[section.section], section.selector);
			}
			this.updateLiveRegions(line, parsedState.item_count);
			const lineItem = document.getElementById(`CartItem-${line}`) || document.getElementById(`CartDrawer-Item-${line}`);
			if (lineItem && lineItem.querySelector(`[name="${name}"]`)) cartDrawerWrapper ? trapFocus(cartDrawerWrapper, lineItem.querySelector(`[name="${name}"]`)) : lineItem.querySelector(`[name="${name}"]`).focus();
			else if (parsedState.item_count === 0 && cartDrawerWrapper) trapFocus(cartDrawerWrapper.querySelector("#CartDrawer"), cartDrawerWrapper.querySelector("[tabindex=\"-1\"]"));
			else if (document.querySelector(".cart-item") && cartDrawerWrapper) trapFocus(cartDrawerWrapper, document.querySelector(".cart-item-name"));
			this.disableLoading();
		} catch (e) {
			if (e.name === "AbortError") return;
			for (const overlay of this.querySelectorAll(".loading-overlay")) overlay.classList.add("hidden");
			const errors = document.getElementById("cart-errors") || document.getElementById("CartDrawer-CartErrors");
			errors.textContent = window.cartStrings.error;
			this.disableLoading();
		}
	}
	updateLiveRegions(line, itemCount) {
		if (this.currentItemCount === itemCount) {
			const lineItemError = document.getElementById(`Line-item-error-${line}`) || document.getElementById(`CartDrawer-LineItemError-${line}`);
			const quantityElement = document.getElementById(`Quantity-${line}`) || document.getElementById(`Drawer-quantity-${line}`);
			lineItemError.innerHTML = window.cartStrings.quantityError.replace("[quantity]", quantityElement.value);
		}
		this.currentItemCount = itemCount;
		this.lineItemStatusElement.setAttribute("aria-hidden", true);
		const cartStatus = document.getElementById("cart-live-region-text") || document.getElementById("CartDrawer-LiveRegionText");
		cartStatus.setAttribute("aria-hidden", false);
		setTimeout(() => {
			cartStatus.setAttribute("aria-hidden", true);
		}, 1e3);
	}
	getSectionInnerHTML(html, selector) {
		return new window.DOMParser().parseFromString(html, "text/html").querySelector(selector).innerHTML;
	}
	enableLoading(line) {
		(document.getElementById("main-cart-items") || document.getElementById("CartDrawer-CartItems")).classList.add("loading");
		const cartItemElements = this.querySelectorAll(`#CartItem-${line} .loading-overlay`);
		const cartDrawerItemElements = this.querySelectorAll(`#CartDrawer-Item-${line} .loading-overlay`);
		for (const overlay of [...cartItemElements, ...cartDrawerItemElements]) overlay.classList.remove("hidden");
		document.activeElement.blur();
		this.lineItemStatusElement.setAttribute("aria-hidden", false);
	}
	disableLoading() {
		(document.getElementById("main-cart-items") || document.getElementById("CartDrawer-CartItems")).classList.remove("loading");
	}
};
window.customElements.define("cart-items", CartItems);
//#endregion
export { CartItems as default };
