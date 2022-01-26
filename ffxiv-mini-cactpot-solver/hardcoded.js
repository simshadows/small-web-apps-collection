/*
 * Filename: hardcoded.js
 * Author:   simshadows <contact@simshadows.com>
 * License:  GNU Affero General Public License v3 (AGPL-3.0)
 *
 * The algorithm is quite slow at initial stages, so some hardcoding is done
 * for these few extremely common states.
 */

const assert = console.assert;

const defaultPayouts = [
    10000, // 6
    36, // 7
    720, // 8
    360, // 9
    80, // 10
    252, // 11
    108, // 12
    72, // 13
    54, // 14
    180, // 15
    72, // 16
    180, // 17
    119, // 18
    36, // 19
    306, // 20
    1080, // 21
    144, // 22
    1800, // 23
    3600, // 24
];

export function getDefaultPayouts() {
    return defaultPayouts.slice();
}

// A general-purpose utility function that I don't really know where to put
// without bloating the codebase.
export function intArraysAreEqual(a, b) {
    if (a.length !== b.length) return false;
    for (const [i, v] of a.entries()) {
        if (b[i] !== v) return false;
    }
    return true;
}

export function getHardcodedValues(knownNumbers, payouts) {
    // Hardcoded values only supported for default payouts
    if (!intArraysAreEqual(payouts, defaultPayouts)) return undefined;
    return postprocessedValues.get(knownNumbers.join());
}

