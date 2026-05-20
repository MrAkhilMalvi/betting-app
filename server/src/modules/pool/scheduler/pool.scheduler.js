import cron from "node-cron";
import * as service from "../pool.service.js";

const poolTimes = [
  "09:00",
  "10:00",
  "12:00",
  "14:00",
  "17:00",
  "19:00",
  "21:00",
];

export const startPoolScheduler = () => {
  cron.schedule("* * * * *", async () => {

    const now = new Date()
      .toLocaleTimeString("en-GB", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

    if (poolTimes.includes(now)) {

      await service.createAutomaticPool();

    }

  });
};