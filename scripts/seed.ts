import { NewUser, insertUser } from "@/lib/db";

async function main() {
  const newUser: NewUser = {
    email: "foo@example.com",
    image: "some image url",
    first_name: "foo",  // Change 'name' to 'first_name'
    last_name: "bar",   // Add 'last_name'
    grade_level: "bar",   // Add 'last_name'
    location: "bar",   // Add 'last_name'
    birthday: "bar",   // Add 'last_name'
    gender: "bar",   // Add 'last_name'
    sport: "bar",   // Add 'last_name'
    team: "bar",   // Add 'last_name'
    position: "bar",   // Add 'last_name'
    number: "bar",   // Add 'last_name'
    password: "bar",   // Add 'last_name'
    createdAt:new Date(),   // Add 'last_name'
  };
  
  const res = await insertUser(newUser);
  console.log("insert user success", res);
  process.exit();
}

main();