const preprocessedValues = [
    [[null,null,null,null,null,null,null,null,null], {
        linesAverages: {a: 360.3452, b: 360.3452, c: 360.3452, d: 360.3452, e: 360.3452, f: 360.3452, g: 360.3452, h: 360.3452},
        selectionScores: [1510.4806, 1453.1979, 1510.4806, 1453.1979, 1510.1404, 1453.1979, 1510.4806, 1453.1979, 1510.4806],
    }],
    [[1,null,null,null,null,null,null,null,null], {
        linesAverages: {a: 528.7500, b: 528.7500, c: 276.1429, d: 276.1429, e: 276.1429, f: 528.7500, g: 276.1429, h: 276.1429},
        selectionScores: [null, 1619.0682, 1677.7854, 1619.0682, 1677.5339, 1533.5155, 1677.7854, 1533.5155, 1634.5375],
    }],
    [[2,null,null,null,null,null,null,null,null], {
        linesAverages: {a: 510.4643, b: 510.4643, c: 285.2857, d: 285.2857, e: 285.2857, f: 510.4643, g: 285.2857, h: 285.2857},
        selectionScores: [null, 1611.9324, 1665.8128, 1611.9324, 1664.1696, 1510.8488, 1665.8128, 1510.8488, 1620.8137],
    }],
    [[3,null,null,null,null,null,null,null,null], {
        linesAverages: {a: 511.5000, b: 511.5000, c: 284.7679, d: 284.7679, e: 284.7679, f: 511.5000, g: 284.7679, h: 284.7679},
        selectionScores: [null, 1606.1372, 1662.5048, 1606.1372, 1661.3378, 1509.7414, 1662.5048, 1509.7414, 1616.8524],
    }],
    [[4,null,null,null,null,null,null,null,null], {
        linesAverages: {a: 183.6429, b: 183.6429, c: 448.6964, d: 448.6964, e: 448.6964, f: 183.6429, g: 448.6964, h: 448.6964},
        selectionScores: [null, 1302.5446, 1356.8411, 1302.5446, 1365.0048, 1342.5289, 1356.8411, 1342.5289, 1331.1696],
    }],
    [[5,null,null,null,null,null,null,null,null], {
        linesAverages: {a: 193.5714, b: 193.5714, c: 443.7321, d: 443.7321, e: 443.7321, f: 193.5714, g: 443.7321, h: 443.7321},
        selectionScores: [null, 1298.0702, 1354.6107, 1298.0702, 1359.5589, 1337.8012, 1354.6107, 1337.8012, 1327.4399],
    }],
    [[6,null,null,null,null,null,null,null,null], {
        linesAverages: {a: 230.9643, b: 230.9643, c: 425.0357, d: 425.0357, e: 425.0357, f: 230.9643, g: 425.0357, h: 425.0357},
        selectionScores: [null, 1306.0068, 1360.2601, 1306.0068, 1364.3045, 1330.9220, 1360.2601, 1330.9220, 1327.6789],
    }],
    [[7,null,null,null,null,null,null,null,null], {
        linesAverages: {a: 318.3929, b: 318.3929, c: 381.3214, d: 381.3214, e: 381.3214, f: 318.3929, g: 381.3214, h: 381.3214},
        selectionScores: [null, 1388.0473, 1453.3286, 1388.0473, 1454.5455, 1404.2524, 1453.3286, 1404.2524, 1404.5280],
    }],
    [[8,null,null,null,null,null,null,null,null], {
        linesAverages: {a: 381.7500, b: 381.7500, c: 349.6429, d: 349.6429, e: 349.6429, f: 381.7500, g: 349.6429, h: 349.6429},
        selectionScores: [null, 1448.1720, 1527.0875, 1448.1720, 1527.0875, 1467.6640, 1527.0875, 1467.6640, 1478.8917],
    }],
    [[9,null,null,null,null,null,null,null,null], {
        linesAverages: {a: 384.0714, b: 384.0714, c: 348.4821, d: 348.4821, e: 348.4821, f: 384.0714, g: 348.4821, h: 348.4821},
        selectionScores: [null, 1450.6283, 1517.7214, 1450.6283, 1517.7214, 1455.7845, 1517.7214, 1455.7845, 1467.5563],
    }],
    [[null,1,null,null,null,null,null,null,null], {
        linesAverages: {a: 276.1429, b: 276.1429, c: 528.7500, d: 276.1429, e: 276.1429, f: 528.7500, g: 276.1429, h: 276.1429},
        selectionScores: [1407.7057, null, 1407.7057, 1332.5116, 1411.3542, 1332.5116, 1374.8491, 1309.5351, 1374.8491],
    }],
    [[null,2,null,null,null,null,null,null,null], {
        linesAverages: {a: 285.2857, b: 285.2857, c: 510.4643, d: 285.2857, e: 285.2857, f: 510.4643, g: 285.2857, h: 285.2857},
        selectionScores: [1408.3164, null, 1408.3164, 1326.7238, 1414.9402, 1326.7238, 1373.2670, 1310.2732, 1373.2670],
    }],
    [[null,3,null,null,null,null,null,null,null], {
        linesAverages: {a: 284.7679, b: 284.7679, c: 511.5000, d: 284.7679, e: 284.7679, f: 511.5000, g: 284.7679, h: 284.7679},
        selectionScores: [1400.4039, null, 1400.4039, 1320.3009, 1406.4190, 1320.3009, 1367.5062, 1302.5768, 1367.5062],
    }],
    [[null,4,null,null,null,null,null,null,null], {
        linesAverages: {a: 448.6964, b: 448.6964, c: 183.6429, d: 448.6964, e: 448.6964, f: 183.6429, g: 448.6964, h: 448.6964},
        selectionScores: [1431.6339, null, 1431.6339, 1431.6339, 1442.3848, 1431.6339, 1443.3062, 1302.5446, 1443.3062],
    }],
    [[null,5,null,null,null,null,null,null,null], {
        linesAverages: {a: 443.7321, b: 443.7321, c: 193.5714, d: 443.7321, e: 443.7321, f: 193.5714, g: 443.7321, h: 443.7321},
        selectionScores: [1430.3744, null, 1430.3744, 1430.3744, 1444.3173, 1430.3744, 1444.3173, 1298.0702, 1444.3173],
    }],
    [[null,6,null,null,null,null,null,null,null], {
        linesAverages: {a: 425.0357, b: 425.0357, c: 230.9643, d: 425.0357, e: 425.0357, f: 230.9643, g: 425.0357, h: 425.0357},
        selectionScores: [1437.6369, null, 1437.6369, 1420.7917, 1441.3664, 1420.7917, 1437.6985, 1296.9366, 1437.6985],
    }],
    [[null,7,null,null,null,null,null,null,null], {
        linesAverages: {a: 381.3214, b: 381.3214, c: 318.3929, d: 381.3214, e: 381.3214, f: 318.3929, g: 381.3214, h: 381.3214},
        selectionScores: [1483.1417, null, 1483.1417, 1436.5646, 1485.6839, 1436.5646, 1467.1539, 1319.0854, 1467.1539],
    }],
    [[null,8,null,null,null,null,null,null,null], {
        linesAverages: {a: 349.6429, b: 349.6429, c: 381.7500, d: 349.6429, e: 349.6429, f: 381.7500, g: 349.6429, h: 349.6429},
        selectionScores: [1512.9280, null, 1512.9280, 1461.6810, 1498.2048, 1461.6810, 1489.7226, 1337.5435, 1489.7226],
    }],
    [[null,9,null,null,null,null,null,null,null], {
        linesAverages: {a: 348.4821, b: 348.4821, c: 384.0714, d: 348.4821, e: 348.4821, f: 384.0714, g: 348.4821, h: 348.4821},
        selectionScores: [1518.4664, null, 1518.4664, 1464.1967, 1503.3565, 1464.1967, 1495.2378, 1341.7625, 1495.2378],
    }],
    [[null,null,1,null,null,null,null,null,null], {
        linesAverages: {a: 276.1429, b: 276.1429, c: 276.1429, d: 528.7500, e: 528.7500, f: 528.7500, g: 276.1429, h: 276.1429},
        selectionScores: [1677.7854, 1619.0682, null, 1533.5155, 1677.5339, 1619.0682, 1634.5375, 1533.5155, 1677.7854],
    }],
    [[null,null,2,null,null,null,null,null,null], {
        linesAverages: {a: 285.2857, b: 285.2857, c: 285.2857, d: 510.4643, e: 510.4643, f: 510.4643, g: 285.2857, h: 285.2857},
        selectionScores: [1665.8128, 1611.9324, null, 1510.8488, 1664.1696, 1611.9324, 1620.8137, 1510.8488, 1665.8128],
    }],
    [[null,null,3,null,null,null,null,null,null], {
        linesAverages: {a: 284.7679, b: 284.7679, c: 284.7679, d: 511.5000, e: 511.5000, f: 511.5000, g: 284.7679, h: 284.7679},
        selectionScores: [1662.5048, 1606.1372, null, 1509.7414, 1661.3378, 1606.1372, 1616.8524, 1509.7414, 1662.5048],
    }],
    [[null,null,4,null,null,null,null,null,null], {
        linesAverages: {a: 448.6964, b: 448.6964, c: 448.6964, d: 183.6429, e: 183.6429, f: 183.6429, g: 448.6964, h: 448.6964},
        selectionScores: [1356.8411, 1302.5446, null, 1342.5289, 1365.0048, 1302.5446, 1331.1696, 1342.5289, 1356.8411],
    }],
    [[null,null,5,null,null,null,null,null,null], {
        linesAverages: {a: 443.7321, b: 443.7321, c: 443.7321, d: 193.5714, e: 193.5714, f: 193.5714, g: 443.7321, h: 443.7321},
        selectionScores: [1354.6107, 1298.0702, null, 1337.8012, 1359.5589, 1298.0702, 1327.4399, 1337.8012, 1354.6107],
    }],
    [[null,null,6,null,null,null,null,null,null], {
        linesAverages: {a: 425.0357, b: 425.0357, c: 425.0357, d: 230.9643, e: 230.9643, f: 230.9643, g: 425.0357, h: 425.0357},
        selectionScores: [1360.2601, 1306.0068, null, 1330.9220, 1364.3045, 1306.0068, 1327.6789, 1330.9220, 1360.2601],
    }],
    [[null,null,7,null,null,null,null,null,null], {
        linesAverages: {a: 381.3214, b: 381.3214, c: 381.3214, d: 318.3929, e: 318.3929, f: 318.3929, g: 381.3214, h: 381.3214},
        selectionScores: [1453.3286, 1388.0473, null, 1404.2524, 1454.5455, 1388.0473, 1404.5280, 1404.2524, 1453.3286],
    }],
    [[null,null,8,null,null,null,null,null,null], {
        linesAverages: {a: 349.6429, b: 349.6429, c: 349.6429, d: 381.7500, e: 381.7500, f: 381.7500, g: 349.6429, h: 349.6429},
        selectionScores: [1527.0875, 1448.1720, null, 1467.6640, 1527.0875, 1448.1720, 1478.8917, 1467.6640, 1527.0875],
    }],
    [[null,null,9,null,null,null,null,null,null], {
        linesAverages: {a: 348.4821, b: 348.4821, c: 348.4821, d: 384.0714, e: 384.0714, f: 384.0714, g: 348.4821, h: 348.4821},
        selectionScores: [1517.7214, 1450.6283, null, 1455.7845, 1517.7214, 1450.6283, 1467.5563, 1455.7845, 1517.7214],
    }],
    [[null,null,null,1,null,null,null,null,null], {
        linesAverages: {a: 276.1429, b: 528.7500, c: 276.1429, d: 276.1429, e: 276.1429, f: 276.1429, g: 528.7500, h: 276.1429},
        selectionScores: [1407.7057, 1332.5116, 1374.8491, null, 1411.3542, 1309.5351, 1407.7057, 1332.5116, 1374.8491],
    }],
    [[null,null,null,2,null,null,null,null,null], {
        linesAverages: {a: 285.2857, b: 510.4643, c: 285.2857, d: 285.2857, e: 285.2857, f: 285.2857, g: 510.4643, h: 285.2857},
        selectionScores: [1408.3164, 1326.7238, 1373.2670, null, 1414.9402, 1310.2732, 1408.3164, 1326.7238, 1373.2670],
    }],
    [[null,null,null,3,null,null,null,null,null], {
        linesAverages: {a: 284.7679, b: 511.5000, c: 284.7679, d: 284.7679, e: 284.7679, f: 284.7679, g: 511.5000, h: 284.7679},
        selectionScores: [1400.4039, 1320.3009, 1367.5062, null, 1406.4190, 1302.5768, 1400.4039, 1320.3009, 1367.5062],
    }],
    [[null,null,null,4,null,null,null,null,null], {
        linesAverages: {a: 448.6964, b: 183.6429, c: 448.6964, d: 448.6964, e: 448.6964, f: 448.6964, g: 183.6429, h: 448.6964},
        selectionScores: [1431.6339, 1431.6339, 1443.3062, null, 1442.3848, 1302.5446, 1431.6339, 1431.6339, 1443.3062],
    }],
    [[null,null,null,5,null,null,null,null,null], {
        linesAverages: {a: 443.7321, b: 193.5714, c: 443.7321, d: 443.7321, e: 443.7321, f: 443.7321, g: 193.5714, h: 443.7321},
        selectionScores: [1430.3744, 1430.3744, 1444.3173, null, 1444.3173, 1298.0702, 1430.3744, 1430.3744, 1444.3173],
    }],
    [[null,null,null,6,null,null,null,null,null], {
        linesAverages: {a: 425.0357, b: 230.9643, c: 425.0357, d: 425.0357, e: 425.0357, f: 425.0357, g: 230.9643, h: 425.0357},
        selectionScores: [1437.6369, 1420.7917, 1437.6985, null, 1441.3664, 1296.9366, 1437.6369, 1420.7917, 1437.6985],
    }],
    [[null,null,null,7,null,null,null,null,null], {
        linesAverages: {a: 381.3214, b: 318.3929, c: 381.3214, d: 381.3214, e: 381.3214, f: 381.3214, g: 318.3929, h: 381.3214},
        selectionScores: [1483.1417, 1436.5646, 1467.1539, null, 1485.6839, 1319.0854, 1483.1417, 1436.5646, 1467.1539],
    }],
    [[null,null,null,8,null,null,null,null,null], {
        linesAverages: {a: 349.6429, b: 381.7500, c: 349.6429, d: 349.6429, e: 349.6429, f: 349.6429, g: 381.7500, h: 349.6429},
        selectionScores: [1512.9280, 1461.6810, 1489.7226, null, 1498.2048, 1337.5435, 1512.9280, 1461.6810, 1489.7226],
    }],
    [[null,null,null,9,null,null,null,null,null], {
        linesAverages: {a: 348.4821, b: 384.0714, c: 348.4821, d: 348.4821, e: 348.4821, f: 348.4821, g: 384.0714, h: 348.4821},
        selectionScores: [1518.4664, 1464.1967, 1495.2378, null, 1503.3565, 1341.7625, 1518.4664, 1464.1967, 1495.2378],
    }],
    [[null,null,null,null,1,null,null,null,null], {
        linesAverages: {a: 528.7500, b: 276.1429, c: 528.7500, d: 276.1429, e: 528.7500, f: 276.1429, g: 528.7500, h: 276.1429},
        selectionScores: [1860.4402, 1823.3801, 1860.4402, 1823.3801, null, 1823.3801, 1860.4402, 1823.3801, 1860.4402],
    }],
    [[null,null,null,null,2,null,null,null,null], {
        linesAverages: {a: 510.4643, b: 285.2857, c: 510.4643, d: 285.2857, e: 510.4643, f: 285.2857, g: 510.4643, h: 285.2857},
        selectionScores: [1832.5414, 1799.1833, 1832.5414, 1799.1833, null, 1799.1833, 1832.5414, 1799.1833, 1832.5414],
    }],
    [[null,null,null,null,3,null,null,null,null], {
        linesAverages: {a: 511.5000, b: 284.7679, c: 511.5000, d: 284.7679, e: 511.5000, f: 284.7679, g: 511.5000, h: 284.7679},
        selectionScores: [1834.1798, 1798.6134, 1834.1798, 1798.6134, null, 1798.6134, 1834.1798, 1798.6134, 1834.1798],
    }],
    [[null,null,null,null,4,null,null,null,null], {
        linesAverages: {a: 183.6429, b: 448.6964, c: 183.6429, d: 448.6964, e: 183.6429, f: 448.6964, g: 183.6429, h: 448.6964},
        selectionScores: [1171.9670, 1151.8619, 1171.9670, 1151.8619, null, 1151.8619, 1171.9670, 1151.8619, 1171.9670],
    }],
    [[null,null,null,null,5,null,null,null,null], {
        linesAverages: {a: 193.5714, b: 443.7321, c: 193.5714, d: 443.7321, e: 193.5714, f: 443.7321, g: 193.5714, h: 443.7321},
        selectionScores: [1176.2048, 1149.9336, 1176.2048, 1149.9336, null, 1149.9336, 1176.2048, 1149.9336, 1176.2048],
    }],
    [[null,null,null,null,6,null,null,null,null], {
        linesAverages: {a: 230.9643, b: 425.0357, c: 230.9643, d: 425.0357, e: 230.9643, f: 425.0357, g: 230.9643, h: 425.0357},
        selectionScores: [1234.6143, 1180.9884, 1234.6143, 1180.9884, null, 1180.9884, 1234.6143, 1180.9884, 1234.6143],
    }],
    [[null,null,null,null,7,null,null,null,null], {
        linesAverages: {a: 318.3929, b: 381.3214, c: 318.3929, d: 381.3214, e: 318.3929, f: 381.3214, g: 318.3929, h: 381.3214},
        selectionScores: [1427.3583, 1325.8366, 1427.3583, 1325.8366, null, 1325.8366, 1427.3583, 1325.8366, 1427.3583],
    }],
    [[null,null,null,null,8,null,null,null,null], {
        linesAverages: {a: 381.7500, b: 349.6429, c: 381.7500, d: 349.6429, e: 381.7500, f: 349.6429, g: 381.7500, h: 349.6429},
        selectionScores: [1544.7607, 1416.9833, 1544.7607, 1416.9833, null, 1416.9833, 1544.7607, 1416.9833, 1544.7607],
    }],
    [[null,null,null,null,9,null,null,null,null], {
        linesAverages: {a: 384.0714, b: 348.4821, c: 384.0714, d: 348.4821, e: 384.0714, f: 348.4821, g: 384.0714, h: 348.4821},
        selectionScores: [1509.1976, 1401.2464, 1509.1976, 1401.2464, null, 1401.2464, 1509.1976, 1401.2464, 1509.1976],
    }],
    [[null,null,null,null,null,1,null,null,null], {
        linesAverages: {a: 276.1429, b: 276.1429, c: 276.1429, d: 528.7500, e: 276.1429, f: 276.1429, g: 528.7500, h: 276.1429},
        selectionScores: [1374.8491, 1332.5116, 1407.7057, 1309.5351, 1411.3542, null, 1374.8491, 1332.5116, 1407.7057],
    }],
    [[null,null,null,null,null,2,null,null,null], {
        linesAverages: {a: 285.2857, b: 285.2857, c: 285.2857, d: 510.4643, e: 285.2857, f: 285.2857, g: 510.4643, h: 285.2857},
        selectionScores: [1373.2670, 1326.7238, 1408.3164, 1310.2732, 1414.9402, null, 1373.2670, 1326.7238, 1408.3164],
    }],
    [[null,null,null,null,null,3,null,null,null], {
        linesAverages: {a: 284.7679, b: 284.7679, c: 284.7679, d: 511.5000, e: 284.7679, f: 284.7679, g: 511.5000, h: 284.7679},
        selectionScores: [1367.5062, 1320.3009, 1400.4039, 1302.5768, 1406.4190, null, 1367.5062, 1320.3009, 1400.4039],
    }],
    [[null,null,null,null,null,4,null,null,null], {
        linesAverages: {a: 448.6964, b: 448.6964, c: 448.6964, d: 183.6429, e: 448.6964, f: 448.6964, g: 183.6429, h: 448.6964},
        selectionScores: [1443.3062, 1431.6339, 1431.6339, 1302.5446, 1442.3848, null, 1443.3062, 1431.6339, 1431.6339],
    }],
    [[null,null,null,null,null,5,null,null,null], {
        linesAverages: {a: 443.7321, b: 443.7321, c: 443.7321, d: 193.5714, e: 443.7321, f: 443.7321, g: 193.5714, h: 443.7321},
        selectionScores: [1444.3173, 1430.3744, 1430.3744, 1298.0702, 1444.3173, null, 1444.3173, 1430.3744, 1430.3744],
    }],
    [[null,null,null,null,null,6,null,null,null], {
        linesAverages: {a: 425.0357, b: 425.0357, c: 425.0357, d: 230.9643, e: 425.0357, f: 425.0357, g: 230.9643, h: 425.0357},
        selectionScores: [1437.6985, 1420.7917, 1437.6369, 1296.9366, 1441.3664, null, 1437.6985, 1420.7917, 1437.6369],
    }],
    [[null,null,null,null,null,7,null,null,null], {
        linesAverages: {a: 381.3214, b: 381.3214, c: 381.3214, d: 318.3929, e: 381.3214, f: 381.3214, g: 318.3929, h: 381.3214},
        selectionScores: [1467.1539, 1436.5646, 1483.1417, 1319.0854, 1485.6839, null, 1467.1539, 1436.5646, 1483.1417],
    }],
    [[null,null,null,null,null,8,null,null,null], {
        linesAverages: {a: 349.6429, b: 349.6429, c: 349.6429, d: 381.7500, e: 349.6429, f: 349.6429, g: 381.7500, h: 349.6429},
        selectionScores: [1489.7226, 1461.6810, 1512.9280, 1337.5435, 1498.2048, null, 1489.7226, 1461.6810, 1512.9280],
    }],
    [[null,null,null,null,null,9,null,null,null], {
        linesAverages: {a: 348.4821, b: 348.4821, c: 348.4821, d: 384.0714, e: 348.4821, f: 348.4821, g: 384.0714, h: 348.4821},
        selectionScores: [1495.2378, 1464.1967, 1518.4664, 1341.7625, 1503.3565, null, 1495.2378, 1464.1967, 1518.4664],
    }],
    [[null,null,null,null,null,null,1,null,null], {
        linesAverages: {a: 276.1429, b: 528.7500, c: 276.1429, d: 276.1429, e: 528.7500, f: 276.1429, g: 276.1429, h: 528.7500},
        selectionScores: [1677.7854, 1533.5155, 1634.5375, 1619.0682, 1677.5339, 1533.5155, null, 1619.0682, 1677.7854],
    }],
    [[null,null,null,null,null,null,2,null,null], {
        linesAverages: {a: 285.2857, b: 510.4643, c: 285.2857, d: 285.2857, e: 510.4643, f: 285.2857, g: 285.2857, h: 510.4643},
        selectionScores: [1665.8128, 1510.8488, 1620.8137, 1611.9324, 1664.1696, 1510.8488, null, 1611.9324, 1665.8128],
    }],
    [[null,null,null,null,null,null,3,null,null], {
        linesAverages: {a: 284.7679, b: 511.5000, c: 284.7679, d: 284.7679, e: 511.5000, f: 284.7679, g: 284.7679, h: 511.5000},
        selectionScores: [1662.5048, 1509.7414, 1616.8524, 1606.1372, 1661.3378, 1509.7414, null, 1606.1372, 1662.5048],
    }],
    [[null,null,null,null,null,null,4,null,null], {
        linesAverages: {a: 448.6964, b: 183.6429, c: 448.6964, d: 448.6964, e: 183.6429, f: 448.6964, g: 448.6964, h: 183.6429},
        selectionScores: [1356.8411, 1342.5289, 1331.1696, 1302.5446, 1365.0048, 1342.5289, null, 1302.5446, 1356.8411],
    }],
    [[null,null,null,null,null,null,5,null,null], {
        linesAverages: {a: 443.7321, b: 193.5714, c: 443.7321, d: 443.7321, e: 193.5714, f: 443.7321, g: 443.7321, h: 193.5714},
        selectionScores: [1354.6107, 1337.8012, 1327.4399, 1298.0702, 1359.5589, 1337.8012, null, 1298.0702, 1354.6107],
    }],
    [[null,null,null,null,null,null,6,null,null], {
        linesAverages: {a: 425.0357, b: 230.9643, c: 425.0357, d: 425.0357, e: 230.9643, f: 425.0357, g: 425.0357, h: 230.9643},
        selectionScores: [1360.2601, 1330.9220, 1327.6789, 1306.0068, 1364.3045, 1330.9220, null, 1306.0068, 1360.2601],
    }],
    [[null,null,null,null,null,null,7,null,null], {
        linesAverages: {a: 381.3214, b: 318.3929, c: 381.3214, d: 381.3214, e: 318.3929, f: 381.3214, g: 381.3214, h: 318.3929},
        selectionScores: [1453.3286, 1404.2524, 1404.5280, 1388.0473, 1454.5455, 1404.2524, null, 1388.0473, 1453.3286],
    }],
    [[null,null,null,null,null,null,8,null,null], {
        linesAverages: {a: 349.6429, b: 381.7500, c: 349.6429, d: 349.6429, e: 381.7500, f: 349.6429, g: 349.6429, h: 381.7500},
        selectionScores: [1527.0875, 1467.6640, 1478.8917, 1448.1720, 1527.0875, 1467.6640, null, 1448.1720, 1527.0875],
    }],
    [[null,null,null,null,null,null,9,null,null], {
        linesAverages: {a: 348.4821, b: 384.0714, c: 348.4821, d: 348.4821, e: 384.0714, f: 348.4821, g: 348.4821, h: 384.0714},
        selectionScores: [1517.7214, 1455.7845, 1467.5563, 1450.6283, 1517.7214, 1455.7845, null, 1450.6283, 1517.7214],
    }],
    [[null,null,null,null,null,null,null,1,null], {
        linesAverages: {a: 276.1429, b: 276.1429, c: 528.7500, d: 276.1429, e: 276.1429, f: 276.1429, g: 276.1429, h: 528.7500},
        selectionScores: [1374.8491, 1309.5351, 1374.8491, 1332.5116, 1411.3542, 1332.5116, 1407.7057, null, 1407.7057],
    }],
    [[null,null,null,null,null,null,null,2,null], {
        linesAverages: {a: 285.2857, b: 285.2857, c: 510.4643, d: 285.2857, e: 285.2857, f: 285.2857, g: 285.2857, h: 510.4643},
        selectionScores: [1373.2670, 1310.2732, 1373.2670, 1326.7238, 1414.9402, 1326.7238, 1408.3164, null, 1408.3164],
    }],
    [[null,null,null,null,null,null,null,3,null], {
        linesAverages: {a: 284.7679, b: 284.7679, c: 511.5000, d: 284.7679, e: 284.7679, f: 284.7679, g: 284.7679, h: 511.5000},
        selectionScores: [1367.5062, 1302.5768, 1367.5062, 1320.3009, 1406.4190, 1320.3009, 1400.4039, null, 1400.4039],
    }],
    [[null,null,null,null,null,null,null,4,null], {
        linesAverages: {a: 448.6964, b: 448.6964, c: 183.6429, d: 448.6964, e: 448.6964, f: 448.6964, g: 448.6964, h: 183.6429},
        selectionScores: [1443.3062, 1302.5446, 1443.3062, 1431.6339, 1442.3848, 1431.6339, 1431.6339, null, 1431.6339],
    }],
    [[null,null,null,null,null,null,null,5,null], {
        linesAverages: {a: 443.7321, b: 443.7321, c: 193.5714, d: 443.7321, e: 443.7321, f: 443.7321, g: 443.7321, h: 193.5714},
        selectionScores: [1444.3173, 1298.0702, 1444.3173, 1430.3744, 1444.3173, 1430.3744, 1430.3744, null, 1430.3744],
    }],
    [[null,null,null,null,null,null,null,6,null], {
        linesAverages: {a: 425.0357, b: 425.0357, c: 230.9643, d: 425.0357, e: 425.0357, f: 425.0357, g: 425.0357, h: 230.9643},
        selectionScores: [1437.6985, 1296.9366, 1437.6985, 1420.7917, 1441.3664, 1420.7917, 1437.6369, null, 1437.6369],
    }],
    [[null,null,null,null,null,null,null,7,null], {
        linesAverages: {a: 381.3214, b: 381.3214, c: 318.3929, d: 381.3214, e: 381.3214, f: 381.3214, g: 381.3214, h: 318.3929},
        selectionScores: [1467.1539, 1319.0854, 1467.1539, 1436.5646, 1485.6839, 1436.5646, 1483.1417, null, 1483.1417],
    }],
    [[null,null,null,null,null,null,null,8,null], {
        linesAverages: {a: 349.6429, b: 349.6429, c: 381.7500, d: 349.6429, e: 349.6429, f: 349.6429, g: 349.6429, h: 381.7500},
        selectionScores: [1489.7226, 1337.5435, 1489.7226, 1461.6810, 1498.2048, 1461.6810, 1512.9280, null, 1512.9280],
    }],
    [[null,null,null,null,null,null,null,9,null], {
        linesAverages: {a: 348.4821, b: 348.4821, c: 384.0714, d: 348.4821, e: 348.4821, f: 348.4821, g: 348.4821, h: 384.0714},
        selectionScores: [1495.2378, 1341.7625, 1495.2378, 1464.1967, 1503.3565, 1464.1967, 1518.4664, null, 1518.4664],
    }],
    [[null,null,null,null,null,null,null,null,1], {
        linesAverages: {a: 528.7500, b: 276.1429, c: 276.1429, d: 528.7500, e: 276.1429, f: 276.1429, g: 276.1429, h: 528.7500},
        selectionScores: [1634.5375, 1533.5155, 1677.7854, 1533.5155, 1677.5339, 1619.0682, 1677.7854, 1619.0682, null],
    }],
    [[null,null,null,null,null,null,null,null,2], {
        linesAverages: {a: 510.4643, b: 285.2857, c: 285.2857, d: 510.4643, e: 285.2857, f: 285.2857, g: 285.2857, h: 510.4643},
        selectionScores: [1620.8137, 1510.8488, 1665.8128, 1510.8488, 1664.1696, 1611.9324, 1665.8128, 1611.9324, null],
    }],
    [[null,null,null,null,null,null,null,null,3], {
        linesAverages: {a: 511.5000, b: 284.7679, c: 284.7679, d: 511.5000, e: 284.7679, f: 284.7679, g: 284.7679, h: 511.5000},
        selectionScores: [1616.8524, 1509.7414, 1662.5048, 1509.7414, 1661.3378, 1606.1372, 1662.5048, 1606.1372, null],
    }],
    [[null,null,null,null,null,null,null,null,4], {
        linesAverages: {a: 183.6429, b: 448.6964, c: 448.6964, d: 183.6429, e: 448.6964, f: 448.6964, g: 448.6964, h: 183.6429},
        selectionScores: [1331.1696, 1342.5289, 1356.8411, 1342.5289, 1365.0048, 1302.5446, 1356.8411, 1302.5446, null],
    }],
    [[null,null,null,null,null,null,null,null,5], {
        linesAverages: {a: 193.5714, b: 443.7321, c: 443.7321, d: 193.5714, e: 443.7321, f: 443.7321, g: 443.7321, h: 193.5714},
        selectionScores: [1327.4399, 1337.8012, 1354.6107, 1337.8012, 1359.5589, 1298.0702, 1354.6107, 1298.0702, null],
    }],
    [[null,null,null,null,null,null,null,null,6], {
        linesAverages: {a: 230.9643, b: 425.0357, c: 425.0357, d: 230.9643, e: 425.0357, f: 425.0357, g: 425.0357, h: 230.9643},
        selectionScores: [1327.6789, 1330.9220, 1360.2601, 1330.9220, 1364.3045, 1306.0068, 1360.2601, 1306.0068, null],
    }],
    [[null,null,null,null,null,null,null,null,7], {
        linesAverages: {a: 318.3929, b: 381.3214, c: 381.3214, d: 318.3929, e: 381.3214, f: 381.3214, g: 381.3214, h: 318.3929},
        selectionScores: [1404.5280, 1404.2524, 1453.3286, 1404.2524, 1454.5455, 1388.0473, 1453.3286, 1388.0473, null],
    }],
    [[null,null,null,null,null,null,null,null,8], {
        linesAverages: {a: 381.7500, b: 349.6429, c: 349.6429, d: 381.7500, e: 349.6429, f: 349.6429, g: 349.6429, h: 381.7500},
        selectionScores: [1478.8917, 1467.6640, 1527.0875, 1467.6640, 1527.0875, 1448.1720, 1527.0875, 1448.1720, null],
    }],
    [[null,null,null,null,null,null,null,null,9], {
        linesAverages: {a: 384.0714, b: 348.4821, c: 348.4821, d: 384.0714, e: 348.4821, f: 348.4821, g: 348.4821, h: 384.0714},
        selectionScores: [1467.5563, 1455.7845, 1517.7214, 1455.7845, 1517.7214, 1450.6283, 1517.7214, 1450.6283, null],
    }],
];

