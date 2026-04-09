

function parseAsnFile(file: File): Promise<Asn[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            const lines = text.split('\n').map(line => line.trim().split('\t')).filter(line => line.length > 0);

            const asns: Asn[] = lines.map(line => ({
                deliveryNo: line[0],
                material: line[1],
                qty: parseInt(line[3], 10),
                sscc: line[2]
            }));

            resolve(asns);
        };
        reader.onerror = () => {
            reject(new Error('Error reading file'));
        };
        reader.readAsText(file);
    });
}

export async function importTxtFile(file: File): Promise<Asn[]> {
    try {
        const asns = await parseAsnFile(file);
        console.log('Parsed ASNs:', asns);
        return asns;
    } catch (error) {
        console.error('Error importing TXT file:', error);
        alert('Failed to import TXT file');
        return [];
    }
}
