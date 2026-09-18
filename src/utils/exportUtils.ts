/**
 * Garden of Mine shared export utilities.
 *
 * Architecture contract:
 * - Features own WHAT an export contains.
 * - This module owns reusable HOW mechanics.
 * - Specialist exporters (for example Comparison XLSX) may consume these
 *   helpers without surrendering their feature-specific document structure.
 */

export function safeFileName(
    value: string,
    fallback = 'garden-of-mine-export',
): string {
    return (
        value
            .trim()
            .replace(
                /[^a-z0-9]+/gi,
                '-',
            )
            .replace(
                /^-+|-+$/g,
                '',
            )
            .toLowerCase() ||
        fallback
    );
}


export function escapeRtf(
    value: string,
    newline: 'line' | 'paragraph' = 'line',
): string {
    // RTF Unicode values are signed UTF-16 code units. Do not use a
    // code-point iterator here: emoji need both halves of their surrogate pair.
    return value
        .replace(/\\/g, '\\\\')
        .replace(/{/g, '\\{')
        .replace(/}/g, '\\}')
        .replace(/\r\n|\r|\n/g, newline === 'paragraph' ? '\\par\n' : '\\line ')
        .replace(/[^\x00-\x7F]/g, character => {
            const code = character.charCodeAt(0);
            return `\\u${code > 32767 ? code - 65536 : code}?`;
        });
}

/** Knowledge documents preserve paragraphs rather than soft line breaks. */
export function escapeRtfParagraph(value: string): string {
    return escapeRtf(value, 'paragraph');
}


export function downloadBlob(
    filename: string,
    blob: Blob,
): void {
    const url =
        URL.createObjectURL(
            blob,
        );

    const anchor =
        document.createElement(
            'a',
        );

    anchor.href =
        url;

    anchor.download =
        filename;

    document.body.appendChild(
        anchor,
    );

    anchor.click();

    anchor.remove();

    window.setTimeout(
        () => {
            URL.revokeObjectURL(
                url,
            );
        },
        1000,
    );
}


export function downloadTextFile(
    filename: string,
    content: string,
    type = 'text/plain;charset=utf-8',
): void {
    downloadBlob(
        filename,
        new Blob(
            [
                content,
            ],
            {
                type,
            },
        ),
    );
}


export function downloadJson(
    filename: string,
    value: unknown,
    spacing = 2,
): void {
    downloadTextFile(
        filename,
        JSON.stringify(
            value,
            null,
            spacing,
        ),
        'application/json;charset=utf-8',
    );
}


export function printDocument(): void {
    window.print();
}
