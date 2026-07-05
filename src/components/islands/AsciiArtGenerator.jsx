import { useEffect, useMemo, useRef, useState } from "preact/hooks";
import { FIGLET_FONTS, renderFiglet } from "../../lib/ascii/figletFonts";
import {
  imageToAscii,
  loadImageFromFile,
} from "../../lib/ascii/imageToAscii";

const WIDTHS = [40, 60, 80, 100, 120];

export default function AsciiArtGenerator() {
  const [mode, setMode] = useState("text");
  const [text, setText] = useState("topfuelbread");
  const [font, setFont] = useState("Standard");
  const [width, setWidth] = useState(80);
  const [invert, setInvert] = useState(false);
  const [style, setStyle] = useState("shaded");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [loadedImage, setLoadedImage] = useState(null);
  const fileRef = useRef(null);

  const textOutput = useMemo(
    () => renderFiglet(text, font),
    [text, font],
  );

  useEffect(() => {
    if (mode === "text") {
      setOutput(textOutput);
      setError("");
    }
  }, [mode, textOutput]);

  useEffect(() => {
    if (mode !== "image" || !loadedImage) return;
    setOutput(
      imageToAscii(loadedImage, {
        width,
        invert,
        style,
      }),
    );
  }, [mode, loadedImage, width, invert, style]);

  async function handleFile(file) {
    setError("");
    try {
      const image = await loadImageFromFile(file);
      setLoadedImage(image);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load image");
      setOutput("");
    }
  }

  function onDrop(event) {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    if (file) void handleFile(file);
  }

  async function copyOutput() {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  function downloadTxt() {
    if (!output) return;
    const blob = new Blob([output], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "ascii-art.txt";
    link.click();
    URL.revokeObjectURL(url);
  }

  function clearAll() {
    setText("");
    setOutput("");
    setError("");
    setLoadedImage(null);
    if (fileRef.current) fileRef.current.value = "";
  }

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
                <span>Style</span>
                <select
                  value={style}
                  onChange={(event) =>
                    setStyle(
                      event.currentTarget.value === "edges" ? "edges" : "shaded",
                    )
                  }
                >
                  <option value="shaded">Shaded</option>
                  <option value="edges">Edges</option>
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
                disabled={!output}
                onClick={() => void copyOutput()}
              >
                {copied ? "Copied" : "Copy"}
              </button>
              <button
                type="button"
                class="ascii-gen__btn"
                disabled={!output}
                onClick={downloadTxt}
              >
                .txt
              </button>
            </div>
          </div>
          <pre class="ascii-gen__result" aria-live="polite">
            {output || "ASCII output appears here. Type above or drop an image."}
          </pre>
        </div>
      </div>
    </div>
  );
}
