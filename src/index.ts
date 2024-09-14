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
            const d6 = [...dot6.entries()].find(e => e[1] === ch)?.[0];
            const d8 = [...dot8.entries()].find(e => e[1] === ch)?.[0];
            if (d6) {
                this._dots = 6;
                this._code = d6;
            } else if (d8) {
                this._dots = 8;
                this._code = d8;
            } else {
                this._dots = 6;
                this._code = 0;
            }
            this._ch = this.dots === 8 ? dot8.get(this._code) || dot6.get(this._code)! : dot6.get(this._code)!;
        } else if (typeof ch === 'number') {
            this._dots = ch >= 8 ? 8 : 6;
        }
        if (!this._ch) this._ch = dot6.get(0)!;

    }
    // manipulation fns
    grow(method: GrowMethods = 'nearest2', dir: 'top' | 'bottom' = 'bottom') {
        if (this.dots >= 8) return;
        const n = new Braille(8);
        if (dir === 'top') {

        } else {
            for (let i = 1; i <= 8; i++) {
                n.xy(i, this.xy(i));
            }
            switch (method) {
                case 'tack':
                    
            }
        }
    }
    invert() {
        for (let i = 1; i <= this.dots; i++) {
            this.xy(i, !this.xy(i));
        }
    }
    /**
     * Get pixel at index
     * @param n 
     */
    xy(n: number): boolean
    /**
     * Get pixel at coordinates
     * @param x 
     * @param y 
     */
    xy(x: number, y: number): boolean
    /**
     * Set pixel at index
     * @param n 
     * @param v 
     */
    xy(n: number, v: boolean): void
    /**
     * Set pixel at coordinates
     * @param x 
     * @param y 
     * @param v 
     */
    xy(x: number, y: number, v: boolean): void
    /**
     * Get or set value at coordinates/index
     * @deprecated Use a different overload
     * @param x 
     * @param y 
     * @param v 
     * @returns 
     */
    xy(x: number, y?: number | boolean, v?: boolean): boolean | void {
        let code = this.codeArr();
        if (typeof y === 'boolean') {
            v = y;
            y = undefined;
        }
        let n;
        if (y === undefined) n = x;
        else n = x * 2 + y + 1;
        n = Math.floor(n);
        if (n > this.dots || n < 1) throw new RangeError('Coordinates out of range');
        if (v !== undefined) {
            if (v) code.push(n);
            else {
                const i = code.indexOf(n);
                if (i < 0) return;
                else code.splice(i, 1);
            }
            code.sort();
            this._code = parseInt(code.join(''));
            if (isNaN(this._code)) this._code = 0;
            const ch = this.dots === 8 ? dot8.get(this._code) || dot6.get(this._code) : dot6.get(this._code);
            if (!ch) throw new Error(`Could not find char ${this._code}`);
            this._ch = ch;
        } else {
            return code.indexOf(x) >= 0;
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
        if (!strict) code = parseInt(Braille.codeArr(code).join(''));
        if (dots !== undefined) {
            if (dots >= 8) ch = dot8.get(code);
            else ch = dot6.get(code);
        } else ch = dot6.get(code) || dot8.get(code);
        if (!ch) ch = dot6.get(0)!;
        return new Braille(ch);
    }
    static codeArr(code: number) {
        return [...new Set(code.toString().split('').map(n => parseInt(n)).toSorted())];
    }
    codeArr() {
        return [...new Set(this.code.toString().split('').map(n => parseInt(n)).toSorted())];
    }
    setCode(code: number, strict = false, dots?: number) {
        Object.assign(this, Braille.fromCode(code, strict, dots));
    }
    static dot6 = dot6;
    static dot8 = dot8;
}
/*export class BrailleImg {
    m: Braille[][];
    constructor(img: string)
    constructor(w: number, h: number)
    constructor(img: string | number, h?: number) {
        this.m = [];
        const imgr = typeof img === 'string' ? img.split('\n') : undefined;
        const w = typeof img === 'number' ? img : undefined;
        for (let y = 0; y < (h || imgr?.length || 0); y++) {
            let r = [];
            for (let x = 0; x < (w || imgr?.[y].length || 0); x++) {
                // @ts-ignore
                r.push(new Braille(imgr?.[y]?.charAt(x) || 8));
            }
            this.m.push(r);
        }
    }
    xy()
    invert() {
        for (const r of this.m) {
            for (const b of r) {
                b.invert();
            }
        }
    }
    render() {
        let s = '';
        for (const r of this.m) {
            for (const b of r) {
                s += b.ch;
            }
            s += '\n';
        }
        return s;
    }
}*/
