import { useEffect, useMemo, useRef, useState } from "preact/hooks";
import { CHARACTER_SET_OPTIONS } from "../../lib/ascii/characterSets";
import {
  imageToAscii,
  loadImageFromFile,
  loadImageFromUrl,
  normalizeAsciiOutput,
  plainToCodeInner,
  wrapCodeBlock,
} from "../../lib/ascii/imageToAscii";

const WIDTHS = [40, 60, 80, 100, 120];
const COLOUR_OVERLAYS = [
  { id: "colour", label: "Colour" },
  { id: "fullColour", label: "FullColour" },
];
const EMPTY_OUTPUT = { plain: "", html: "" };

export default function AsciiArtGenerator() {
  const [width, setWidth] = useState(100);
  const [invert, setInvert] = useState(false);
  const [colourOverlay, setColourOverlay] = useState("fullColour");
  const [characterSet, setCharacterSet] = useState("blocks");
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [brightnessMapping, setBrightnessMapping] = useState(0.5);
  const [output, setOutput] = useState(EMPTY_OUTPUT);
  const [copied, setCopied] = useState("");
  const [error, setError] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loadedImage, setLoadedImage] = useState(null);
  const fileRef = useRef(null);

  const codeInner = useMemo(() => {
    if (!output.plain) return "";
    if (colourOverlay !== "none") return output.html;
    return plainToCodeInner(output.plain);
  }, [colourOverlay, output.plain, output.html]);

  useEffect(() => {
    if (!loadedImage) return;
    setOutput(
      normalizeAsciiOutput(
        imageToAscii(loadedImage, {
          width,
          characterSet,
          brightness,
          contrast,
          brightnessMapping,
          invert,
          colourOverlay,
        }),
      ),
    );
  }, [
    loadedImage,
    width,
    characterSet,
    brightness,
    contrast,
    brightnessMapping,
    invert,
    colourOverlay,
  ]);

  async function handleFile(file) {
    setError("");
    try {
      const image = await loadImageFromFile(file);
      setImageUrl("");
      setLoadedImage(image);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load image");
      setOutput(EMPTY_OUTPUT);
    }
  }

  async function handleUrl() {
    const trimmed = imageUrl.trim();
    if (!trimmed) return;

    setError("");
    try {
      const image = await loadImageFromUrl(trimmed);
      if (fileRef.current) fileRef.current.value = "";
      setLoadedImage(image);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load image");
      setOutput(EMPTY_OUTPUT);
    }
  }

  function onDrop(event) {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    if (file) void handleFile(file);
  }

  async function copyPlain() {
    if (!output.plain) return;
    await navigator.clipboard.writeText(output.plain);
    setCopied("plain");
    window.setTimeout(() => setCopied(""), 1500);
  }

  async function copyCodeBlock() {
    if (!codeInner) return;
    await navigator.clipboard.writeText(wrapCodeBlock(codeInner));
    setCopied("code");
    window.setTimeout(() => setCopied(""), 1500);
  }

  function downloadTxt() {
    if (!output.plain) return;
    const blob = new Blob([output.plain], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "ascii-art.txt";
    link.click();
    URL.revokeObjectURL(url);
  }

  function clearAll() {
    setOutput(EMPTY_OUTPUT);
    setError("");
    setImageUrl("");
    setLoadedImage(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  function toggleColourOverlay(nextOverlay) {
    setColourOverlay((current) =>
      current === nextOverlay ? "none" : nextOverlay,
    );
  }

  const hasOutput = Boolean(output.plain);
  const showColoredPreview = colourOverlay !== "none" && output.html;

  return (
    <div class="ascii-gen">
      <header class="ascii-gen__hero">
        <p class="ascii-gen__eyebrow">[ DEV TOOL ]</p>
        <h1>ASCII Art Generator</h1>
        <p class="ascii-gen__subtitle">
          Turn images into shareable ASCII art. Everything runs locally in your
          browser.
        </p>
      </header>

      <div class="ascii-gen__panel">
        <div
          class="ascii-gen__drop"
          onDragOver={(event) => event.preventDefault()}
          onDrop={onDrop}
        >
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(event) => {
              const file = event.currentTarget.files?.[0];
              if (file) void handleFile(file);
            }}
          />
          <p class="ascii-gen__drop-title">Drop an image or click to browse</p>
          <p class="ascii-gen__drop-hint">
            PNG, JPG, SVG. Drop an image, choose a file, or paste an image URL.
            Images never leave your browser.
          </p>
          <button
            type="button"
            class="ascii-gen__btn ascii-gen__btn--primary"
            onClick={() => fileRef.current?.click()}
          >
            Choose image
          </button>
          <p class="ascii-gen__drop-or">or</p>
          <div class="ascii-gen__drop-url">
            <input
              type="url"
              class="ascii-gen__drop-url-input"
              placeholder="https://example.com/image.jpg"
              value={imageUrl}
              onInput={(event) => setImageUrl(event.currentTarget.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") void handleUrl();
              }}
            />
            <button
              type="button"
              class="ascii-gen__btn"
              disabled={!imageUrl.trim()}
              onClick={() => void handleUrl()}
            >
              Load
            </button>
          </div>
          {error && <p class="ascii-gen__error">{error}</p>}
        </div>

        <div class="ascii-gen__toolbar">
          <label class="ascii-gen__field">
            <span>Width</span>
            <select
              value={width}
              onChange={(event) => setWidth(Number(event.currentTarget.value))}
            >
              {WIDTHS.map((value) => (
                <option key={value} value={value}>
                  {value} cols
                </option>
              ))}
            </select>
          </label>
          <label class="ascii-gen__field">
            <span>Character Set</span>
            <select
              value={characterSet}
              onChange={(event) => setCharacterSet(event.currentTarget.value)}
            >
              {CHARACTER_SET_OPTIONS.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.name}
                </option>
              ))}
            </select>
          </label>
          <label class="ascii-gen__check">
            <input
              type="checkbox"
              checked={invert}
              onChange={(event) => setInvert(event.currentTarget.checked)}
            />
            <span>Invert</span>
          </label>
          <div class="ascii-gen__render-modes">
            <span class="ascii-gen__render-modes-label">Colour</span>
            <div class="ascii-gen__render-modes-row">
              {COLOUR_OVERLAYS.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  class={`ascii-gen__btn${
                    colourOverlay === entry.id ? " ascii-gen__btn--active" : ""
                  }`}
                  onClick={() => toggleColourOverlay(entry.id)}
                >
                  {entry.label}
                </button>
              ))}
            </div>
          </div>
          <div class="ascii-gen__sliders">
            <label class="ascii-gen__field ascii-gen__field--slider">
              <span>Brightness {brightness}</span>
              <input
                type="range"
                min="-100"
                max="100"
                step="1"
                value={brightness}
                onInput={(event) =>
                  setBrightness(Number(event.currentTarget.value))
                }
              />
            </label>
            <label class="ascii-gen__field ascii-gen__field--slider">
              <span>Contrast {contrast}</span>
              <input
                type="range"
                min="-100"
                max="100"
                step="1"
                value={contrast}
                onInput={(event) =>
                  setContrast(Number(event.currentTarget.value))
                }
              />
            </label>
            <label class="ascii-gen__field ascii-gen__field--slider">
              <span>Mapping {brightnessMapping.toFixed(2)}</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={brightnessMapping}
                onInput={(event) =>
                  setBrightnessMapping(Number(event.currentTarget.value))
                }
              />
            </label>
          </div>

          <button type="button" class="ascii-gen__btn" onClick={clearAll}>
            Clear
          </button>
        </div>

        <div class="ascii-gen__result-wrap">
          <div class="ascii-gen__result-head">
            <span>ASCII</span>
            <div class="ascii-gen__actions">
              <button
                type="button"
                class="ascii-gen__btn"
                disabled={!hasOutput}
                onClick={() => void copyPlain()}
              >
                {copied === "plain" ? "Copied" : "Copy"}
              </button>
              <button
                type="button"
                class="ascii-gen__btn"
                disabled={!hasOutput}
                onClick={() => void copyCodeBlock()}
              >
                {copied === "code" ? "Copied" : "Copy code block"}
              </button>
              <button
                type="button"
                class="ascii-gen__btn"
                disabled={!hasOutput}
                onClick={downloadTxt}
              >
                .txt
              </button>
            </div>
          </div>
          {showColoredPreview ? (
            <div class="ascii-gen__result ascii-gen__result--html" aria-live="polite">
              <code dangerouslySetInnerHTML={{ __html: output.html }} />
            </div>
          ) : (
            <pre class="ascii-gen__result" aria-live="polite">
              {output.plain || "ASCII output appears here. Drop an image."}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
