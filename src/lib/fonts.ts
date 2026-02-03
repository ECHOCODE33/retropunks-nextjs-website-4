import { Press_Start_2P, Roboto_Mono, Google_Sans_Code, Space_Mono, Lexend, Oxanium } from "next/font/google";

export const pressFont = Press_Start_2P({
	subsets: ["latin"],
	weight: "400",
	variable: "--font-press",
});

export const googleFont = Google_Sans_Code({
	subsets: ["latin"],
	weight: ["300", "400", "500", "600", "700", "800"],
	variable: "--font-google",
	display: "swap",
});

export const robotoFont = Roboto_Mono({
	subsets: ["latin"],
	weight: ["100", "200", "300", "400", "500", "600", "700"],
	variable: "--font-roboto",
});

export const spaceFont = Space_Mono({
	subsets: ["latin"],
	weight: ["400", "700"],
	variable: "--font-space",
});

export const lexendFont = Lexend({
	subsets: ["latin"],
	weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
	variable: "--font-lexend",
});

export const oxaniumFont = Oxanium({
	subsets: ["latin"],
	weight: ["200", "300", "400", "500", "600", "700", "800"],
	variable: "--font-oxanium",
});

export const press = pressFont.className;
export const google = googleFont.className;
export const roboto = robotoFont.className;
export const space = spaceFont.className;
export const lexend = lexendFont.className;
export const oxanium = oxaniumFont.className;

/*
import { Press_Start_2P, Roboto_Mono, Google_Sans_Code, Space_Mono } from "next/font/google";

export const press = Press_Start_2P({
	subsets: ["latin"],
	weight: "400",
	variable: "--font-press",
});

export const google = Google_Sans_Code({
	subsets: ["latin"],
	weight: "700",
	variable: "--font-google",
});

export const roboto = Roboto_Mono({
	subsets: ["latin"],
	weight: "700",
	variable: "--font-roboto",
});

export const space = Space_Mono({
	subsets: ["latin"],
	weight: "400",
	variable: "--font-space",
});
 */
