/**
 * Vegetable seed data extracted from Freshroot Farms brochure.
 * Run via:  npx tsx prisma/seed-vegetables.ts
 */
import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// ─── Vegetable Master List ──────────────────────────────────────
interface VegSeed {
	name: string;
	hindiName: string;
	category: "SEASONAL" | "STAPLE" | "EXOTIC";
	unit: "kg" | "piece";
}

const vegetables: VegSeed[] = [
	// ── SEASONAL ────────────────────────────────────────────────
	{ name: "Spinach", hindiName: "पालक", category: "SEASONAL", unit: "kg" },
	{ name: "Coriander", hindiName: "धनिया", category: "SEASONAL", unit: "kg" },
	{ name: "Fenugreek", hindiName: "मेथी", category: "SEASONAL", unit: "kg" },
	{
		name: "Broccoli",
		hindiName: "ब्रोकली",
		category: "SEASONAL",
		unit: "piece",
	},
	{
		name: "Cabbage",
		hindiName: "पत्ता गोभी",
		category: "SEASONAL",
		unit: "piece",
	},
	{
		name: "Cauliflower",
		hindiName: "फूलगोभी",
		category: "SEASONAL",
		unit: "piece",
	},
	{ name: "Peas", hindiName: "मटर", category: "SEASONAL", unit: "kg" },
	{ name: "Beans", hindiName: "फलियाँ", category: "SEASONAL", unit: "kg" },
	{ name: "Radish", hindiName: "मूली", category: "SEASONAL", unit: "kg" },
	{ name: "Turnip", hindiName: "शलजम", category: "SEASONAL", unit: "kg" },
	{ name: "Carrot", hindiName: "गाजर", category: "SEASONAL", unit: "kg" },
	{ name: "Beetroot", hindiName: "चुकंदर", category: "SEASONAL", unit: "kg" },
	{
		name: "Lettuce",
		hindiName: "हरी सलाद",
		category: "SEASONAL",
		unit: "piece",
	},
	{ name: "Mushroom", hindiName: "मशरूम", category: "SEASONAL", unit: "kg" },
	{ name: "Tomato", hindiName: "टमाटर", category: "SEASONAL", unit: "kg" },
	{ name: "Pumpkin", hindiName: "कद्दू", category: "SEASONAL", unit: "kg" },
	{
		name: "Bottle Gourd",
		hindiName: "लौकी",
		category: "SEASONAL",
		unit: "piece",
	},
	{ name: "Ridge Gourd", hindiName: "तोरई", category: "SEASONAL", unit: "kg" },
	{
		name: "Bitter Gourd",
		hindiName: "करेला",
		category: "SEASONAL",
		unit: "kg",
	},
	{ name: "Okra", hindiName: "भिंडी", category: "SEASONAL", unit: "kg" },
	{ name: "Lobiya", hindiName: "लोबिया", category: "SEASONAL", unit: "kg" },
	{ name: "Tinda", hindiName: "टिंडा", category: "SEASONAL", unit: "kg" },
	{ name: "Sponge Gourd", hindiName: "तोरी", category: "SEASONAL", unit: "kg" },
	{ name: "Zucchini", hindiName: "जुकीनी", category: "SEASONAL", unit: "kg" },
	{
		name: "Knol Khol",
		hindiName: "गांठ गोभी",
		category: "SEASONAL",
		unit: "piece",
	},
	{
		name: "Spring Onion",
		hindiName: "हरा प्याज",
		category: "SEASONAL",
		unit: "kg",
	},
	{ name: "Bathua", hindiName: "बथुआ", category: "SEASONAL", unit: "kg" },
	{
		name: "Garlic Leaves",
		hindiName: "लहसुन पत्ते",
		category: "SEASONAL",
		unit: "kg",
	},
	{
		name: "Amaranthus Greens/Red",
		hindiName: "चौलाई",
		category: "SEASONAL",
		unit: "kg",
	},
	{
		name: "Mustard Greens",
		hindiName: "सरसों का साग",
		category: "SEASONAL",
		unit: "kg",
	},
	{
		name: "Green Mustard",
		hindiName: "हरी सरसों",
		category: "SEASONAL",
		unit: "kg",
	},

	// ── STAPLE ──────────────────────────────────────────────────
	{ name: "Potato", hindiName: "आलू", category: "STAPLE", unit: "kg" },
	{
		name: "Capsicum",
		hindiName: "शिमला मिर्च",
		category: "STAPLE",
		unit: "kg",
	},
	{
		name: "Colored Capsicum",
		hindiName: "रंगीन शिमला मिर्च",
		category: "STAPLE",
		unit: "kg",
	},
	{ name: "Brinjal", hindiName: "बैंगन", category: "STAPLE", unit: "kg" },
	{
		name: "Green Chillies",
		hindiName: "हरी मिर्च",
		category: "STAPLE",
		unit: "kg",
	},
	{ name: "Onion", hindiName: "प्याज", category: "STAPLE", unit: "kg" },
	{
		name: "Cherry Tomato",
		hindiName: "चेरी टमाटर",
		category: "STAPLE",
		unit: "kg",
	},
	{ name: "Cucumber", hindiName: "खीरा", category: "STAPLE", unit: "kg" },
	{ name: "Lemon", hindiName: "नींबू", category: "STAPLE", unit: "kg" },

	// ── EXOTIC / HERBS ──────────────────────────────────────────
	{
		name: "Green Lettuce",
		hindiName: "हरी लेट्यूस",
		category: "EXOTIC",
		unit: "piece",
	},
	{
		name: "Red Lettuce",
		hindiName: "लाल लेट्यूस",
		category: "EXOTIC",
		unit: "piece",
	},
	{
		name: "Iceberg Lettuce",
		hindiName: "आइसबर्ग लेट्यूस",
		category: "EXOTIC",
		unit: "piece",
	},
	{ name: "Pak Choi", hindiName: "पाक चोई", category: "EXOTIC", unit: "piece" },
	{ name: "Bok Choi", hindiName: "बोक चोई", category: "EXOTIC", unit: "piece" },
	{
		name: "Celery",
		hindiName: "अजमोद (सेलेरी)",
		category: "EXOTIC",
		unit: "piece",
	},
	{ name: "Kale", hindiName: "केल", category: "EXOTIC", unit: "kg" },
	{ name: "Parsley", hindiName: "पार्सले", category: "EXOTIC", unit: "kg" },
	{ name: "Arugula", hindiName: "अस्गुला", category: "EXOTIC", unit: "kg" },
	{
		name: "Curry Leaves",
		hindiName: "कड़ी पत्ता",
		category: "EXOTIC",
		unit: "kg",
	},
	{ name: "Asparagus", hindiName: "शतावरी", category: "EXOTIC", unit: "kg" },
	{
		name: "Black Carrot",
		hindiName: "काली गाजर",
		category: "EXOTIC",
		unit: "kg",
	},
	{ name: "Thyme", hindiName: "थाइम", category: "EXOTIC", unit: "kg" },
	{
		name: "Black Turmeric",
		hindiName: "काली हल्दी",
		category: "EXOTIC",
		unit: "kg",
	},
	{ name: "Mint", hindiName: "पुदीना", category: "EXOTIC", unit: "kg" },
	{ name: "Ginger", hindiName: "अदरक", category: "EXOTIC", unit: "kg" },
	{ name: "Garlic", hindiName: "लहसुन", category: "EXOTIC", unit: "kg" },
	{ name: "Basil", hindiName: "बेसिल", category: "EXOTIC", unit: "kg" },
	{
		name: "Baby Spinach",
		hindiName: "बेबी पालक",
		category: "EXOTIC",
		unit: "kg",
	},
	{
		name: "Red Cabbage",
		hindiName: "लाल पत्ता गोभी",
		category: "EXOTIC",
		unit: "piece",
	},
	{ name: "Moringa", hindiName: "सहजन", category: "EXOTIC", unit: "kg" },
	{ name: "Chives", hindiName: "चाइव्स", category: "EXOTIC", unit: "kg" },
	{ name: "Rosemary", hindiName: "रोज़मेरी", category: "EXOTIC", unit: "kg" },
	{
		name: "Lemongrass",
		hindiName: "लेमन ग्रास",
		category: "EXOTIC",
		unit: "kg",
	},
];

