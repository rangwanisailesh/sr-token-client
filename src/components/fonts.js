import { 
    Barlow,
    Barlow_Condensed,
    Poppins,
} from "next/font/google";

const b1 = Barlow_Condensed({ subsets: ['latin'], weight: '500' });
const b2 = Barlow({ subsets: ['latin'], weight: '500' });
const p1 = Poppins({ subsets: ['latin'], weight: '400' });
const p2 = Poppins({ subsets: ['latin'], weight: '700' });

export const barlow_condensed = b1.className;
export const barlow = b2.className;
export const poppins_regular = p1.className;
export const poppins_bold = p2.className;