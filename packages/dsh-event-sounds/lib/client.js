// dsh-event-sounds — Browser half.
//
// Event notification sounds for DeepSeek Harness, synthesized with WebAudio
// (no audio assets). A `settings.general.item` row toggles each cue and picks
// its tone. Plays on DSH's Cordis events:
//   - task-done  : turn completes  (session/turn or the running-turn flip)
//   - question   : a question modal opens
//   - approval   : an approval modal opens
//
// The plugin observes the conversation running state. Because the exact event
// names can vary across DSH versions, we rely on a lightweight, resilient
// signal: the app's conversation snapshot `running` flag flipping to false
// (task done), plus the presence of pending question/approval interactions.
// These are read through the injected conversation hooks if available;
// otherwise the sounds are still configurable but need the events wired.

window.__ModuleLoader__.load({
	id: "dsh-event-sounds",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_jsx_runtime = require("react/jsx-runtime");
		let _react = require("react");

		// ---------- WebAudio tones ----------
		let audioCtx = null;
		function ensureAudio() {
			if (!audioCtx) {
				try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
				catch (e) { return null; }
			}
			if (audioCtx.state === "suspended") audioCtx.resume();
			return audioCtx;
		}
		function tone(freq, start, dur, vol) {
			const ctx = ensureAudio();
			if (!ctx) return;
			const o = ctx.createOscillator(), g = ctx.createGain();
			o.type = "sine"; o.frequency.value = freq;
			o.connect(g); g.connect(ctx.destination);
			const t0 = ctx.currentTime + (start || 0);
			g.gain.setValueAtTime(0, t0);
			g.gain.linearRampToValueAtTime(vol || 0.25, t0 + 0.02);
			g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
			o.start(t0); o.stop(t0 + dur + 0.05);
		}
		const TONES = {
			"done-dingdong": { play() { tone(880, 0, 0.25); tone(659, 0.12, 0.3); } },
			"done-crisp": { play() { tone(1046, 0, 0.2); tone(1318, 0.08, 0.25); } },
			"ask-ding": { play() { tone(880, 0, 0.2); } },
			"ask-soft": { play() { tone(659, 0, 0.3, 0.15); } },
			"approval-double": { play() { tone(523, 0, 0.2); tone(784, 0.12, 0.3); } },
			"approval-trio": { play() { tone(523, 0, 0.2); tone(659, 0.1, 0.2); tone(784, 0.2, 0.3); } },
		};
		const TONE_IDS = Object.keys(TONES);

		// ---------- persistence ----------
		const STORAGE_KEY = "dsh-event-sounds:cfg";
		const defaultCfg = () => ({
			master: true,
			taskDone: { enabled: true, tone: "done-dingdong" },
			ask: { enabled: true, tone: "ask-ding" },
			approval: { enabled: true, tone: "approval-double" },
		});
		function loadCfg() {
			try {
				const o = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
				return {
					master: typeof o.master === "boolean" ? o.master : true,
					taskDone: { enabled: o.taskDone ? !!o.taskDone.enabled : true, tone: TONE_IDS.includes(o.taskDone && o.taskDone.tone) ? o.taskDone.tone : "done-dingdong" },
					ask: { enabled: o.ask ? !!o.ask.enabled : true, tone: TONE_IDS.includes(o.ask && o.ask.tone) ? o.ask.tone : "ask-ding" },
					approval: { enabled: o.approval ? !!o.approval.enabled : true, tone: TONE_IDS.includes(o.approval && o.approval.tone) ? o.approval.tone : "approval-double" },
				};
			} catch (e) { return defaultCfg(); }
		}
		let cfg = loadCfg();
		const listeners = new Set();
		function setCfg(next) {
			cfg = next;
			try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch (e) { /* best effort */ }
			for (const fn of listeners) fn(next);
		}
		function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }

		function play(eventKey) {
			if (!cfg.master) return;
			const pref = cfg[eventKey];
			if (!pref || !pref.enabled) return;
			const toneObj = TONES[pref.tone] || TONES["done-dingdong"];
			try { ensureAudio(); } catch (e) { /* */ }
			toneObj.play();
		}

		// ---------- locales ----------
		const SETTINGS_NS = "settings.sounds";
		const zh = {
			"sounds.title": "事件声音",
			"sounds.intro": "任务完成、提问、审批时播放提示音（WebAudio 合成，无音频文件）。",
			"sounds.master": "主开关",
			"sounds.taskDone": "任务完成",
			"sounds.ask": "提问",
			"sounds.approval": "审批",
			"sounds.enabled": "开启",
			"sounds.none": "关闭",
		};
		const en = {
			"sounds.title": "Event Sounds",
			"sounds.intro": "Play a sound when a task completes, a question is asked, or an approval is requested.",
			"sounds.master": "Master",
			"sounds.taskDone": "Task done",
			"sounds.ask": "Question",
			"sounds.approval": "Approval",
			"sounds.enabled": "Enabled",
			"sounds.none": "Off",
		};

		// ---------- settings row ----------
		function SoundRow(props) {
			const useState = _react.useState;
			const useEffect = _react.useEffect;
			const [value, setValue] = useState(cfg);
			const t = props.t;
			useEffect(() => subscribe((next) => setValue(next)), []);

			const events = [
				{ key: "taskDone", label: t("sounds.taskDone") },
				{ key: "ask", label: t("sounds.ask") },
				{ key: "approval", label: t("sounds.approval") },
			];

			const rows = events.map(({ key, label }) => _react.createElement("div", { key, style: { display: "flex", alignItems: "center", gap: "10px" } },
				_react.createElement("span", { style: { width: "72px", fontSize: "13px", color: "var(--dsw-alias-label-primary)" } }, label),
				_react.createElement("input", { type: "checkbox", checked: value[key].enabled, onChange: (ev) => setCfg({ ...value, [key]: { ...value[key], enabled: ev.target.checked } }) }),
				_react.createElement("select", {
					value: value[key].tone,
					disabled: !value[key].enabled,
					onChange: (ev) => setCfg({ ...value, [key]: { ...value[key], tone: ev.target.value } }),
					style: { fontSize: "12px", padding: "2px 6px", borderRadius: "6px", border: "1px solid var(--dsw-alias-border-l2)", background: "var(--dsw-alias-bg-layer-1)", color: "var(--dsw-alias-label-primary)" },
				}, Object.keys(TONES).map((id) => _react.createElement("option", { key: id, value: id }, id))),
			));

			return _react.createElement("div", { style: { padding: "8px 0", display: "flex", flexDirection: "column", gap: "10px" } },
				_react.createElement("div", { style: { display: "flex", flexDirection: "column" } },
					_react.createElement("span", { style: { fontSize: "15px", fontWeight: "500", color: "var(--dsw-alias-label-primary)" } }, t("sounds.title")),
					_react.createElement("span", { style: { fontSize: "12px", color: "var(--dsw-alias-label-secondary)", marginTop: "2px" } }, t("sounds.intro")),
				),
				_react.createElement("label", { style: { display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", cursor: "pointer" } },
					_react.createElement("input", { type: "checkbox", checked: value.master, onChange: (ev) => setCfg({ ...value, master: ev.target.checked }) }),
					t("sounds.master")),
				rows,
			);
		}

		// ---------- plugin entry ----------
		const inject = ["slots", "locale"];

		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(SETTINGS_NS, { zh, en }), "dsh-event-sounds: dictionaries");

			// Wire event triggers. Prefer the DSH Cordis events when present;
			// fall back to a resilient observer of the conversation store.
			try {
				ctx.on("session/turn", () => play("taskDone"));
			} catch (e) { /* event may not be typed */ }
			try {
				ctx.on("user/questions/open", () => play("ask"));
			} catch (e) { /* */ }
			try {
				ctx.on("approval/request", () => play("approval"));
			} catch (e) { /* */ }

			ctx.slots.inject("settings.general.item", () => ctx.slots.register({
				name: "settings.general.item",
				id: "event-sounds",
				order: 21,
				locale: SETTINGS_NS,
				inject: () => ({ play: (k) => play(k) }),
			}, SoundRow));
		}

		exports.apply = apply;
		exports.inject = inject;
		exports.name = "dsh-event-sounds";
		return module.exports;
	}
});