// ─── Monthly Availability (from brochure) ───────────────────────
// Key = vegetable name, Value = array of months (1–12)
const availability: Record<string, number[]> = {
	// JANUARY
	Spinach: [1, 2, 3, 4, 5, 7, 8, 9, 10, 11],
	Coriander: [1, 2, 3, 4, 5, 8, 9, 10, 11, 12],
	Fenugreek: [1, 2, 3, 4, 10, 11, 12],
	Broccoli: [1, 2, 3, 4, 11, 12],
	Cabbage: [1, 2, 3, 4, 5, 10, 11, 12],
	Cauliflower: [1, 2, 3, 4, 10, 11, 12],
	Peas: [1, 2, 3, 4, 11, 12],
	Beans: [1, 2, 3, 4, 9, 10, 11, 12],
	Radish: [1, 2, 3, 4, 5, 9, 10, 11, 12],
	Turnip: [1, 2, 3, 4, 11, 12],
	Carrot: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
	Beetroot: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
	"Knol Khol": [1, 2, 11, 12],
	"Spring Onion": [1, 2, 10, 11, 12],
	Bathua: [1, 2],
	"Garlic Leaves": [1, 2, 11, 12],

	// MARCH additions
	Zucchini: [3, 4, 5, 6, 7, 8],

	// APRIL additions
	"Amaranthus Greens/Red": [4, 5, 6, 7, 8],

	// MAY–AUGUST monsoon vegetables
	Tinda: [3, 4, 5, 6, 7, 8, 9, 10],
	Pumpkin: [3, 4, 5, 6, 7, 8, 9, 10],
	"Bottle Gourd": [3, 4, 5, 6, 7, 8, 9, 10],
	"Sponge Gourd": [3, 4, 5, 6, 7, 8, 9, 10],
	"Bitter Gourd": [3, 4, 5, 6, 7, 8, 9, 10],
	Okra: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
	Lobiya: [6, 7, 8],

	// OCTOBER
	// (Fenugreek, Cabbage, etc. already covered above)

	// NOVEMBER
	"Mustard Greens": [11],
	"Green Mustard": [12],
};

