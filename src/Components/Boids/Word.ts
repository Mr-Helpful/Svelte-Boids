import { MaxHeap } from './MaxHeap';
import type { Vec } from './Vector';

type PDF = { d: number[]; w: number; h: number };
type FromRGBA = (r: number, g: number, b: number, a: number) => number;

function RGBAtoPdf(data: ImageData, func: FromRGBA): PDF {
	const image = data.data;
	const pdf = {
		d: new Array<number>(),
		w: data.width,
		h: data.height
	};

	let i = 0;
	while (i < image.length) {
		pdf.d.push(func(image[i++], image[i++], image[i++], image[i++]));
	}
	return pdf;
}

function RGBAtoCdf(data: ImageData, func: FromRGBA): PDF {
	const pdf = RGBAtoPdf(data, func);
	const cdf = { d: pdf.d.slice(0), w: pdf.w, h: pdf.h };
	cdf.d.forEach((v, i) => {
		if (i >= cdf.w) cdf.d[i] = v + cdf.d[i - cdf.w];
	});
	cdf.d.forEach((v, i) => {
		if (i % cdf.w > 0) cdf.d[i] = v + cdf.d[i - 1];
	});
	return cdf;
}

type Box = [number, number, number, number];

/** Cuts a box in half, always cutting on the longer side */
function splitBox([i, j, w, h]: Box): [Box, Box] {
	if (w > h) {
		const v = Math.floor(w / 2);
		return [
			[i, j, v, h],
			[i + v, j, w - v, h]
		];
	} else {
		const v = Math.floor(h / 2);
		return [
			[i, j, w, v],
			[i, j + v, w, h - v]
		];
	}
}

function cdfAreaforBox(cdf: PDF, [i, j, w, h]: Box) {
	const As = [
		[i, j],
		[i + w, j],
		[i, j + h],
		[i + w, j + h]
	].map(([x, y]) => {
		if (x < 1) return 0;
		if (y < 1) return 0;
		const k = (y - 1) * cdf.w + x - 1;
		return cdf.d[k];
	});

	// compute area as difference of rectangles
	return As[3] - As[2] - As[1] + As[0];
}

type HeapItem = [Box, number];

/** This admittedly isn't the best algorithm,
 * but its flaws will be accounted for in an update rule for the boids
 *
 * We repeatedly subdivide a box surrounding the text, each time subdividing
 * the box with the most black pixels in them, leading to roughly equivalent
 * areas of pixels covered per point.
 */
export function splitBased(
	ctx: CanvasRenderingContext2D,
	N: number,
	f: FromRGBA = (_r, _g, _b, a) => a
): Vec[] {
	const dims = [ctx.canvas.width, ctx.canvas.height];
	const data = ctx.getImageData(0, 0, dims[0], dims[1]);
	const cdf = RGBAtoCdf(data, f);

	const box: Box = [0, 0, dims[0], dims[1]];
	const item: HeapItem = [box, cdfAreaforBox(cdf, box)];
	const heap = new MaxHeap((d: HeapItem) => d[1], [item]);

	while (heap.length < N) {
		const [rect, area] = heap.pop();
		const [rect1, rect2] = splitBox(rect);
		const area1 = cdfAreaforBox(cdf, rect1);

		heap.push([rect1, area1]);
		heap.push([rect2, area - area1]);
	}

	return heap
		.items()
		.map((d: HeapItem) => d[0])
		.map(([i, j, w, h]: Box) => [i + Math.floor(w / 2), j + Math.floor(h / 2)]);
}

export function getPoints(
	ctx: CanvasRenderingContext2D,
	letters: string,
	N: number,
	f: FromRGBA = (_r, _g, _b, a) => a
): Vec[] {
	// insert thin spaces to separate text slightly
	letters = letters.split('').join(String.fromCharCode(8201)).toUpperCase();

	ctx.textBaseline = 'top';
	ctx.font = '50px arial';
	ctx.strokeStyle = '#000000';
	ctx.fillText(letters, 20, 20);

	return splitBased(ctx, N, f);
}

function toCdfMdfs(data: ImageData, func: FromRGBA) {
	const pdf = RGBAtoPdf(data, func);
	const cdfx = { d: pdf.d.slice(0), w: pdf.w, h: pdf.h };
	const cdfy = { d: pdf.d.slice(0), w: pdf.w, h: pdf.h };

	cdfx.d.forEach((v, i) => {
		if (i % cdfx.w > 0) cdfx.d[i] = v + cdfx.d[i - 1];
	});
	cdfy.d.forEach((v, i) => {
		if (i >= cdfy.w) cdfy.d[i] = v + cdfy.d[i - cdfx.w];
	});

	const mdfx = { d: cdfy.d.slice(0), w: cdfy.w, h: cdfy.h };
	const mdfy = { d: cdfx.d.slice(0), w: cdfx.w, h: cdfx.h };

	mdfx.d.forEach((v, i) => {
		const x = i % mdfx.w;
		if (x == 0) mdfx.d[i] = 0;
		else mdfx.d[i] = x * v + mdfx.d[i - 1];
	});
	mdfy.d.forEach((v, i) => {
		const y = Math.floor(i / mdfy.w);
		if (y == 0) mdfy.d[i] = 0;
		else mdfy.d[i] = y * v + mdfy.d[i - mdfy.w];
	});
	cdfy.d.forEach((v, i) => {
		if (i % cdfy.w > 0) cdfy.d[i] = v + cdfy.d[i - 1];
	});

	return [cdfy, mdfx, mdfy];
}

export function centroidFetcher(ctx: CanvasRenderingContext2D, func: FromRGBA) {
	const [w, h] = [ctx.canvas.width, ctx.canvas.height];
	const data = ctx.getImageData(0, 0, w, h);
	const [cdf, mdfx, mdfy] = toCdfMdfs(data, func).map((d) => d.d);
	const I = (x: number, y: number) => x + y * w;

	return function ([ix, iy]: Vec, [jx, jy]: Vec) {
		const i0 = I(jx, jy);
		const i1 = I(ix, jy);
		const i2 = I(jx, iy);
		const i3 = I(ix, iy);
		const Area = cdf[i0] - cdf[i1] - cdf[i2] + cdf[i3];
		const Mx = mdfx[i0] - mdfx[i1] - mdfx[i2] + mdfx[i3];
		const My = mdfy[i0] - mdfy[i1] - mdfy[i2] + mdfy[i3];
		return [Mx / Area - ix, My / Area - iy];
	};
}
