import { t as hydrate } from "@theme/island-demo";
//#region theme/frontend/islands/island-demo-media-mobile.js
var IslandDemoMediaMobile = class extends window.HTMLElement {
	connectedCallback() {
		hydrate(this);
	}
};
window.customElements.define("island-demo-media-mobile", IslandDemoMediaMobile);
//#endregion
