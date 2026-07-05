import fs from "node:fs";
import path from "node:path";

const ART_ROOT = path.join(process.cwd(), "src/content/ascii/art");
const ART_EXTENSIONS = new Set([".html", ".svg"]);

export type ArtPiece = {
  name: string;
  title: string;
  addedAt: number;
};

function artPieceFromFile(
  collection: string,
  file: string,
  includeCollectionInTitle: boolean,
): ArtPiece {
  const filePath = path.join(ART_ROOT, collection, file);
  const { birthtimeMs, mtimeMs } = fs.statSync(filePath);
  const basename = path.basename(file, path.extname(file));

  return {
    name: `${collection}/${basename}`,
    title: includeCollectionInTitle ? `${collection}/${file}` : file,
    addedAt: birthtimeMs || mtimeMs,
  };
}

export function listAsciiCollections(): string[] {
  return fs
    .readdirSync(ART_ROOT, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

export function listAsciiArt(collection: string): ArtPiece[] {
  const artDir = path.join(ART_ROOT, collection);

  return fs
    .readdirSync(artDir)
    .filter((file) => ART_EXTENSIONS.has(path.extname(file)))
    .map((file) => artPieceFromFile(collection, file, false))
    .sort((a, b) => b.addedAt - a.addedAt);
}

export function listAllAsciiArt(): ArtPiece[] {
  return listAsciiCollections()
    .flatMap((collection) =>
      fs
        .readdirSync(path.join(ART_ROOT, collection))
        .filter((file) => ART_EXTENSIONS.has(path.extname(file)))
        .map((file) => artPieceFromFile(collection, file, true)),
    )
    .sort((a, b) => b.addedAt - a.addedAt);
}
