import figlet from "figlet";
import Big from "figlet/importable-fonts/Big.js";
import Block from "figlet/importable-fonts/Block.js";
import Ghost from "figlet/importable-fonts/Ghost.js";
import Slant from "figlet/importable-fonts/Slant.js";
import Standard from "figlet/importable-fonts/Standard.js";

export const FIGLET_FONTS = [
  { id: "Standard", label: "Standard" },
  { id: "Slant", label: "Slant" },
  { id: "Big", label: "Big" },
  { id: "Block", label: "Block" },
  { id: "Ghost", label: "Shadow" },
] as const;

let ready = false;

export function ensureFigletFonts() {
  if (ready) return;
  figlet.parseFont("Standard", Standard);
  figlet.parseFont("Slant", Slant);
  figlet.parseFont("Big", Big);
  figlet.parseFont("Block", Block);
  figlet.parseFont("Ghost", Ghost);
  ready = true;
}

export function renderFiglet(text: string, font: string): string {
  ensureFigletFonts();
  const input = text.trim() || "ASCII";
  try {
    return figlet.textSync(input, {
      font: font as figlet.Fonts,
      whitespaceBreak: true,
    });
  } catch {
    return input;
  }
}
