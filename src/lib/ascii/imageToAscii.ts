export type AsciiStyle = "shaded" | "edges";

const RAMPS: Record<AsciiStyle, string> = {
  shaded: " $@#*+=-:.`. ",
  edges: " .:-=+*#%@",
};

export interface ImageToAsciiOptions {
  width: number;
  invert?: boolean;
  style?: AsciiStyle;
  color?: boolean;
}

export interface ImageToAsciiResult {
  plain: string;
  html: string;
}

function charForBrightness(
  brightness: number,
  ramp: string,
  invert: boolean,
): string {
  let value = brightness;
  if (invert) value = 1 - value;
  return ramp[Math.floor(value * (ramp.length - 1))]!;
}

function appendColoredChar(
  parts: string[],
  state: { color: string; text: string },
  r: number,
  g: number,
  b: number,
  char: string,
) {
  const nextColor = `rgb(${r}, ${g}, ${b})`;
  if (state.text && state.color !== nextColor) {
    parts.push(
      `<span style="color: ${state.color};">${escapeHtml(state.text)}</span>`,
    );
    state.text = "";
  }
  state.color = nextColor;
  state.text += char;
}

function flushColored(parts: string[], state: { color: string; text: string }) {
  if (!state.text) return;
  parts.push(
    `<span style="color: ${state.color};">${escapeHtml(state.text)}</span>`,
  );
  state.text = "";
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function plainToCodeInner(plain: string): string {
  return escapeHtml(plain);
}

export function wrapCodeBlock(inner: string): string {
  return `<code>${inner}</code>`;
}

export function normalizeAsciiOutput(value: unknown): ImageToAsciiResult {
  if (typeof value === "string") {
    return { plain: value, html: plainToCodeInner(value) };
  }

  if (value && typeof value === "object" && "plain" in value) {
    const record = value as Partial<ImageToAsciiResult>;
    const plain = typeof record.plain === "string" ? record.plain : "";
    const html =
      typeof record.html === "string" ? record.html : plainToCodeInner(plain);
    return { plain, html };
  }

  return { plain: "", html: "" };
}

export function imageToAscii(
  image: HTMLImageElement,
  {
    width,
    invert = false,
    style = "shaded",
    color = false,
  }: ImageToAsciiOptions,
): ImageToAsciiResult {
  const cols = Math.max(10, Math.min(200, width));
  const aspect = image.height / image.width;
  const rows = Math.max(1, Math.round(cols * aspect * 0.5));

  const canvas = document.createElement("canvas");
  canvas.width = cols;
  canvas.height = rows;

  const ctx = canvas.getContext("2d");
  if (!ctx) return { plain: "", html: "" };

  ctx.drawImage(image, 0, 0, cols, rows);
  const { data } = ctx.getImageData(0, 0, cols, rows);
  const ramp = RAMPS[style];

  const plainLines: string[] = [];
  const htmlLines: string[] = [];

  for (let y = 0; y < rows; y++) {
    let plainLine = "";
    const coloredParts: string[] = [];
    const spanState = { color: "", text: "" };

    for (let x = 0; x < cols; x++) {
      const i = (y * cols + x) * 4;
      const r = data[i]!;
      const g = data[i + 1]!;
      const b = data[i + 2]!;
      const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      const char = charForBrightness(brightness, ramp, invert);
      plainLine += char;

      if (color) {
        appendColoredChar(coloredParts, spanState, r, g, b, char);
      }
    }

    plainLines.push(plainLine);

    if (color) {
      flushColored(coloredParts, spanState);
      htmlLines.push(coloredParts.join(""));
    }
  }

  const plain = plainLines.join("\n");
  const html = color ? htmlLines.join("\n") : plainToCodeInner(plain);

  return { plain, html };
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
