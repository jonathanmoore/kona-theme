import { t as hydrate } from "@theme/island-demo";
//#region theme/frontend/islands/island-demo-media.js
var IslandDemoMedia = class extends window.HTMLElement {
	connectedCallback() {
		hydrate(this);
	}
};
window.customElements.define("island-demo-media", IslandDemoMedia);
//#endregion
