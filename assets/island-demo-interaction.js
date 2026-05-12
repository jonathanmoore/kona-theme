import { t as hydrate } from "@theme/island-demo";
//#region theme/frontend/islands/island-demo-interaction.js
var IslandDemoInteraction = class extends window.HTMLElement {
	connectedCallback() {
		hydrate(this);
	}
};
window.customElements.define("island-demo-interaction", IslandDemoInteraction);
//#endregion
