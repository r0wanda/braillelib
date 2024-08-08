import got from 'got';
import _ora from 'ora';
import { join } from 'desm';
import { writeFile } from 'node:fs/promises';

const ora = (text: string) => _ora({ text }).start();

function fetchUnicode() {
    return got('https://www.unicode.org/Public/UCD/latest/ucd/UnicodeData.txt').text();
}
async function parseUnicode() {
    const spin = ora('Downloading unicode data');
    const r = new Map<number, string>();
    const txt = await fetchUnicode();
    spin.text = 'Splitting lines';
    const lines = txt.split('\n');
    let li = 0;
    bl: for (const l of lines) {
        spin.text = `Parsing lines (${li}/${lines.length})`;
        let code: number = -1;
        let name: string = '';
        const seg = l.split(';');
        if (seg.length < 2) continue;
        let ctrl = false;
        loop: for (let i = 0; i < seg.length; i++) {
            switch (i) {
                case 0:
                    code = parseInt(seg[i], 16);
                    break;
                case 1: 
                    if (seg[i] === '<control>') ctrl = true;
                    else {
                        name = seg[i];
                        break loop;
                    }
                    break;
                default: 
                    if (ctrl && seg[i] === 'N') {
                        name = seg[++i];
                        if (name === '') continue bl;
                        break;
                    }
            }
        }
        if (code < 0 || name.length < 1) throw new Error(`Could not parse line: ${l}`);
        r.set(code, name);
        li++;
    }
    spin.succeed('Parsed unicode data');
    return r;
}

function gen(start: number, end: number, names: Map<number, string>) {
    const a = new Map<number, string>();
    for (let i = start; i <= end; i++) {
        let id = names.get(i)?.split('-');
        if (!id) throw new Error('Could not find code');
        if (id[0].toLowerCase().includes('blank')) id = ['', '0'];
        const n = parseInt(id[1]);
        if (isNaN(n)) throw new Error('Could not parse code');
        a.set(n, String.fromCharCode(i));
    }
    return a;
}
function map2Str(map: Map<any, any>) {
    return JSON.stringify([...map]);
}
const uni = await parseUnicode();
await writeFile(join(import.meta.url, '6dot.json'), map2Str(gen(0x2800, 0x283f, uni)));
await writeFile(join(import.meta.url, '8dot.json'), map2Str(gen(0x2840, 0x28ff, uni)));
