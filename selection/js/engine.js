/**
 * engine.js
 * Lógica pura de algoritmos de ordenamiento.
 * Genera secuencias de estados para ser consumidos por el visualizador.
 */

const SortEngines = {
    // === SELECTION SORT ===
    selection: {
        name: 'Selection',
        code: 'SS',
        complexity: 'O(n²)',
        computeSteps(originalArr) {
            const steps = [];
            const a = [...originalArr];
            const n = a.length;

            for (let i = 0; i < n - 1; i++) {
                let minIdx = i;
                steps.push({
                    type: 'PASS_START',
                    i,
                    minIdx,
                    array: [...a],
                    msg: `Iniciando pasada <b>${i}</b>. Se asume que el mínimo es <code>arr[${i}]</code>.`
                });

                for (let j = i + 1; j < n; j++) {
                    steps.push({
                        type: 'COMPARE',
                        i,
                        j,
                        minIdx,
                        array: [...a],
                        msg: `Comparando <code>${a[j]}</code> con el mínimo actual <code>${a[minIdx]}</code>.`
                    });

                    if (a[j] < a[minIdx]) {
                        const prevMin = minIdx;
                        minIdx = j;
                        steps.push({
                            type: 'NEW_MIN',
                            i,
                            j,
                            minIdx,
                            prevMin,
                            array: [...a],
                            msg: `¡Encontrado! <code>${a[j]}</code> es menor. Nuevo <b>minIdx = ${j}</b>.`
                        });
                    }
                }

                if (minIdx !== i) {
                    steps.push({
                        type: 'SWAP',
                        i,
                        minIdx,
                        array: [...a],
                        msg: `Intercambiando el mínimo <code>${a[minIdx]}</code> con <code>${a[i]}</code>.`
                    });
                    [a[i], a[minIdx]] = [a[minIdx], a[i]];
                } else {
                    steps.push({
                        type: 'NO_SWAP',
                        i,
                        array: [...a],
                        msg: `El mínimo ya estaba en la posición correcta.`
                    });
                }

                steps.push({
                    type: 'LOCK',
                    i,
                    array: [...a],
                    msg: `Posición <b>${i}</b> consolidada ✓.`
                });
            }

            steps.push({
                type: 'DONE',
                array: [...a],
                msg: "🎉 <b>Ordenamiento completado.</b> Todos los elementos están en su lugar."
            });
            return steps;
        }
    },

    // === BUBBLE SORT ===
    bubble: {
        name: 'Bubble',
        code: 'BS',
        complexity: 'O(n²)',
        computeSteps(originalArr) {
            const steps = [];
            const a = [...originalArr];
            const n = a.length;

            for (let i = 0; i < n - 1; i++) {
                let swapped = false;
                steps.push({
                    type: 'PASS_START',
                    i,
                    array: [...a],
                    msg: `Pasada <b>${i + 1}</b>. Los elementos más grandes "burbujearán" hacia el final.`
                });

                for (let j = 0; j < n - i - 1; j++) {
                    steps.push({
                        type: 'COMPARE',
                        i,
                        j,
                        jPlus1: j + 1,
                        array: [...a],
                        msg: `Comparando <code>${a[j]}</code> vs <code>${a[j + 1]}</code>.`
                    });

                    if (a[j] > a[j + 1]) {
                        steps.push({
                            type: 'SWAP',
                            i,
                            j,
                            jPlus1: j + 1,
                            array: [...a],
                            msg: `<code>${a[j]}</code> > <code>${a[j + 1]}</code>. Intercambiando...`
                        });
                        [a[j], a[j + 1]] = [a[j + 1], a[j]];
                        swapped = true;
                    }
                }

                if (!swapped) {
                    steps.push({
                        type: 'DONE',
                        array: [...a],
                        msg: "🎉 <b>Ordenamiento completado.</b> No hubo swaps en esta pasada."
                    });
                    return steps;
                }

                steps.push({
                    type: 'LOCK',
                    i: n - i - 1,
                    array: [...a],
                    msg: `Elemento en posición <b>${n - i - 1}</b> está en su lugar.`
                });
            }

            steps.push({
                type: 'DONE',
                array: [...a],
                msg: "🎉 <b>Ordenamiento completado.</b>"
            });
            return steps;
        }
    },

    // === INSERTION SORT ===
    insertion: {
        name: 'Insertion',
        code: 'IS',
        complexity: 'O(n²)',
        computeSteps(originalArr) {
            const steps = [];
            const a = [...originalArr];
            const n = a.length;

            steps.push({
                type: 'PASS_START',
                i: 0,
                array: [...a],
                msg: `Primer elemento <code>${a[0]}</code> ya está "ordenado" por definición.`
            });

            for (let i = 1; i < n; i++) {
                const key = a[i];
                let j = i - 1;
                
                steps.push({
                    type: 'PASS_START',
                    i,
                    key,
                    array: [...a],
                    msg: `Insertando <code>${key}</code> en la parte ordenada [0..${i-1}].`
                });

                while (j >= 0) {
                    steps.push({
                        type: 'COMPARE',
                        i,
                        j,
                        key,
                        array: [...a],
                        msg: `¿<code>${key}</code> < <code>${a[j]}</code>? Desplazando elementos mayores.`
                    });

                    if (a[j] > key) {
                        steps.push({
                            type: 'SHIFT',
                            i,
                            j,
                            key,
                            array: [...a],
                            msg: `<code>${a[j]}</code> > <code>${key}</code>. Desplazando a la derecha.`
                        });
                        a[j + 1] = a[j];
                        j--;
                    } else {
                        break;
                    }
                }

                if (j + 1 !== i) {
                    steps.push({
                        type: 'INSERT',
                        i,
                        position: j + 1,
                        key,
                        array: [...a],
                        msg: `Insertando <code>${key}</code> en posición <b>${j + 1}</b>.`
                    });
                    a[j + 1] = key;
                }

                steps.push({
                    type: 'LOCK',
                    i,
                    array: [...a],
                    msg: `Elementos [0..${i}] ahora ordenados.`
                });
            }

            steps.push({
                type: 'DONE',
                array: [...a],
                msg: "🎉 <b>Ordenamiento completado.</b> Array ordenado por inserciones."
            });
            return steps;
        }
    },

    /**
     * Obtiene el motor por nombre.
     */
    getEngine(name) {
        return this[name] || this.selection;
    },

    /**
     * Genera datos aleatorios para el inicio.
     */
    generateRandomArray(size = 8) {
        const arr = [];
        while (arr.length < size) {
            const r = Math.floor(Math.random() * 85) + 10;
            if (!arr.includes(r)) arr.push(r);
        }
        return arr;
    },

    /**
     * Parsea string de array del usuario.
     */
    parseArrayInput(input) {
        const numbers = input.split(',')
            .map(s => parseInt(s.trim()))
            .filter(n => !isNaN(n) && n >= 10 && n <= 99);
        return numbers.slice(0, 10);
    }
};

// Backwards compatibility
window.SelectionEngine = {
    computeSteps: (arr) => SortEngines.selection.computeSteps(arr),
    generateRandomArray: (size) => SortEngines.generateRandomArray(size)
};

window.SortEngines = SortEngines;