import { t as hydrate } from "@theme/island-demo";
//#region theme/frontend/islands/island-demo-idle.js
var IslandDemoIdle = class extends window.HTMLElement {
	connectedCallback() {
		hydrate(this);
	}
};
window.customElements.define("island-demo-idle", IslandDemoIdle);
//#endregion
