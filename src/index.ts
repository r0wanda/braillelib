import { join } from 'desm';
import { readFile } from 'node:fs/promises';

export const dot6 = new Map<number, string>(JSON.parse(await readFile(join(import.meta.url, '6dot.json'), 'utf8')));
export const dot8 = new Map<number, string>(JSON.parse(await readFile(join(import.meta.url, '8dot.json'), 'utf8')));

export type GrowMethods = 'tack' | 'tackfull' | 'dupe' | 'nearest' | 'nearest2';
export type ShrinkMethods = 'remove' | 'squish' | 'squishminus' | 'nearest' | 'nearest2';

export class Braille {
    get ch() {
        return this._ch;
    }
    set ch(ch: string) {
        Object.assign(this, new Braille(ch));
    }
    get code() {
        return this._code;
    }
    set code(code: number) {
        this.setCode(code);
    }
    get dots() {
        return this._dots >= 8 ? 8 : 6;
    }
    set dots(dots: number) {
        if (dots < this._dots) throw new RangeError('Cannot shrink character implicitly, use .shrink');
        this.grow();
    }
    _ch: string;
    _code: number;
    _dots: number;
    /**
     * By default, a blank 6-dot braille character is used
     */
    constructor()
    /**
     * Parse a braille character
     * @param ch The character to parse
     */
    constructor(ch: string)
    /**
     * Create a blank character with 6 or 8 dots
     * @param dots Number of dots (will be rounded to 6 or 8) 
     */
    constructor(dots: number)
    constructor(ch?: string | number) {
        this._ch = '';
        this._code = 0;
        this._dots = 6;
        if (typeof ch === 'string') {
            this._ch = ch;
            this._code = [...dot6.entries()].find(e => e[1] === ch)?.[0] || 0;
        } else if (typeof ch === 'number') {
            this._dots = ch >= 8 ? 8 : 6;
        }
        if (!this._ch) this._ch = dot6.get(0)!;
    }
    // manipulation fns
    grow(method: GrowMethods = 'nearest2', dir: 'up' | 'down' = 'up') {
        if (this._dots >= 8) return;
        const n = new Braille(8);
        if (dir === 'up') {

        } else {
            switch (method) {
                case 'tack':

            }
        }
    }

    /**
     * Get character instance from code
     * @param code numeric code
     * @param strict only use codes from database, otherwise construct new character to use
     * @param dots Either 6 or 8, otherwise try to guess then default to 6
     * @returns 
     */
    static fromCode(code: number, strict = false, dots?: number) {
        let ch;
        if (!strict) code = parseInt([...new Set(code.toString().split('').map(n => parseInt(n)).toSorted())].join(''));
        if (dots !== undefined) {
            if (dots >= 8) ch = dot8.get(code);
            else ch = dot6.get(code);
        } else ch = dot6.get(code) || dot8.get(code);
        if (!ch) ch = dot6.get(0)!;
        return new Braille(ch);
    }
    setCode(code: number, strict = false, dots?: number) {
        Object.assign(this, Braille.fromCode(code, strict, dots));
    }
    static dot6 = dot6;
    static dot8 = dot8;
}
export class BrailleImg {
    
}