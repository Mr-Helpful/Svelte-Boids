type Spec = { [key: string]: Spec } | Spec[] | string;

export function check_object(
	value: /*eslint-disable @typescript-eslint/no-explicit-any*/ any,
	spec: Spec
): boolean {
	if (typeof spec === 'string' && typeof value === spec) return true;
	if (Array.isArray(value) && Array.isArray(spec))
		return value.every((v, i) => check_object(v, spec[i]));
	if (typeof value === 'object' && typeof spec === 'object')
		return (
			Object.keys(spec).every((key) => key in value) &&
			check_object(
				Object.keys(spec).map((key) => value[key]),
				Object.values(spec)
			)
		);
	return false;
}

/** Wraps a handler s.t. it will only be called via a 'Enter' press */
export function enter_pressed(callback: () => void): (ev: KeyboardEvent) => void {
	return (ev: KeyboardEvent) => {
		if (ev.key === 'Enter') callback();
	};
}

/** Returns a promise that takes ms milliseconds to resolve */
export function wait(ms: number): Promise<void> {
	return new Promise((res) => setTimeout(res, ms));
}

/** Returns a function that gives the time in milliseconds since last call */
export function perf_timer(): { reset: () => void; delta: () => number } {
	let t0 = performance.now();
	return {
		reset: () => {
			t0 = performance.now();
		},
		delta: () => {
			const t1 = performance.now();
			return [t1 - t0, (t0 = t1)][0];
		}
	};
}
