import { faker } from "@faker-js/faker";
import { type z } from "zod";
import { createAdminUser } from "./utils";
import { db } from "@/server/db";
import { createUser } from "@/server/api/routers/user";
import { serviceInstances } from "@/server/db/schema";
import { createCUID } from "@/lib/cuid";

const USERS_TO_CREATE = 10;
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
    const user = await createUser(db, {
      name: faker.person.firstName(),
      username: faker.string.alphanumeric(8),
      email: faker.internet.email(),
      password,
    }, [], "admin");
    users.push(user);
    console.log(`Created user ${user.name}, id: ${user.id}`);
  }
  console.log(`Created ${USERS_TO_CREATE} users`);

  // Create service instances
  const instances = [];
  for (let i = 0; i < INSTANCES_TO_CREATE; i++) {
    const instance = await db.insert(serviceInstances).values({
        id: createCUID(),
        name: `Instance-${i}`,
        type: "CHATGPT_SHARED",
        url: faker.internet.url(),
      }
    )
    instances.push(instance);
    console.log(`Created instance with id: ${instance.id}`);
  }


  // Create logs over the past LOG_DAY_SPAN days
  for (const user of users) {
    for (let i = 0; i < LOGS_TO_CREATE_PER_USER; i++) {
      const randomMinutes = faker.number.int(60 * 24 * LOG_DAY_SPAN);
      const randomDate = new Date(Date.now() - randomMinutes * 60 * 1000);
      const randomText = faker.lorem.sentence();

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
          model: faker.helpers.arrayElement(["gpt-2", "gpt-3"]),
          text: randomText,
          utf8Length: Buffer.byteLength(randomText, "utf8"),
          conversationId: faker.string.alphanumeric(16),
          openaiTeamId: null,
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
