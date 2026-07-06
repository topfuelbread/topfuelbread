import { useEffect, useMemo, useRef, useState } from "preact/hooks";
import { CHARACTER_SET_OPTIONS } from "../../lib/ascii/characterSets";
import { FIGLET_FONTS, renderFiglet } from "../../lib/ascii/figletFonts";
import {
  imageToAscii,
  loadImageFromFile,
  normalizeAsciiOutput,
  plainToCodeInner,
  wrapCodeBlock,
} from "../../lib/ascii/imageToAscii";

const WIDTHS = [40, 60, 80, 100, 120];
const EMPTY_OUTPUT = { plain: "", html: "" };

export default function AsciiArtGenerator() {
  const [mode, setMode] = useState("image");
  const [text, setText] = useState("topfuelbread");
  const [font, setFont] = useState("Standard");
  const [width, setWidth] = useState(100);
  const [color, setColor] = useState(true);
  const [invert, setInvert] = useState(false);
  const [characterSet, setCharacterSet] = useState("blocks");
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [brightnessMapping, setBrightnessMapping] = useState(0.5);
  const [output, setOutput] = useState(EMPTY_OUTPUT);
  const [copied, setCopied] = useState("");
  const [error, setError] = useState("");
  const [loadedImage, setLoadedImage] = useState(null);
  const fileRef = useRef(null);

  const textOutput = useMemo(
    () => renderFiglet(text, font),
    [text, font],
  );

  const codeInner = useMemo(() => {
    if (!output.plain) return "";
    if (mode === "image" && color) return output.html;
    return plainToCodeInner(output.plain);
  }, [mode, color, output.plain, output.html]);

  useEffect(() => {
    if (mode === "text") {
      setOutput({ plain: textOutput, html: "" });
      setError("");
    }
  }, [mode, textOutput]);

  useEffect(() => {
    if (mode !== "image" || !loadedImage) return;
    setOutput(
      normalizeAsciiOutput(
        imageToAscii(loadedImage, {
          width,
          invert,
          characterSet,
          brightness,
          contrast,
          brightnessMapping,
          color,
        }),
      ),
    );
  }, [
    mode,
    loadedImage,
    width,
    invert,
    characterSet,
    brightness,
    contrast,
    brightnessMapping,
    color,
  ]);

  async function handleFile(file) {
    setError("");
    try {
      const image = await loadImageFromFile(file);
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
    setText("");
    setOutput(EMPTY_OUTPUT);
    setError("");
    setLoadedImage(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  const hasOutput = Boolean(output.plain);
  const showColoredPreview = mode === "image" && color && output.html;

  return (
    <div class="ascii-gen">
      <header class="ascii-gen__hero">
        <p class="ascii-gen__eyebrow">[ DEV TOOL ]</p>
        <h1>ASCII Art Generator</h1>
        <p class="ascii-gen__subtitle">
          Turn images and text into shareable ASCII art. Everything runs locally
          in your browser.
        </p>
      </header>

      <div class="ascii-gen__panel">
        <div class="ascii-gen__toolbar">
          <label class="ascii-gen__field">
            <span>Mode</span>
            <select
              value={mode}
              onChange={(event) =>
                setMode(event.currentTarget.value === "image" ? "image" : "text")
              }
            >
              <option value="text">Text</option>
              <option value="image">Image</option>
            </select>
          </label>

          {mode === "text" ? (
            <>
              <label class="ascii-gen__field ascii-gen__field--grow">
                <span>Text</span>
                <input
                  type="text"
                  value={text}
                  placeholder="Type text to render as a banner…"
                  onInput={(event) => setText(event.currentTarget.value)}
                />
              </label>
              <label class="ascii-gen__field">
                <span>Font</span>
                <select
                  value={font}
                  onChange={(event) => setFont(event.currentTarget.value)}
                >
                  {FIGLET_FONTS.map((entry) => (
                    <option key={entry.id} value={entry.id}>
                      {entry.label}
                    </option>
                  ))}
                </select>
              </label>
            </>
          ) : (
            <>
              <label class="ascii-gen__field">
                <span>Width</span>
                <select
                  value={width}
                  onChange={(event) =>
                    setWidth(Number(event.currentTarget.value))
                  }
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
              <label class="ascii-gen__check">
                <input
                  type="checkbox"
                  checked={color}
                  onChange={(event) => setColor(event.currentTarget.checked)}
                />
                <span>Color</span>
              </label>
              <label class="ascii-gen__check">
                <input
                  type="checkbox"
                  checked={invert}
                  onChange={(event) => setInvert(event.currentTarget.checked)}
                />
                <span>Invert</span>
              </label>
            </>
          )}

          <button type="button" class="ascii-gen__btn" onClick={clearAll}>
            Clear
          </button>
        </div>

        {mode === "image" && (
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
              PNG, JPG, SVG. Images never leave your browser.
            </p>
            <button
              type="button"
              class="ascii-gen__btn ascii-gen__btn--primary"
              onClick={() => fileRef.current?.click()}
            >
              Choose image
            </button>
            {error && <p class="ascii-gen__error">{error}</p>}
          </div>
        )}

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
              {output.plain ||
                "ASCII output appears here. Type above or drop an image."}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
