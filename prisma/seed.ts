import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import * as bcrypt from "bcrypt";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
	console.log("🌱 Seeding Freshroot Farms database...\n");

	// ─── Admin User ───────────────────────────────────────────
	const hashedPassword = await bcrypt.hash("admin123", 10);
	const admin = await prisma.user.upsert({
		where: { email: "admin@freshroot.com" },
		update: {},
		create: {
			email: "admin@freshroot.com",
			password: hashedPassword,
			name: "Freshroot Admin",
			role: "admin",
		},
	});
	console.log(`✅ Admin user: ${admin.email}`);

	// ─── Customers ────────────────────────────────────────────
	const customer1 = await prisma.customer.create({
		data: {
			name: "Rajesh Kumar",
			phone: "9876543210",
			email: "rajesh@example.com",
		},
	});

	const customer2 = await prisma.customer.create({
		data: {
			name: "Priya Sharma",
			phone: "9876543211",
			email: "priya@example.com",
		},
	});

	const customer3 = await prisma.customer.create({
		data: {
			name: "Amit Patel",
			phone: "9876543212",
			email: "amit@example.com",
		},
	});
	console.log(`✅ Created ${3} customers`);

	// ─── Addresses ────────────────────────────────────────────
	const address1 = await prisma.address.create({
		data: {
			customerId: customer1.id,
			line1: "42, Green Valley Apartments",
			line2: "Sector 12",
			city: "Chandigarh",
			state: "Punjab",
			pincode: "160012",
			label: "home",
			isDefault: true,
		},
	});

	const address2 = await prisma.address.create({
		data: {
			customerId: customer2.id,
			line1: "15, Rose Garden Colony",
			city: "Mohali",
			state: "Punjab",
			pincode: "140301",
			label: "home",
			isDefault: true,
		},
	});

	await prisma.address.create({
		data: {
			customerId: customer3.id,
			line1: "8, Sunrise Towers",
			line2: "Phase 5",
			city: "Mohali",
			state: "Punjab",
			pincode: "140308",
			label: "office",
			isDefault: true,
		},
	});
	console.log(`✅ Created addresses`);

	// ─── Subscriptions ────────────────────────────────────────
	await prisma.subscription.create({
		data: {
			customerId: customer1.id,
			plan: "daily",
			items: [
				{ name: "Fresh Vegetables Box", qty: 1, unit: "box" },
				{ name: "Milk (1L)", qty: 2, unit: "litre" },
			],
			startDate: new Date("2026-01-01"),
			status: "active",
		},
	});

	await prisma.subscription.create({
		data: {
			customerId: customer2.id,
			plan: "weekly",
			items: [
				{ name: "Organic Fruit Basket", qty: 1, unit: "basket" },
				{ name: "Salad Greens", qty: 2, unit: "pack" },
			],
			startDate: new Date("2026-02-01"),
			status: "active",
		},
	});
	console.log(`✅ Created subscriptions`);

	// ─── Orders ───────────────────────────────────────────────
	const order1 = await prisma.order.create({
		data: {
			customerId: customer1.id,
			items: [
				{ name: "Tomatoes", qty: 2, unit: "kg", price: 60 },
				{ name: "Spinach", qty: 1, unit: "bunch", price: 30 },
				{ name: "Eggs", qty: 12, unit: "pcs", price: 84 },
			],
			totalAmount: 174,
			status: "delivered",
			deliveryDate: new Date("2026-03-18"),
		},
	});

	const order2 = await prisma.order.create({
		data: {
			customerId: customer2.id,
			items: [
				{ name: "Organic Apples", qty: 1, unit: "kg", price: 250 },
				{ name: "Broccoli", qty: 0.5, unit: "kg", price: 80 },
			],
			totalAmount: 330,
			status: "confirmed",
			deliveryDate: new Date("2026-03-22"),
		},
	});

	const order3 = await prisma.order.create({
		data: {
			customerId: customer3.id,
			items: [
				{ name: "Mixed Herbs Box", qty: 1, unit: "box", price: 150 },
				{ name: "Mushrooms", qty: 0.25, unit: "kg", price: 100 },
			],
			totalAmount: 250,
			status: "pending",
			deliveryDate: new Date("2026-03-23"),
			notes: "Please deliver before 10 AM",
		},
	});
	console.log(`✅ Created ${3} orders`);

	// ─── Deliveries ───────────────────────────────────────────
	await prisma.delivery.create({
		data: {
			orderId: order1.id,
			addressId: address1.id,
			status: "delivered",
			deliveredAt: new Date("2026-03-18T09:30:00"),
			driverName: "Harpreet Singh",
		},
	});

	await prisma.delivery.create({
		data: {
			orderId: order2.id,
			addressId: address2.id,
			status: "scheduled",
			driverName: "Gurpreet Kaur",
		},
	});
	console.log(`✅ Created deliveries`);

	// ─── Kitchen Gardens ──────────────────────────────────────
	const kg1 = await prisma.kitchenGarden.create({
		data: {
			customerId: customer1.id,
			setupDate: new Date("2026-01-15"),
			location: "Rooftop",
			gardenSize: "6x4 ft",
			status: "active",
			notes: "Herbs and leafy vegetables",
		},
	});

	await prisma.kitchenGarden.create({
		data: {
			customerId: customer2.id,
			setupDate: new Date("2026-02-10"),
			location: "Balcony",
			gardenSize: "4x3 ft",
			status: "active",
			notes: "Tomatoes, chillies, and coriander",
		},
	});
	console.log(`✅ Created kitchen gardens`);

	// ─── KG Visits ────────────────────────────────────────────
	await prisma.kGVisit.create({
		data: {
			kitchenGardenId: kg1.id,
			visitDate: new Date("2026-02-01"),
			workDone:
				"Initial soil preparation and planting of basil, mint, and coriander seeds",
			healthStatus: "good",
			photos: ["https://example.com/photos/kg1-visit1.jpg"],
			notes: "Soil pH is balanced. Good drainage.",
		},
	});

	await prisma.kGVisit.create({
		data: {
			kitchenGardenId: kg1.id,
			visitDate: new Date("2026-03-01"),
			workDone: "Pruning, pest check, added organic fertilizer",
			healthStatus: "good",
			photos: ["https://example.com/photos/kg1-visit2.jpg"],
			notes: "Plants growing well. First harvest of basil ready.",
		},
	});
	console.log(`✅ Created KG visits`);

	// ─── Expenses ─────────────────────────────────────────────
	await prisma.expense.createMany({
		data: [
			{
				category: "seeds",
				description: "Organic vegetable seed pack — tomato, spinach, fenugreek",
				amount: 450,
				date: new Date("2026-01-10"),
				paidTo: "Green Seeds Co.",
			},
			{
				category: "fertilizer",
				description: "Vermicompost 50kg bag",
				amount: 800,
				date: new Date("2026-01-15"),
				paidTo: "Farm Supplies Ltd.",
			},
			{
				category: "transport",
				description: "Delivery van fuel — weekly run",
				amount: 1200,
				date: new Date("2026-03-15"),
				paidTo: "HP Petrol Pump",
			},
			{
				category: "labour",
				description: "Farm helper — March wages",
				amount: 8000,
				date: new Date("2026-03-01"),
				paidTo: "Ramu",
			},
			{
				category: "packaging",
				description: "Eco-friendly boxes — 100 pcs",
				amount: 2500,
				date: new Date("2026-02-20"),
				paidTo: "PackGreen",
			},
		],
	});
	console.log(`✅ Created expenses`);

	// ─── Payments ─────────────────────────────────────────────
	await prisma.payment.create({
		data: {
			customerId: customer1.id,
			amount: 174,
			method: "upi",
			status: "completed",
			reference: "UPI-REF-20260318-001",
			date: new Date("2026-03-18"),
		},
	});

	await prisma.payment.create({
		data: {
			customerId: customer2.id,
			amount: 500,
			method: "cash",
			status: "completed",
			date: new Date("2026-03-15"),
			notes: "Advance payment for March orders",
		},
	});

	await prisma.payment.create({
		data: {
			customerId: customer3.id,
			amount: 250,
			method: "bank_transfer",
			status: "pending",
			reference: "NEFT-20260320-789",
			date: new Date("2026-03-20"),
		},
	});
	console.log(`✅ Created payments`);

	console.log("\n🎉 Seed completed successfully!");
}

main()
	.catch((e) => {
		console.error("❌ Seed failed:", e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
