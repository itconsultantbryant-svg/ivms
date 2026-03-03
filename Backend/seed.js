const { User, main } = require("./models");

async function seed() {
  await main();
  const count = await User.count();
  if (count === 0) {
    await User.create({
      firstName: "Admin",
      lastName: "User",
      email: "admin@example.com",
      password: "admin123",
      phoneNumber: null,
      imageUrl: null,
    });
    console.log("Default user created: admin@example.com / admin123");
  }
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
