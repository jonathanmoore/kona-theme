import { t as hydrate } from "@theme/island-demo";
//#region theme/frontend/islands/island-demo-visible.js
var IslandDemoVisible = class extends window.HTMLElement {
	connectedCallback() {
		hydrate(this);
	}
};
window.customElements.define("island-demo-visible", IslandDemoVisible);
//#endregion
