import dotenv from "dotenv";
dotenv.config({ path: "./.env" }); // ✅ MUST BE FIRST

import app from "./app.js";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});