import fs from "fs";
import { IndexedFasta } from "@gmod/indexedfasta";

let map = {} as Record<string, Record<string, string>>;

const t = new IndexedFasta({
  path: process.argv[2],
});

const ret = await t.getSequenceNames();
if (!ret) {
  throw new Error("Error fetching sequence names");
}

let i = 0;
const len = ret.length;
for (const id of ret) {
  console.log(i + "/" + len);
  const [prefix, species] = id.split("_");
  const ret = await t.getResiduesByName(id, 0, Infinity);
  if (!ret) {
    throw new Error("Failed to fetch: " + id);
  }
  if (!map[prefix]) {
    map[prefix] = {};
  }
  map[prefix][species] = ret;
  i++;
}
Object.keys(map).forEach((key) => {
  fs.writeFileSync(
    `output/${key}.mfa`,
    Object.entries(map[key])
      .map(([species, value]) => `>${species}\n${value}`)
      .join("\n"),
  );
});
