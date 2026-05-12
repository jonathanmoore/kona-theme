import { n as createEvent, t as Events } from "@theme/events";
//#region theme/frontend/islands/variant-selects.js
var VariantSelects = class extends window.HTMLElement {
	connectedCallback() {
		this.controller = new AbortController();
		this.addEventListener("change", this.onVariantChange, { signal: this.controller.signal });
	}
	disconnectedCallback() {
		this.controller?.abort();
	}
	onVariantChange() {
		this.updateOptions();
		this.updateMasterId();
		if (!this.currentVariant) this.dispatchEvent(createEvent(Events.VARIANT_CHANGED, {
			variant: null,
			available: false,
			sectionId: this.dataset.section
		}));
		else {
			this.updateURL();
			this.updateVariantInput();
			this.renderProductInfo();
			this.dispatchEvent(createEvent(Events.VARIANT_CHANGED, {
				variant: this.currentVariant,
				available: this.currentVariant.available,
				sectionId: this.dataset.section
			}));
		}
	}
	updateOptions() {
		this.options = Array.from(this.querySelectorAll("select"), (select) => select.value);
	}
	updateMasterId() {
		this.currentVariant = this.getVariantData().find((variant) => {
			return !variant.options.map((option, index) => {
				return this.options[index] === option;
			}).includes(false);
		});
	}
	updateURL() {
		if (!this.currentVariant || this.dataset.updateUrl === "false") return;
		window.history.replaceState({}, "", `${this.dataset.url}?variant=${this.currentVariant.id}`);
	}
	updateVariantInput() {
		const productForms = document.querySelectorAll(`#product-form-${this.dataset.section}, #product-form-installment-${this.dataset.section}`);
		for (const productForm of productForms) {
			const input = productForm.querySelector("input[name=\"id\"]");
			input.value = this.currentVariant.id;
			input.dispatchEvent(new Event("change", { bubbles: true }));
		}
	}
	async renderProductInfo() {
		try {
			const responseText = await (await fetch(`${this.dataset.url}?variant=${this.currentVariant.id}&section_id=${this.dataset.originalSection ? this.dataset.originalSection : this.dataset.section}`, { signal: this.controller.signal })).text();
			const html = new window.DOMParser().parseFromString(responseText, "text/html");
			const destination = document.getElementById(`price-${this.dataset.section}`);
			const source = html.getElementById(`price-${this.dataset.originalSection ? this.dataset.originalSection : this.dataset.section}`);
			if (source && destination) destination.innerHTML = source.innerHTML;
			const price = document.getElementById(`price-${this.dataset.section}`);
			if (price) price.classList.remove("invisible");
		} catch (e) {
			if (e.name !== "AbortError") console.error(e);
		}
	}
	getVariantData() {
		this.variantData = this.variantData || JSON.parse(this.querySelector("[type=\"application/json\"]").textContent);
		return this.variantData;
	}
};
window.customElements.define("variant-selects", VariantSelects);
//#endregion
export { VariantSelects as default };
