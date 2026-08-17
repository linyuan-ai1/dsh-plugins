// dsh-usage-panel — Browser half.
//
// Floating usage dashboard for DeepSeek Harness. It shows the Go / DeepSeek /
// New API usage dashboard in a collapsible panel.
//
// The dashboard itself (HTML/JS) is served by the Electron desktop shell at a
// URL the shell exposes through the preload bridge `window.dshElectron.dashboardUrl()`.
// This plugin detects that bridge:
//   - When present (desktop shell): renders a floating panel with the iframe.
//   - When absent (plain web): shows a "desktop only" hint.
//
// The panel is injected via the additive `shell.overlay` slot (floats above the
// app, click-through until a surface opts in). A small floating toggle button
// is rendered as part of the overlay.

window.__ModuleLoader__.load({
	id: "dsh-usage-panel",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_jsx_runtime = require("react/jsx-runtime");
		let _react = require("react");

		// ---------- persistence ----------
		const PREFS_KEY = "dsh-usage-panel:open";
		let open = localStorage.getItem(PREFS_KEY) === "1";
		function setOpen(v) { open = v; try { localStorage.setItem(PREFS_KEY, v ? "1" : "0"); } catch (e) { /* */ } }

		// ---------- locales ----------
		const NS = "usage";
		const zh = {
			"usage.title": "用量面板",
			"usage.open": "打开用量面板",
			"usage.close": "收起",
			"usage.unavailable": "用量面板仅在桌面版可用",
			"usage.hint": "此功能需要 DeepSeek Harness 桌面版（Electron），浏览器里不可用。",
			"usage.connecting": "连接中…",
		};
		const en = {
			"usage.title": "Usage Panel",
			"usage.open": "Open usage panel",
			"usage.close": "Collapse",
			"usage.unavailable": "Usage panel is available in the desktop app only",
			"usage.hint": "This needs the DeepSeek Harness desktop shell (Electron); not available in a plain browser.",
			"usage.connecting": "Connecting…",
		};

		// ---------- overlay component ----------
		// A fixed floating toggle (top-right) plus a panel that shows the
		// dashboard iframe. Rendered inside the `shell.overlay` additive slot.
		function UsageOverlay(props) {
			const _react2 = _react;
			const useState = _react2.useState;
			const useEffect = _react2.useEffect;
			const t = props.t;
			const [expanded, setExpanded] = useState(open);
			const [url, setUrl] = useState(undefined); // undefined=connecting, null=unavailable, string=url
			const [visible, setVisible] = useState(false);

			const loadUrl = async () => {
				setUrl(undefined);
				try {
					const bridge = typeof window !== "undefined" && window.dshElectron;
					if (bridge && typeof bridge.dashboardUrl === "function") {
						const next = await bridge.dashboardUrl();
						setUrl(next ?? null);
					} else {
						setUrl(null);
					}
				} catch (e) { setUrl(null); }
			};
			useEffect(() => { void loadUrl(); }, []);

			const toggle = () => {
				const next = !expanded;
				setExpanded(next);
				setOpen(next);
				setVisible(true);
			};

			const toggleBtn = _react2.createElement("button", {
				type: "button",
				onClick: toggle,
				title: t("usage.open"),
				style: {
					position: "fixed", right: "18px", top: "18px", zIndex: 9999,
					width: "36px", height: "36px", borderRadius: "10px", cursor: "pointer",
					border: "1px solid var(--dsw-alias-border-l2)",
					background: "var(--dsw-alias-bg-layer-1)",
					color: "var(--dsw-alias-label-primary)",
					display: "flex", alignItems: "center", justifyContent: "center",
					boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
				},
			}, _react2.createElement("svg", { viewBox: "0 0 16 16", width: "16", height: "16", "aria-hidden": true },
				_react2.createElement("path", { d: "M3 12V8M8 12V4M13 12V6", stroke: "currentColor", strokeWidth: "1.6", strokeLinecap: "round" })));

			// Panel content: connecting / unavailable / iframe.
			let body;
			if (url === undefined) {
				body = _react2.createElement("div", { style: { padding: "16px", fontSize: "13px", color: "var(--dsw-alias-label-secondary)" } }, t("usage.connecting"));
			} else if (url === null) {
				body = _react2.createElement("div", { style: { padding: "16px", display: "flex", flexDirection: "column", gap: "8px" } },
					_react2.createElement("span", { style: { fontSize: "14px", fontWeight: "500", color: "var(--dsw-alias-label-primary)" } }, t("usage.unavailable")),
					_react2.createElement("span", { style: { fontSize: "12px", color: "var(--dsw-alias-label-secondary)" } }, t("usage.hint")));
			} else {
				body = _react2.createElement("iframe", { src: url, title: t("usage.title"), style: { width: "100%", height: "100%", border: "none" } });
			}

			const panel = expanded ? _react2.createElement("div", {
				style: {
					position: "fixed", right: "18px", top: "62px", zIndex: 9998,
					width: "400px", height: "520px", borderRadius: "12px", overflow: "hidden",
					border: "1px solid var(--dsw-alias-border-l2)",
					background: "var(--dsw-alias-bg-base)",
					boxShadow: "0 12px 40px rgba(0,0,0,0.18)",
					display: "flex", flexDirection: "column",
				},
			},
				_react2.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", borderBottom: "1px solid var(--dsw-alias-border-l1)" } },
					_react2.createElement("span", { style: { fontSize: "13px", fontWeight: "600", color: "var(--dsw-alias-label-primary)" } }, t("usage.title")),
					_react2.createElement("button", { type: "button", onClick: toggle, style: { background: "transparent", border: "none", color: "var(--dsw-alias-label-secondary)", cursor: "pointer", fontSize: "13px" } }, "✕")),
				_react2.createElement("div", { style: { flex: 1, minHeight: 0 } }, body)) : null;

			return _react2.createElement("div", { style: { pointerEvents: "none" } },
				_react2.createElement("div", { style: { pointerEvents: "auto" } }, toggleBtn),
				panel);
		}

		// ---------- plugin entry ----------
		const inject = ["slots", "locale"];

		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, { zh, en }), "dsh-usage-panel: dictionaries");
			ctx.slots.inject("shell.overlay", () => ctx.slots.register({
				name: "shell.overlay",
				id: "usage-panel",
				order: 10,
				locale: NS,
				inject: () => ({}),
			}, UsageOverlay));
		}

		exports.apply = apply;
		exports.inject = inject;
		exports.name = "dsh-usage-panel";
		return module.exports;
	}
});
