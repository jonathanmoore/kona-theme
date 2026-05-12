import { t as hydrate } from "@theme/island-demo";
//#region theme/frontend/islands/island-demo-parent.js
var IslandDemoParent = class extends window.HTMLElement {
	connectedCallback() {
		hydrate(this);
	}
};
window.customElements.define("island-demo-parent", IslandDemoParent);
//#endregion
