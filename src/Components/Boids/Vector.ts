function zip<T, U>(f: (...col: T[]) => U, ...vs: [T, T][]): [U, U] {
	return [f(...vs.map((v) => v[0])), f(...vs.map((v) => v[1]))];
}

function both<T>(f: (...col: T[]) => boolean, ...vs: [T, T][]): boolean {
	return f(...vs.map((v) => v[0])) && f(...vs.map((v) => v[1]));
}

function clamp_num(v: number, s: number, e: number) {
	return Math.max(s, Math.min(e, v));
}

function rand(s: number, e: number) {
	return s + Math.random() * (e - s);
}

function nAdd(x: number, y: number) {
	if (isNaN(x)) return y;
	if (isNaN(y)) return x;
	return x + y;
}

function modV(x: number, c: number) {
	while (x < 0) x += c;
	return x % c;
}

export type Vec = [number, number];

/* add: v1 + v2
 * sub: v1 - v2
 * dot: v1 • v2
 * mul: cv
 * mag: |v|
 * set: v s.t. |v| = c
 * one: v s.t. |v| = 1
 * lim: v s.t. s <= |v| <= e
 * sum: sum of vs
 * avg: mean of vs
 * random: [x, y] s.t. s < x,y < e
 */
export const inside = (v: Vec, s: Vec, e: Vec) => both((x, i, j) => x >= i && x < j, v, s, e);
export const add = (v1: Vec, v2: Vec): Vec => [nAdd(v1[0], v2[0]), nAdd(v1[1], v2[1])];
export const avg = (vs: Vec[]): Vec => div(sum(vs), vs.length);
export const div = (v: Vec, c: number): Vec => mul(v, 1 / c);
export const dot = (v1: Vec, v2: Vec) => v1[0] * v2[0] + v1[1] * v2[1];
export const lim = (v: Vec, s: number, e: number): Vec => set(v, clamp_num(mag(v), s, e));
export const mag = (v: Vec) => Math.sqrt(dot(v, v));
export const mod = (v1: Vec, v2: Vec): Vec => [modV(v1[0], v2[0]), modV(v1[1], v2[1])];
export const mul = (v: Vec, c: number): Vec => [v[0] * c, v[1] * c];
export const one = (v: Vec): Vec => div(v, mag(v) || 1);
export const set = (v: Vec, c: number): Vec => mul(one(v), c);
export const sub = (v1: Vec, v2: Vec): Vec => [v1[0] - v2[0], v1[1] - v2[1]];
export const sum = (vs: Vec[]): Vec => vs.reduce(add, [0, 0]);
export const clamp = (v: Vec, s: Vec, e: Vec): Vec => zip(clamp_num, v, s, e);
export const random = (s: Vec, e: Vec): Vec => zip(rand, s, e);
