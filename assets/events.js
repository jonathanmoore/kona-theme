//#region theme/frontend/lib/events.js
/**
* Theme event type constants.
* Global events (cart:*) are dispatched on document.
* Local events (variant:*) bubble from the originating component.
*/
var Events = {
	CART_ADDED: "cart:added",
	CART_UPDATED: "cart:updated",
	CART_ERROR: "cart:error",
	VARIANT_CHANGED: "variant:changed"
};
/**
* Create a CustomEvent with bubbles: true.
* @param {string} type - Event type from Events constants
* @param {object} detail - Event payload
* @returns {CustomEvent}
*/
function createEvent(type, detail = {}) {
	return new CustomEvent(type, {
		bubbles: true,
		detail
	});
}
/**
* Subscribe to an event with automatic AbortController wiring.
* Returns the AbortController — call .abort() in disconnectedCallback.
*
* @param {EventTarget} target - Element or document to listen on
* @param {string} type - Event type
* @param {Function} handler - Event handler
* @returns {AbortController}
*/
function listen(target, type, handler) {
	const controller = new AbortController();
	target.addEventListener(type, handler, { signal: controller.signal });
	return controller;
}
//#endregion
export { createEvent as n, listen as r, Events as t };
