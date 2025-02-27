import { date, decimal, integer, smallint, pgTable, serial, pgEnum, text, char, varchar, timestamp,  } from "drizzle-orm/pg-core";

export const genderEnum = pgEnum('gender', ['male', 'female']);
export const roleEnum = pgEnum('role', ['permabanned', 'tempbanned', 'restricted', 'unverified', 'user', 'premium', 'moderator', 'admin', 'creator']);

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 16 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  firstName: text('first_name'),
  last_name: text('last_name'),
  full_name: text('full_name'),
  dob: date('dob'),
  avatar_url: text('avatar_url'),
  balance: decimal('balance', { precision: 10, scale: 2 }),
  gender: genderEnum('gender'),
  profile_level: smallint('profile_level'),
  profile_exp: integer('profile_exp'),
  role: roleEnum('role'),
  created_at: timestamp('created_on').defaultNow(),
  last_login: timestamp('last_login'),
  deleted_at: timestamp('deleted_at'),
});

export const billing = pgTable('user_billing', {
  id: serial('id').primaryKey(),
  created_at: timestamp('created_at'),
  billing_address_street1: varchar('billing_address_street_1', { length: 255 }),
  billing_address_street2: varchar('billing_address_street_2', { length: 255 }),
  billing_address_city: varchar('billing_address_city', { length: 255 }),
  billing_address_state: char('billing_address_state', { length: 2 }),
  billing_address_zip: integer('billing_address_zip'),
  billing_address_country: varchar('billing_address_country', { length: 255 }),
  phone_number: integer('phone_number'),
  stored_cc_number: integer('stored_cc_number'),
  stored_cc_name: varchar('stored_cc_name', { length: 255 }),
  stored_cc_exp_month: smallint('stored_cc_expiration'),
  stored_cc_exp_year: smallint('stored_cc_exp_year'),
  stored_cc_cvv: smallint('stored_cc_cvv'),
});