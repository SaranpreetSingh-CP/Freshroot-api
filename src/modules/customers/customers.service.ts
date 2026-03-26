import {
	Injectable,
	NotFoundException,
	ConflictException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service.js";
import { CreateCustomerDto, UpdateCustomerDto } from "./dto/index.js";

@Injectable()
export class CustomersService {
	constructor(private readonly prisma: PrismaService) {}

	/** Normalize phone (trim) and email (trim + lowercase) */
	private normalizeContact(data: { phone?: string; email?: string | null }) {
		if (data.phone) data.phone = data.phone.trim();
		if (data.email) data.email = data.email.trim().toLowerCase();
	}

	/** Check if another customer already has this phone+email combo */
	private async checkDuplicate(
		phone: string,
		email: string | null | undefined,
		excludeId?: number,
	) {
		const where: any = { phone, email: email ?? null };
		if (excludeId) where.NOT = { id: excludeId };
		const existing = await this.prisma.customer.findFirst({ where });
		if (existing) {
			throw new ConflictException(
				"Customer with this phone and email already exists",
			);
		}
	}

	/** Catch Prisma unique constraint violation and return friendly error */
	private handleUniqueError(error: any): never {
		if (error?.code === "P2002") {
			throw new ConflictException(
				"Customer with this phone and email already exists",
			);
		}
		throw error;
	}
	/** Default include for plan + vegetable limits */
	private readonly planInclude = {
		plans: {
			orderBy: { createdAt: "desc" as const },
			take: 1,
			include: {
				limits: {
					include: { vegetable: { select: { name: true, unit: true } } },
				},
			},
		},
	};

	/** Map a customer record (with plans relation) to a clean response */
	private mapCustomerResponse(customer: any) {
		const plan = customer.plans?.[0] ?? null;

		return {
			id: customer.id,
			name: customer.name,
			phone: customer.phone,
			email: customer.email,
			address: customer.address,
			createdAt: customer.createdAt,
			plan: plan
				? {
						id: plan.id,
						totalQty: plan.totalQty,
						type: plan.label ?? null,
					}
				: null,
			vegetableLimits: plan?.limits
				? plan.limits.map((l: any) => ({
						vegetableId: l.vegetableId,
						vegetableName: l.vegetable.name,
						limitQty:
							l.vegetable.unit === "piece"
								? (l.maxQtyPiece ?? 0)
								: (l.maxQtyKg ?? 0),
						unit: l.vegetable.unit ?? "kg",
					}))
				: [],
		};
	}
	async create(dto: CreateCustomerDto) {
		const { subscription, plan, ...customerData } = dto;
		this.normalizeContact(customerData);
		await this.checkDuplicate(customerData.phone, customerData.email);

		try {
			const result = await this.prisma.$transaction(async (tx) => {
				const customer = await tx.customer.create({ data: customerData });

				// ── Subscription ─────────────────────────────────
				let sub: any = null;
				if (subscription) {
					const subData: any = {
						customerId: customer.id,
						type: subscription.type,
						package: subscription.package,
						offerPrice: subscription.offerPrice,
						status: subscription.status ?? "active",
					};
					if (subscription.actualPrice != null)
						subData.actualPrice = subscription.actualPrice;
					if (subscription.paymentTerms)
						subData.paymentTerms = subscription.paymentTerms;
					if (subscription.totalQuantity != null)
						subData.totalQuantity = subscription.totalQuantity;
					if (subscription.totalDeliveries != null)
						subData.totalDeliveries = subscription.totalDeliveries;
					if (subscription.startDate)
						subData.startDate = new Date(subscription.startDate);
					if (subscription.endDate)
						subData.endDate = new Date(subscription.endDate);
					if (subscription.remarks) subData.remarks = subscription.remarks;
					sub = await tx.subscription.create({ data: subData });
				}

				// ── Plan + VegetableLimits ───────────────────────
				let createdPlan: any = null;
				if (plan) {
					createdPlan = await tx.customerPlan.create({
						data: {
							customerId: customer.id,
							totalQty: plan.totalQty,
							label: plan.label,
							...(plan.limits?.length && {
								limits: {
									create: plan.limits.map((l) => ({
										vegetableId: l.vegetableId,
										maxQtyKg: l.maxQtyKg,
										maxQtyPiece: l.maxQtyPiece,
									})),
								},
							}),
						},
						include: {
							limits: { include: { vegetable: { select: { name: true } } } },
						},
					});
				}

				// Re-fetch full customer with plan+limits for response
				const full = await tx.customer.findUnique({
					where: { id: customer.id },
					include: this.planInclude,
				});

				return { customer: full, subscription: sub, plan: createdPlan };
			});

			return this.mapCustomerResponse(result.customer);
		} catch (error) {
			this.handleUniqueError(error);
		}
	}

	async findAll() {
		const customers = await this.prisma.customer.findMany({
			include: {
				subscriptions: true,
				...this.planInclude,
			},
			orderBy: { createdAt: "desc" },
		});
		return customers.map((c) => this.mapCustomerResponse(c));
	}

	async getCustomerDetails(id: number) {
		const customer = await this.prisma.customer.findUnique({
			where: { id },
		});
		if (!customer) throw new NotFoundException("Customer not found");

		const [rawSubscriptions, pastOrders] = await Promise.all([
			this.prisma.subscription.findMany({
				where: { customerId: id },
				select: {
					id: true,
					type: true,
					package: true,
					status: true,
					startDate: true,
				},
			}),
			this.prisma.order.findMany({
				where: {
					customerId: id,
					status: { in: ["DELIVERED", "CANCELLED", "SKIPPED"] },
				},
				orderBy: { deliveryDate: "desc" },
				select: {
					id: true,
					items: true,
					totalAmount: true,
					deliveryDate: true,
					status: true,
					orderItems: {
						select: {
							quantity: true,
							unit: true,
							vegetable: { select: { name: true } },
						},
					},
				},
			}),
		]);

		const subscriptions = rawSubscriptions.map((s) => ({
			...s,
			startDate: s.startDate ?? customer.createdAt,
		}));

		// Calculate consumed quantity from DELIVERED orders only
		let totalKg = 0;
		const piecesMap: Record<string, number> = {};
		for (const o of pastOrders) {
			if (o.status !== "DELIVERED") continue;

			// Prefer normalized orderItems, fall back to legacy JSON items
			const itemsList: { name?: string; quantity: number; unit: string }[] =
				o.orderItems.length > 0
					? o.orderItems.map((oi) => ({
							name: (oi as any).vegetable?.name,
							quantity: oi.quantity,
							unit: oi.unit,
						}))
					: Array.isArray(o.items)
						? (o.items as any[])
						: [];

			for (const item of itemsList) {
				const unit = (item.unit ?? "kg").toLowerCase();
				if (unit === "piece" || unit === "pieces" || unit === "pc") {
					const name = item.name ?? "Unknown";
					piecesMap[name] = (piecesMap[name] ?? 0) + (item.quantity ?? 0);
				} else {
					totalKg += item.quantity ?? 0;
				}
			}
		}

		const consumedQuantity = {
			kg: Math.round(totalKg * 100) / 100,
			pieces: piecesMap,
		};

		return {
			customer: {
				id: customer.id,
				name: customer.name,
				email: customer.email,
				phone: customer.phone,
				address: customer.address,
				createdAt: customer.createdAt,
			},
			subscriptions,
			consumedQuantity,
			pastOrders: pastOrders.map((o) => ({
				id: o.id,
				items: o.items,
				total: o.totalAmount,
				date: o.deliveryDate,
				status: o.status,
			})),
		};
	}

	async findOne(id: number) {
		const customer = await this.prisma.customer.findUnique({
			where: { id },
			include: {
				subscriptions: {
					include: { kitchenGarden: true, deliveries: true },
				},
				orders: true,
				payments: true,
				...this.planInclude,
			},
		});
		if (!customer) throw new NotFoundException("Customer not found");
		return this.mapCustomerResponse(customer);
	}

	async update(id: number, dto: UpdateCustomerDto) {
		const existing = await this.findOne(id);

		const { subscription, plan, ...customerData } = dto;
		this.normalizeContact(customerData);

		// If phone or email is changing, check uniqueness of the new combo
		const newPhone = customerData.phone ?? existing.phone;
		const newEmail =
			customerData.email !== undefined ? customerData.email : existing.email;
		if (customerData.phone !== undefined || customerData.email !== undefined) {
			await this.checkDuplicate(newPhone, newEmail, id);
		}

		try {
			// Update customer fields
			const customer = await this.prisma.customer.update({
				where: { id },
				data: customerData,
				include: { subscriptions: true },
			});

			let updatedSub: any = null;

			if (subscription) {
				const subData: any = { ...subscription };
				delete subData.id;
				if (subscription.startDate)
					subData.startDate = new Date(subscription.startDate);
				if (subscription.endDate)
					subData.endDate = new Date(subscription.endDate);
				if (subscription.nextRenewal)
					subData.nextRenewal = new Date(subscription.nextRenewal);

				if (subscription.id) {
					updatedSub = await this.prisma.subscription.update({
						where: { id: subscription.id },
						data: subData,
					});
				} else {
					subData.customerId = id;
					updatedSub = await this.prisma.subscription.create({
						data: subData,
					});
				}
			}

			// ── Plan update (replace limits) ────────────────────
			let updatedPlan: any = null;
			if (plan) {
				// Find latest plan for this customer
				const existingPlan = await this.prisma.customerPlan.findFirst({
					where: { customerId: id },
					orderBy: { createdAt: "desc" },
				});

				if (existingPlan) {
					// Update totalQty / label
					const planUpdateData: any = {};
					if (plan.totalQty != null) planUpdateData.totalQty = plan.totalQty;
					if (plan.label !== undefined) planUpdateData.label = plan.label;

					await this.prisma.customerPlan.update({
						where: { id: existingPlan.id },
						data: planUpdateData,
					});

					// Replace limits if provided
					if (plan.limits !== undefined) {
						await this.prisma.vegetableLimit.deleteMany({
							where: { planId: existingPlan.id },
						});
						if (plan.limits.length > 0) {
							await this.prisma.vegetableLimit.createMany({
								data: plan.limits.map((l) => ({
									planId: existingPlan.id,
									vegetableId: l.vegetableId,
									maxQtyKg: l.maxQtyKg,
									maxQtyPiece: l.maxQtyPiece,
								})),
							});
						}
					}

					updatedPlan = await this.prisma.customerPlan.findUnique({
						where: { id: existingPlan.id },
						include: {
							limits: {
								include: { vegetable: { select: { name: true } } },
							},
						},
					});
				} else {
					// No existing plan → create new
					updatedPlan = await this.prisma.customerPlan.create({
						data: {
							customerId: id,
							totalQty: plan.totalQty ?? 0,
							label: plan.label,
							...(plan.limits?.length && {
								limits: {
									create: plan.limits.map((l) => ({
										vegetableId: l.vegetableId,
										maxQtyKg: l.maxQtyKg,
										maxQtyPiece: l.maxQtyPiece,
									})),
								},
							}),
						},
						include: {
							limits: {
								include: { vegetable: { select: { name: true } } },
							},
						},
					});
				}
			}

			// Re-fetch full customer with plan+limits for response
			const full = await this.prisma.customer.findUnique({
				where: { id },
				include: this.planInclude,
			});

			return this.mapCustomerResponse(full);
		} catch (error) {
			this.handleUniqueError(error);
		}
	}

	// ─── GET PLAN WITH LIMITS ───────────────────────────────────
	async getPlan(customerId: number) {
		await this.findOne(customerId); // ensure customer exists

		const plan = await this.prisma.customerPlan.findFirst({
			where: { customerId },
			orderBy: { createdAt: "desc" },
			include: {
				limits: {
					include: { vegetable: { select: { name: true } } },
				},
			},
		});

		if (!plan) {
			throw new NotFoundException(`No plan found for customer #${customerId}`);
		}

		return {
			id: plan.id,
			totalQty: plan.totalQty,
			label: plan.label,
			limits: plan.limits.map((l) => ({
				vegetableId: l.vegetableId,
				vegetableName: l.vegetable.name,
				maxQtyKg: l.maxQtyKg,
				maxQtyPiece: l.maxQtyPiece,
			})),
		};
	}

	async remove(id: number) {
		await this.findOne(id);
		await this.prisma.customer.delete({ where: { id } });
		return { message: "Customer deleted successfully" };
	}
}
