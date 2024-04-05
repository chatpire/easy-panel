import { faker } from "@faker-js/faker";
import { createAdminUser } from "./utils";
import { db } from "@/server/db";
import { createUser } from "@/server/api/routers/user";
import { serviceInstances } from "@/server/db/schema";
import { createCUID } from "@/lib/cuid";
import { writeChatResourceUsageLog } from "@/server/actions/write-resource-usage-log";

import {ServiceTypeSchema} from "@/server/db/enum";

const USERS_TO_CREATE = 3;
const INSTANCES_TO_CREATE = 2;
const LOGS_TO_CREATE_PER_USER = 10;
const LOG_DAY_SPAN = 1;

async function main() {
  console.log(`Start seeding ...`);

  // Create users
  const users = [];
  const admin = await createAdminUser(db);
  console.log(`Created admin user ${admin.name}, id: ${admin.id}`);
  users.push(admin);

  for (let i = 0; i < USERS_TO_CREATE; i++) {
    const password = "password";
    const user = await createUser(
      db,
      {
        name: faker.person.firstName(),
        username: faker.string.alphanumeric(8),
        email: faker.internet.email(),
        password,
      },
      [],
      "admin",
    );
    users.push(user);
    console.log(`Created user ${user.name}, id: ${user.id}`);
  }
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

  // Create logs over the past LOG_DAY_SPAN days
  for (const user of users) {
    for (let i = 0; i < LOGS_TO_CREATE_PER_USER; i++) {
      const randomMinutes = faker.number.int(60 * 24 * LOG_DAY_SPAN);
      const randomDate = new Date(Date.now() - randomMinutes * 60 * 1000);
      const randomText = faker.lorem.sentence();

      await writeChatResourceUsageLog(db, {
        userId: user.id,
        instanceId: faker.helpers.arrayElement(instances).id,
        text: randomText,
        timestamp: randomDate,
        details: {
          type: ServiceTypeSchema.Values.CHATGPT_SHARED,
          model: "gpt-4",
          chatgptAccountId: faker.helpers.arrayElement(["personal", "team1"]),
        },
      });
    }
  }

  console.log(`Seeding finished.`);
}

main()
  .then()
  .catch(async (e) => {
    console.error(e);
    process.exit(1);
  });
