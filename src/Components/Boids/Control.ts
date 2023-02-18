import * as V from './Vector';

export type BoidData = { s: V.Vec; v: V.Vec; a: V.Vec };

export type ConstantSettings = {
	min_vel: number;
	max_vel: number;
	max_acc: number;
	view_radius: number;
	view_angles: number;
	words_weight: number;
	dims: V.Vec;
	target: V.Vec;
	word_points: V.Vec[];
	colour: string;
	N: number;
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
	word_input: string;
	playback: { tick: Promise<() => number>; reset: () => void };
};

export type ControlSettings = ConstantSettings & ConfigSettings;

export type InitConfig = { min_vel: number; max_vel: number; dims: V.Vec; N: number };
export function initialise(constants: InitConfig): BoidData[] {
	const { min_vel: s, max_vel: e, dims, N } = constants;
	return new Array(N).fill(0).map(() => ({
		s: V.random([0, 0], dims),
		v: V.lim(V.random([-e, -e], [e, e]), s, e),
		a: [0, 0]
	}));
}

export function step(boids: BoidData[], steps: number, settings: ControlSettings) {
	return boids
		.map((boid, i): BoidData => {
			const a = accel(boid, boids, settings.word_points[i] ?? [0, 0], settings);
			return { ...boid, a };
		})
		.map((boid) => move(boid, steps, settings));
}

/** Updates the acceleration for a single boid */
function accel(
	boid: BoidData,
	boids: BoidData[],
	word: V.Vec,
	{
		avoid_weight,
		align_weight,
		center_weight,
		mouse_weight,
		edges_weight,
		words_weight,
		use_mouse,
		use_edges,
		use_words,
		target,
		dims,
		view_angles,
		view_radius,
		max_vel
	}: ControlSettings
): V.Vec {
	const [near, seen] = select(boid, boids, view_radius, view_angles);
	// we bind all the common variables to be used in finding an acceleration
	const bAcc = getAcc.bind({}, boid, max_vel);

	const accs: V.Vec[] = [];
	accs.push(bAcc(avoid_weight, avoid(boid, near)));
	accs.push(bAcc(align_weight, align(seen)));
	accs.push(bAcc(center_weight, toMid(boid, seen)));

	if (use_mouse) accs.push(bAcc(mouse_weight, toPos(boid, target)));
	if (use_edges) accs.push(bAcc(edges_weight, edges(boid, view_radius, dims)));
	if (use_words) accs.push(bAcc(words_weight, toPos(boid, word)));

	return V.avg(accs);
}

/** Gets the acceleration of a single boid from its desired velocity */
function getAcc(boid: BoidData, max_vel: number, weight: number, acc: V.Vec) {
	const a0 = V.set(acc, max_vel);
	if (a0[0] == 0 && a0[1] == 0) return a0;
	return V.mul(V.sub(a0, boid.v), weight);
}

/** Selects all the boids that the current boid can "see"
 * @param boid - a single boid object
 * @param boids - all other boids
 * @return - the boids that the current boid can "see"
 */
function select(
	boid: BoidData,
	boids: BoidData[],
	view_radius: number,
	view_angles: number
): [BoidData[], BoidData[]] {
	const near = boids.filter((b) => {
		const d = V.mag(V.sub(b.s, boid.s));
		return 0 < d && d <= view_radius;
	});
	const seen = near.filter((b) => {
		const o = V.sub(b.s, boid.s);
		return V.dot(o, b.v) / (V.mag(o) * V.mag(b.v)) > view_angles;
	});
	return [near, seen];
}

/** Gets the nudge required to avoid all other seen boids
 * @param boid - a single boid object
 * @param boids - the other seen boids
 * @return - the velocity needed to avoid the other boids in one step
 */
function avoid(boid: BoidData, boids: BoidData[]) {
	return V.avg(boids.map((b) => V.sub(b.s, boid.s)).map((o) => V.set(o, -1 / V.mag(o))));
}

/** Gets the nudge required to align the boid with other seen boids
 * @param boids - the other seen boids
 * @return - the velocity needed to align
 */
function align(boids: BoidData[]) {
	return V.avg(boids.map((b) => b.v));
}

/** Gets the nudge required to move the boid to the middle of the pack
 * @param boid - a single boid object
 * @param boids - the other seen boids
 * @return - the velocity needed to reach the middle in one step
 */
function toMid(boid: BoidData, boids: BoidData[]) {
	return toPos(boid, V.avg(boids.map((b) => b.s)));
}

/** Gets the nudge required for the boid to reach a certain position.
 * @param boid - a single boid object
 * @param t - the target position to reach
 * @return - the velocity needed to reach the position in one step
 */
function toPos(boid: BoidData, t: V.Vec) {
	return V.sub(t, boid.s);
}

function edges(boid: BoidData, view_radius: number, dims: V.Vec): V.Vec {
	const vBox: V.Vec = [view_radius, view_radius];
	const vRect = [vBox, V.sub(dims, vBox)];
	if (V.inside(boid.s, vRect[0], vRect[1])) return [0, 0];
	return toPos(boid, V.div(dims, 2));
}

function move(
	{ s, v, a }: BoidData,
	steps: number,
	{ max_acc, min_vel, max_vel, use_edges, dims }: ControlSettings
) {
	a = V.set(a, max_acc);
	v = V.lim(V.add(v, V.mul(a, steps)), min_vel, max_vel);
	s = V.add(s, V.mul(v, steps));
	if (use_edges) s = V.clamp(s, [1, 1], V.sub(dims, [1, 1]));
	return { s: V.mod(s, dims), v, a };
}
