#!/usr/bin/node

import fs from "fs/promises";

let availableTranslations = await fs.readdir("public/resources/translations");
availableTranslations = availableTranslations.filter(x => x !== "index.json");
await fs.writeFile(
    "public/resources/translations/index.json",
    JSON.stringify(availableTranslations),
);
