import { t as hydrate } from "@theme/island-demo";
//#region theme/frontend/islands/island-demo-child.js
var IslandDemoChild = class extends window.HTMLElement {
	connectedCallback() {
		hydrate(this);
	}
};
window.customElements.define("island-demo-child", IslandDemoChild);
//#endregion
