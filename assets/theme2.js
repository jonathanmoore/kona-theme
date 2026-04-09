import { t as initDisclosureWidgets } from "@theme/a11y";
//#region \0vite/modulepreload-polyfill.js
(function polyfill() {
	const relList = document.createElement("link").relList;
	if (relList && relList.supports && relList.supports("modulepreload")) return;
	for (const link of document.querySelectorAll("link[rel=\"modulepreload\"]")) processPreload(link);
	new MutationObserver((mutations) => {
		for (const mutation of mutations) {
			if (mutation.type !== "childList") continue;
			for (const node of mutation.addedNodes) if (node.tagName === "LINK" && node.rel === "modulepreload") processPreload(node);
		}
	}).observe(document, {
		childList: true,
		subtree: true
	});
	function getFetchOpts(link) {
		const fetchOpts = {};
		if (link.integrity) fetchOpts.integrity = link.integrity;
		if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
		if (link.crossOrigin === "use-credentials") fetchOpts.credentials = "include";
		else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
		else fetchOpts.credentials = "same-origin";
		return fetchOpts;
	}
	function processPreload(link) {
		if (link.ep) return;
		link.ep = true;
		const fetchOpts = getFetchOpts(link);
		fetch(link.href, fetchOpts);
	}
})();
//#endregion
//#region node_modules/.pnpm/vite-plugin-shopify-theme-islands@1.3.2_vite@8.0.8_@types+node@25.5.2_jiti@2.6.1_/node_modules/vite-plugin-shopify-theme-islands/dist/runtime.js
var INTERACTION_EVENT_NAMES = [
	"mouseenter",
	"touchstart",
	"focusin"
];
var DEFAULT_INTERACTION_EVENTS = [...INTERACTION_EVENT_NAMES];
var INTERACTION_EVENT_NAMES_LABEL = INTERACTION_EVENT_NAMES.join(", ");
var INTERACTION_EVENT_NAME_SET = new Set(INTERACTION_EVENT_NAMES);
var PREFIX = "[vite-plugin-shopify-theme-islands]";
function isInteractionEventName(value) {
	return INTERACTION_EVENT_NAME_SET.has(value);
}
function validateInteractionEvents(events) {
	if (events === void 0) return;
	if (events.length === 0) throw new Error(`${PREFIX} "directives.interaction.events" must not be empty`);
	const { invalid } = partitionInteractionEventTokens(events);
	const invalidEvent = invalid[0];
	if (invalidEvent) throw new Error(`${PREFIX} "directives.interaction.events" contains unsupported event "${invalidEvent}"`);
}
function partitionInteractionEventTokens(tokens) {
	const valid = [];
	const invalid = [];
	for (const token of tokens) if (isInteractionEventName(token)) valid.push(token);
	else invalid.push(token);
	return {
		valid,
		invalid
	};
}
var DEFAULT_DIRECTIVES = {
	visible: {
		attribute: "client:visible",
		rootMargin: "200px",
		threshold: 0
	},
	idle: {
		attribute: "client:idle",
		timeout: 500
	},
	media: { attribute: "client:media" },
	defer: {
		attribute: "client:defer",
		delay: 3e3
	},
	interaction: {
		attribute: "client:interaction",
		events: [...DEFAULT_INTERACTION_EVENTS]
	}
};
var DEFAULT_RETRY = {
	retries: 0,
	delay: 1e3
};
function normalizeReviveOptions(options) {
	const d = DEFAULT_DIRECTIVES;
	const r = DEFAULT_RETRY;
	const dir = options?.directives;
	validateInteractionEvents(dir?.interaction?.events);
	return {
		directives: {
			visible: {
				...d.visible,
				...dir?.visible
			},
			idle: {
				...d.idle,
				...dir?.idle
			},
			media: {
				...d.media,
				...dir?.media
			},
			defer: {
				...d.defer,
				...dir?.defer
			},
			interaction: {
				...d.interaction,
				...dir?.interaction
			}
		},
		debug: options?.debug ?? false,
		retry: {
			...r,
			...options?.retry
		},
		directiveTimeout: options?.directiveTimeout ?? 0
	};
}
var basename = (key) => key.split("/").pop() ?? key;
function defaultKeyToTag(key) {
	const filename = basename(key);
	const tag = filename.replace(/\.(ts|js)$/, "");
	const skip = !tag.includes("-");
	if (skip && tag) console.warn(`[islands] Skipping "${filename}" — filename must contain a hyphen to match a valid custom element tag (e.g. rename to "${tag}-island.ts")`);
	return {
		tag,
		skip
	};
}
function buildIslandMap(payload) {
	const map = /* @__PURE__ */ new Map();
	for (const [key, loader] of Object.entries(payload.islands)) {
		const { tag, skip } = defaultKeyToTag(key);
		if (skip) continue;
		if (!map.has(tag)) map.set(tag, loader);
	}
	return map;
}
var DirectiveCancelledError = class extends Error {
	constructor() {
		super("[islands] directive cancelled: element removed from DOM");
		this.name = "DirectiveCancelledError";
	}
};
function waitVisible(element, rootMargin, threshold, watch) {
	return new Promise((resolve, reject) => {
		let settled = false;
		let unwatch = () => {};
		const finish = (done) => {
			if (settled) return;
			settled = true;
			unwatch();
			io.disconnect();
			done();
		};
		const io = new IntersectionObserver(([entry]) => {
			if (entry.isIntersecting) finish(resolve);
		}, {
			rootMargin,
			threshold
		});
		io.observe(element);
		unwatch = watch(element, () => finish(() => reject(new DirectiveCancelledError())));
	});
}
function waitInteraction(element, events, watch) {
	return new Promise((resolve, reject) => {
		let settled = false;
		let unwatch = () => {};
		const cleanup = () => {
			for (const name of events) element.removeEventListener(name, handler);
		};
		const finish = (done) => {
			if (settled) return;
			settled = true;
			unwatch();
			cleanup();
			done();
		};
		const handler = () => {
			finish(resolve);
		};
		for (const name of events) element.addEventListener(name, handler);
		unwatch = watch(element, () => finish(() => reject(new DirectiveCancelledError())));
	});
}
function waitDelay(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
function waitIdle(timeout) {
	return new Promise((resolve) => {
		if ("requestIdleCallback" in window) window.requestIdleCallback(() => resolve(), { timeout });
		else setTimeout(resolve, timeout);
	});
}
function waitMedia(query) {
	const m = window.matchMedia(query);
	return new Promise((resolve) => {
		if (m.matches) resolve();
		else m.addEventListener("change", () => resolve(), { once: true });
	});
}
function createDirectiveOrchestrator(waiters = {
	waitVisible,
	waitMedia,
	waitIdle,
	waitDelay,
	waitInteraction
}) {
	async function runBuiltIns(ctx) {
		const { tagName, element: el, directives, log, watchCancellable } = ctx;
		const visibleAttr = directives.visible.attribute;
		if (el.getAttribute(visibleAttr) !== null) {
			log.note(`waiting for ${visibleAttr}`);
			await waiters.waitVisible(el, el.getAttribute(visibleAttr) || directives.visible.rootMargin, directives.visible.threshold, watchCancellable);
		}
		const query = el.getAttribute(directives.media.attribute);
		if (query === "") console.warn(`[islands] <${tagName}> ${directives.media.attribute} has no value — media check skipped, island will load immediately`);
		else if (query) {
			log.note(`waiting for ${directives.media.attribute}="${query}"`);
			await waiters.waitMedia(query);
		}
		const idleAttr = el.getAttribute(directives.idle.attribute);
		if (idleAttr !== null) {
			const raw = parseInt(idleAttr, 10);
			const elTimeout = Number.isNaN(raw) ? directives.idle.timeout : raw;
			log.note(`waiting for ${directives.idle.attribute} (${elTimeout}ms)`);
			await waiters.waitIdle(elTimeout);
		}
		const deferAttr = el.getAttribute(directives.defer.attribute);
		if (deferAttr !== null) {
			const msParsed = parseInt(deferAttr, 10);
			if (deferAttr !== "" && Number.isNaN(msParsed)) console.warn(`[islands] <${tagName}> invalid ${directives.defer.attribute} value "${deferAttr}" — using default ${directives.defer.delay}ms`);
			const ms = Number.isNaN(msParsed) ? directives.defer.delay : msParsed;
			log.note(`waiting for ${directives.defer.attribute} (${ms}ms)`);
			await waiters.waitDelay(ms);
		}
		const interactionAttr = el.getAttribute(directives.interaction.attribute);
		if (interactionAttr !== null) {
			let events = [...directives.interaction.events];
			if (interactionAttr) {
				const tokens = interactionAttr.split(/\s+/).filter(Boolean);
				if (tokens.length === 0) console.warn(`[islands] <${tagName}> ${directives.interaction.attribute} has no valid event tokens — using default events`);
				else {
					const { valid, invalid } = partitionInteractionEventTokens(tokens);
					if (invalid.length > 0) if (valid.length > 0) console.warn(`[islands] <${tagName}> ${directives.interaction.attribute} contains unsupported event token${invalid.length === 1 ? "" : "s"} (${invalid.join(", ")}) — ignoring invalid token${invalid.length === 1 ? "" : "s"}; supported tokens: ${INTERACTION_EVENT_NAMES_LABEL}`);
					else console.warn(`[islands] <${tagName}> ${directives.interaction.attribute} contains no supported event tokens (${invalid.join(", ")}) — using default events; supported tokens: ${INTERACTION_EVENT_NAMES_LABEL}`);
					if (valid.length > 0) events = valid;
				}
			}
			log.note(`waiting for ${directives.interaction.attribute} (${events.join(", ")})`);
			await waiters.waitInteraction(el, events, watchCancellable);
		}
	}
	function runCustomDirectives(ctx) {
		const matched = [];
		if (ctx.customDirectives) for (const [attrName, directiveFn] of ctx.customDirectives) {
			const value = ctx.element.getAttribute(attrName);
			if (value !== null) matched.push([
				attrName,
				directiveFn,
				value
			]);
		}
		if (matched.length === 0) return false;
		const attrNames = matched.map(([attrName]) => attrName).join(", ");
		ctx.log.flush(`dispatching to custom directive${matched.length === 1 ? "" : "s"} ${attrNames}`);
		let remaining = matched.length;
		let fired = false;
		let aborted = false;
		let timer;
		const loadOnce = () => {
			if (fired || aborted) return Promise.resolve();
			if (--remaining === 0) {
				clearTimeout(timer);
				fired = true;
				return ctx.run();
			}
			return Promise.resolve();
		};
		if (ctx.directiveTimeout > 0) timer = setTimeout(() => {
			if (fired || aborted) return;
			aborted = true;
			ctx.onError(attrNames, /* @__PURE__ */ new Error(`[islands] Custom directive timed out after ${ctx.directiveTimeout}ms for <${ctx.tagName}>`));
		}, ctx.directiveTimeout);
		for (const [attrName, directiveFn, value] of matched) try {
			Promise.resolve(directiveFn(loadOnce, {
				name: attrName,
				value
			}, ctx.element)).catch((err) => {
				clearTimeout(timer);
				aborted = true;
				ctx.onError(attrName, err);
			});
		} catch (err) {
			clearTimeout(timer);
			aborted = true;
			ctx.onError(attrName, err);
		}
		return true;
	}
	return { async run(ctx) {
		await runBuiltIns(ctx);
		return runCustomDirectives(ctx);
	} };
}
function createIslandLifecycleCoordinator(opts) {
	const queued = /* @__PURE__ */ new Set();
	const loaded = /* @__PURE__ */ new Set();
	const retryCount = /* @__PURE__ */ new Map();
	const cancellableElements = /* @__PURE__ */ new Map();
	let initialWalkComplete = false;
	let walkImpl;
	const queue = (tag) => {
		if (queued.has(tag) || loaded.has(tag)) return false;
		queued.add(tag);
		return true;
	};
	const settleSuccess = (tag) => {
		const attempt = (retryCount.get(tag) ?? 0) + 1;
		queued.delete(tag);
		loaded.add(tag);
		retryCount.delete(tag);
		return attempt;
	};
	const settleFailure = (tag) => {
		const attempt = (retryCount.get(tag) ?? 0) + 1;
		if (attempt <= opts.retries) {
			retryCount.set(tag, attempt);
			return {
				retryDelayMs: opts.retryDelay * 2 ** (attempt - 1),
				attempt
			};
		}
		retryCount.delete(tag);
		queued.delete(tag);
		return {
			retryDelayMs: null,
			attempt
		};
	};
	const evict = (tag) => {
		retryCount.delete(tag);
		queued.delete(tag);
	};
	const isQueued = (tag) => queued.has(tag);
	const watchCancellable = (el, cancel) => {
		cancellableElements.set(el, cancel);
		return () => {
			cancellableElements.delete(el);
		};
	};
	const cancelDetached = () => {
		if (cancellableElements.size === 0) return;
		for (const [el, cancel] of cancellableElements) if (!el.isConnected) {
			cancellableElements.delete(el);
			cancel();
		}
	};
	const start = (input) => {
		let disconnected = false;
		let initialized = false;
		const customElementFilter = { acceptNode: (node) => {
			const tag = node.tagName;
			if (!tag.includes("-")) return NodeFilter.FILTER_SKIP;
			return isQueued(tag.toLowerCase()) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
		} };
		const activate = (el) => {
			const tagName = el.tagName.toLowerCase();
			const loader = input.islandMap.get(tagName);
			if (!loader) return;
			let ancestor = el.parentElement;
			while (ancestor) {
				if (isQueued(ancestor.tagName.toLowerCase())) return;
				ancestor = ancestor.parentElement;
			}
			if (!queue(tagName)) return;
			input.onActivate(tagName, el, loader);
		};
		const walk = (el) => {
			activate(el);
			const walker = document.createTreeWalker(el, NodeFilter.SHOW_ELEMENT, customElementFilter);
			let node;
			while (node = walker.nextNode()) activate(node);
		};
		walkImpl = walk;
		const handleAdditions = (mutations) => {
			for (const { addedNodes } of mutations) for (const node of addedNodes) if (node.nodeType === Node.ELEMENT_NODE) walk(node);
		};
		const observer = new MutationObserver((mutations) => {
			cancelDetached();
			handleAdditions(mutations);
		});
		const init = () => {
			if (disconnected || initialized) return;
			const root = input.getRoot();
			if (!root) return;
			initialized = true;
			input.onBeforeInitialWalk?.();
			walk(root);
			initialWalkComplete = true;
			input.onInitialWalkComplete?.();
			observer.observe(root, {
				childList: true,
				subtree: true
			});
		};
		if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
		else init();
		const disconnect = () => {
			disconnected = true;
			document.removeEventListener("DOMContentLoaded", init);
			observer.disconnect();
		};
		return { disconnect };
	};
	return {
		settleSuccess,
		settleFailure,
		evict,
		isQueued,
		get initialWalkComplete() {
			return initialWalkComplete;
		},
		watchCancellable,
		walk(root) {
			walkImpl?.(root);
		},
		start
	};
}
var SILENT_LOGGER = {
	note() {},
	flush() {}
};
function addListener(target, name, handler) {
	const listener = (event) => handler(event.detail);
	target.addEventListener(name, listener);
	return () => target.removeEventListener(name, listener);
}
function dispatch(target, name, detail) {
	target.dispatchEvent(new CustomEvent(name, { detail }));
}
function createRuntimeSurface(deps) {
	return {
		dispatchLoad(detail) {
			dispatch(deps.target, "islands:load", detail);
		},
		dispatchError(detail) {
			dispatch(deps.target, "islands:error", detail);
		},
		onLoad(handler) {
			return addListener(deps.target, "islands:load", handler);
		},
		onError(handler) {
			return addListener(deps.target, "islands:error", handler);
		},
		createLogger(tagName, debug) {
			if (!debug) return SILENT_LOGGER;
			const msgs = [];
			return {
				note(msg) {
					msgs.push(msg);
				},
				flush(summary) {
					if (msgs.length === 0) deps.console.log("[islands]", `<${tagName}> ${summary}`);
					else {
						deps.console.groupCollapsed(`[islands] <${tagName}> ${summary}`);
						for (const msg of msgs) deps.console.log(msg);
						deps.console.groupEnd();
					}
					msgs.length = 0;
				}
			};
		},
		beginReadyLog(islandCount, debug) {
			if (!debug) return () => {};
			deps.console.groupCollapsed(`[islands] ready — ${islandCount} island(s)`);
			return () => deps.console.groupEnd();
		}
	};
}
var runtimeSurface;
function getRuntimeSurface() {
	runtimeSurface ??= createRuntimeSurface({
		target: document,
		console
	});
	return runtimeSurface;
}
function isRevivePayload(v) {
	return typeof v === "object" && v !== null && "islands" in v && !Array.isArray(v);
}
function revive(islandsOrPayload, options, customDirectives) {
	const runtimeSurface2 = getRuntimeSurface();
	const payload = isRevivePayload(islandsOrPayload) ? islandsOrPayload : {
		islands: islandsOrPayload,
		options,
		customDirectives
	};
	const opts = normalizeReviveOptions(payload.options);
	const islandMap = buildIslandMap(payload);
	const resolvedDirectives = payload.customDirectives;
	const attrVisible = opts.directives.visible.attribute;
	const attrMedia = opts.directives.media.attribute;
	const attrIdle = opts.directives.idle.attribute;
	const attrDefer = opts.directives.defer.attribute;
	const attrInteraction = opts.directives.interaction.attribute;
	const debug = opts.debug;
	const directiveTimeout = opts.directiveTimeout;
	const lifecycle = createIslandLifecycleCoordinator({
		retries: opts.retry.retries,
		retryDelay: opts.retry.delay
	});
	const directiveOrchestrator = createDirectiveOrchestrator();
	let disconnected = false;
	async function loadIsland(tagName, el, loader) {
		if (debug && !lifecycle.initialWalkComplete) {
			const parts = [];
			const pushAttr = (attr, val) => {
				if (val !== null) parts.push(val ? `${attr}="${val}"` : attr);
			};
			pushAttr(attrVisible, el.getAttribute(attrVisible));
			const mediaVal = el.getAttribute(attrMedia);
			if (mediaVal) parts.push(`${attrMedia}="${mediaVal}"`);
			pushAttr(attrIdle, el.getAttribute(attrIdle));
			pushAttr(attrDefer, el.getAttribute(attrDefer));
			pushAttr(attrInteraction, el.getAttribute(attrInteraction));
			if (resolvedDirectives?.size) {
				for (const a of resolvedDirectives.keys()) if (el.hasAttribute(a)) parts.push(a);
			}
			if (parts.length > 0) console.log("[islands]", `<${tagName}> waiting · ${parts.join(", ")}`);
		}
		const log = runtimeSurface2.createLogger(tagName, debug);
		const run = () => {
			if (disconnected) return Promise.resolve();
			const t0 = performance.now();
			return loader().then(() => {
				const attempt = lifecycle.settleSuccess(tagName);
				runtimeSurface2.dispatchLoad({
					tag: tagName,
					duration: performance.now() - t0,
					attempt
				});
				if (!disconnected && el.children.length) lifecycle.walk(el);
			}).catch((err) => {
				console.error(`[islands] Failed to load <${tagName}>:`, err);
				const { retryDelayMs, attempt } = lifecycle.settleFailure(tagName);
				runtimeSurface2.dispatchError({
					tag: tagName,
					error: err,
					attempt
				});
				if (retryDelayMs !== null) setTimeout(run, retryDelayMs);
			});
		};
		const handleDirectiveError = (attrName, err) => {
			if (attrName === null && err instanceof DirectiveCancelledError) return;
			if (attrName !== null) console.error(`[islands] Custom directive ${attrName} failed for <${tagName}>:`, err);
			else console.error(`[islands] Built-in directive failed for <${tagName}>:`, err);
			runtimeSurface2.dispatchError({
				tag: tagName,
				error: err,
				attempt: 1
			});
			lifecycle.evict(tagName);
		};
		try {
			if (await directiveOrchestrator.run({
				tagName,
				element: el,
				directives: opts.directives,
				customDirectives: resolvedDirectives,
				directiveTimeout,
				watchCancellable: lifecycle.watchCancellable,
				log,
				run,
				onError: handleDirectiveError
			})) return;
		} catch (err) {
			handleDirectiveError(null, err);
			log.flush(err instanceof DirectiveCancelledError ? "aborted (element removed)" : "aborted (directive error)");
			return;
		}
		log.flush("triggered");
		run();
	}
	let endReadyLog;
	const disconnectLifecycle = lifecycle.start({
		getRoot: () => document.body,
		islandMap,
		onActivate: loadIsland,
		onBeforeInitialWalk: () => {
			endReadyLog = runtimeSurface2.beginReadyLog(islandMap.size, debug);
		},
		onInitialWalkComplete: () => {
			endReadyLog?.();
			endReadyLog = void 0;
		}
	});
	return { disconnect() {
		disconnected = true;
		endReadyLog?.();
		endReadyLog = void 0;
		disconnectLifecycle.disconnect();
	} };
}
//#endregion
//#region \0vite/preload-helper.js
var scriptRel = "modulepreload";
var assetsURL = function(dep, importerUrl) {
	return new URL(dep, importerUrl).href;
};
var seen = {};
var __vitePreload = function preload(baseModule, deps, importerUrl) {
	let promise = Promise.resolve();
	if (deps && deps.length > 0) {
		const links = document.getElementsByTagName("link");
		const cspNonceMeta = document.querySelector("meta[property=csp-nonce]");
		const cspNonce = cspNonceMeta?.nonce || cspNonceMeta?.getAttribute("nonce");
		function allSettled(promises) {
			return Promise.all(promises.map((p) => Promise.resolve(p).then((value) => ({
				status: "fulfilled",
				value
			}), (reason) => ({
				status: "rejected",
				reason
			}))));
		}
		promise = allSettled(deps.map((dep) => {
			dep = assetsURL(dep, importerUrl);
			if (dep in seen) return;
			seen[dep] = true;
			const isCss = dep.endsWith(".css");
			const cssSelector = isCss ? "[rel=\"stylesheet\"]" : "";
			if (!!importerUrl) for (let i = links.length - 1; i >= 0; i--) {
				const link = links[i];
				if (link.href === dep && (!isCss || link.rel === "stylesheet")) return;
			}
			else if (document.querySelector(`link[href="${dep}"]${cssSelector}`)) return;
			const link = document.createElement("link");
			link.rel = isCss ? "stylesheet" : scriptRel;
			if (!isCss) link.as = "script";
			link.crossOrigin = "";
			link.href = dep;
			if (cspNonce) link.setAttribute("nonce", cspNonce);
			document.head.appendChild(link);
			if (isCss) return new Promise((res, rej) => {
				link.addEventListener("load", res);
				link.addEventListener("error", () => rej(/* @__PURE__ */ new Error(`Unable to preload CSS for ${dep}`)));
			});
		}));
	}
	function handlePreloadError(err) {
		const e = new Event("vite:preloadError", { cancelable: true });
		e.payload = err;
		window.dispatchEvent(e);
		if (!e.defaultPrevented) throw err;
	}
	return promise.then((res) => {
		for (const item of res || []) {
			if (item.status !== "rejected") continue;
			handlePreloadError(item.reason);
		}
		return baseModule().catch(handlePreloadError);
	});
};
var { disconnect } = revive({
	islands: Object.assign({}, { .../* @__PURE__ */ Object.assign({
		"/theme/frontend/islands/cart-drawer-items.js": () => __vitePreload(() => import("@theme/cart-drawer-items"), [], import.meta.url),
		"/theme/frontend/islands/cart-drawer.js": () => __vitePreload(() => import("@theme/cart-drawer"), [], import.meta.url),
		"/theme/frontend/islands/cart-items.js": () => __vitePreload(() => import("@theme/cart-items"), [], import.meta.url),
		"/theme/frontend/islands/cart-note.js": () => __vitePreload(() => import("@theme/cart-note"), [], import.meta.url),
		"/theme/frontend/islands/cart-remove-button.js": () => __vitePreload(() => import("@theme/cart-remove-button"), [], import.meta.url),
		"/theme/frontend/islands/details-disclosure.js": () => __vitePreload(() => import("@theme/details-disclosure"), [], import.meta.url),
		"/theme/frontend/islands/details-modal.js": () => __vitePreload(() => import("@theme/details-modal"), [], import.meta.url),
		"/theme/frontend/islands/header-drawer.js": () => __vitePreload(() => import("@theme/header-drawer"), [], import.meta.url),
		"/theme/frontend/islands/island-demo-child.js": () => __vitePreload(() => import("@theme/island-demo-child"), [], import.meta.url),
		"/theme/frontend/islands/island-demo-defer.js": () => __vitePreload(() => import("@theme/island-demo-defer"), [], import.meta.url),
		"/theme/frontend/islands/island-demo-idle.js": () => __vitePreload(() => import("@theme/island-demo-idle"), [], import.meta.url),
		"/theme/frontend/islands/island-demo-interaction.js": () => __vitePreload(() => import("@theme/island-demo-interaction"), [], import.meta.url),
		"/theme/frontend/islands/island-demo-media-mobile.js": () => __vitePreload(() => import("@theme/island-demo-media-mobile"), [], import.meta.url),
		"/theme/frontend/islands/island-demo-media.js": () => __vitePreload(() => import("@theme/island-demo-media"), [], import.meta.url),
		"/theme/frontend/islands/island-demo-parent.js": () => __vitePreload(() => import("@theme/island-demo-parent"), [], import.meta.url),
		"/theme/frontend/islands/island-demo-visible.js": () => __vitePreload(() => import("@theme/island-demo-visible"), [], import.meta.url),
		"/theme/frontend/islands/localization-form.js": () => __vitePreload(() => import("@theme/localization-form"), [], import.meta.url),
		"/theme/frontend/islands/password-modal.js": () => __vitePreload(() => import("@theme/password-modal"), [], import.meta.url),
		"/theme/frontend/islands/product-form.js": () => __vitePreload(() => import("@theme/product-form"), [], import.meta.url),
		"/theme/frontend/islands/product-recommendations.js": () => __vitePreload(() => import("@theme/product-recommendations"), [], import.meta.url),
		"/theme/frontend/islands/quantity-input.js": () => __vitePreload(() => import("@theme/quantity-input"), [], import.meta.url),
		"/theme/frontend/islands/sticky-header.js": () => __vitePreload(() => import("@theme/sticky-header"), [], import.meta.url),
		"/theme/frontend/islands/variant-radios.js": () => __vitePreload(() => import("@theme/variant-radios"), [], import.meta.url),
		"/theme/frontend/islands/variant-selects.js": () => __vitePreload(() => import("@theme/variant-selects"), [], import.meta.url)
	}) }),
	options: {
		"directives": {
			"visible": {
				"attribute": "client:visible",
				"rootMargin": "200px",
				"threshold": 0
			},
			"idle": {
				"attribute": "client:idle",
				"timeout": 500
			},
			"media": { "attribute": "client:media" },
			"defer": {
				"attribute": "client:defer",
				"delay": 3e3
			},
			"interaction": {
				"attribute": "client:interaction",
				"events": [
					"mouseenter",
					"touchstart",
					"focusin"
				]
			}
		},
		"debug": false
	}
});
//#endregion
//#region theme/frontend/entrypoints/theme.js
initDisclosureWidgets(document.querySelectorAll("[id^=\"Details-\"] summary"));
//#endregion
