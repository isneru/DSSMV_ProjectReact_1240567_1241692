export function rgbOpacity(rgbValue: string, opacity: number) {
	const [r, g, b] = rgbValue.match(/\d+/g)?.map(Number) || []
	return `rgba(${r}, ${g}, ${b}, ${opacity})`
}
