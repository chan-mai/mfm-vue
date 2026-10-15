import { ref } from 'vue';

export interface LogEntry {
	id: number;
	time: string;
	kind: string;
	detail: string;
}

const entries = ref<LogEntry[]>([]);
let nextId = 0;

function add(kind: string, detail: string) {
	entries.value = [{ id: nextId++, time: new Date().toLocaleTimeString(), kind, detail }, ...entries.value].slice(0, 8);
}

export function useEventLog() {
	return { entries, add };
}
