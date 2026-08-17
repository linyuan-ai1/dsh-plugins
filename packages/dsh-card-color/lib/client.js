// dsh-card-color — Browser half.
//
// Assistant reply-card color for DeepSeek Harness. The app's reply text is
// wrapped in per-paragraph cards whose fill/border come from CSS vars:
//   --dsh-card-bg-light / --dsh-card-border-light
//   --dsh-card-bg-dark  / --dsh-card-border-dark
// This plugin owns those vars: a `settings.general.item` row to pick a
// soft-pastel preset, with "auto-follow theme" (light uses the light pair,
// dark uses the dark pair). Persistence via localStorage.
//
// NOTE: the reply cards themselves are rendered by the DSH core
// (AssistantMarkdown). This plugin only colors them. If the core does not yet
// consume these vars, the rows still persist your choice for a future core
// that does — and the vars are set here regardless.

window.__ModuleLoader__.load({
	id: "dsh-card-color",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_jsx_runtime = require("react/jsx-runtime");
		let _react = require("react");

		// ---------- presets ----------
		const PRESETS = {
			cream:  { light: { bg: "#faf7f0", border: "#e9e2d2" }, dark: { bg: "#27282c", border: "#3b3d44" } },
			blue:   { light: { bg: "#f0f5fb", border: "#d7e3f2" }, dark: { bg: "#202936", border: "#37465a" } },
			green:  { light: { bg: "#f1f7f1", border: "#d6e8d8" }, dark: { bg: "#1f2a22", border: "#35503a" } },
			purple: { light: { bg: "#f7f3fb", border: "#e2d7ef" }, dark: { bg: "#2a2535", border: "#443a57" } },
			slate:  { light: { bg: "#f1f2f4", border: "#d7dade" }, dark: { bg: "#232529", border: "#383b41" } },
		};
		const PRESET_IDS = ["cream", "blue", "green", "purple", "slate"];

		// ---------- persistence ----------
		const STORAGE_KEY = "dsh-card-color:setting";
		const defaultSetting = () => ({ auto: true, preset: "cream" });
		function loadSetting() {
			try {
				const o = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
				return {
					auto: typeof o.auto === "boolean" ? o.auto : true,
					preset: PRESET_IDS.includes(o.preset) ? o.preset : "cream",
				};
			} catch (e) { return defaultSetting(); }
		}
		let setting = loadSetting();
		const listeners = new Set();
		function setSetting(next) {
			setting = next;
			try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch (e) { /* best effort */ }
			applyVars();
			for (const fn of listeners) fn(next);
		}
		function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }

		// ---------- apply CSS vars to the conversation root ----------
		// The vars inherit down to the reply cards. We set them on <body> so any
		// reply anywhere in the app picks them up (subject to core support).
		function applyVars() {
			const p = PRESETS[setting.preset] || PRESETS.cream;
			const lightBg = setting.auto ? p.light.bg : p.light.bg;
			const darkBg = setting.auto ? p.dark.bg : p.light.bg;
			const lightBorder = setting.auto ? p.light.border : p.light.border;
			const darkBorder = setting.auto ? p.dark.border : p.light.border;
			const root = document.documentElement;
			root.style.setProperty("--dsh-card-bg-light", lightBg);
			root.style.setProperty("--dsh-card-border-light", lightBorder);
			root.style.setProperty("--dsh-card-bg-dark", darkBg);
			root.style.setProperty("--dsh-card-border-dark", darkBorder);
		}

		// ---------- locales ----------
		const SETTINGS_NS = "settings.cardColor";
		const zh = {
			"cardColor.title": "回复卡片颜色",
			"cardColor.intro": "AI 回复按段落显示为卡片，可切换卡片颜色（自动随深浅主题）。",
			"cardColor.auto": "自动随主题切换（浅色/深色用不同卡片色）",
			"cardColor.cream": "米白",
			"cardColor.blue": "浅蓝",
			"cardColor.green": "浅绿",
			"cardColor.purple": "浅紫",
			"cardColor.slate": "浅灰",
		};
		const en = {
			"cardColor.title": "Reply Card Color",
			"cardColor.intro": "Assistant replies are wrapped in cards; pick a color preset (auto-switches with theme).",
			"cardColor.auto": "Auto-follow the theme (light/dark use different card colors)",
			"cardColor.cream": "Cream",
			"cardColor.blue": "Blue",
			"cardColor.green": "Green",
			"cardColor.purple": "Purple",
			"cardColor.slate": "Slate",
		};

		// ---------- settings row ----------
		function CardColorRow(props) {
			const useState = _react.useState;
			const useEffect = _react.useEffect;
			const [value, setValue] = useState(setting);
			const t = props.t;
			useEffect(() => subscribe((next) => setValue(next)), []);

			const swatches = PRESET_IDS.map((id) => {
				const p = PRESETS[id];
				return _react.createElement("button", {
					key: id,
					type: "button",
					title: t("cardColor." + id),
					onClick: () => setSetting({ ...value, preset: id }),
					style: {
						display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 8px 4px 5px",
						border: value.preset === id ? "1px solid var(--dsw-alias-state-business-primary)" : "1px solid var(--dsw-alias-border-l2)",
						borderRadius: "8px", background: "transparent", cursor: "pointer",
					},
				}, _react.createElement("span", {
					"aria-hidden": true,
					style: { width: "16px", height: "16px", borderRadius: "5px", background: p.light.bg, border: "1px solid " + p.light.border, display: "inline-block" },
				}), _react.createElement("span", { style: { fontSize: "12px", color: "var(--dsw-alias-label-primary)" } }, t("cardColor." + id)));
			});

			return _react.createElement("div", { style: { padding: "8px 0", display: "flex", flexDirection: "column", gap: "10px" } },
				_react.createElement("div", { style: { display: "flex", flexDirection: "column" } },
					_react.createElement("span", { style: { fontSize: "15px", fontWeight: "500", color: "var(--dsw-alias-label-primary)" } }, t("cardColor.title")),
					_react.createElement("span", { style: { fontSize: "12px", color: "var(--dsw-alias-label-secondary)", marginTop: "2px" } }, t("cardColor.intro")),
				),
				_react.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: "8px" } }, swatches),
				_react.createElement("label", { style: { display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--dsw-alias-label-primary)", cursor: "pointer" } },
					_react.createElement("input", { type: "checkbox", checked: value.auto, onChange: (ev) => setSetting({ ...value, auto: ev.target.checked }) }),
					t("cardColor.auto")),
			);
		}

		// ---------- plugin entry ----------
		const inject = ["slots", "locale"];

		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(SETTINGS_NS, { zh, en }), "dsh-card-color: dictionaries");
			applyVars();
			ctx.effect(() => subscribe(() => applyVars()), "dsh-card-color: vars");

			ctx.slots.inject("settings.general.item", () => ctx.slots.register({
				name: "settings.general.item",
				id: "card-color",
				order: 23,
				locale: SETTINGS_NS,
				inject: () => ({}),
			}, CardColorRow));
		}

		exports.apply = apply;
		exports.inject = inject;
		exports.name = "dsh-card-color";
		return module.exports;
	}
});
