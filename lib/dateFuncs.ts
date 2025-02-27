
export function todaysDate(): string {
	return new Date().toJSON().slice(0, 10);
}

export function todaysDateSplit(): { year: number, month: number, day: number } {
	const date = new Date().toJSON().slice(0, 10).split('-');
	return { year: Number(date[0]), month: Number(date[1]), day: Number(date[2]) };
}

export function todaysDateLocale(): string {
	return new Date().toLocaleDateString();
}
