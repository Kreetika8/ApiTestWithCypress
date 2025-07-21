import { faker } from "@faker-js/faker";
export function fakeUserData() {
  return {
    "name": faker.internet.username(),
    "gender": faker.helpers.arrayElement(["male", "female"]),
    "email": faker.internet.email(),
    "status": faker.helpers.arrayElement(["active", "inactive"])
  };
}

export function fakePostData() {
  return {
    title: faker.lorem.sentence(),
    body: faker.lorem.paragraph()
  };
}