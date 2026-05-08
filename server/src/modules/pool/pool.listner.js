import pool from "../../config/db.js";

export const startPoolListener = async (io) => {

  const client = await pool.connect();

  await client.query("LISTEN pool_winner");

  client.on("notification", (msg) => {

    const data = JSON.parse(msg.payload);

    io.emit("poolWinner", data);

  });

};