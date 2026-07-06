import {
  type CharacterSetId,
  getCharacterRamp,
} from "./characterSets";

const MAX_SOURCE_EDGE = 500;

export type ColourOverlay = "none" | "colour" | "fullColour";

export interface ImageToAsciiOptions {
  width: number;
  characterSet?: CharacterSetId;
  brightness?: number;
  contrast?: number;
  brightnessMapping?: number;
  invert?: boolean;
  colourOverlay?: ColourOverlay;
}

export interface ImageToAsciiResult {
  plain: string;
  html: string;
}

type RgbCell = [number, number, number];

function luminance(r: number, g: number, b: number): number {
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

function percentileStretchBounds(values: number[]): { lo: number; hi: number } {
  if (values.length === 0) return { lo: 0, hi: 1 };

  const sorted = [...values].sort((a, b) => a - b);
  const loIdx = Math.floor(sorted.length * 0.05);
  const hiIdx = Math.min(
    sorted.length - 1,
    Math.ceil(sorted.length * 0.95) - 1,
  );
  const lo = sorted[loIdx] ?? 0;
  const hi = sorted[hiIdx] ?? 1;

  if (hi - lo < 0.001) return { lo: 0, hi: 1 };
  return { lo, hi };
}

function stretchBrightness(value: number, lo: number, hi: number): number {
  return Math.min(1, Math.max(0, (value - lo) / (hi - lo)));
}

function applyBrightnessContrast(
  imageData: ImageData,
  brightness: number,
  contrast: number,
): ImageData {
  const data = new Uint8ClampedArray(imageData.data);
  const brightnessOffset = brightness * 2.55;
  const contrastFactor = (259 * (contrast + 255)) / (255 * (259 - contrast));

  for (let i = 0; i < data.length; i += 4) {
    for (let channel = 0; channel < 3; channel++) {
      let value = data[i + channel]!;
      value = contrastFactor * (value - 128) + 128;
      value += brightnessOffset;
      data[i + channel] = Math.max(0, Math.min(255, Math.round(value)));
    }
  }

  return new ImageData(data, imageData.width, imageData.height);
}

function averageRegion(
  imageData: ImageData,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): RgbCell {
  const { width, height, data } = imageData;
  const left = Math.max(0, Math.floor(x1));
  const top = Math.max(0, Math.floor(y1));
  const right = Math.min(width - 1, Math.ceil(x2));
  const bottom = Math.min(height - 1, Math.ceil(y2));

  let r = 0;
  let g = 0;
  let b = 0;
  let count = 0;

  for (let y = top; y <= bottom; y++) {
    for (let x = left; x <= right; x++) {
      const i = (y * width + x) * 4;
      r += data[i]!;
      g += data[i + 1]!;
      b += data[i + 2]!;
      count++;
    }
  }

  if (count === 0) return [0, 0, 0];
  return [Math.round(r / count), Math.round(g / count), Math.round(b / count)];
}

function sampleGridCells(
  imageData: ImageData,
  cols: number,
  rows: number,
): RgbCell[] {
  const cellWidth = imageData.width / cols;
  const cellHeight = imageData.height / rows;
  const cells: RgbCell[] = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x1 = col * cellWidth;
      const y1 = row * cellHeight;
      const x2 = (col + 1) * cellWidth;
      const y2 = (row + 1) * cellHeight;
      cells.push(averageRegion(imageData, x1, y1, x2, y2));
    }
  }

  return cells;
}

function mapBrightness(
  brightness: number,
  brightnessMapping: number,
  invert: boolean,
  stretchLo: number,
  stretchHi: number,
  useStretch: boolean,
): number {
  let mapped = useStretch
    ? stretchBrightness(brightness, stretchLo, stretchHi)
    : brightness;
  const gamma = 1 / (0.25 + brightnessMapping * 1.5);
  mapped = Math.pow(Math.min(1, Math.max(0, mapped)), gamma);
  if (invert) mapped = 1 - mapped;
  return mapped;
}

function charForMappedBrightness(mapped: number, ramp: string): string {
  if (ramp.length === 0) return " ";
  const index = Math.floor(mapped * (ramp.length - 1));
  return ramp[index] ?? ramp[ramp.length - 1]!;
}

function colorCharFromRamp(char: string): string {
  return /\s/.test(char) ? "." : char;
}

function mosaicCharFromRamp(char: string): string {
  return /\s/.test(char) ? " " : "█";
}

