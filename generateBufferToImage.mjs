import fs from "fs";

const buffer = Buffer.from(); // バッファデータ
fs.writeFile("image.jpg", buffer, (err) => {
  if (err) {
    console.error("Error writing file:", err);
  } else {
    console.log("Image file created successfully!");
  }
});
