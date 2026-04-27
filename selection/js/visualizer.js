/**
 * visualizer.js
 * Manipulación del DOM y orquestación de animaciones con GSAP.
 */

const Visualizer = {
    cards: [],
    container: null,
    cardWidth: 88, // 76px + 12px gap

    /**
     * Crea las tarjetas iniciales en el DOM.
     */
    initCanvas(array) {
        this.container = document.getElementById('cards-box');
        const idxRow = document.getElementById('idx-row');
        this.container.innerHTML = '';
        idxRow.innerHTML = '';
        this.cards = [];

        array.forEach((val, i) => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `<span class="card-val">${val}</span>`;
            // Posicionamiento inicial con GSAP
            gsap.set(card, { x: i * this.cardWidth, y: 0 });
            
            this.container.appendChild(card);
            
            // Crear etiqueta de índice
            const lbl = document.createElement('div');
            lbl.className = 'idx-lbl';
            lbl.textContent = i;
            gsap.set(lbl, { x: i * this.cardWidth });
            idxRow.appendChild(lbl);
            
            this.cards.push({ el: card, val: val, currentIdx: i, lbl: lbl });
        });

        // Ajustar el ancho del contenedor para centrar
        this.container.style.width = `${array.length * this.cardWidth - 12}px`;
        this.container.style.height = `86px`;
        idxRow.style.width = `${array.length * this.cardWidth - 12}px`;
        idxRow.style.height = `20px`;
    },

    /**
     * Renderiza el bloque de código Java según el algoritmo.
     */
    renderCode(algo = 'selection') {
        const codeView = document.getElementById('code-view');
        
        const codes = {
            selection: [
                { n: 1, h: `<span class="kw">public class</span> SelectionSort {` },
                { n: 2, h: `  <span class="kw">public static void</span> sort(<span class="kw">int</span>[] arr) {` },
                { n: 3, h: `    <span class="kw">int</span> n = arr.length;` },
                { n: 4, h: `` },
                { n: 5, h: `    <span class="kw">for</span> (<span class="kw">int</span> i = <span class="nl">0</span>; i &lt; n-<span class="nl">1</span>; i++) {` },
                { n: 6, h: `      <span class="kw">int</span> minIdx = i;` },
                { n: 7, h: `` },
                { n: 8, h: `      <span class="kw">for</span> (<span class="kw">int</span> j = i+<span class="nl">1</span>; j &lt; n; j++) {` },
                { n: 9, h: `        <span class="kw">if</span> (arr[j] &lt; arr[minIdx]) {` },
                { n: 10, h: `          minIdx = j; <span class="cm">// ← nuevo mínimo</span>` },
                { n: 11, h: `        }` },
                { n: 12, h: `      }` },
                { n: 13, h: `` },
                { n: 14, h: `      <span class="kw">if</span> (minIdx != i) {` },
                { n: 15, h: `        <span class="kw">int</span> temp = arr[i];` },
                { n: 16, h: `        arr[i] = arr[minIdx];` },
                { n: 17, h: `        arr[minIdx] = temp;` },
                { n: 18, h: `      }` },
                { n: 19, h: `    }` },
                { n: 20, h: `  }` },
                { n: 21, h: `}` },
            ],
            bubble: [
                { n: 1, h: `<span class="kw">public class</span> BubbleSort {` },
                { n: 2, h: `  <span class="kw">public static void</span> sort(<span class="kw">int</span>[] arr) {` },
                { n: 3, h: `    <span class="kw">int</span> n = arr.length;` },
                { n: 4, h: `    <span class="kw">boolean</span> swapped;` },
                { n: 5, h: `` },
                { n: 6, h: `    <span class="kw">for</span> (<span class="kw">int</span> i = <span class="nl">0</span>; i &lt; n-<span class="nl">1</span>; i++) {` },
                { n: 7, h: `      swapped = <span class="nl">false</span>;` },
                { n: 8, h: `` },
                { n: 9, h: `      <span class="kw">for</span> (<span class="kw">int</span> j = <span class="nl">0</span>; j &lt; n-i-<span class="nl">1</span>; j++) {` },
                { n: 10, h: `        <span class="kw">if</span> (arr[j] &gt; arr[j+<span class="nl">1</span>]) {` },
                { n: 11, h: `          <span class="kw">int</span> temp = arr[j];` },
                { n: 12, h: `          arr[j] = arr[j+<span class="nl">1</span>];` },
                { n: 13, h: `          arr[j+<span class="nl">1</span>] = temp;` },
                { n: 14, h: `          swapped = <span class="nl">true</span>;` },
                { n: 15, h: `        }` },
                { n: 16, h: `      }` },
                { n: 17, h: `` },
                { n: 18, h: `      <span class="kw">if</span> (!swapped) <span class="kw">break</span>;` },
                { n: 19, h: `    }` },
                { n: 20, h: `  }` },
                { n: 21, h: `}` },
            ],
            insertion: [
                { n: 1, h: `<span class="kw">public class</span> InsertionSort {` },
                { n: 2, h: `  <span class="kw">public static void</span> sort(<span class="kw">int</span>[] arr) {` },
                { n: 3, h: `    <span class="kw">int</span> n = arr.length;` },
                { n: 4, h: `` },
                { n: 5, h: `    <span class="kw">for</span> (<span class="kw">int</span> i = <span class="nl">1</span>; i &lt; n; i++) {` },
                { n: 6, h: `      <span class="kw">int</span> key = arr[i];` },
                { n: 7, h: `      <span class="kw">int</span> j = i - <span class="nl">1</span>;` },
                { n: 8, h: `` },
                { n: 9, h: `      <span class="kw">while</span> (j &gt;= <span class="nl">0</span> && arr[j] &gt; key) {` },
                { n: 10, h: `        arr[j + <span class="nl">1</span>] = arr[j];` },
                { n: 11, h: `        j = j - <span class="nl">1</span>;` },
                { n: 12, h: `      }` },
                { n: 13, h: `` },
                { n: 14, h: `      arr[j + <span class="nl">1</span>] = key;` },
                { n: 15, h: `    }` },
                { n: 16, h: `  }` },
                { n: 17, h: `}` },
            ]
        };
        
        const code = codes[algo] || codes.selection;
        codeView.innerHTML = code.map(l => `<div class="cl" data-l="${l.n}"><span class="ln">${l.n}</span><span class="lc">${l.h || '&nbsp;'}</span></div>`).join('');
    },

    /**
     * Ejecuta la animación correspondiente a un paso del motor.
     */
    async drawStep(step) {
        const status = document.getElementById('status');
        status.innerHTML = step.msg;

        // Limpiar estados previos
        this.cards.forEach(c => c.el.classList.remove('is-min', 'is-cand'));
        this.clearCodeHighlights();

        switch (step.type) {
            case 'PASS_START':
                this.highlightCodeLine(2); // for i
                this.highlightCodeLine(3); // minIdx = i
                this.cards[step.i].el.classList.add('is-min');
                break;

            case 'COMPARE':
                this.highlightCodeLine(4); // for j
                this.highlightCodeLine(5); // if
                this.cards[step.j].el.classList.add('is-cand');
                this.cards[step.minIdx].el.classList.add('is-min');
                break;

            case 'NEW_MIN':
                this.highlightCodeLine(6, 'hi-rose'); // minIdx = j
                this.cards[step.minIdx].el.classList.add('is-min');
                break;

            case 'SWAP':
                this.highlightCodeLine(9, 'hi-default');
                this.highlightCodeLine(10);
                this.highlightCodeLine(11);
                await this.animateSwap(step.i, step.minIdx);
                break;

            case 'LOCK':
                this.cards[step.i].el.classList.add('is-done');
                break;
        }
    },

    async animateSwap(idx1, idx2) {
        const card1 = this.cards[idx1];
        const card2 = this.cards[idx2];

        // Calculamos la distancia de desplazamiento
        const dist = (idx2 - idx1) * this.cardWidth;
        const dur = 0.9 / window.AppState?.speed || 0.9;

        // Animación de arco con GSAP
        const tl = gsap.timeline();
        
        await tl.to(card1.el, {
            x: `+=${dist}`,
            y: -30,
            duration: dur,
            ease: "power2.inOut",
            zIndex: 10
        })
        .to(card2.el, {
            x: `-=${dist}`,
            y: 30,
            duration: dur,
            ease: "power2.inOut"
        }, 0) // El 0 hace que las animaciones ocurran al mismo tiempo
        .to([card1.el, card2.el], {
            y: 0,
            duration: dur * 0.33,
            ease: "back.out"
        })
        .to(card1.lbl, { x: `+=${dist}`, duration: dur * 0.6, ease: "power2.inOut" }, dur * 0.2)
        .to(card2.lbl, { x: `-=${dist}`, duration: dur * 0.6, ease: "power2.inOut" }, dur * 0.2)
        .then();

        // Actualizar el orden lógico en nuestro array de referencia
        [this.cards[idx1], this.cards[idx2]] = [this.cards[idx2], this.cards[idx1]];
    },

    highlightCodeLine(lineIdx, className = 'hi-default') {
        document.querySelectorAll('.cl').forEach(el => {
            const ln = parseInt(el.dataset.l);
            el.classList.remove('hi-default', 'hi-rose');
            if (ln === lineIdx) el.classList.add(className);
        });
    },

    clearCodeHighlights() {
        document.querySelectorAll('.cl').forEach(el => {
            el.classList.remove('hi-default', 'hi-rose');
        });
    }
};

window.Visualizer = Visualizer;