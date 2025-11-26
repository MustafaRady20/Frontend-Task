import fs from "fs";
import path from "path";

const __dirname = path.dirname(new URL(import.meta.url).pathname);

const dataPath = path.join(__dirname, "public", "data");

const files = [
  "authors.json",
  "books.json",
  "inventory.json",
  "stores.json"
];

let output = {};

for (const file of files) {
  const filePath = path.join(dataPath, file);
  const key = file.replace(".json", "");

  const content = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  output[key] = content;
}

fs.writeFileSync("db.json", JSON.stringify(output, null, 2));

console.log("db.json created successfully!");
