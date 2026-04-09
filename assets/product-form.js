import { n as fetchConfig } from "@theme/utils";
import { n as createEvent, r as listen, t as Events } from "@theme/events";
//#region theme/frontend/islands/product-form.js
var CART_SECTIONS = ["cart-drawer", "cart-icon-bubble"];
var ProductForm = class extends window.HTMLElement {
	constructor() {
		super();
		this.form = this.querySelector("form");
		this.form.querySelector("[name=\"id\"]").disabled = false;
		this.hasCartDrawer = !!document.querySelector("cart-drawer");
		this.submitButton = this.querySelector("[type=\"submit\"]");
		if (this.hasCartDrawer) this.submitButton.setAttribute("aria-haspopup", "dialog");
	}
	connectedCallback() {
		this.controller = new AbortController();
		this.form.addEventListener("submit", this.onSubmitHandler.bind(this), { signal: this.controller.signal });
		const section = this.closest("section");
		if (section) this.variantController = listen(section, Events.VARIANT_CHANGED, this.onVariantChanged.bind(this));
	}
	disconnectedCallback() {
		this.controller?.abort();
		this.variantController?.abort();
	}
	onVariantChanged(event) {
		const { variant, available } = event.detail;
		this.handleErrorMessage();
		const addButton = this.submitButton;
		const addButtonText = addButton?.querySelector("span");
		if (!addButton) return;
		if (!variant) {
			addButton.setAttribute("disabled", "disabled");
			if (addButtonText) addButtonText.textContent = window.variantStrings.unavailable;
			const price = document.getElementById(`price-${event.detail.sectionId}`);
			if (price) price.classList.add("invisible");
		} else if (!available) {
			addButton.setAttribute("disabled", "disabled");
			if (addButtonText) addButtonText.textContent = window.variantStrings.soldOut;
		} else {
			addButton.removeAttribute("disabled");
			if (addButtonText) addButtonText.textContent = window.variantStrings.addToCart;
		}
	}
	async onSubmitHandler(evt) {
		evt.preventDefault();
		if (this.submitButton.getAttribute("aria-disabled") === "true") return;
		this.handleErrorMessage();
		this.submitButton.setAttribute("aria-disabled", true);
		this.submitButton.classList.add("loading");
		const config = fetchConfig("javascript");
		config.headers["X-Requested-With"] = "XMLHttpRequest";
		delete config.headers["Content-Type"];
		const formData = new window.FormData(this.form);
		const activeElement = document.activeElement;
		if (this.hasCartDrawer) {
			formData.append("sections", CART_SECTIONS.join(","));
			formData.append("sections_url", window.location.pathname);
		}
		config.body = formData;
		try {
			const data = await (await fetch(`${window.routes.cart_add_url}`, {
				...config,
				signal: this.controller.signal
			})).json();
			if (data.status) {
				this.handleErrorMessage(data.description);
				document.dispatchEvent(createEvent(Events.CART_ERROR, {
					source: "product-form",
					message: data.description
				}));
				this.submitButton.setAttribute("aria-disabled", true);
				this.error = true;
				return;
			}
			if (!this.hasCartDrawer) {
				window.location = window.routes.cart_url;
				return;
			}
			this.error = false;
			document.dispatchEvent(createEvent(Events.CART_ADDED, {
				source: "product-form",
				productId: data.id,
				sections: data.sections,
				activeElement
			}));
		} catch (e) {
			if (e.name !== "AbortError") console.error(e);
		} finally {
			this.submitButton.classList.remove("loading");
			if (!this.error) this.submitButton.removeAttribute("aria-disabled");
		}
	}
	handleErrorMessage(errorMessage = false) {
		this.errorMessage = this.errorMessage || this.querySelector("[data-error-message]");
		this.errorMessage.toggleAttribute("hidden", !errorMessage);
		if (errorMessage) this.errorMessage.textContent = errorMessage;
	}
};
window.customElements.define("product-form", ProductForm);
//#endregion
