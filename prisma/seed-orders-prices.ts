import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
	// ─── Old Orders (past dates) across different customers ─────
	const orders = [
		// March 10, 2026
		{
			customerId: 1, // Sudha Gupta
			items: [
				{ vegetableId: 1, name: "Spinach", quantity: 2, unit: "kg" },
				{ vegetableId: 11, name: "Carrot", quantity: 1, unit: "kg" },
				{ vegetableId: 15, name: "Tomato", quantity: 1.5, unit: "kg" },
			],
			totalAmount: 350,
			status: "DELIVERED",
			deliveryDate: new Date("2026-03-10"),
		},
		{
			customerId: 29, // Saranpreet Singh
			items: [
				{ vegetableId: 4, name: "Broccoli", quantity: 2, unit: "piece" },
				{ vegetableId: 7, name: "Peas", quantity: 1, unit: "kg" },
				{ vegetableId: 2, name: "Coriander", quantity: 0.5, unit: "kg" },
			],
			totalAmount: 420,
			status: "DELIVERED",
			deliveryDate: new Date("2026-03-10"),
		},
		{
			customerId: 25, // Arpana Bansal
			items: [
				{ vegetableId: 6, name: "Cauliflower", quantity: 3, unit: "piece" },
				{ vegetableId: 9, name: "Radish", quantity: 1, unit: "kg" },
			],
			totalAmount: 280,
			status: "DELIVERED",
			deliveryDate: new Date("2026-03-10"),
		},

		// March 12, 2026
		{
			customerId: 3, // Alka Gupta
			items: [
				{ vegetableId: 14, name: "Mushroom", quantity: 0.5, unit: "kg" },
				{ vegetableId: 1, name: "Spinach", quantity: 1, unit: "kg" },
				{ vegetableId: 8, name: "Beans", quantity: 1, unit: "kg" },
			],
			totalAmount: 390,
			status: "DELIVERED",
			deliveryDate: new Date("2026-03-12"),
		},
		{
			customerId: 5, // Rashmi Rekha Mahanta
			items: [
				{ vegetableId: 15, name: "Tomato", quantity: 2, unit: "kg" },
				{ vegetableId: 20, name: "Okra", quantity: 0.5, unit: "kg" },
				{ vegetableId: 11, name: "Carrot", quantity: 1, unit: "kg" },
			],
			totalAmount: 310,
			status: "DELIVERED",
			deliveryDate: new Date("2026-03-12"),
		},

		// March 15, 2026
		{
			customerId: 10, // Seema Vig
			items: [
				{ vegetableId: 3, name: "Fenugreek", quantity: 1, unit: "kg" },
				{ vegetableId: 12, name: "Beetroot", quantity: 1, unit: "kg" },
				{ vegetableId: 16, name: "Pumpkin", quantity: 2, unit: "kg" },
			],
			totalAmount: 440,
			status: "DELIVERED",
			deliveryDate: new Date("2026-03-15"),
		},
		{
			customerId: 15, // Anu Bhardwaj
			items: [
				{ vegetableId: 5, name: "Cabbage", quantity: 1, unit: "piece" },
				{ vegetableId: 7, name: "Peas", quantity: 2, unit: "kg" },
				{ vegetableId: 19, name: "Bitter Gourd", quantity: 0.5, unit: "kg" },
			],
			totalAmount: 360,
			status: "CANCELLED",
			deliveryDate: new Date("2026-03-15"),
		},
		{
			customerId: 1, // Sudha Gupta
			items: [
				{ vegetableId: 2, name: "Coriander", quantity: 0.25, unit: "kg" },
				{ vegetableId: 4, name: "Broccoli", quantity: 2, unit: "piece" },
				{ vegetableId: 14, name: "Mushroom", quantity: 0.5, unit: "kg" },
			],
			totalAmount: 500,
			status: "DELIVERED",
			deliveryDate: new Date("2026-03-15"),
		},

		// March 18, 2026
		{
			customerId: 20, // Neeraj Kumar
			items: [
				{ vegetableId: 1, name: "Spinach", quantity: 1.5, unit: "kg" },
				{ vegetableId: 15, name: "Tomato", quantity: 2, unit: "kg" },
				{ vegetableId: 6, name: "Cauliflower", quantity: 2, unit: "piece" },
				{ vegetableId: 18, name: "Ridge Gourd", quantity: 1, unit: "kg" },
			],
			totalAmount: 580,
			status: "DELIVERED",
			deliveryDate: new Date("2026-03-18"),
		},
		{
			customerId: 27, // Geeta Malhotra
			items: [
				{ vegetableId: 8, name: "Beans", quantity: 1, unit: "kg" },
				{ vegetableId: 10, name: "Turnip", quantity: 1, unit: "kg" },
				{ vegetableId: 3, name: "Fenugreek", quantity: 0.5, unit: "kg" },
			],
			totalAmount: 295,
			status: "DELIVERED",
			deliveryDate: new Date("2026-03-18"),
		},

		// March 20, 2026
		{
			customerId: 29, // Saranpreet Singh
			items: [
				{ vegetableId: 11, name: "Carrot", quantity: 2, unit: "kg" },
				{ vegetableId: 12, name: "Beetroot", quantity: 1, unit: "kg" },
				{ vegetableId: 9, name: "Radish", quantity: 1.5, unit: "kg" },
			],
			totalAmount: 375,
			status: "DELIVERED",
			deliveryDate: new Date("2026-03-20"),
		},
		{
			customerId: 7, // Kanta Manchanda
			items: [
				{ vegetableId: 17, name: "Bottle Gourd", quantity: 1, unit: "piece" },
				{ vegetableId: 20, name: "Okra", quantity: 1, unit: "kg" },
				{ vegetableId: 1, name: "Spinach", quantity: 1, unit: "kg" },
				{ vegetableId: 2, name: "Coriander", quantity: 0.25, unit: "kg" },
			],
			totalAmount: 410,
			status: "DELIVERED",
			deliveryDate: new Date("2026-03-20"),
		},
	];

	console.log("Creating 12 old orders...");
	for (const order of orders) {
		await prisma.order.create({ data: order });
	}
	console.log("✅ 12 orders created");

	// ─── Vegetable Prices for those dates ───────────────────────
	const priceSets = [
		{
			date: new Date("2026-03-10"),
			prices: [
				{ vegetableId: 1, price: 40 }, // Spinach
				{ vegetableId: 2, price: 30 }, // Coriander
				{ vegetableId: 4, price: 60 }, // Broccoli
				{ vegetableId: 6, price: 40 }, // Cauliflower
				{ vegetableId: 7, price: 80 }, // Peas
				{ vegetableId: 9, price: 25 }, // Radish
				{ vegetableId: 11, price: 35 }, // Carrot
				{ vegetableId: 15, price: 30 }, // Tomato
			],
		},
		{
			date: new Date("2026-03-12"),
			prices: [
				{ vegetableId: 1, price: 42 }, // Spinach
				{ vegetableId: 8, price: 70 }, // Beans
				{ vegetableId: 11, price: 35 }, // Carrot
				{ vegetableId: 14, price: 200 }, // Mushroom
				{ vegetableId: 15, price: 28 }, // Tomato
				{ vegetableId: 20, price: 50 }, // Okra
			],
		},
		{
			date: new Date("2026-03-15"),
			prices: [
				{ vegetableId: 2, price: 32 }, // Coriander
				{ vegetableId: 3, price: 50 }, // Fenugreek
				{ vegetableId: 4, price: 65 }, // Broccoli
				{ vegetableId: 5, price: 30 }, // Cabbage
				{ vegetableId: 7, price: 85 }, // Peas
				{ vegetableId: 12, price: 40 }, // Beetroot
				{ vegetableId: 14, price: 210 }, // Mushroom
				{ vegetableId: 16, price: 25 }, // Pumpkin
				{ vegetableId: 19, price: 45 }, // Bitter Gourd
			],
		},
		{
			date: new Date("2026-03-18"),
			prices: [
				{ vegetableId: 1, price: 38 }, // Spinach
				{ vegetableId: 3, price: 48 }, // Fenugreek
				{ vegetableId: 6, price: 42 }, // Cauliflower
				{ vegetableId: 8, price: 65 }, // Beans
				{ vegetableId: 10, price: 30 }, // Turnip
				{ vegetableId: 15, price: 32 }, // Tomato
				{ vegetableId: 18, price: 35 }, // Ridge Gourd
			],
		},
		{
			date: new Date("2026-03-20"),
			prices: [
				{ vegetableId: 1, price: 40 }, // Spinach
				{ vegetableId: 2, price: 35 }, // Coriander
				{ vegetableId: 9, price: 28 }, // Radish
				{ vegetableId: 11, price: 38 }, // Carrot
				{ vegetableId: 12, price: 42 }, // Beetroot
				{ vegetableId: 17, price: 30 }, // Bottle Gourd
				{ vegetableId: 20, price: 55 }, // Okra
			],
		},
	];

	console.log("Upserting vegetable prices for 5 dates...");
	for (const set of priceSets) {
		for (const p of set.prices) {
			await prisma.vegetablePrice.upsert({
				where: {
					vegetableId_date: {
						vegetableId: p.vegetableId,
						date: set.date,
					},
				},
				create: {
					vegetableId: p.vegetableId,
					price: p.price,
					date: set.date,
				},
				update: { price: p.price },
			});
		}
	}
	console.log("✅ Vegetable prices seeded for 5 dates");

	// ─── Now trigger cost calculation for each date ────────────
	console.log("Calculating order costs...");
	for (const set of priceSets) {
		const startOfDay = new Date(set.date);
		startOfDay.setUTCHours(0, 0, 0, 0);
		const endOfDay = new Date(startOfDay);
		endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);

		const orders = await prisma.order.findMany({
			where: { deliveryDate: { gte: startOfDay, lt: endOfDay } },
		});

		const prices = await prisma.vegetablePrice.findMany({
			where: { date: startOfDay },
		});

		const vegetables = await prisma.vegetable.findMany({
			select: { id: true, unit: true },
		});

		const priceMap = new Map<number, number>();
		for (const p of prices) priceMap.set(p.vegetableId, p.price);

		const baseUnitMap = new Map<number, string>();
		for (const v of vegetables) baseUnitMap.set(v.id, v.unit);

		for (const order of orders) {
			const items = order.items as any[];
			let cost: number | null = 0;

			for (const item of items) {
				if (!item.vegetableId) {
					cost = null;
					break;
				}
				const unitPrice = priceMap.get(item.vegetableId);
				if (unitPrice === undefined) {
					cost = null;
					break;
				}

				const baseUnit = baseUnitMap.get(item.vegetableId) ?? "kg";
				const u = (item.unit ?? baseUnit).toLowerCase();
				let normQty = item.quantity;
				if (u === "g" && baseUnit === "kg") normQty = item.quantity / 1000;

				cost! += normQty * unitPrice;
			}

			if (cost !== null) cost = Math.round(cost * 100) / 100;

			await prisma.order.update({
				where: { id: order.id },
				data: { cost },
			});
		}
	}
	console.log("✅ Order costs calculated");
}

main()
	.then(() => {
		console.log("\n🌱 Seed complete!");
		process.exit(0);
	})
	.catch((e) => {
		console.error(e);
		process.exit(1);
	});
