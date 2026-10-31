import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";

// Public site typefaces: a serif for headlines (with an italic for the one
// emphasised word), Geist for reading, Geist Mono for navigation and labels.
const display = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
});

const sans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-site",
  display: "swap",
});

const mono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono-site",
  display: "swap",
});

/** Class names that make the three font variables available to a subtree. */
export const siteFontVariables = `${display.variable} ${sans.variable} ${mono.variable}`;
