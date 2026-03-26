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

	// ─── Unique Customers ─────────────────────────────────────
	// Deduplicated from STF + KG spreadsheets:
	//  • Anita Kinra Suneja (9971697655): same entry in both sheets → 1 customer, 1 combined subscription
	//  • Ananya Kamrah (STF) / Neelima Kamrah (KG) (9711818181, same address) → 1 customer, 2 subscriptions
	//  • KIIT University (9711818181): separate entity, same phone → separate customer

	const c = {
		sudha: await prisma.customer.create({
			data: {
				name: "Sudha Gupta",
				phone: "9818759387",
				address:
					"1201- Tower 16, Close North, Nirvana country, Sector 50, Gurugram",
			},
		}),
		smita: await prisma.customer.create({
			data: {
				name: "Smita Periwal",
				phone: "9799969639 / 8209052321",
				address: "2251- 1st floor, near maidalsa hospital, Sec 46, Gurugram",
			},
		}),
		sukriti: await prisma.customer.create({
			data: {
				name: "Sukriti Taneja",
				phone: "9999946388",
				address: "E28, South city 2, Gurugram",
			},
		}),
		suman: await prisma.customer.create({
			data: {
				name: "Suman Khullar",
				phone: "9910049397",
				address: "C-023, DLF crest, Park drive, Phase 5, Sec 54, Gurugram",
			},
		}),
		ruchi: await prisma.customer.create({
			data: {
				name: "Ruchi Jain",
				phone: "9811483245",
				address:
					"A-104, DLF crest, Park drive, Phase 5, Sec 54, Golf course road, Gurugram",
			},
		}),
		pratima: await prisma.customer.create({
			data: {
				name: "Pratima Manchanda",
				phone: "9818488433",
				address: "1638, A - Sec 10A, Gurugram",
			},
		}),
		kshamata: await prisma.customer.create({
			data: {
				name: "Kshamata Yadav",
				phone: "9891702229",
				address: "L-231, Park place, DLF 5, Sec 54, Golfcourse road, Gurugram",
			},
		}),
		ivan: await prisma.customer.create({
			data: {
				name: "Ivan Jalauddin",
				phone: "9810306250",
				address:
					"Vila 172, Sushant lok - D block, 903, Sector 43, Service road, Pwo apartments, Gurugram",
			},
		}),
		anita_kinra: await prisma.customer.create({
			data: {
				name: "Anita Kinra Suneja",
				phone: "9971697655",
				address: "189, Cedar crest, Nirvana country, Sec 50, Gurugram",
			},
		}),
		naresh: await prisma.customer.create({
			data: {
				name: "Naresh",
				phone: "9811126261",
				address: "A1/69, Ground floor, Panchsheel Enclave, South Delhi.",
			},
		}),
		navneet: await prisma.customer.create({
			data: {
				name: "Navneet Kaur",
				phone: "9958172432",
				address:
					"C47, 1st floor, Coral block, Emaar Emerald hills, Sec 65, Gurugram",
			},
		}),
		suprateek: await prisma.customer.create({
			data: {
				name: "Suprateek Roy",
				phone: "9899064322",
				address: "N13/5, 4th floor, DLF phase 2, Gurugram",
			},
		}),
		namrata: await prisma.customer.create({
			data: {
				name: "Namrata Doon",
				phone: "7447799170",
				address: "H-52, Park Heights, Sector 54, Gurugram",
			},
		}),
		anita_gauri: await prisma.customer.create({
			data: {
				name: "Anita Gauri",
				phone: "9811758520",
				address: "111, Cedar crest, Nirvana Country, Gurugram.",
			},
		}),
		reema: await prisma.customer.create({
			data: {
				name: "Reema Bansal",
				phone: "9899096130",
				address:
					"B-293, DLF crest, Sec 54, Park drive, Phase 5, Golf course road, Gurugram.",
			},
		}),
		ananya: await prisma.customer.create({
			data: {
				name: "Ananya Kamrah",
				phone: "9711818181",
				address: "B-510, Ansal Escensia, Sec 67, Gurugram",
			},
		}),
		preet: await prisma.customer.create({
			data: {
				name: "Preet Kahlon",
				phone: "8800494543",
				address: "B-1101, IFS Ridgeview, Sec 54, Gurugram.",
			},
		}),
		samip: await prisma.customer.create({
			data: {
				name: "Samip",
				phone: "9818607709",
				address: "1549, Ground floor, Maruti vihar",
			},
		}),
		shobna: await prisma.customer.create({
			data: {
				name: "Shobna Yadav",
				phone: "9910058003",
				address:
					"F-41, Mehram Nagar, Police colony, Near palam airport, Delhi cantt.",
			},
		}),
		gunjan: await prisma.customer.create({
			data: {
				name: "Gunjan Batra",
				phone: "9810854033",
				address: "408, Magnolias, Sec 42, Gurugram",
			},
		}),
		// KG-only customers
		shrey: await prisma.customer.create({
			data: {
				name: "Shrey Dutt Mishra",
				phone: "9811254765",
				address: "I - 1652, CR Park, Gurgaon.",
			},
		}),
		shruti: await prisma.customer.create({
			data: {
				name: "Shruti Sharma",
				phone: "8130488003",
				address: "JP- 116, Pitampura, New Delhi",
			},
		}),
		alameda: await prisma.customer.create({
			data: {
				name: "Alameda Arora",
				phone: "9896450904",
				address: "Shree sai BPCL petrol pump, Sec 91, Gurugram.",
			},
		}),
		kanchan: await prisma.customer.create({
			data: {
				name: "Kanchan Neb",
				phone: "9811823671",
				address: "17 - DLF phase 1, Gurugram",
			},
		}),
		arpana: await prisma.customer.create({
			data: {
				name: "Arpana Bansal",
				phone: "9810634923",
				address: "Ishaan Hospital, 3rd floor, 1/8B,",
			},
		}),
		roshni: await prisma.customer.create({
			data: {
				name: "Roshni",
				phone: "9650966000",
				address: "12, DLF farms, near Sultanpur metro station.",
			},
		}),
		geeta: await prisma.customer.create({
			data: {
				name: "Geeta Malhotra",
				phone: "9811078231",
				address: "25, Shakuntala farms,",
			},
		}),
		kiit: await prisma.customer.create({
			data: {
				name: "KIIT University",
				phone: "9711818181",
				address: "Badshahpur Sohna Rd, Bhondsi,",
			},
		}),
	};
	console.log(`✅ Created ${Object.keys(c).length} unique customers`);

	// ─── STF Subscriptions ────────────────────────────────────
	const stfSubs = await Promise.all([
		prisma.subscription.create({
			data: {
				customerId: c.sudha.id,
				type: "STF",
				package: "Pax 1 Quarterly",
				actualPrice: 15000,
				offerPrice: 10000,
				paymentTerms: "Full amount paid",
				totalQuantity: 80,
				deliveredQty: 68.05,
				totalDeliveries: 24,
				deliveredBasket: 20,
				pendingKgs: 11.95,
				nextRenewal: new Date("2026-03-18"),
				status: "active",
			},
		}),
		prisma.subscription.create({
			data: {
				customerId: c.smita.id,
				type: "STF",
				package: "Pax 2 Quarterly",
				actualPrice: 30000,
				offerPrice: 24000,
				paymentTerms: "12000 pending",
				totalQuantity: 150,
				deliveredQty: 72.8,
				totalDeliveries: 24,
				deliveredBasket: 10,
				pendingKgs: 77.2,
				nextRenewal: new Date("2026-04-02"),
				status: "active",
			},
		}),
		prisma.subscription.create({
			data: {
				customerId: c.sukriti.id,
				type: "STF",
				package: "Pax 1 Quarterly",
				actualPrice: 15000,
				offerPrice: 12000,
				paymentTerms: "Full amount paid",
				totalQuantity: 80,
				deliveredQty: 79.75,
				totalDeliveries: 24,
				deliveredBasket: 11,
				pendingKgs: 0.25,
				nextRenewal: new Date("2026-03-14"),
				status: "active",
			},
		}),
		prisma.subscription.create({
			data: {
				customerId: c.suman.id,
				type: "STF",
				package: "Pax 2 Quarterly",
				actualPrice: 30000,
				offerPrice: 22000,
				paymentTerms: "Full amount paid",
				totalQuantity: 150,
				deliveredQty: 99.45,
				totalDeliveries: 24,
				deliveredBasket: 11,
				pendingKgs: 50.55,
				nextRenewal: new Date("2026-03-26"),
				status: "active",
			},
		}),
		prisma.subscription.create({
			data: {
				customerId: c.ruchi.id,
				type: "STF",
				package: "Pax 1 Quarterly",
				actualPrice: 15000,
				offerPrice: 12250,
				paymentTerms: "Full amount paid",
				totalQuantity: 80,
				deliveredQty: 51.55,
				totalDeliveries: 24,
				deliveredBasket: 16,
				pendingKgs: 28.45,
				status: "active",
			},
		}),
		prisma.subscription.create({
			data: {
				customerId: c.pratima.id,
				type: "STF",
				package: "Pax 1 Quarterly",
				actualPrice: 15000,
				offerPrice: 12250,
				paymentTerms: "Full amount paid",
				totalQuantity: 80,
				deliveredQty: 67.25,
				totalDeliveries: 24,
				deliveredBasket: 16,
				pendingKgs: 12.75,
				nextRenewal: new Date("2026-03-19"),
				status: "active",
			},
		}),
		prisma.subscription.create({
			data: {
				customerId: c.kshamata.id,
				type: "STF",
				package: "Pax 1 Quarterly",
				actualPrice: 15000,
				offerPrice: 12250,
				paymentTerms: "Full amount paid",
				totalQuantity: 80,
				deliveredQty: 67.1,
				totalDeliveries: 24,
				deliveredBasket: 8,
				pendingKgs: 12.9,
				nextRenewal: new Date("2026-03-19"),
				status: "active",
			},
		}),
		prisma.subscription.create({
			data: {
				customerId: c.ivan.id,
				type: "STF",
				package: "Pax 1 Quarterly",
				actualPrice: 15000,
				offerPrice: 15000,
				paymentTerms: "Full amount paid",
				totalQuantity: 80,
				deliveredQty: 28.95,
				totalDeliveries: 24,
				deliveredBasket: 9,
				pendingKgs: 51.05,
				nextRenewal: new Date("2026-04-09"),
				status: "active",
			},
		}),
		// Anita Kinra Suneja — combined KG+STF (appears identically in both sheets)
		prisma.subscription.create({
			data: {
				customerId: c.anita_kinra.id,
				type: "KG + STF",
				package: "Pax 2 Quarterly & KG service maintenance",
				offerPrice: 36000,
				paymentTerms: "Full amount paid",
				totalQuantity: 150,
				deliveredQty: 69.15,
				totalDeliveries: 24,
				deliveredBasket: 14,
				pendingKgs: 80.85,
				nextRenewal: new Date("2026-04-08"),
				status: "active",
			},
		}),
		prisma.subscription.create({
			data: {
				customerId: c.naresh.id,
				type: "STF",
				package: "Pax 2 Quarterly",
				actualPrice: 30000,
				offerPrice: 22000,
				paymentTerms: "Full amount paid",
				totalQuantity: 150,
				deliveredQty: 13,
				totalDeliveries: 24,
				deliveredBasket: 2,
				pendingKgs: 137,
				nextRenewal: new Date("2026-04-19"),
				status: "active",
			},
		}),
		prisma.subscription.create({
			data: {
				customerId: c.navneet.id,
				type: "STF",
				package: "Pax 1 Quarterly",
				actualPrice: 15000,
				offerPrice: 12250,
				paymentTerms: "Full amount paid",
				totalQuantity: 150,
				deliveredQty: 44.95,
				totalDeliveries: 24,
				deliveredBasket: 6,
				pendingKgs: 105.05,
				nextRenewal: new Date("2026-04-09"),
				status: "active",
			},
		}),
		prisma.subscription.create({
			data: {
				customerId: c.suprateek.id,
				type: "STF",
				package: "Pax 2 Quarterly",
				actualPrice: 30000,
				offerPrice: 20000,
				paymentTerms: "Full amount paid",
				totalQuantity: 150,
				deliveredQty: 64.05,
				totalDeliveries: 24,
				deliveredBasket: 10,
				pendingKgs: 85.95,
				nextRenewal: new Date("2026-04-04"),
				status: "active",
			},
		}),
		prisma.subscription.create({
			data: {
				customerId: c.namrata.id,
				type: "STF",
				package: "Pax 1 Monthly trail",
				actualPrice: 8000,
				offerPrice: 4000,
				paymentTerms: "Full amount paid",
				totalQuantity: 24,
				deliveredQty: 24,
				totalDeliveries: 8,
				deliveredBasket: 8,
				pendingKgs: 0,
				nextRenewal: new Date("2026-03-12"),
				status: "active",
			},
		}),
		prisma.subscription.create({
			data: {
				customerId: c.anita_gauri.id,
				type: "STF",
				package: "Pax 2 Quarterly",
				actualPrice: 30000,
				offerPrice: 20000,
				paymentTerms: "Full amount paid",
				totalQuantity: 150,
				deliveredQty: 37.65,
				totalDeliveries: 24,
				deliveredBasket: 5,
				pendingKgs: 112.35,
				nextRenewal: new Date("2026-04-12"),
				status: "active",
			},
		}),
		prisma.subscription.create({
			data: {
				customerId: c.reema.id,
				type: "STF",
				package: "Pax 2 Quarterly",
				actualPrice: 30000,
				offerPrice: 22000,
				paymentTerms: "Full amount paid",
				totalQuantity: 150,
				deliveredQty: 41.2,
				totalDeliveries: 24,
				deliveredBasket: 5,
				pendingKgs: 108.8,
				nextRenewal: new Date("2026-04-12"),
				status: "active",
			},
		}),
		// Ananya Kamrah — STF subscription
		prisma.subscription.create({
			data: {
				customerId: c.ananya.id,
				type: "STF",
				package: "Pax 2 Quarterly",
				actualPrice: 30000,
				offerPrice: 30000,
				paymentTerms: "Full amount paid",
				totalQuantity: 150,
				deliveredQty: 30.95,
				totalDeliveries: 24,
				deliveredBasket: 5,
				pendingKgs: 119.05,
				nextRenewal: new Date("2026-04-16"),
				status: "active",
			},
		}),
		prisma.subscription.create({
			data: {
				customerId: c.preet.id,
				type: "STF",
				package: "Pax 1 Monthly trail",
				actualPrice: 8000,
				offerPrice: 4000,
				paymentTerms: "Full amount paid",
				totalQuantity: 24,
				deliveredQty: 12.65,
				totalDeliveries: 8,
				deliveredBasket: 4,
				pendingKgs: 11.35,
				nextRenewal: new Date("2026-03-19"),
				status: "active",
			},
		}),
		prisma.subscription.create({
			data: {
				customerId: c.samip.id,
				type: "STF",
				package: "Pax 1 Quarterly",
				actualPrice: 15000,
				offerPrice: 10000,
				paymentTerms: "Full amount paid",
				totalQuantity: 80,
				deliveredQty: 23.85,
				totalDeliveries: 24,
				deliveredBasket: 3,
				pendingKgs: 56.15,
				nextRenewal: new Date("2026-04-12"),
				status: "active",
			},
		}),
		prisma.subscription.create({
			data: {
				customerId: c.shobna.id,
				type: "STF",
				package: "Pax 1 Quarterly",
				actualPrice: 15000,
				offerPrice: 12000,
				paymentTerms: "Full amount paid",
				totalQuantity: 80,
				deliveredQty: 19.95,
				totalDeliveries: 24,
				deliveredBasket: 3,
				pendingKgs: 60.05,
				nextRenewal: new Date("2026-03-16"),
				status: "active",
			},
		}),
		prisma.subscription.create({
			data: {
				customerId: c.gunjan.id,
				type: "STF",
				package: "Pax 2 Quarterly",
				actualPrice: 30000,
				offerPrice: 22000,
				paymentTerms: "Full amount paid",
				totalQuantity: 150,
				deliveredQty: 0,
				totalDeliveries: 24,
				deliveredBasket: 0,
				pendingKgs: 150,
				nextRenewal: new Date("2026-06-03"),
				status: "active",
			},
		}),
	]);
	console.log(`✅ Created ${stfSubs.length} STF/combined subscriptions`);

	// ─── KG Subscriptions ─────────────────────────────────────
	// Anita Kinra Suneja's KG+STF combined subscription already created above
	// Neelima Kamrah (KG sheet) = Ananya Kamrah (same phone 9711818181 + same address) → KG sub for ananya
	const kgSubs = await Promise.all([
		prisma.subscription.create({
			data: {
				customerId: c.shrey.id,
				type: "KG",
				package: "30 Grow bags- Service and maintenance",
				offerPrice: 30000,
				status: "active",
			},
		}),
		prisma.subscription.create({
			data: {
				customerId: c.shruti.id,
				type: "KG",
				package: "8 Grow bags service and maintenance",
				offerPrice: 12000,
				paymentTerms: "Full amount paid",
				status: "active",
			},
		}),
		prisma.subscription.create({
			data: {
				customerId: c.alameda.id,
				type: "Land",
				package: "KG yearly package",
				offerPrice: 120000,
				paymentTerms:
					"30K received and rest 90k to be paid as 30K for each month.",
				status: "active",
			},
		}),
		prisma.subscription.create({
			data: {
				customerId: c.kanchan.id,
				type: "KG",
				package: "KG service and maintenance",
				offerPrice: 14000,
				paymentTerms: "Full amount paid",
				status: "active",
			},
		}),
		prisma.subscription.create({
			data: {
				customerId: c.arpana.id,
				type: "KG",
				package: "KG service",
				offerPrice: 16000,
				paymentTerms: "Full amount paid",
				status: "active",
			},
		}),
		// Neelima Kamrah = Ananya Kamrah → KG subscription for the same customer
		prisma.subscription.create({
			data: {
				customerId: c.ananya.id,
				type: "KG",
				package: "KG service",
				offerPrice: 65000,
				status: "active",
			},
		}),
		prisma.subscription.create({
			data: {
				customerId: c.roshni.id,
				type: "Land",
				package: "2000 Sq mt",
				offerPrice: 130000,
				paymentTerms: "Advance 54000 received",
				status: "active",
			},
		}),
		prisma.subscription.create({
			data: {
				customerId: c.geeta.id,
				type: "KG",
				package: "10 Grow bags",
				offerPrice: 75000,
				paymentTerms: "37500 received",
				status: "active",
			},
		}),
		prisma.subscription.create({
			data: {
				customerId: c.kiit.id,
				type: "landscape",
				package: "Landscaping & KG",
				offerPrice: 130000,
				paymentTerms: "32500 per month",
				status: "active",
			},
		}),
	]);
	console.log(`✅ Created ${kgSubs.length} KG/Land subscriptions`);

	// ─── Sample Orders ────────────────────────────────────────
	await prisma.order.create({
		data: {
			customerId: c.sudha.id,
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

	await prisma.order.create({
		data: {
			customerId: c.smita.id,
			items: [
				{ name: "Organic Apples", qty: 1, unit: "kg", price: 250 },
				{ name: "Broccoli", qty: 0.5, unit: "kg", price: 80 },
			],
			totalAmount: 330,
			status: "confirmed",
			deliveryDate: new Date("2026-03-22"),
		},
	});

	await prisma.order.create({
		data: {
			customerId: c.sukriti.id,
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
	console.log(`✅ Created 3 sample orders`);

	// ─── Sample Deliveries (linked to subscriptions) ──────────
	await prisma.delivery.create({
		data: {
			subscriptionId: stfSubs[0].id, // Sudha's STF subscription
			deliveredQty: 3.5,
			date: new Date("2026-03-18"),
			status: "delivered",
			driverName: "Harpreet Singh",
		},
	});

	await prisma.delivery.create({
		data: {
			subscriptionId: stfSubs[1].id, // Smita's STF subscription
			deliveredQty: 7.5,
			date: new Date("2026-03-22"),
			status: "scheduled",
			driverName: "Gurpreet Kaur",
		},
	});
	console.log(`✅ Created sample deliveries`);

	// ─── Sample Kitchen Gardens (linked to subscriptions) ─────
	const kg1 = await prisma.kitchenGarden.create({
		data: {
			subscriptionId: stfSubs[8].id, // Anita Kinra's KG+STF subscription
			setupDate: new Date("2026-01-15"),
			location: "Garden area",
			gardenSize: "6x4 ft",
			status: "active",
			maintenanceCycle: "monthly",
			notes: "Herbs and leafy vegetables",
		},
	});

	await prisma.kitchenGarden.create({
		data: {
			subscriptionId: kgSubs[0].id, // Shrey's KG subscription
			setupDate: new Date("2026-02-10"),
			location: "Rooftop",
			gardenSize: "30 grow bags",
			status: "active",
			maintenanceCycle: "monthly",
			notes: "30 grow bags setup with regular maintenance",
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
			customerId: c.sudha.id,
			amount: 10000,
			method: "upi",
			status: "completed",
			reference: "UPI-REF-20260318-001",
			date: new Date("2026-03-18"),
		},
	});
	await prisma.payment.create({
		data: {
			customerId: c.smita.id,
			amount: 12000,
			method: "cash",
			status: "completed",
			date: new Date("2026-03-15"),
			notes: "Partial payment — 12000 pending",
		},
	});
	await prisma.payment.create({
		data: {
			customerId: c.sukriti.id,
			amount: 12000,
			method: "bank_transfer",
			status: "completed",
			reference: "NEFT-20260320-789",
			date: new Date("2026-03-20"),
		},
	});
	console.log(`✅ Created payments`);

	// ─── Random Plans + Vegetable Limits ──────────────────────
	const planTypes = ["STF", "Kitchen Garden"];
	const packageNames = [
		"Quarterly",
		"Monthly",
		"50 Grow Bags",
		"100 Grow Bags",
	];
	const paymentTermsList = ["50% advance", "Full payment", "Monthly billing"];

	const rand = (min: number, max: number) =>
		Math.floor(Math.random() * (max - min + 1)) + min;
	const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

	// Piece-based vegetable IDs: Broccoli=4, Cabbage=5, Cauliflower=6, Lettuce=13, Bottle Gourd=17
	const pieceVegIds = [4, 5, 6, 13, 17];
	// Kg-based vegetable IDs: Spinach=1, Coriander=2, Fenugreek=3, Peas=7, Beans=8, Carrot=11
	const kgVegIds = [1, 2, 3, 7, 8, 11];

	const allCustomerIds = Object.values(c).map((cust) => cust.id);

	let planCount = 0;
	for (const custId of allCustomerIds) {
		// ~70% of customers get a plan
		if (Math.random() > 0.7) continue;

		const totalQty = rand(50, 150);
		const planType = pick(planTypes);

		// Update subscription pricing if one exists
		const existingSub = await prisma.subscription.findFirst({
			where: { customerId: custId },
			orderBy: { createdAt: "desc" },
		});

		if (existingSub) {
			const actualPrice = rand(10000, 50000);
			await prisma.subscription.update({
				where: { id: existingSub.id },
				data: {
					actualPrice,
					offerPrice: Math.round(actualPrice * (0.75 + Math.random() * 0.2)),
					paymentTerms: pick(paymentTermsList),
				},
			});
		}

		// Create plan
		const plan = await prisma.customerPlan.create({
			data: {
				customerId: custId,
				totalQty: totalQty,
				label: planType,
			},
		});

		// Add 2–4 random vegetable limits
		const numLimits = rand(2, 4);
		const selectedPiece = pieceVegIds
			.sort(() => Math.random() - 0.5)
			.slice(0, Math.min(rand(1, 2), numLimits));
		const selectedKg = kgVegIds
			.sort(() => Math.random() - 0.5)
			.slice(0, numLimits - selectedPiece.length);

		const limitsData = [
			...selectedPiece.map((vId) => ({
				planId: plan.id,
				vegetableId: vId,
				maxQtyKg: null as number | null,
				maxQtyPiece: rand(10, 60),
			})),
			...selectedKg.map((vId) => ({
				planId: plan.id,
				vegetableId: vId,
				maxQtyKg: rand(5, 30),
				maxQtyPiece: null as number | null,
			})),
		];

		await prisma.vegetableLimit.createMany({ data: limitsData });
		planCount++;
	}
	console.log(`✅ Created ${planCount} customer plans with vegetable limits`);

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
