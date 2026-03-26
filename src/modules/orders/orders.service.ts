import {
	Injectable,
	NotFoundException,
	BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service.js";
import {
	CreateOrderDto,
	UpdateOrderDto,
	normalizeOrderStatus,
	getComputedStatus,
} from "./dto/index.js";
import type { Prisma } from "../../../generated/prisma/client.js";

@Injectable()
export class OrdersService {
	constructor(private readonly prisma: PrismaService) {}

	// ─── Helper: calculate totalQty from items ──────────────────
	private calcTotalQty(items: { quantity?: number; qty?: number }[]): number {
		return (
			Math.round(
				items.reduce((sum, i) => sum + (i.quantity ?? (i as any).qty ?? 0), 0) *
					100,
			) / 100
		);
	}

	// ─── Helper: today at midnight ──────────────────────────────
	private today(): Date {
		const d = new Date();
		d.setHours(0, 0, 0, 0);
		return d;
	}

	/** Resolve & validate items — look up vegetableId if provided */
	private async resolveItems(items: CreateOrderDto["items"]) {
		const resolved: {
			vegetableId?: number;
			name: string;
			quantity: number;
			unit: string;
		}[] = [];

		for (const item of items) {
			if (item.vegetableId) {
				const veg = await this.prisma.vegetable.findUnique({
					where: { id: item.vegetableId },
				});
				if (!veg) {
					throw new BadRequestException(
						`Vegetable with id ${item.vegetableId} not found`,
					);
				}
				resolved.push({
					vegetableId: veg.id,
					name: item.name ?? veg.name,
					quantity: item.quantity,
					unit: item.unit,
				});
			} else {
				resolved.push({
					name: item.name ?? item.itemName ?? "",
					quantity: item.quantity,
					unit: item.unit,
				});
			}
		}
		return resolved;
	}

	/** Create OrderItem records from resolved items */
	private buildOrderItemCreates(
		items: { vegetableId?: number; quantity: number; unit: string }[],
	) {
		return items
			.filter((i) => i.vegetableId != null)
			.map((i) => ({
				vegetableId: i.vegetableId!,
				quantity: i.quantity,
				unit: i.unit,
			}));
	}

	async create(dto: CreateOrderDto) {
		const normalizedItems = await this.resolveItems(dto.items);
		const totalAmount = dto.total ?? dto.totalAmount ?? 0;
		const status = normalizeOrderStatus(dto.status) ?? "PENDING";
		const totalQty = this.calcTotalQty(normalizedItems);

		// Accept both "date" and "deliveryDate"; normalize to start-of-day
		const deliveryDate = new Date(dto.date ?? dto.deliveryDate ?? new Date());
		deliveryDate.setHours(0, 0, 0, 0);

		// ── Plan validations ────────────────────────────────────
		await this.validatePlanQty(dto.customerId, totalQty);
		await this.validateVegetableLimits(dto.customerId, normalizedItems);

		const orderItemCreates = this.buildOrderItemCreates(normalizedItems);

		return this.prisma.order.create({
			data: {
				customerId: dto.customerId,
				items: normalizedItems as unknown as Prisma.InputJsonValue,
				totalAmount,
				totalQty,
				status,
				deliveryDate,
				notes: dto.notes,
				...(orderItemCreates.length > 0 && {
					orderItems: { create: orderItemCreates },
				}),
			},
			include: { customer: true, orderItems: { include: { vegetable: true } } },
		});
	}

	/** Attach computedStatus to an order */
	private withComputedStatus<T extends { deliveryDate: Date; status: string }>(
		order: T,
	) {
		return { ...order, computedStatus: getComputedStatus(order) };
	}

	async findAll() {
		const orders = await this.prisma.order.findMany({
			include: { customer: true, orderItems: { include: { vegetable: true } } },
			orderBy: { createdAt: "desc" },
		});
		return orders.map((o) => this.withComputedStatus(o));
	}

	async findOne(id: string) {
		const order = await this.prisma.order.findUnique({
			where: { id },
			include: { customer: true, orderItems: { include: { vegetable: true } } },
		});
		if (!order) throw new NotFoundException("Order not found");
		return this.withComputedStatus(order);
	}

	async update(id: string, dto: UpdateOrderDto) {
		const existing = await this.findOne(id);

		// ── Prevent editing past / delivered orders ──────────────
		if (existing.status === "DELIVERED") {
			throw new BadRequestException("Cannot edit a delivered order");
		}
		if (existing.status === "SKIPPED") {
			throw new BadRequestException("Cannot edit a skipped order");
		}
		const deliveryDay = new Date(existing.deliveryDate);
		deliveryDay.setHours(0, 0, 0, 0);
		if (deliveryDay < this.today()) {
			throw new BadRequestException("Cannot edit a past order");
		}

		const data: any = {};

		if (dto.customerId != null) data.customerId = dto.customerId;
		if (dto.notes !== undefined) data.notes = dto.notes;

		// Accept both "date" and "deliveryDate"; normalize to start-of-day
		const rawDate = dto.date ?? dto.deliveryDate;
		if (rawDate) {
			const d = new Date(rawDate);
			d.setHours(0, 0, 0, 0);
			data.deliveryDate = d;
		}

		if (dto.status) data.status = normalizeOrderStatus(dto.status);

		// Handle total / totalAmount
		const total = dto.total ?? dto.totalAmount;
		if (total != null) data.totalAmount = total;

		// Handle items update with validation
		if (dto.items) {
			const resolvedItems = await this.resolveItems(dto.items);
			data.items = resolvedItems as unknown as Prisma.InputJsonValue;
			data.totalQty = this.calcTotalQty(resolvedItems);

			// ── Plan quantity check ─────────────────────────────
			const customerId = dto.customerId ?? existing.customerId;
			await this.validatePlanQty(customerId, data.totalQty, id);
			await this.validateVegetableLimits(customerId, resolvedItems, id);

			// Replace OrderItem records
			const orderItemCreates = this.buildOrderItemCreates(resolvedItems);
			await this.prisma.orderItem.deleteMany({ where: { orderId: id } });
			if (orderItemCreates.length > 0) {
				await this.prisma.orderItem.createMany({
					data: orderItemCreates.map((i) => ({ ...i, orderId: id })),
				});
			}
		}

		const updated = await this.prisma.order.update({
			where: { id },
			data,
			include: { customer: true, orderItems: { include: { vegetable: true } } },
		});
		return this.withComputedStatus(updated);
	}

	async updateStatus(id: string, status: string) {
		await this.findOne(id);
		const normalized = normalizeOrderStatus(status) ?? status;
		return this.prisma.order.update({
			where: { id },
			data: { status: normalized },
			include: { customer: true },
		});
	}

	async remove(id: string) {
		await this.findOne(id);
		await this.prisma.order.delete({ where: { id } });
		return { message: "Order deleted successfully" };
	}

	/**
	 * Mark an order as DELIVERED and set deliveredAt timestamp.
	 */
	async markDelivered(id: string) {
		const order = await this.prisma.order.findUnique({ where: { id } });
		if (!order) throw new NotFoundException("Order not found");

		const updated = await this.prisma.order.update({
			where: { id },
			data: {
				status: "DELIVERED",
				deliveredAt: new Date(),
			},
			include: { customer: true },
		});

		return this.withComputedStatus(updated);
	}

	// ─── SKIP DELIVERY ──────────────────────────────────────────
	async skipOrder(id: string) {
		const order = await this.prisma.order.findUnique({ where: { id } });
		if (!order) throw new NotFoundException("Order not found");

		if (order.status === "DELIVERED") {
			throw new BadRequestException("Cannot skip a delivered order");
		}

		const deliveryDay = new Date(order.deliveryDate);
		deliveryDay.setHours(0, 0, 0, 0);
		if (deliveryDay < this.today()) {
			throw new BadRequestException("Cannot skip a past order");
		}

		const updated = await this.prisma.order.update({
			where: { id },
			data: { status: "SKIPPED" },
			include: { customer: true },
		});

		return this.withComputedStatus(updated);
	}

	// ─── DELIVERED ORDERS FOR A CUSTOMER ────────────────────────
	async getDeliveredOrders(customerId: number) {
		const orders = await this.prisma.order.findMany({
			where: { customerId, status: "DELIVERED" },
			orderBy: { deliveryDate: "desc" },
			include: { orderItems: { include: { vegetable: true } } },
		});

		return orders.map((o) => ({
			id: o.id,
			date: o.deliveryDate,
			items:
				o.orderItems.length > 0
					? o.orderItems.map((oi) => ({
							vegetableName: oi.vegetable.name,
							quantity: oi.quantity,
							unit: oi.unit,
						}))
					: (o.items as any[]).map((i) => ({
							vegetableName: i.name ?? "Unknown",
							quantity: i.quantity,
							unit: i.unit,
						})),
			totalQty: o.totalQty ?? this.calcTotalQty(o.items as any[]),
			status: o.status,
		}));
	}

	// ─── UPCOMING DELIVERIES FOR A CUSTOMER ─────────────────────
	async getUpcomingDeliveries(customerId: number, limit?: number) {
		const take = limit && limit > 0 ? limit : undefined;
		const orders = await this.prisma.order.findMany({
			where: {
				customerId,
				deliveryDate: { gte: this.today() },
				status: { notIn: ["DELIVERED", "CANCELLED", "SKIPPED"] },
			},
			orderBy: { deliveryDate: "asc" },
			...(take ? { take } : {}),
			include: { orderItems: { include: { vegetable: true } } },
		});

		return orders.map((o) => ({
			id: o.id,
			date: o.deliveryDate,
			items:
				o.orderItems.length > 0
					? o.orderItems.map((oi) => ({
							vegetableName: oi.vegetable.name,
							quantity: oi.quantity,
							unit: oi.unit,
						}))
					: (o.items as any[]).map((i) => ({
							vegetableName: i.name ?? "Unknown",
							quantity: i.quantity,
							unit: i.unit,
						})),
			totalQty: o.totalQty ?? this.calcTotalQty(o.items as any[]),
			status: o.status,
		}));
	}

	// ─── PLAN USAGE / QUANTITY TRACKING ─────────────────────────
	async getPlanUsage(customerId: number) {
		const plan = await this.prisma.customerPlan.findFirst({
			where: { customerId },
			orderBy: { createdAt: "desc" },
			include: {
				limits: {
					include: { vegetable: { select: { name: true, unit: true } } },
				},
			},
		});

		if (!plan) {
			throw new NotFoundException(`No plan found for customer #${customerId}`);
		}

		// ── Fetch delivered + upcoming orders with item details ──
		const [deliveredOrders, upcomingOrders] = await Promise.all([
			this.prisma.order.findMany({
				where: { customerId, status: "DELIVERED" },
				select: {
					totalQty: true,
					items: true,
					orderItems: {
						select: { vegetableId: true, quantity: true, unit: true },
					},
				},
			}),
			this.prisma.order.findMany({
				where: {
					customerId,
					deliveryDate: { gte: this.today() },
					status: { notIn: ["DELIVERED", "CANCELLED", "SKIPPED"] },
				},
				select: {
					items: true,
					orderItems: {
						select: { vegetableId: true, quantity: true, unit: true },
					},
				},
			}),
		]);

		// ── KG: overall used qty (from delivered orders) ────────
		const usedQty =
			Math.round(
				deliveredOrders.reduce((sum, o) => {
					const qty = o.totalQty ?? this.calcTotalQty(o.items as any[]);
					return sum + qty;
				}, 0) * 100,
			) / 100;

		// ── Per-vegetable usage (delivered + planned) ────────────
		const vegUsageMap = new Map<number, { used: number; planned: number }>();

		const extractItems = (o: {
			items: any;
			orderItems: { vegetableId: number; quantity: number; unit: string }[];
		}) => {
			return o.orderItems.length > 0
				? o.orderItems
				: Array.isArray(o.items)
					? (o.items as any[])
					: [];
		};

		for (const o of deliveredOrders) {
			for (const oi of extractItems(o)) {
				if (oi.vegetableId == null) continue;
				const entry = vegUsageMap.get(oi.vegetableId) ?? {
					used: 0,
					planned: 0,
				};
				entry.used += oi.quantity ?? 0;
				vegUsageMap.set(oi.vegetableId, entry);
			}
		}

		for (const o of upcomingOrders) {
			for (const oi of extractItems(o)) {
				if (oi.vegetableId == null) continue;
				const entry = vegUsageMap.get(oi.vegetableId) ?? {
					used: 0,
					planned: 0,
				};
				entry.planned += oi.quantity ?? 0;
				vegUsageMap.set(oi.vegetableId, entry);
			}
		}

		// ── pieceUsage: only piece-based vegetables with limits ──
		const pieceUsage = plan.limits
			.filter((limit) => limit.vegetable.unit === "piece")
			.map((limit) => {
				const usage = vegUsageMap.get(limit.vegetableId) ?? {
					used: 0,
					planned: 0,
				};
				const limitQty = limit.maxQtyPiece ?? 0;
				const usedQ = Math.round(usage.used);
				const plannedQ = Math.round(usage.planned);
				const remaining = Math.round(limitQty - usedQ - plannedQ);

				return {
					vegetableId: limit.vegetableId,
					vegetableName: limit.vegetable.name,
					limitQty,
					usedQty: usedQ,
					plannedQty: plannedQ,
					remainingQty: remaining,
				};
			})
			.sort(
				(a, b) =>
					b.usedQty + b.plannedQty - (a.usedQty + a.plannedQty) ||
					a.vegetableName.localeCompare(b.vegetableName),
			);

		return {
			totalQty: plan.totalQty,
			usedQty,
			remainingQty: Math.round((plan.totalQty - usedQty) * 100) / 100,
			pieceUsage,
		};
	}

	// ─── VALIDATE ORDER (dry-run) ───────────────────────────────
	async validateOrder(dto: {
		customerId: number;
		items: CreateOrderDto["items"];
	}) {
		const normalizedItems = await this.resolveItems(dto.items);
		const totalQty = this.calcTotalQty(normalizedItems);

		const errors: {
			vegetableId?: number;
			vegetableName?: string;
			message: string;
		}[] = [];

		// ── Check total plan qty ────────────────────────────────
		const plan = await this.prisma.customerPlan.findFirst({
			where: { customerId: dto.customerId },
			orderBy: { createdAt: "desc" },
			include: {
				limits: {
					include: { vegetable: { select: { name: true, unit: true } } },
				},
			},
		});

		if (plan) {
			const orders = await this.prisma.order.findMany({
				where: {
					customerId: dto.customerId,
					status: { notIn: ["CANCELLED", "SKIPPED"] },
				},
				select: { totalQty: true },
			});
			const currentTotal = orders.reduce(
				(sum, o) => sum + (o.totalQty ?? 0),
				0,
			);

			if (currentTotal + totalQty > plan.totalQty) {
				errors.push({
					message: `Exceeds plan limit. Plan: ${plan.totalQty} kg, Already used/planned: ${Math.round(currentTotal * 100) / 100} kg, This order: ${totalQty} kg`,
				});
			}

			// ── Per-vegetable limits ────────────────────────────
			if (plan.limits.length > 0) {
				const limitMap = new Map(plan.limits.map((l) => [l.vegetableId, l]));

				// Fetch delivered + upcoming usage
				const [deliveredOrders, upcomingOrders] = await Promise.all([
					this.prisma.order.findMany({
						where: { customerId: dto.customerId, status: "DELIVERED" },
						select: {
							items: true,
							orderItems: {
								select: { vegetableId: true, quantity: true, unit: true },
							},
						},
					}),
					this.prisma.order.findMany({
						where: {
							customerId: dto.customerId,
							deliveryDate: { gte: this.today() },
							status: { notIn: ["DELIVERED", "CANCELLED", "SKIPPED"] },
						},
						select: {
							items: true,
							orderItems: {
								select: { vegetableId: true, quantity: true, unit: true },
							},
						},
					}),
				]);

				const usageMap = new Map<number, number>();
				for (const o of [...deliveredOrders, ...upcomingOrders]) {
					const ois =
						o.orderItems.length > 0
							? o.orderItems
							: Array.isArray(o.items)
								? (o.items as any[])
								: [];
					for (const oi of ois) {
						if (oi.vegetableId == null) continue;
						usageMap.set(
							oi.vegetableId,
							(usageMap.get(oi.vegetableId) ?? 0) + (oi.quantity ?? 0),
						);
					}
				}

				for (const item of normalizedItems) {
					if (item.vegetableId == null) continue;
					const limit = limitMap.get(item.vegetableId);
					if (!limit) continue;

					const unit = (item.unit ?? "kg").toLowerCase();
					const used = usageMap.get(item.vegetableId) ?? 0;
					const requested = item.quantity ?? 0;

					if (unit === "piece" || unit === "pieces" || unit === "pc") {
						if (
							limit.maxQtyPiece != null &&
							used + requested > limit.maxQtyPiece
						) {
							errors.push({
								vegetableId: item.vegetableId,
								vegetableName: limit.vegetable.name,
								message: `${limit.vegetable.name}: ${used + requested} pieces exceeds limit of ${limit.maxQtyPiece} pieces (used: ${used})`,
							});
						}
					} else {
						if (limit.maxQtyKg != null && used + requested > limit.maxQtyKg) {
							errors.push({
								vegetableId: item.vegetableId,
								vegetableName: limit.vegetable.name,
								message: `${limit.vegetable.name}: ${Math.round((used + requested) * 100) / 100} kg exceeds limit of ${limit.maxQtyKg} kg (used: ${Math.round(used * 100) / 100})`,
							});
						}
					}
				}
			}
		}

		return { valid: errors.length === 0, errors };
	}

	// ─── PLAN QUANTITY VALIDATION ───────────────────────────────
	/**
	 * Check that (total delivered + upcoming planned + thisOrderQty)
	 * does not exceed the customer plan totalQty.
	 * @param excludeOrderId — exclude an order being edited from the sum
	 */
	private async validatePlanQty(
		customerId: number,
		thisOrderQty: number,
		excludeOrderId?: string,
	) {
		const plan = await this.prisma.customerPlan.findFirst({
			where: { customerId },
			orderBy: { createdAt: "desc" },
		});
		if (!plan) return; // no plan → no cap

		// Sum delivered + upcoming (non-terminal) orders
		const orders = await this.prisma.order.findMany({
			where: {
				customerId,
				status: { notIn: ["CANCELLED", "SKIPPED"] },
				...(excludeOrderId && { id: { not: excludeOrderId } }),
			},
			select: { totalQty: true },
		});

		const currentTotal = orders.reduce((sum, o) => sum + (o.totalQty ?? 0), 0);

		if (currentTotal + thisOrderQty > plan.totalQty) {
			throw new BadRequestException(
				`Exceeds plan limit. Plan: ${plan.totalQty} kg, ` +
					`Already used/planned: ${Math.round(currentTotal * 100) / 100} kg, ` +
					`This order: ${thisOrderQty} kg`,
			);
		}
	}

	// ─── PER-VEGETABLE LIMIT VALIDATION ─────────────────────────
	/**
	 * For each item in the order, check against the customer's plan
	 * VegetableLimit. Usage is summed from DELIVERED + upcoming orders.
	 */
	private async validateVegetableLimits(
		customerId: number,
		items: {
			vegetableId?: number;
			name?: string;
			quantity: number;
			unit: string;
		}[],
		excludeOrderId?: string,
	) {
		// Find the latest plan with limits
		const plan = await this.prisma.customerPlan.findFirst({
			where: { customerId },
			orderBy: { createdAt: "desc" },
			include: {
				limits: { include: { vegetable: { select: { name: true } } } },
			},
		});
		if (!plan || plan.limits.length === 0) return; // no limits → no restriction

		// Build a map: vegetableId → limit
		const limitMap = new Map(plan.limits.map((l) => [l.vegetableId, l]));

		// Collect vegetable IDs from this order that have limits
		const vegIdsToCheck = items
			.filter((i) => i.vegetableId != null && limitMap.has(i.vegetableId!))
			.map((i) => i.vegetableId!);

		if (vegIdsToCheck.length === 0) return;

		// Get delivered + upcoming orders for this customer
		const [deliveredOrders, upcomingOrders] = await Promise.all([
			this.prisma.order.findMany({
				where: {
					customerId,
					status: "DELIVERED",
					...(excludeOrderId && { id: { not: excludeOrderId } }),
				},
				select: {
					items: true,
					orderItems: {
						select: { vegetableId: true, quantity: true, unit: true },
					},
				},
			}),
			this.prisma.order.findMany({
				where: {
					customerId,
					deliveryDate: { gte: this.today() },
					status: { notIn: ["DELIVERED", "CANCELLED", "SKIPPED"] },
					...(excludeOrderId && { id: { not: excludeOrderId } }),
				},
				select: {
					items: true,
					orderItems: {
						select: { vegetableId: true, quantity: true, unit: true },
					},
				},
			}),
		]);

		// Sum usage per vegetable from delivered + upcoming orders
		const usageMap = new Map<number, number>();
		for (const o of [...deliveredOrders, ...upcomingOrders]) {
			const orderItems: {
				vegetableId?: number;
				quantity: number;
				unit: string;
			}[] =
				o.orderItems.length > 0
					? o.orderItems
					: Array.isArray(o.items)
						? (o.items as any[])
						: [];
			for (const oi of orderItems) {
				if (oi.vegetableId == null) continue;
				usageMap.set(
					oi.vegetableId,
					(usageMap.get(oi.vegetableId) ?? 0) + (oi.quantity ?? 0),
				);
			}
		}

		// Validate each item against its limit
		const errors: string[] = [];
		for (const item of items) {
			if (item.vegetableId == null) continue;
			const limit = limitMap.get(item.vegetableId);
			if (!limit) continue; // no limit for this vegetable

			const unit = (item.unit ?? "kg").toLowerCase();
			const used = usageMap.get(item.vegetableId) ?? 0;
			const requested = item.quantity ?? 0;

			if (unit === "piece" || unit === "pieces" || unit === "pc") {
				if (limit.maxQtyPiece != null && used + requested > limit.maxQtyPiece) {
					errors.push(
						`${limit.vegetable.name}: ${used + requested} pieces exceeds limit of ${limit.maxQtyPiece} pieces (used: ${used})`,
					);
				}
			} else {
				if (limit.maxQtyKg != null && used + requested > limit.maxQtyKg) {
					errors.push(
						`${limit.vegetable.name}: ${Math.round((used + requested) * 100) / 100} kg exceeds limit of ${limit.maxQtyKg} kg (used: ${Math.round(used * 100) / 100})`,
					);
				}
			}
		}

		if (errors.length > 0) {
			throw new BadRequestException(
				`Vegetable limits exceeded:\n${errors.join("\n")}`,
			);
		}
	}
}
