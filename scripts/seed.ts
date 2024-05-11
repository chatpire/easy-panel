import "dotenv/config";
import { faker } from "@faker-js/faker";
import { createAdminUser } from "./utils";
import { conn, db } from "@/server/db";
import { resourceUsageLogs, serviceInstances, users } from "@/server/db/schema";
import { createCUID } from "@/lib/cuid";
import { ServiceTypeSchema } from "@/server/db/enum";

const USERS_TO_CREATE = 20;
const INSTANCES_TO_CREATE = 2;
const LOGS_TO_CREATE_PER_USER = 100;
const LOG_DAY_SPAN = 2;

async function main() {
  console.log(`Start seeding ...`);

  // Create users
  const admin = await createAdminUser(db);
  if (admin) {
    console.log(`Created admin user ${admin.name}, id: ${admin.id}`);
  }

  const usersToCreate = [];
  for (let i = 0; i < USERS_TO_CREATE; i++) {
    const password = "password";
    usersToCreate.push({
      id: createCUID(),
      name: faker.person.firstName(),
      username: faker.string.alphanumeric(8),
      email: faker.internet.email(),
      password,
    });
  }
  const usersCreated = await db.insert(users).values(usersToCreate).returning();
  console.log(`Created ${USERS_TO_CREATE} users`);

  // Create service instances
  const instancesToCreate = [];
  for (let i = 0; i < INSTANCES_TO_CREATE; i++) {
    instancesToCreate.push({
      id: createCUID(),
      name: `Instance-${i}`,
      type: ServiceTypeSchema.Values.CHATGPT_SHARED,
      url: faker.internet.url(),
    });
  }
  const instances = await db.insert(serviceInstances).values(instancesToCreate).returning();
  console.log(`Created ${INSTANCES_TO_CREATE} service instances`);

  // Create logs over the past LOG_DAY_SPAN days
  const logInterval = Math.floor((LOG_DAY_SPAN * 24 * 60 * 60 * 1000) / LOGS_TO_CREATE_PER_USER);

  for (const user of usersCreated) {
    let baseTime = Date.now() - LOG_DAY_SPAN * 24 * 60 * 60 * 1000;
    for (let i = 0; i < LOGS_TO_CREATE_PER_USER; i++) {
      const logsToCreate = [];
      const createdAt = new Date(baseTime);
      baseTime += logInterval;
      const text = faker.lorem.paragraph(30);
      logsToCreate.push({
        id: createCUID(),
        type: ServiceTypeSchema.Values.CHATGPT_SHARED,
        userId: user.id,
        instanceId: instances[i % instances.length]!.id,
        text: text,
        textBytes: Buffer.byteLength(text),
        createdAt: createdAt,
        details: {
          type: ServiceTypeSchema.Values.CHATGPT_SHARED,
          model: "gpt-4",
          chatgptAccountId: i % 7 > 4 ? "personal" : "team1",
        },
      });
      await db.insert(resourceUsageLogs).values(logsToCreate);
    }
    console.log(`...${LOGS_TO_CREATE_PER_USER} logs for user ${user.id}`);
  }
  console.log(`Created ${LOGS_TO_CREATE_PER_USER} logs for each of ${USERS_TO_CREATE} users`);

  console.log(`Seeding finished.`);
}

main()
  .then(async () => {
    await conn.end();
  })
  .catch(async (e) => {
    console.error(e);
    process.exit(1);
  })
  .finally();