const postprocessedValues = (()=>{
    const ret = new Map();
    for (const [knownNumbers, x] of preprocessedValues) {
        const key = knownNumbers.join();
        if (ret.has(key)) console.warn(`Duplicate key: ${key}`);
        ret.set(key, x);
    }
    return ret;
})();

//// valuesGenerator is a code generator for the preprocessedValues object.
//// Under normal operation, this web application doesn't ever actually use valuesGenerator.
//// Hence, we comment it out unless it's needed.
//// To use it, uncomment it and refresh the app, and open your browser developer tools.
//// Wait for the generator to complete, then copy-and-paste the resulting string where needed.
////
//import {
//    calculate,
//} from "./algorithm.js";
//const valuesGenerator = (()=>{
//    console.log("");
//
//    function makeEntry(knownValues) {
//        const result = calculate(knownValues, defaultPayouts);
//
//        let ret = "";
//
//        const kv = knownValues.map((x) => String(x));
//        const kvstr = kv.join(",");
//        ret += `    [[${kvstr}], {\n`;
//
//        //const la = Object.entries(result.linesAverages).map((k, v) => (k + ": " + String(v.toFixed(4))));
//        // idk why that doesn't work
//        const la = [];
//        for (const [k, v] of Object.entries(result.linesAverages)) {
//            la.push(k + ": " + String(v.toFixed(4)));
//        }
//        ret += "        linesAverages: {" + la.join(", ") + "},\n";
//
//        const ss = result.selectionScores.map((x) => ((x === null) ? "null" : x.toFixed(4))).join(", ");
//        ret += `        selectionScores: [${ss}],\n`;
//
//        ret += "    }],";
//        return ret;
//    }
//
//    let s = "const preprocessedValues = [\n";
//
//    const emptyKnownNumbers = [null,null,null,null,null,null,null,null,null];
//    console.log("Generating for empty state");
//    s += makeEntry(emptyKnownNumbers) + "\n";
//
//    for (let i = 0; i < emptyKnownNumbers.length; ++i) {
//        for (let number = 1; number <= 9; ++number) {
//            const newKnownNumbers = [...emptyKnownNumbers];
//            newKnownNumbers[i] = number;
//            console.log(`Generating for position=${i} number=${number}`);
//            s += makeEntry(newKnownNumbers) + "\n";
//        }
//    }
//    s += "];\n";
//
//    console.log(s);
//})();

