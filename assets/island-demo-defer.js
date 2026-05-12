import { t as hydrate } from "@theme/island-demo";
//#region theme/frontend/islands/island-demo-defer.js
var IslandDemoDefer = class extends window.HTMLElement {
	connectedCallback() {
		hydrate(this);
	}
};
window.customElements.define("island-demo-defer", IslandDemoDefer);
//#endregion
