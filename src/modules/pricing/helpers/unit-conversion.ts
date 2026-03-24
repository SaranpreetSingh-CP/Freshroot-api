/**
 * Convert a quantity from one unit to the vegetable's base unit.
 *
 * Supported conversions:
 *   g  → kg  = quantity / 1000
 *   kg → kg  = quantity
 *   piece → piece = quantity
 *
 * If units already match, returns quantity unchanged.
 */
export function convertToBaseUnit(
	quantity: number,
	unit: string,
	baseUnit: string,
): number {
	const u = unit.toLowerCase().trim();
	const b = baseUnit.toLowerCase().trim();

	if (u === b) return quantity;

	// gram → kilogram
	if (u === "g" && b === "kg") return quantity / 1000;

	// kilogram → gram (unlikely but handled)
	if (u === "kg" && b === "g") return quantity * 1000;

	// Unrecognised pair — return as-is
	return quantity;
}
