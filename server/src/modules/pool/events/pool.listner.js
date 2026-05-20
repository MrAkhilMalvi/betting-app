import db from "../../../config/db.js";

import { emitPoolWinner } from "./pool.events.js";

export const startPoolListener = async () => {
  const client = await db.connect();

  await client.query(`
      LISTEN pool_winner
    `);

  client.on("notification", (msg) => {
    try {
      const data = JSON.parse(msg.payload);

      emitPoolWinner(data);
    } catch (err) {
      console.error("Pool listener error:", err);
    }
  });
};