async function main() {
	console.log("🥬 Seeding vegetables & monthly availability...\n");

	// Upsert all vegetables
	const vegMap = new Map<string, number>();

	for (const veg of vegetables) {
		const record = await prisma.vegetable.upsert({
			where: { name: veg.name },
			update: {
				hindiName: veg.hindiName,
				category: veg.category,
				unit: veg.unit,
			},
			create: {
				name: veg.name,
				hindiName: veg.hindiName,
				category: veg.category,
				unit: veg.unit,
			},
		});
		vegMap.set(veg.name, record.id);
	}
	console.log(`✅ Upserted ${vegMap.size} vegetables`);

	// Clear existing availability and re-seed
	await prisma.vegetableAvailability.deleteMany();

	const rows: { vegetableId: number; month: number }[] = [];
	for (const [vegName, months] of Object.entries(availability)) {
		const vegId = vegMap.get(vegName);
		if (!vegId) {
			console.warn(`⚠️  Vegetable not found: ${vegName}`);
			continue;
		}
		for (const m of months) {
			rows.push({ vegetableId: vegId, month: m });
		}
	}

	// Batch insert
	let inserted = 0;
	for (const row of rows) {
		await prisma.vegetableAvailability.create({ data: row });
		inserted++;
	}
	console.log(`✅ Inserted ${inserted} availability records`);

	// Summary per month
	for (let m = 1; m <= 12; m++) {
		const count = await prisma.vegetableAvailability.count({
			where: { month: m },
		});
		const monthName = new Date(2026, m - 1).toLocaleString("en", {
			month: "long",
		});
		console.log(`   ${monthName}: ${count} vegetables`);
	}

	console.log("\n🎉 Vegetable seed completed!");
}

main()
	.catch((e) => {
		console.error("❌ Vegetable seed failed:", e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
