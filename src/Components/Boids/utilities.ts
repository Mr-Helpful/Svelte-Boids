type ValueHasVal = {
	[key: string]: { val: unknown };
};

type ExtractedVal<O extends ValueHasVal> = {
	[P in keyof O]: O[P]['val'];
};

export function extractValues<O extends ValueHasVal>(obj: O): ExtractedVal<O> {
	const new_obj = {} as ExtractedVal<O>;
	for (const key in obj) {
		if (Object.hasOwnProperty.call(obj, key)) new_obj[key] = obj[key].val;
	}
	return new_obj;
}
