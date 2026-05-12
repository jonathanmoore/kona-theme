//#region theme/frontend/islands/product-recommendations.js
var ProductRecommendations = class extends window.HTMLElement {
	connectedCallback() {
		this.controller = new AbortController();
		this.loadRecommendations();
	}
	disconnectedCallback() {
		this.controller?.abort();
	}
	async loadRecommendations() {
		try {
			const text = await (await fetch(this.dataset.url, { signal: this.controller.signal })).text();
			const html = document.createElement("div");
			html.innerHTML = text;
			const recommendations = html.querySelector("product-recommendations");
			if (recommendations && recommendations.innerHTML.trim().length) this.innerHTML = recommendations.innerHTML;
		} catch (e) {
			if (e.name !== "AbortError") console.error(e);
		}
	}
};
window.customElements.define("product-recommendations", ProductRecommendations);
//#endregion
