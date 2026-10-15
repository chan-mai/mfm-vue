// ページ内で評価, rootの文字, 画像, 装飾付き要素, 操作要素の位置とスタイルを収集
async (root) => {
	const round = (n) => Math.round(n * 100) / 100;
	const parent = root.parentElement;
	const pr = parent.getBoundingClientRect();
	const ps = getComputedStyle(parent);
	const ox =
		pr.left + parseFloat(ps.borderLeftWidth) + parseFloat(ps.paddingLeft);
	const oy = pr.top + parseFloat(ps.borderTopWidth) + parseFloat(ps.paddingTop);
	const rect = (r) => ({
		x: round(r.left - ox),
		y: round(r.top - oy),
		w: round(r.width),
		h: round(r.height),
	});
	const pick = (el, props) => {
		const s = getComputedStyle(el);
		return Object.fromEntries(props.map((p) => [p, s.getPropertyValue(p)]));
	};
	const key = (el) =>
		(el.textContent || el.value || el.placeholder || "")
			.replace(/\s+/g, " ")
			.trim()
			.slice(0, 40);
	const visible = (el) => {
		const s = getComputedStyle(el);
		return s.display !== "none" && s.visibility !== "hidden";
	};

	const TEXT_PROPS = [
		"color",
		"font-family",
		"font-size",
		"font-weight",
		"font-style",
		"text-decoration-line",
		"text-decoration-style",
		"text-decoration-color",
		"text-shadow",
		"-webkit-text-fill-color",
	];
	const BOX_PROPS = [
		"background-color",
		"background-image",
		"border-top-width",
		"border-right-width",
		"border-bottom-width",
		"border-left-width",
		"border-top-style",
		"border-right-style",
		"border-bottom-style",
		"border-left-style",
		"border-top-color",
		"border-right-color",
		"border-bottom-color",
		"border-left-color",
		"border-top-left-radius",
		"border-top-right-radius",
		"border-bottom-right-radius",
		"border-bottom-left-radius",
		"box-shadow",
		"padding-top",
		"padding-right",
		"padding-bottom",
		"padding-left",
	];
	const CONTROL_PROPS = [
		"cursor",
		"color",
		"background-color",
		"text-decoration-line",
		"outline-style",
		"outline-width",
		"outline-color",
		"outline-offset",
		"border-top-color",
		"box-shadow",
		"user-select",
		"opacity",
	];

	const chars = [];
	const segmenter = new Intl.Segmenter();
	const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
	const range = document.createRange();
	for (let node = walker.nextNode(); node; node = walker.nextNode()) {
		const el = node.parentElement;
		if (!el || el.closest("style, script") || !visible(el)) continue;
		const style = pick(el, TEXT_PROPS);
		for (const { segment, index } of segmenter.segment(node.data)) {
			if (!segment.trim()) continue;
			range.setStart(node, index);
			range.setEnd(node, index + segment.length);
			const r = range.getClientRects()[0];
			if (!r || r.width === 0) continue;
			chars.push({ ch: segment, ...rect(r), style });
		}
	}

	// アイコンフォントとSVGを描画範囲で比較
	const SCALE = 4;
	const MARGIN = 4;
	const ink = async (el, r) => {
		const w = r.width + MARGIN * 2;
		const h = r.height + MARGIN * 2;
		const canvas = document.createElement("canvas");
		canvas.width = Math.ceil(w * SCALE);
		canvas.height = Math.ceil(h * SCALE);
		const g = canvas.getContext("2d", { willReadFrequently: true });
		g.scale(SCALE, SCALE);
		if (el.tagName === "I") {
			const before = getComputedStyle(el, "::before");
			const ch = JSON.parse(before.content);
			const s = getComputedStyle(el);
			g.font = `${s.fontStyle} ${s.fontWeight} ${s.fontSize} ${s.fontFamily}`;
			const baseline = MARGIN + g.measureText(ch).fontBoundingBoxAscent;
			g.font = `${before.fontStyle} ${before.fontWeight} ${before.fontSize} ${before.fontFamily}`;
			g.fillText(ch, MARGIN, baseline);
		} else {
			const vb = el.viewBox?.baseVal;
			if (!vb || vb.width === 0) return null;
			const unit = vb.width / r.width;
			const clone = el.cloneNode(true);
			clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
			clone.setAttribute("width", String(w));
			clone.setAttribute("height", String(h));
			clone.setAttribute(
				"viewBox",
				`${vb.x - MARGIN * unit} ${vb.y - MARGIN * unit} ${vb.width + 2 * MARGIN * unit} ${vb.height + 2 * MARGIN * unit}`,
			);
			// scoped CSSは画像化で失われるため計算値を直接指定
			const sources = [el, ...el.querySelectorAll("*")];
			[clone, ...clone.querySelectorAll("*")].forEach((node, i) => {
				const cs = getComputedStyle(sources[i]);
				for (const p of ["fill", "stroke", "stroke-width", "stroke-linecap", "stroke-linejoin"]) {
					node.style.setProperty(p, cs.getPropertyValue(p).replace("currentcolor", "#000"));
				}
			});
			const img = new Image();
			img.src = `data:image/svg+xml,${encodeURIComponent(new XMLSerializer().serializeToString(clone))}`;
			await img.decode();
			g.drawImage(img, 0, 0, w, h);
		}
		const { data, width, height } = g.getImageData(0, 0, canvas.width, canvas.height);
		let [x0, y0, x1, y1, area] = [width, height, -1, -1, 0];
		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				const a = data[(y * width + x) * 4 + 3];
				if (a < 128) continue;
				area++;
				if (x < x0) x0 = x;
				if (x > x1) x1 = x;
				if (y < y0) y0 = y;
				if (y > y1) y1 = y;
			}
		}
		if (x1 < 0) return null;
		return {
			...rect({
				left: r.left - MARGIN + x0 / SCALE,
				top: r.top - MARGIN + y0 / SCALE,
				width: (x1 - x0 + 1) / SCALE,
				height: (y1 - y0 + 1) / SCALE,
			}),
			area: round(area / SCALE / SCALE),
		};
	};

	const media = [];
	for (const el of root.querySelectorAll("img, svg, i[class*='ti-']")) {
		if (el.parentElement?.closest("svg") || !visible(el)) continue;
		const r = el.getBoundingClientRect();
		if (r.width === 0) continue;
		if (el.tagName === "IMG") {
			media.push({ kind: "img", ...rect(r), src: el.currentSrc || el.src, alt: el.alt });
		} else {
			const box = await ink(el, r);
			if (box) media.push({ kind: "icon", ...box, src: null, alt: null });
		}
	}

	const boxes = [];
	for (const el of root.querySelectorAll("*")) {
		if (el.matches("img, svg, svg *, i[class*='ti-']") || !visible(el))
			continue;
		const s = getComputedStyle(el);
		const decorated =
			!/rgba\(\d+, \d+, \d+, 0\)|transparent/.test(s.backgroundColor) ||
			s.backgroundImage !== "none" ||
			["Top", "Right", "Bottom", "Left"].some(
				(side) =>
					parseFloat(s[`border${side}Width`]) > 0 &&
					s[`border${side}Style`] !== "none",
			) ||
			s.boxShadow !== "none";
		if (!decorated) continue;
		const rects = el.getClientRects();
		if (rects.length === 0) continue;
		boxes.push({
			key: key(el),
			...rect(el.getBoundingClientRect()),
			lines: rects.length,
			style: pick(el, BOX_PROPS),
		});
	}

	const controls = [];
	for (const el of root.querySelectorAll(
		"a, button, input, textarea, [tabindex]",
	)) {
		if (!visible(el)) continue;
		const id = String(controls.length);
		el.setAttribute("data-mfm-compare-control", id);
		controls.push({
			id,
			key: `${el.tagName.toLowerCase()}:${key(el)}`,
			style: pick(el, CONTROL_PROPS),
		});
	}

	const rs = root.getClientRects();
	const last = rs[rs.length - 1];
	return {
		root: last
			? {
					...rect(root.getBoundingClientRect()),
					bottom: round(last.bottom - oy),
				}
			: null,
		chars,
		media,
		boxes,
		controls,
		controlProps: CONTROL_PROPS,
	};
};
