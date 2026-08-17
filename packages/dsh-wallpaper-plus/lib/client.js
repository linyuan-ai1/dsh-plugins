// dsh-wallpaper-plus — Browser half (client plugin bundle).
//
// Fullscreen image/video wallpaper for DeepSeek Harness:
//   - A `settings.general.item` row to import an image or short video, remove
//     it, and toggle video audio.
//   - A fixed wallpaper layer appended to document.body (z-index:-1) behind
//     the translucent app columns.
//   - Importing a video flips the app to dark (bright clip reads best under
//     the dim).
//   - Persistence via localStorage (same-origin, survives reloads).
//
// Loaded by dsh-client-modules at /plugins/dsh-wallpaper-plus/client.js
// through window.__ModuleLoader__.load.

window.__ModuleLoader__.load({
	id: "dsh-wallpaper-plus",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_jsx_runtime = require("react/jsx-runtime");
		let _react = require("react");

		// ---------- persistence ----------
		const STORAGE_KEY = "dsh-wallpaper-plus:wallpaper";
		const defaultWallpaper = () => null;
		function loadWallpaper() {
			try {
				const raw = localStorage.getItem(STORAGE_KEY);
				if (!raw) return null;
				const o = JSON.parse(raw);
				if (o && o.type && typeof o.dataUrl === "string") return o;
				return null;
			} catch (e) { return null; }
		}
		function saveWallpaper(w) {
			try {
				if (w === null) localStorage.removeItem(STORAGE_KEY);
				else localStorage.setItem(STORAGE_KEY, JSON.stringify(w));
			} catch (e) { /* best effort */ }
		}

		// ---------- helpers ----------
		function readAsDataUrl(file) {
			return new Promise((resolve, reject) => {
				const reader = new FileReader();
				reader.onload = () => resolve(String(reader.result || ""));
				reader.onerror = () => reject(reader.error || new Error("read failed"));
				reader.readAsDataURL(file);
			});
		}
		// A 100MB cap so 2K / 5-10s wallpaper clips import directly (local app).
		const MAX_VIDEO_BYTES = 100 * 1024 * 1024;
		const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

		// The live wallpaper state (mirrored out to the row + the layer).
		let state = { value: loadWallpaper(), listeners: new Set() };
		function getState() { return state.value; }
		function setState(next) {
			state.value = next;
			saveWallpaper(next);
			for (const fn of state.listeners) fn(next);
		}
		// Current listeners keyed by a token; the row component holds one.
		function subscribe(fn) {
			state.listeners.add(fn);
			return () => state.listeners.delete(fn);
		}

		// ---------- wallpaper layer ----------
		let layerEl = null;
		let mediaEl = null;
		function renderLayer(w) {
			if (layerEl === null) {
				layerEl = document.createElement("div");
				layerEl.style.cssText = "position:fixed;inset:0;z-index:-1;pointer-events:none;overflow:hidden;";
				document.body.prepend(layerEl);
			}
			if (mediaEl !== null) { mediaEl.remove(); mediaEl = null; }
			if (w === null) {
				layerEl.style.display = "none";
				document.body.classList.remove("dsh-wallpaper-active");
				return;
			}
			layerEl.style.display = "block";
			document.body.classList.add("dsh-wallpaper-active");
			if (w.type === "video") {
				mediaEl = document.createElement("video");
				mediaEl.src = w.dataUrl;
				// Play the clip's original audio only when enabled.
				mediaEl.muted = w.sound !== true;
				mediaEl.autoplay = true;
				mediaEl.loop = true;
				mediaEl.playsInline = true;
				mediaEl.style.cssText = "position:absolute;inset:0;width:100%;height:100%;object-fit:cover;";
				layerEl.appendChild(mediaEl);
			} else {
				mediaEl = document.createElement("div");
				mediaEl.style.cssText = "position:absolute;inset:0;width:100%;height:100%;background-size:cover;background-position:center;background-image:url(\"" + w.dataUrl + "\");";
				layerEl.appendChild(mediaEl);
			}
		}

		// Flip the app to dark when importing a video (bright clip under dim).
		function forceDarkTheme(ctx) {
			try {
				const theme = ctx.get && ctx.get('theme');
				if (theme && typeof theme.setTheme === 'function') theme.setTheme('dark');
			} catch (e) { /* theme service may be absent */ }
		}

		// ---------- locales ----------
		const SETTINGS_NS = "settings.wallpaper";
		const zh = {
			"wallpaper.title": "壁纸",
			"wallpaper.intro": "导入图片或短视频作为全屏背景，自动压暗以保证可读性；导入视频自动切换深色模式。",
			"wallpaper.pick": "导入壁纸",
			"wallpaper.remove": "移除壁纸",
			"wallpaper.sound": "播放视频原声",
			"wallpaper.videoTooLarge": "视频超过 {size}，请选择更短的视频",
			"wallpaper.imageTooLarge": "图片超过 {size}，请选择更小的图片",
			"wallpaper.readFailed": "文件读取失败，请重试",
		};
		const en = {
			"wallpaper.title": "Wallpaper",
			"wallpaper.intro": "Import an image or short video as the fullscreen background; video import switches to dark mode automatically.",
			"wallpaper.pick": "Choose wallpaper",
			"wallpaper.remove": "Remove wallpaper",
			"wallpaper.sound": "Play video audio",
			"wallpaper.videoTooLarge": "Video exceeds {size}; choose a shorter one",
			"wallpaper.imageTooLarge": "Image exceeds {size}; choose a smaller one",
			"wallpaper.readFailed": "Could not read the file; try again",
		};

		// ---------- settings row component ----------
		function WallpaperRow(props) {
			const _react2 = _react;
			const useState = _react2.useState;
			const useEffect = _react2.useEffect;
			const useRef = _react2.useRef;
			const [value, setValue] = useState(getState());
			const [error, setError] = useState(undefined);
			const [busy, setBusy] = useState(false);
			const inputRef = useRef(null);
			const t = props.t;

			useEffect(() => subscribe((next) => setValue(next)), []);

			const applyFile = async (file) => {
				if (!file) return;
				setError(undefined);
				const type = file.type.startsWith("video/") ? "video" : "image";
				const cap = type === "video" ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
				if (file.size > cap) {
					setError(type === "video"
						? t("wallpaper.videoTooLarge", { size: "100MB" })
						: t("wallpaper.imageTooLarge", { size: "8MB" }));
					return;
				}
				setBusy(true);
				try {
					const dataUrl = await readAsDataUrl(file);
					setState({ type, dataUrl, name: file.name, sound: type === "video" });
					if (type === "video") forceDarkTheme(props);
				} catch (e) {
					setError(t("wallpaper.readFailed"));
				} finally {
					setBusy(false);
				}
			};

			// Guard file input.
			const input = _react2.createElement("input", {
				ref: inputRef,
				type: "file",
				accept: "image/*,video/*",
				style: { display: "none" },
				onChange: (ev) => {
					const f = ev.target.files ? ev.target.files[0] : undefined;
					ev.target.value = "";
					applyFile(f);
				},
			});

			const pickBtn = _react2.createElement("button", {
				type: "button",
				disabled: busy,
				onClick: () => { if (inputRef.current) inputRef.current.click(); },
				style: { padding: "4px 10px", borderRadius: "6px", border: "1px solid var(--dsw-alias-border-l2)", background: "var(--dsw-alias-interactive-bg-hover)", color: "var(--dsw-alias-label-primary)", cursor: "pointer", fontSize: "12px", lineHeight: "18px" },
			}, busy ? (t("wallpaper.pick") + "…") : t("wallpaper.pick"));

			// Preview + controls when a wallpaper is set.
			let preview = null;
			if (value) {
				const media = value.type === "video"
					? _react2.createElement("video", { src: value.dataUrl, muted: !value.sound, autoPlay: true, loop: true, playsInline: true,
						style: { maxWidth: "100%", maxHeight: "140px", borderRadius: "8px", display: "block" } })
					: _react2.createElement("img", { src: value.dataUrl, alt: value.name, style: { maxWidth: "100%", maxHeight: "140px", borderRadius: "8px", display: "block" } });
				const removeBtn = _react2.createElement("button", {
					type: "button", onClick: () => setState(null),
					style: { fontSize: "12px", color: "var(--dsw-alias-label-secondary)", background: "transparent", border: "1px solid var(--dsw-alias-border-l2)", borderRadius: "6px", padding: "3px 8px", cursor: "pointer" },
				}, t("wallpaper.remove"));
				let sound = null;
				if (value.type === "video") {
					sound = _react2.createElement("label", { style: { display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--dsw-alias-label-secondary)", cursor: "pointer" } },
						_react2.createElement("input", { type: "checkbox", checked: value.sound === true,
							onChange: (ev) => setState({ ...value, sound: ev.target.checked }) }),
						t("wallpaper.sound"));
				}
				preview = _react2.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "8px", marginTop: "8px" } },
					media,
					_react2.createElement("div", { style: { display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" } }, removeBtn, sound));
			}

			const titleEl = _react2.createElement("span", { style: { fontSize: "15px", fontWeight: "500", color: "var(--dsw-alias-label-primary)" } }, t("wallpaper.title"));
			const introEl = _react2.createElement("span", { style: { fontSize: "12px", color: "var(--dsw-alias-label-secondary)", marginTop: "2px" } }, t("wallpaper.intro"));
			const errEl = error ? _react2.createElement("span", { style: { fontSize: "12px", color: "var(--dsw-alias-destructive-tertiary, #ef4444)" } }, error) : null;

			return _react2.createElement("div", { style: { padding: "8px 0" } },
				_react2.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" } },
					_react2.createElement("div", { style: { display: "flex", flexDirection: "column" } }, titleEl, introEl),
					input, pickBtn),
				preview,
				errEl);
		}

		// ---------- plugin entry ----------
		const inject = ["slots", "locale", "theme"];

		function apply(ctx) {
			// Register locale dictionaries.
			ctx.effect(() => ctx.locale.register(SETTINGS_NS, { zh, en }), "dsh-wallpaper-plus: dictionaries");

			// Render the current wallpaper layer on load + on change.
			renderLayer(getState());
			ctx.effect(() => subscribe((next) => renderLayer(next)), "dsh-wallpaper-plus: wallpaper layer");

			// Inject the settings row into the General settings section.
			ctx.slots.inject("settings.general.item", () => ctx.slots.register({
				name: "settings.general.item",
				id: "wallpaper-plus",
				order: 22,
				locale: SETTINGS_NS,
				inject: () => ({ /* business face reserved */ }),
			}, WallpaperRow));
		}

		exports.apply = apply;
		exports.inject = inject;
		exports.name = "dsh-wallpaper-plus";
		return module.exports;
	}
});
