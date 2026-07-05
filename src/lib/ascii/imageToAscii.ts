export type AsciiStyle = "shaded" | "edges";

const RAMPS: Record<AsciiStyle, string> = {
  shaded: " $@#*+=-:.`. ",
  edges: " .:-=+*#%@",
};

export interface ImageToAsciiOptions {
  width: number;
  invert?: boolean;
  style?: AsciiStyle;
}

export function imageToAscii(
  image: HTMLImageElement,
  { width, invert = false, style = "shaded" }: ImageToAsciiOptions,
): string {
  const cols = Math.max(10, Math.min(200, width));
  const aspect = image.height / image.width;
  const rows = Math.max(1, Math.round(cols * aspect * 0.5));

  const canvas = document.createElement("canvas");
  canvas.width = cols;
  canvas.height = rows;

  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  ctx.drawImage(image, 0, 0, cols, rows);
  const { data } = ctx.getImageData(0, 0, cols, rows);
  const ramp = RAMPS[style];

  const lines: string[] = [];
  for (let y = 0; y < rows; y++) {
    let line = "";
    for (let x = 0; x < cols; x++) {
      const i = (y * cols + x) * 4;
      let brightness =
        (0.299 * data[i]! + 0.587 * data[i + 1]! + 0.114 * data[i + 2]!) / 255;
      if (invert) brightness = 1 - brightness;
      line += ramp[Math.floor(brightness * (ramp.length - 1))]!;
    }
    lines.push(line);
  }

  return lines.join("\n");
}

export function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Not an image"));
      return;
    }

    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not load image"));
    };
    image.src = url;
  });
}
