import { formatNumber, shortenSuiAddress } from "@polymedia/suitcase-core";

export function isHex(str: string): boolean {
    return /^[0-9a-fA-F]*$/.test(str);
}

export function shortAddress(
    address: string,
    startsLength: number,
    endsLength: number,
): string {
    return shortenSuiAddress(
        address,
        Math.max(4, startsLength),
        Math.max(4, endsLength),
        undefined,
        "",
    );
}

export function shortNumber(num: number): string {
    return num < 1_000
        ? String(num)
        : formatNumber(num, "compact");
}
