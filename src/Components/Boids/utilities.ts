export function deep_eq(obj1: any, obj2: any): boolean {
	return JSON.stringify(obj1) == JSON.stringify(obj2);
}

export function deep_copy(obj: any): any {
	return JSON.parse(JSON.stringify(obj));
}
