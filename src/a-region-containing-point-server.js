import { default as seedrandom } from "seedrandom";
import { groups } from "../public/data-cities-regions.json";
import { hash } from "./utils/encrypt.js";

export default async function(user) {
  const id = "q-region-containing-point-server";

  return async (franchisees) => {
    const random = seedrandom(`${user.email}#${id}`);
    const { hash: answerHash } = groups[Math.floor(random() * groups.length)];

    // Split the cities by commas, trim whitespace, and join with commas
    const result = franchisees
      .split(",")
      .map((c) => c.trim())
      .join(",");
    return answerHash === (await hash(result));
  };
}
