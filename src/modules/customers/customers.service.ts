import {
	Injectable,
	NotFoundException,
	ConflictException,
	BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service.js";
import { CreateCustomerDto, UpdateCustomerDto } from "./dto/index.js";

@Injectable()
export class CustomersService {
	constructor(private readonly prisma: PrismaService) {}

	// ═════════════════════════════════════════════════════════════
	// HELPERS
	// ═════════════════════════════════════════════════════════════

	private normalizeContact(data: { phone?: string; email?: string | null }) {
		if (data.phone) data.phone = data.phone.trim();
		if (data.email) data.email = data.email.trim().toLowerCase();
	}

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

	private handleUniqueError(error: any): never {
		if (error?.code === "P2002") {
			throw new ConflictException(
				"Customer with this phone and email already exists",
			);
		}
		throw error;
	}

	/** Standard include that pulls latest subscription, plan + limits */
	private readonly fullInclude = {
		subscriptions: {
			orderBy: { createdAt: "desc" as const },
			take: 1,
		},
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

	/** Map DB record → flat API response */
	private mapCustomerResponse(customer: any) {
		const sub = customer.subscriptions?.[0] ?? null;
		const plan = customer.plans?.[0] ?? null;

		return {
			id: customer.id,
			name: customer.name,
			phone: customer.phone,
			email: customer.email,
			address: customer.address,
			status: customer.status ?? "active",
			createdAt: customer.createdAt,
			updatedAt: customer.updatedAt,

			// Subscription
			hasSubscription: !!sub,
			planType: sub?.type ?? null,
			packageName: sub?.package ?? null,
			actualPrice: sub?.actualPrice ?? null,
			offerPrice: sub?.offerPrice ?? null,
			paymentTerms: sub?.paymentTerms ?? null,
			startDate: sub?.startDate ?? customer.createdAt,

			// Plan
			totalQtyKg: plan?.totalQty ?? null,

			// Vegetable limits
			vegetableLimits: plan?.limits
				? plan.limits.map((l: any) => ({
						vegetableId: l.vegetableId,
						vegetableName: l.vegetable.name,
						unit: l.vegetable.unit ?? "kg",
						maxQty:
							(l.vegetable.unit === "piece" ? l.maxQtyPiece : l.maxQtyKg) ?? 0,
					}))
				: [],
		};
	}

	/** Resolve VegetableLimitDto[] → { maxQtyKg, maxQtyPiece } per limit */
	private resolveLimit(l: any, vegUnit?: string) {
		// If flat "maxQty + unit" format was sent
		if (l.maxQty != null && l.unit) {
			return l.unit === "piece"
				? { maxQtyKg: null, maxQtyPiece: Math.round(l.maxQty) }
				: { maxQtyKg: l.maxQty, maxQtyPiece: null };
		}
		// Legacy maxQtyKg / maxQtyPiece format
		return {
			maxQtyKg: l.maxQtyKg ?? null,
			maxQtyPiece: l.maxQtyPiece ?? null,
		};
	}

	/** Validate vegetableIds exist and no duplicates */
	private async validateLimits(limits: { vegetableId: number }[]) {
		const ids = limits.map((l) => l.vegetableId);
		const unique = new Set(ids);
		if (unique.size !== ids.length) {
			throw new BadRequestException("Duplicate vegetableId in limits");
		}
		const count = await this.prisma.vegetable.count({
			where: { id: { in: ids } },
		});
		if (count !== ids.length) {
			throw new BadRequestException("One or more vegetableIds do not exist");
		}
	}

	/**
	 * If the DTO carries a nested `subscription` object (frontend format),
	 * merge its fields into the flat top-level fields so the rest of the
	 * code only deals with one shape.
	 */
	private flattenSubscription(dto: any) {
		if (!dto.subscription) return;
		const sub = dto.subscription;
		if (sub.type !== undefined && dto.planType === undefined)
			dto.planType = sub.type;
		if (sub.package !== undefined && dto.packageName === undefined)
			dto.packageName = sub.package;
		if (sub.actualPrice !== undefined && dto.actualPrice === undefined)
			dto.actualPrice = sub.actualPrice;
		if (sub.offerPrice !== undefined && dto.offerPrice === undefined)
			dto.offerPrice = sub.offerPrice;
		if (sub.paymentTerms !== undefined && dto.paymentTerms === undefined)
			dto.paymentTerms = sub.paymentTerms;
		if (sub.startDate !== undefined && dto.startDate === undefined)
			dto.startDate = sub.startDate;
		if (sub.status !== undefined && dto.status === undefined)
			dto.status = sub.status;
		// Ensure hasSubscription is flagged
		if (dto.hasSubscription === undefined) dto.hasSubscription = true;
		delete dto.subscription;
	}

	/**
	 * If the DTO carries a nested `plan` object (frontend format),
	 * merge plan.totalQty → totalQtyKg.
	 */
	private flattenPlan(dto: any) {
		if (!dto.plan) return;
		if (dto.plan.totalQty !== undefined && dto.totalQtyKg === undefined)
			dto.totalQtyKg = dto.plan.totalQty;
		delete dto.plan;
	}

	/**
	 * Normalise limitQty → maxQty in each vegetable limit
	 * (frontend sends limitQty, backend expects maxQty).
	 */
	private normalizeLimitQty(dto: any) {
		if (!dto.vegetableLimits) return;
		for (const l of dto.vegetableLimits) {
			if (l.limitQty !== undefined && l.maxQty === undefined) {
				l.maxQty = l.limitQty;
			}
			delete l.limitQty;
		}
	}

	// ═════════════════════════════════════════════════════════════
	// CREATE
	// ═════════════════════════════════════════════════════════════

	async create(dto: CreateCustomerDto) {
		this.flattenSubscription(dto);
		this.flattenPlan(dto);
		this.normalizeLimitQty(dto);
		const {
			hasSubscription,
			planType,
			packageName,
			actualPrice,
			offerPrice,
			paymentTerms,
			startDate,
			totalQtyKg,
			vegetableLimits,
			...customerData
		} = dto;

		this.normalizeContact(customerData);
		await this.checkDuplicate(customerData.phone, customerData.email);

		if (vegetableLimits?.length) {
			await this.validateLimits(vegetableLimits);
		}

		try {
			const customer = await this.prisma.$transaction(async (tx) => {
				const cust = await tx.customer.create({
					data: {
						name: customerData.name,
						phone: customerData.phone,
						email: customerData.email,
						address: customerData.address,
						status: customerData.status ?? "active",
					},
				});

				// ── Subscription ─────────────────────────────────
				if (hasSubscription && planType && packageName) {
					await tx.subscription.create({
						data: {
							customerId: cust.id,
							type: planType,
							package: packageName,
							actualPrice: actualPrice ?? null,
							offerPrice: offerPrice ?? 0,
							paymentTerms: paymentTerms ?? null,
							startDate: startDate ? new Date(startDate) : null,
							status: "active",
						},
					});
				}

				// ── Plan + limits ────────────────────────────────
				if (totalQtyKg != null) {
					await tx.customerPlan.create({
						data: {
							customerId: cust.id,
							totalQty: totalQtyKg,
							label: planType ?? null,
							...(vegetableLimits?.length && {
								limits: {
									create: vegetableLimits.map((l) => ({
										vegetableId: l.vegetableId,
										...this.resolveLimit(l),
									})),
								},
							}),
						},
					});
				}

				// Re-fetch with all relations
				return tx.customer.findUnique({
					where: { id: cust.id },
					include: this.fullInclude,
				});
			});

			return this.mapCustomerResponse(customer);
		} catch (error) {
			this.handleUniqueError(error);
		}
	}

	// ═════════════════════════════════════════════════════════════
	// FIND ALL
	// ═════════════════════════════════════════════════════════════

	async findAll() {
		const customers = await this.prisma.customer.findMany({
			include: this.fullInclude,
			orderBy: { createdAt: "desc" },
		});
		return customers.map((c) => this.mapCustomerResponse(c));
	}

	// ═════════════════════════════════════════════════════════════
	// FIND ONE
	// ═════════════════════════════════════════════════════════════

	async findOne(id: number) {
		const customer = await this.prisma.customer.findUnique({
			where: { id },
			include: this.fullInclude,
		});
		if (!customer) throw new NotFoundException("Customer not found");
		return this.mapCustomerResponse(customer);
	}

	// ═════════════════════════════════════════════════════════════
	// UPDATE
	// ═════════════════════════════════════════════════════════════

	async update(id: number, dto: UpdateCustomerDto) {
		const existing = await this.prisma.customer.findUnique({ where: { id } });
		if (!existing) throw new NotFoundException("Customer not found");

		this.flattenSubscription(dto);
		this.flattenPlan(dto);
		this.normalizeLimitQty(dto);

		const {
			hasSubscription,
			planType,
			packageName,
			actualPrice,
			offerPrice,
			paymentTerms,
			startDate,
			totalQtyKg,
			vegetableLimits,
			...customerData
		} = dto;

		this.normalizeContact(customerData);

		const newPhone = customerData.phone ?? existing.phone;
		const newEmail =
			customerData.email !== undefined ? customerData.email : existing.email;
		if (customerData.phone !== undefined || customerData.email !== undefined) {
			await this.checkDuplicate(newPhone, newEmail, id);
		}

		if (vegetableLimits?.length) {
			await this.validateLimits(vegetableLimits);
		}

		try {
			await this.prisma.$transaction(async (tx) => {
				// ── Update customer fields ───────────────────────
				const updateData: any = {};
				if (customerData.name !== undefined)
					updateData.name = customerData.name;
				if (customerData.phone !== undefined)
					updateData.phone = customerData.phone;
				if (customerData.email !== undefined)
					updateData.email = customerData.email;
				if (customerData.address !== undefined)
					updateData.address = customerData.address;
				if (customerData.status !== undefined)
					updateData.status = customerData.status;

				if (Object.keys(updateData).length > 0) {
					await tx.customer.update({ where: { id }, data: updateData });
				}

				// ── Subscription upsert ──────────────────────────
				const hasSub =
					hasSubscription !== undefined
						? hasSubscription
						: planType !== undefined || packageName !== undefined;

				if (hasSub || planType || packageName || offerPrice != null) {
					const existingSub = await tx.subscription.findFirst({
						where: { customerId: id },
						orderBy: { createdAt: "desc" },
					});

					const subData: any = {};
					if (planType !== undefined) subData.type = planType;
					if (packageName !== undefined) subData.package = packageName;
					if (actualPrice !== undefined) subData.actualPrice = actualPrice;
					if (offerPrice !== undefined) subData.offerPrice = offerPrice;
					if (paymentTerms !== undefined) subData.paymentTerms = paymentTerms;
					if (startDate !== undefined)
						subData.startDate = startDate ? new Date(startDate) : null;

					if (existingSub) {
						await tx.subscription.update({
							where: { id: existingSub.id },
							data: subData,
						});
					} else if (planType && packageName) {
						await tx.subscription.create({
							data: {
								customerId: id,
								type: planType,
								package: packageName,
								actualPrice: actualPrice ?? null,
								offerPrice: offerPrice ?? 0,
								paymentTerms: paymentTerms ?? null,
								startDate: startDate ? new Date(startDate) : null,
								status: "active",
							},
						});
					}
				}

				// ── Plan upsert + limits replace ─────────────────
				if (totalQtyKg !== undefined || vegetableLimits !== undefined) {
					const existingPlan = await tx.customerPlan.findFirst({
						where: { customerId: id },
						orderBy: { createdAt: "desc" },
					});

					if (existingPlan) {
						if (totalQtyKg !== undefined) {
							await tx.customerPlan.update({
								where: { id: existingPlan.id },
								data: { totalQty: totalQtyKg },
							});
						}

						if (vegetableLimits !== undefined) {
							await tx.vegetableLimit.deleteMany({
								where: { planId: existingPlan.id },
							});
							if (vegetableLimits.length > 0) {
								await tx.vegetableLimit.createMany({
									data: vegetableLimits.map((l) => ({
										planId: existingPlan.id,
										vegetableId: l.vegetableId,
										...this.resolveLimit(l),
									})),
								});
							}
						}
					} else {
						await tx.customerPlan.create({
							data: {
								customerId: id,
								totalQty: totalQtyKg ?? 0,
								...(vegetableLimits?.length && {
									limits: {
										create: vegetableLimits.map((l) => ({
											vegetableId: l.vegetableId,
											...this.resolveLimit(l),
										})),
									},
								}),
							},
						});
					}
				}
			});

			// Re-fetch full customer
			const full = await this.prisma.customer.findUnique({
				where: { id },
				include: this.fullInclude,
			});
			return this.mapCustomerResponse(full);
		} catch (error) {
			this.handleUniqueError(error);
		}
	}

	// ═════════════════════════════════════════════════════════════
	// CUSTOMER DETAILS (detailed view with orders)
	// ═════════════════════════════════════════════════════════════

	async getCustomerDetails(id: number) {
		const customer = await this.prisma.customer.findUnique({
			where: { id },
		});
		if (!customer) throw new NotFoundException("Customer not found");

		const [rawSubscriptions, pastOrders, plan] = await Promise.all([
			this.prisma.subscription.findMany({
				where: { customerId: id },
				select: {
					id: true,
					type: true,
					package: true,
					status: true,
					startDate: true,
					actualPrice: true,
					offerPrice: true,
					paymentTerms: true,
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
			this.prisma.customerPlan.findFirst({
				where: { customerId: id },
				orderBy: { createdAt: "desc" },
				include: {
					limits: {
						include: { vegetable: { select: { name: true, unit: true } } },
					},
				},
			}),
		]);

		const subscriptions = rawSubscriptions.map((s) => ({
			...s,
			startDate: s.startDate ?? customer.createdAt,
			actualPrice: s.actualPrice ?? 0,
			offerPrice: s.offerPrice ?? null,
			paymentTerms: s.paymentTerms ?? "",
		}));

		let totalKg = 0;
		const piecesMap: Record<string, number> = {};
		for (const o of pastOrders) {
			if (o.status !== "DELIVERED") continue;
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

		return {
			customer: {
				id: customer.id,
				name: customer.name,
				email: customer.email,
				phone: customer.phone,
				address: customer.address,
				status: customer.status,
				createdAt: customer.createdAt,
			},
			subscriptions,
			totalQtyKg: plan?.totalQty ?? null,
			vegetableLimits: plan?.limits
				? plan.limits.map((l: any) => ({
						vegetableId: l.vegetableId,
						vegetableName: l.vegetable.name,
						unit: l.vegetable.unit ?? "kg",
						maxQty:
							(l.vegetable.unit === "piece" ? l.maxQtyPiece : l.maxQtyKg) ?? 0,
					}))
				: [],
			consumedQuantity: {
				kg: Math.round(totalKg * 100) / 100,
				pieces: piecesMap,
			},
			pastOrders: pastOrders.map((o) => ({
				id: o.id,
				items: o.items,
				total: o.totalAmount,
				date: o.deliveryDate,
				status: o.status,
			})),
		};
	}

	// ═════════════════════════════════════════════════════════════
	// GET PLAN WITH LIMITS
	// ═════════════════════════════════════════════════════════════

	async getPlan(customerId: number) {
		const customer = await this.prisma.customer.findUnique({
			where: { id: customerId },
		});
		if (!customer) throw new NotFoundException("Customer not found");

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

		return {
			id: plan.id,
			totalQty: plan.totalQty,
			label: plan.label,
			limits: plan.limits.map((l) => ({
				vegetableId: l.vegetableId,
				vegetableName: l.vegetable.name,
				unit: l.vegetable.unit ?? "kg",
				maxQty:
					(l.vegetable.unit === "piece" ? l.maxQtyPiece : l.maxQtyKg) ?? 0,
				maxQtyKg: l.maxQtyKg,
				maxQtyPiece: l.maxQtyPiece,
			})),
		};
	}

	// ═════════════════════════════════════════════════════════════
	// DELETE
	// ═════════════════════════════════════════════════════════════

	async remove(id: number) {
		const customer = await this.prisma.customer.findUnique({ where: { id } });
		if (!customer) throw new NotFoundException("Customer not found");
		await this.prisma.customer.delete({ where: { id } });
		return { message: "Customer deleted successfully" };
	}
}
