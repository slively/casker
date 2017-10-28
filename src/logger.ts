import * as supportsColor from 'supports-color';

let colors = [6, 2, 3, 4, 5, 1];

if (supportsColor && supportsColor.level >= 2) {
	colors = [
		26, 32, 33, 38, 39, 40, 41, 42, 43, 44, 45, 57, 62, 63, 68,
		69, 74, 75, 76, 77, 78, 79, 80, 81, 93, 98, 99, 112, 113, 128, 129, 134,
		135, 148, 149, 163, 164, 165, 166, 167, 168, 169, 170, 171,
		172, 173, 178, 179, 184, 185, 199, 200, 201, 202, 203, 204,
		205, 206, 207, 208, 209, 214, 215, 220, 221
	];
}

let currentColorIndex = 0;

export const logger = console;
export const createTaskLogger = (name: string) => {
	currentColorIndex = currentColorIndex === colors.length - 1 ? 0 : currentColorIndex + 1;
	const color = colors[currentColorIndex];
	const format = `\u001b[3${color < 8 ? color : '8;5;' + color};1m%s %s\u001b[0m`;

	return (msg: string) => console.log(format, name, msg); // tslint:disable-line no-console
};