function resolveCell(
  mapped: number,
  ramp: string,
  useBlocksMosaic: boolean,
): { plainChar: string; htmlChar: string; isBlank: boolean } {
  const plainChar = charForMappedBrightness(mapped, ramp);
  const isBlank = /\s/.test(plainChar);
  const htmlChar = useBlocksMosaic
    ? mosaicCharFromRamp(plainChar)
    : colorCharFromRamp(plainChar);
  return { plainChar, htmlChar, isBlank };
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

function drawSourceImage(
  image: HTMLImageElement,
  maxEdge: number,
): ImageData | null {
  const scale = Math.min(1, maxEdge / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.drawImage(image, 0, 0, width, height);
  return ctx.getImageData(0, 0, width, height);
}

function appendHtmlChar(
  coloredParts: string[],
  spanState: { color: string; text: string },
  r: number,
  g: number,
  b: number,
  htmlChar: string,
) {
  if (htmlChar === " ") {
    flushColored(coloredParts, spanState);
    coloredParts.push(" ");
  } else {
    appendColoredChar(coloredParts, spanState, r, g, b, htmlChar);
  }
}

export function imageToAscii(
  image: HTMLImageElement,
  {
    width,
    characterSet = "basic",
    brightness = 0,
    contrast = 0,
    brightnessMapping = 0.5,
    invert = false,
    colourOverlay = "none",
  }: ImageToAsciiOptions,
): ImageToAsciiResult {
  const cols = Math.max(10, Math.min(200, width));
  const aspect = image.height / image.width;
  const rows = Math.max(1, Math.round(cols * aspect * 0.5));
  const ramp = getCharacterRamp(characterSet);
  const useColour = colourOverlay !== "none";
  const useBlocksMosaic = useColour && characterSet === "blocks";
  const useStretch = useColour;

  const source = drawSourceImage(image, MAX_SOURCE_EDGE);
  if (!source) return { plain: "", html: "" };

  const adjusted = applyBrightnessContrast(source, brightness, contrast);
  const cells = sampleGridCells(adjusted, cols, rows);

  let stretchLo = 0;
  let stretchHi = 1;

  if (useStretch) {
    const luminances = cells.map(([r, g, b]) => luminance(r, g, b));
    const bounds = percentileStretchBounds(luminances);
    stretchLo = bounds.lo;
    stretchHi = bounds.hi;
  }

  const plainLines: string[] = [];
  const htmlLines: string[] = [];

  for (let row = 0; row < rows; row++) {
    let plainLine = "";
    const coloredParts: string[] = [];
    const spanState = { color: "", text: "" };

    for (let col = 0; col < cols; col++) {
      const cellIndex = row * cols + col;
      const [r, g, b] = cells[cellIndex]!;
      const cellBrightness = luminance(r, g, b);

      let plainChar: string;
      let htmlChar = "";

      if (colourOverlay === "fullColour") {
        const mappedNormal = mapBrightness(
          cellBrightness,
          brightnessMapping,
          false,
          stretchLo,
          stretchHi,
          true,
        );
        const normal = resolveCell(mappedNormal, ramp, useBlocksMosaic);

        if (normal.isBlank) {
          const mappedInvert = mapBrightness(
            cellBrightness,
            brightnessMapping,
            true,
            stretchLo,
            stretchHi,
            true,
          );
          const filled = resolveCell(mappedInvert, ramp, useBlocksMosaic);
          plainChar = filled.plainChar;
          htmlChar = filled.htmlChar;
        } else {
          plainChar = normal.plainChar;
          htmlChar = normal.htmlChar;
        }
      } else {
        const mapped = mapBrightness(
          cellBrightness,
          brightnessMapping,
          invert,
          stretchLo,
          stretchHi,
          useStretch,
        );
        plainChar = charForMappedBrightness(mapped, ramp);

        if (colourOverlay === "colour") {
          ({ htmlChar } = resolveCell(mapped, ramp, useBlocksMosaic));
        }
      }

      plainLine += plainChar;

      if (colourOverlay !== "none") {
        appendHtmlChar(coloredParts, spanState, r, g, b, htmlChar);
      }
    }

    plainLines.push(plainLine);

    if (useColour) {
      flushColored(coloredParts, spanState);
      htmlLines.push(coloredParts.join(""));
    }
  }

  const plain = plainLines.join("\n");
  const html = useColour ? htmlLines.join("\n") : plainToCodeInner(plain);

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
