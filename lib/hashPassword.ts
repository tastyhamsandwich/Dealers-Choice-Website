import { hash } from 'bcrypt';

export async function hashPassword(password: string) {
	const hashedPass = await hash(password, 12);
	console.log(`Hashed password: ${hashedPass}`);
	return hashedPass;
}