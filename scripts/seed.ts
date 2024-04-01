import { PrismaClient, ResourceUnit, UserRole } from "@prisma/client";
import { faker } from "@faker-js/faker";
import {
  ServiceInstanceCreateInputSchema,
  UserCreateInputSchema,
  UserInstanceTokenCreateInputSchema,
  UserResourceUsageLogCreateInputSchema,
} from "@/schema/generated/zod";
import { type z } from "zod";
import { hashPassword } from "@/lib/password";
import { createAdminUser } from "./utils";

const prisma = new PrismaClient();

const USERS_TO_CREATE = 10;
const INSTANCES_TO_CREATE = 2;
const LOGS_TO_CREATE_PER_USER = 10;
const LOG_DAY_SPAN = 1;

async function main() {
  console.log(`Start seeding ...`);

  // Create users
  const users = [];
  const admin = await createAdminUser(prisma);
  console.log(`Created admin user ${admin.name}, id: ${admin.id}`);
  users.push(admin);

  for (let i = 0; i < USERS_TO_CREATE; i++) {
    const password = "password";
    const user = await prisma.user.create({
      data: UserCreateInputSchema.parse({
        name: faker.person.fullName(),
        username: faker.internet.userName().replace(".", ""),
        email: faker.internet.email(),
        hashedPassword: await hashPassword(password),
        role: UserRole.USER,
      } as z.infer<typeof UserCreateInputSchema>),
    });
    users.push(user);
    console.log(`Created user ${user.name}, id: ${user.id}`);
  }
  console.log(`Created ${USERS_TO_CREATE} users`);

  // Create service instances
  const instances = [];
  for (let i = 0; i < INSTANCES_TO_CREATE; i++) {
    const instance = await prisma.serviceInstance.create({
      data: ServiceInstanceCreateInputSchema.parse({
        name: `Instance-${i}`,
        type: "CHATGPT_SHARED",
        url: faker.internet.url(),
      } as z.infer<typeof ServiceInstanceCreateInputSchema>),
    });
    instances.push(instance);
    console.log(`Created instance with id: ${instance.id}`);
  }

  // Create instance tokens for users
  for (const user of users) {
    for (const instance of instances) {
      await prisma.userInstanceToken.create({
        data: UserInstanceTokenCreateInputSchema.parse({
          token: faker.string.alphanumeric(16),
          user: { connect: { id: user.id } },
          instance: { connect: { id: instance.id } },
        }),
      });
    }
  }

  // Create logs over the past LOG_DAY_SPAN days
  for (const user of users) {
    for (let i = 0; i < LOGS_TO_CREATE_PER_USER; i++) {
      const randomMinutes = faker.number.int(60 * 24 * LOG_DAY_SPAN);
      const randomDate = new Date(Date.now() - randomMinutes * 60 * 1000);

      await prisma.userResourceUsageLog.create({
        data: UserResourceUsageLogCreateInputSchema.parse({
          user: {
            connect: {
              id: user.id,
            },
          },
          instance: {
            connect: {
              id: faker.helpers.arrayElement(instances).id,
            },
          },
          resourceType: faker.helpers.arrayElement(["CHATGPT_SHARED_GPT_3.5", "CHATGPT_SHARED_GPT_4"]),
          unit: ResourceUnit.INPUT_CHAR,
          amount: faker.number.int(1000),
          timestamp: randomDate,
        } as z.infer<typeof UserResourceUsageLogCreateInputSchema>),
      });
    }
    console.log(`Created ${LOGS_TO_CREATE_PER_USER} logs`);
  }

  console.log(`Seeding finished.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
