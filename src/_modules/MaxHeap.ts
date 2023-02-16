function swap<T>(xs: T[], i: number, j: number) {
	const t = xs[i];
	xs[i] = xs[j];
	xs[j] = t;
}

export const MaxHeap = class MaxHeap<Item> {
	constructor(private _comp: (item: Item) => number, public _heap: Item[] = []) {
		if (this._heap.length > 0) {
			this._make_max_heap();
		}
	}

	_max_of_node(i: number): number {
		const Is = [i, 2 * i + 1, 2 * i + 2];
		let hI,
			vI,
			j = -1,
			vJ = NaN;

		for (i of Is) {
			hI = this._heap[i];
			if (hI == undefined) continue;

			vI = this._comp(hI);
			if (vI > vJ || isNaN(vJ)) {
				vJ = vI;
				j = i;
			}
		}
		return j;
	}

	_max_heapify(i: number) {
		const j = this._max_of_node(i);
		if (i == j) return;

		swap(this._heap, i, j);
		this._max_heapify(j);
	}

	get length() {
		return this._heap.length;
	}

	get _leaf() {
		return 2 ** Math.floor(Math.log2(this.length)) - 2;
	}

	_make_max_heap() {
		if (this._heap.length == 0) return;
		// the first node before leaf nodes
		let i = this._leaf;
		while (i >= 0) this._max_heapify(i--);
	}

	push(x: Item) {
		let i = this.length;
		const v = this._comp(x);
		this._heap.push(x);

		while (i > 0) {
			const p = Math.floor((i - 1) / 2);
			const y = this._heap[p];
			const u = this._comp(y);

			if (v <= u) return;
			this._heap[p] = x;
			this._heap[i] = y;
			i = p;
		}
	}

	head() {
		if (this._heap.length == 0) throw new Error('Fetching head from empty heap');
		return this._heap[0];
	}

	pop() {
		if (this.length == 0) throw new Error('Attempting pop from empty heap');
		swap(this._heap, 0, this._heap.length - 1);
		const max = this._heap.pop();
		if (max == undefined) throw new Error('Attempting pop from empty heap');
		if (this.length > 0) this._max_heapify(0);
		return max;
	}
};
