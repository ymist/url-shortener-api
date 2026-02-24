import type { PrismaClient } from '@prisma/client';
import type { IUserRepository } from '../interfaces/IUserRepository.js';

export class UserRepository implements IUserRepository {
	constructor(private prisma: PrismaClient) {}

	async create(data: { email: string; password: string; name?: string }) {
		return await this.prisma.user.create({
			data: {
				email: data.email,
				password: data.password,
				name: data.name,
			},
			select: {
				id: true,
				email: true,
				name: true,
			},
		});
	}

	async findByEmail(email: string) {
		return await this.prisma.user.findUnique({
			where: { email },
			select: {
				id: true,
				email: true,
				password: true,
				name: true,
			},
		});
	}

	async findById(id: string) {
		return await this.prisma.user.findUnique({
			where: { id },
			select: {
				id: true,
				email: true,
				name: true,
			},
		});
	}
}
