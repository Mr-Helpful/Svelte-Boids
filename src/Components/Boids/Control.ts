import * as V from './Vector';

export type BoidData = { s: V.Vec; v: V.Vec; a: V.Vec };

export type ConstantSettings = {
	min_vel: number;
	max_vel: number;
	max_acc: number;
	view_radius: number;
	view_angles: number;
	dims: V.Vec;
	target: V.Vec;
	N: number;
	colour: string;
};

export type ConfigOf<O> = {
	[P in keyof O]: { val: O[P] };
};

export type ConfigSettings = {
	avoid_weight: number;
	align_weight: number;
	center_weight: number;
	mouse_weight: number;
	edges_weight: number;
	use_edges: boolean;
	use_mouse: boolean;
	use_words: boolean;
	playback: { tick: Promise<() => number>; reset: () => void };
};

export type ControlSettings = ConstantSettings & ConfigSettings;

export function initialise(constants: ConstantSettings): BoidData[] {
	const { min_vel: s, max_vel: e, dims, N } = constants;
	return new Array(N).fill(0).map(() => ({
		s: V.random([0, 0], dims),
		v: V.lim(V.random([-e, -e], [e, e]), s, e),
		a: [0, 0]
	}));
}

export function step(boids: BoidData[], steps: number, settings: ControlSettings) {
	// console.log(settings.align_weight);
	return boids.map((b) => update(b, boids, settings)).map((b) => move(b, steps, settings));
}

/** Updates the acceleration for a single boid */
function update(boid: BoidData, boids: BoidData[], settings: ControlSettings) {
	const [near, seen] = select(boid, boids, settings);
	// we bind all the common variables to be used in finding an acceleration
	const bAccel = getAcc.bind({}, boid, settings.target, settings);

	type Rules = [BoidData[], AccGenerator, number][];
	const rules: Rules = [
		[near, avoid, settings.avoid_weight],
		[seen, align, settings.align_weight],
		[seen, toMid, settings.center_weight]
	];
	if (settings.use_mouse) rules.push([seen, toPos, settings.mouse_weight]);
	if (settings.use_edges) rules.push([near, edges, settings.edges_weight]);

	const accels = rules.map(([boids, rule, weight]) => bAccel(boids, rule, weight));

	return { ...boid, a: V.set(V.avg(accels), settings.max_acc) };
}

type AccGenerator = (
	boid: BoidData,
	boids: BoidData[],
	t: V.Vec,
	settings: ControlSettings
) => V.Vec;

/** Gets the acceleration of a single boid from its desired velocity
 * @param {Object} boid - a single boid object
 * @param {Array} boids - the other seen boids
 * @param {Vector} t - a position to target
 * @param {Number} maxV - the maximum velocity the boids can move at
 * @param {Function} f - the function used to determine the boid's desired
 * velocity
 * @param {Number} weight - the weight to assign to the given acceleration
 * @return {Vector} - the acceleration to use
 */
function getAcc(
	boid: BoidData,
	t: V.Vec,
	settings: ControlSettings,
	boids: BoidData[],
	f: AccGenerator,
	weight: number
) {
	const v0 = f(boid, boids, t, settings);
	const v1 = V.set(v0, settings.max_vel);
	if (v1[0] == 0 && v1[1] == 0) return v1;
	return V.mul(V.sub(v1, boid.v), weight);
}

/** Selects all the boids that the current boid can "see"
 * @param {Object} boid - a single boid object
 * @param {Array} boids - all other boids
 * @return {Array} - the boids that the current boid can "see"
 */
function select(
	boid: BoidData,
	boids: BoidData[],
	settings: ControlSettings
): [BoidData[], BoidData[]] {
	const near = boids.filter((b) => {
		const d = V.mag(V.sub(b.s, boid.s));
		return 0 < d && d <= settings.view_radius;
	});
	const seen = near.filter((b) => {
		const o = V.sub(b.s, boid.s);
		return V.dot(o, b.v) / (V.mag(o) * V.mag(b.v)) > settings.view_angles;
	});
	return [near, seen];
}

/** Gets the nudge required to avoid all other seen boids
 * @param {Object} boid - a single boid object
 * @param {Array} boids - the other seen boids
 * @return {Vector} - the velocity needed to avoid the other boids in one step
 */
function avoid(boid: BoidData, boids: BoidData[]) {
	return V.avg(boids.map((b) => V.sub(b.s, boid.s)).map((o) => V.set(o, -1 / V.mag(o))));
}

/** Gets the nudge required to align the boid with other seen boids
 * @param {Object} boid - a single boid object, included to match the layout of
 * other functions
 * @param {Array} boids - the other seen boids
 * @return {Vector} - the velocity needed to align
 */
function align(_1: BoidData, boids: BoidData[]) {
	return V.avg(boids.map((b) => b.v));
}

/** Gets the nudge required to move the boid to the middle of the pack
 * @param {Object} boid - a single boid object
 * @param {Array} boids - the other seen boids
 * @return {Vector} - the velocity needed to reach the middle in one step
 */
function toMid(boid: BoidData, boids: BoidData[]) {
	return toPos(boid, boids, V.avg(boids.map((b) => b.s)));
}

/** Gets the nudge required for the boid to reach a certain position.
 * @param {Object} boid - a single boid object
 * @param {Array} boids - the other seen boids, included to match the layout of
 * other functions
 * @param {Vector} t - the target position to reach
 * @return {Vector} - the velocity needed to reach the position in one step
 */
function toPos(boid: BoidData, _: BoidData[], t: V.Vec) {
	return V.sub(t, boid.s);
}

function edges(boid: BoidData, _1: BoidData[], _2: V.Vec, settings: ControlSettings): V.Vec {
	const vBox: V.Vec = [settings.view_radius, settings.view_radius];
	const vRect = [vBox, V.sub(settings.dims, vBox)];
	if (V.inside(boid.s, vRect[0], vRect[1])) return [0, 0];
	return toPos(boid, [], V.div(settings.dims, 2));
}

function move({ s, v, a }: BoidData, steps: number, settings: ControlSettings) {
	v = V.lim(V.add(v, V.mul(a, steps)), settings.min_vel, settings.max_vel);
	s = V.add(s, V.mul(v, steps));
	if (settings.use_edges) s = V.clamp(s, [1, 1], V.sub(settings.dims, [1, 1]));
	return { s: V.mod(s, settings.dims), v, a };
}
