/**
 * main.js
 * Orquestador principal del proyecto.
 * Conecta la lógica, la UI y la IA.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Registrar plugins de GSAP
    gsap.registerPlugin(ScrollTrigger);

    // 0. ANIMACIONES DE INTRO
    const introTL = gsap.timeline({ delay: 0.2 });
    introTL
        .to('#it-tag', { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' })
        .to('#it-title', { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }, '-=.4')
        .to('#it-sub', { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' }, '-=.5')
        .to('#it-badges', { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }, '-=.4')
        .to('#scroll-hint', { opacity: 1, duration: 0.6 }, '-=.2');

    // Floating glow animation
    gsap.to('#glow1', {
        x: '10%',
        y: '8%',
        duration: 6,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true
    });

    // 1. ESTADO GLOBAL DE LA APLICACIÓN
    const AppState = {
        array: [],
        steps: [],
        currentStepIdx: -1,
        isPlaying: false,
        speed: 1,
        isTransitioning: false,
        currentAlgo: 'selection',
        tutorialMode: false,
        soundEnabled: false
    };
    
    // Algoritmos disponibles
    const ALGO_INFO = {
        selection: { name: 'Selection', code: 'SS', complexity: 'O(n²)', color: '#6366f1' },
        bubble: { name: 'Bubble', code: 'BS', complexity: 'O(n²)', color: '#00f2ff' },
        insertion: { name: 'Insertion', code: 'IS', complexity: 'O(n²)', color: '#ff0055' }
    };

    // 2. REFERENCIAS AL DOM
    const btnPlay = document.getElementById('btn-play');
    const btnStep = document.getElementById('btn-step');
    const btnReset = document.getElementById('btn-reset');
    const spdSl = document.getElementById('spd-sl');
    const spdVal = document.getElementById('spd-v');

    // 3. INICIALIZACIÓN
    function init(customArray = null) {
        // Generar o usar datos
        if (customArray && customArray.length > 0) {
            AppState.array = customArray;
        } else {
            AppState.array = SortEngines.generateRandomArray(8);
        }
        
        // Computar pasos según algoritmo actual
        const engine = SortEngines.getEngine(AppState.currentAlgo);
        AppState.steps = engine.computeSteps(AppState.array);
        AppState.currentStepIdx = -1;
        AppState.isPlaying = false;
        AppState.isTransitioning = false;
        
        // Actualizar UI de algoritmo
        const info = ALGO_INFO[AppState.currentAlgo];
        document.getElementById('algo-name').textContent = info.name;
        document.getElementById('logo-mark').textContent = info.code;
        document.getElementById('complexity-badge').textContent = info.complexity;
        document.getElementById('complexity-badge').style.color = info.color;
        document.getElementById('complexity-badge').style.borderColor = info.color;
        
        // Preparar visualización
        Visualizer.initCanvas(AppState.array);
        Visualizer.renderCode(AppState.currentAlgo);
        updateStats();
        
        // Reset de UI
        btnPlay.innerHTML = '▶ Play';
        const tutorialMsg = AppState.tutorialMode ? ' (Modo Tutorial activo - verás explicaciones detalladas)' : '';
        document.getElementById('status').innerHTML = `Listo. Algoritmo: <b>${info.name} Sort</b>. Pulsa <b>▶ Play</b> o <b>⏭ Paso</b>.${tutorialMsg}`;
        
        // Limpiar highlights
        document.querySelectorAll('.cl').forEach(el => {
            el.classList.remove('hi-default', 'hi-rose');
        });
    }
    
    // Cambiar algoritmo
    const algoSelector = document.getElementById('algo-selector');
    if (algoSelector) {
        algoSelector.addEventListener('change', (e) => {
            AppState.currentAlgo = e.target.value;
            init();
        });
    }
    
    // Entrada manual de array
    const arrayInput = document.getElementById('array-input');
    const btnUseArray = document.getElementById('btn-use-array');
    if (btnUseArray && arrayInput) {
        btnUseArray.addEventListener('click', () => {
            const parsed = SortEngines.parseArrayInput(arrayInput.value);
            if (parsed.length >= 2) {
                init(parsed);
                arrayInput.value = '';
            } else {
                alert('Ingresa al menos 2 números entre 10-99 separados por comas');
            }
        });
        
        arrayInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') btnUseArray.click();
        });
    }

    // 4. CONTROL DE EJECUCIÓN
    async function runAuto() {
        if (AppState.isPlaying || AppState.currentStepIdx >= AppState.steps.length - 1) return;
        
        AppState.isPlaying = true;
        btnPlay.innerHTML = '⏸ Pausar';

        while (AppState.isPlaying && AppState.currentStepIdx < AppState.steps.length - 1) {
            await nextStep();
            // El delay depende del slider de velocidad
            const delayTime = (1000 / AppState.speed);
            await new Promise(resolve => setTimeout(resolve, delayTime));
        }

        if (AppState.currentStepIdx >= AppState.steps.length - 1) {
            AppState.isPlaying = false;
            btnPlay.innerHTML = '↺ Reiniciar';
        }
    }

    async function nextStep() {
        if (AppState.isTransitioning) return;
        if (AppState.currentStepIdx >= AppState.steps.length - 1) return;

        AppState.isTransitioning = true;
        AppState.currentStepIdx++;
        
        const step = AppState.steps[AppState.currentStepIdx];
        
        // Actualizar visualización y esperar a que termine la animación (GSAP)
        await Visualizer.drawStep(step);
        
        updateStats();
        AppState.isTransitioning = false;
    }

    function updateStats() {
        const step = AppState.steps[AppState.currentStepIdx] || { i: 0, j: 0 };
        const total = AppState.steps.length;
        
        // Contar acumulados
        const history = AppState.steps.slice(0, AppState.currentStepIdx + 1);
        const cmps = history.filter(s => s.type === 'COMPARE' || s.type === 'NEW_MIN').length;
        const swps = history.filter(s => s.type === 'SWAP').length;

        document.getElementById('s-cmp').textContent = cmps;
        document.getElementById('s-swp').textContent = swps;
        document.getElementById('s-step').textContent = `${AppState.currentStepIdx + 1} / ${total}`;
        document.getElementById('prog').style.width = `${((AppState.currentStepIdx + 1) / total) * 100}%`;
    }

    // 5. EVENT LISTENERS
    btnPlay.addEventListener('click', () => {
        if (AppState.currentStepIdx >= AppState.steps.length - 1) {
            init();
            return;
        }
        if (AppState.isPlaying) {
            AppState.isPlaying = false;
            btnPlay.innerHTML = '▶ Reanudar';
        } else {
            runAuto();
        }
    });

    btnStep.addEventListener('click', () => {
        AppState.isPlaying = false;
        btnPlay.innerHTML = '▶ Reanudar';
        nextStep();
    });

    btnReset.addEventListener('click', init);

    spdSl.addEventListener('input', (e) => {
        AppState.speed = parseFloat(e.target.value);
        spdVal.textContent = AppState.speed + 'x';
    });

    // Botón Explicación Rápida
    const btnExplain = document.getElementById('btn-explain');
    btnExplain.addEventListener('click', () => {
        if (AppState.isPlaying) return;
        
        const ov = document.getElementById('explain-overlay');
        ov.style.display = 'block';

        const tl = gsap.timeline({
            onComplete: () => {
                gsap.to('.explain-arrow', {opacity: 0, duration: 0.3, stagger: 0.05, onComplete: () => {ov.style.display = 'none'}});
            }
        });

        // Pulse cards area
        tl.set('#cards-box', {outline: '2px solid rgba(0,242,255,0.6)', outlineOffset: '8px', boxShadow: '0 0 30px rgba(0,242,255,0.3)'})
          .to('#ea-cards', {opacity: 1, y: 0, duration: 0.4, ease: 'power2.out'})
          .to('#ea-cards', {opacity: 1, duration: 1.2})
          .to('#ea-cards', {opacity: 0, duration: 0.3})
          .set('#cards-box', {outline: 'none', boxShadow: 'none'})

        // Pulse code area
        .set('#code-view', {outline: '2px solid rgba(99,102,241,0.6)', outlineOffset: '4px'})
          .to('#ea-code', {opacity: 1, duration: 0.4, ease: 'power2.out'})
          .to('#ea-code', {opacity: 1, duration: 1.2})
          .to('#ea-code', {opacity: 0, duration: 0.3})
          .set('#code-view', {outline: 'none'})

        // Pulse chat
        .set('#chat-msgs', {outline: '2px solid rgba(255,0,85,0.5)', outlineOffset: '4px'})
          .to('#ea-chat', {opacity: 1, duration: 0.4})
          .to('#ea-chat', {opacity: 1, duration: 1.2})
          .to('#ea-chat', {opacity: 0, duration: 0.3})
          .set('#chat-msgs', {outline: 'none'})

        // Pulse controls
        .set('.controls', {outline: '2px solid rgba(245,158,11,0.5)', outlineOffset: '4px'})
          .to('#ea-ctrl', {opacity: 1, duration: 0.4})
          .to('#ea-ctrl', {opacity: 1, duration: 1.2})
          .to('#ea-ctrl', {opacity: 0, duration: 0.3}, '-=.2')
          .set('.controls', {outline: 'none'});
    });

    // 6. CONFIGURACIÓN DE GSAP SCROLL TRIGGER (EL "WOW" FACTOR)
    ScrollTrigger.create({
        trigger: "#app-section",
        start: "top 80%",
        onEnter: () => {
            gsap.to("#app-section", { opacity: 1, duration: 0.6, ease: 'power2.out' });
            if (!AppState.array.length) init();
        }
    });

    // Iniciar app si ya está visible (sin scroll)
    if (document.getElementById('app-section').getBoundingClientRect().top < window.innerHeight * 0.9) {
        init();
    }

    // ATAJOS DE TECLADO
    document.addEventListener('keydown', (e) => {
        // Ignorar si está escribiendo en un input
        if (e.target.tagName === 'INPUT') return;
        
        switch(e.key) {
            case ' ':
                e.preventDefault();
                btnPlay.click();
                break;
            case 'ArrowRight':
            case 's':
                e.preventDefault();
                btnStep.click();
                break;
            case 'r':
            case 'R':
                e.preventDefault();
                btnReset.click();
                break;
            case '?':
                e.preventDefault();
                showShortcutsHelp();
                break;
        }
    });
    
    // Mostrar ayuda de atajos
    function showShortcutsHelp() {
        const help = `
        <div style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(10,10,12,0.95);border:1px solid var(--indigo);padding:20px;border-radius:8px;z-index:1000;max-width:300px;">
            <h3 style="margin:0 0 15px;color:var(--cyan);font-family:'Space Mono',monospace;">⌨️ Atajos de Teclado</h3>
            <table style="font-size:12px;font-family:'Space Mono',monospace;width:100%;">
                <tr><td style="color:var(--indigo);padding:4px 8px;">Espacio</td><td>Play/Pausa</td></tr>
                <tr><td style="color:var(--indigo);padding:4px 8px;">→ / S</td><td>Paso a paso</td></tr>
                <tr><td style="color:var(--indigo);padding:4px 8px;">R</td><td>Reset</td></tr>
                <tr><td style="color:var(--indigo);padding:4px 8px;">?</td><td>Ver atajos</td></tr>
            </table>
            <button onclick="this.parentElement.remove()" style="margin-top:15px;width:100%;padding:8px;background:var(--indigo);border:none;border-radius:4px;color:white;cursor:pointer;font-family:'Space Mono',monospace;">Cerrar</button>
        </div>`;
        const div = document.createElement('div');
        div.innerHTML = help;
        document.body.appendChild(div.firstElementChild);
    }
    
    // Mostrar hint de atajos brevemente al inicio
    setTimeout(() => {
        const hint = document.createElement('div');
        hint.id = 'shortcuts-hint';
        hint.innerHTML = 'Presiona <b>?</b> para ver atajos de teclado';
        hint.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:rgba(99,102,241,0.2);border:1px solid var(--indigo);padding:8px 16px;border-radius:20px;font-size:11px;font-family:"Space Mono",monospace;color:var(--cyan);z-index:100;pointer-events:none;opacity:0;transition:opacity 0.5s;';
        document.body.appendChild(hint);
        setTimeout(() => hint.style.opacity = '1', 100);
        setTimeout(() => { hint.style.opacity = '0'; setTimeout(() => hint.remove(), 500); }, 5000);
    }, 2000);

    // EXPORTAR RESULTADOS
    function exportResults() {
        const step = AppState.steps[AppState.currentStepIdx] || AppState.steps[AppState.steps.length - 1];
        const data = {
            algoritmo: AppState.currentAlgo,
            arrayInicial: AppState.array,
            arrayFinal: step?.array || AppState.array,
            pasosTotales: AppState.steps.length,
            pasoActual: AppState.currentStepIdx + 1,
            comparaciones: document.getElementById('s-cmp').textContent,
            swaps: document.getElementById('s-swp').textContent,
            timestamp: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sort-results-${AppState.currentAlgo}-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
    
    // Agregar botón de export si no existe
    const header = document.querySelector('header');
    if (header && !document.getElementById('btn-export')) {
        const btnExport = document.createElement('button');
        btnExport.id = 'btn-export';
        btnExport.className = 'btn btn-sm';
        btnExport.innerHTML = '⬇ Export';
        btnExport.title = 'Exportar resultados (JSON)';
        btnExport.onclick = exportResults;
        btnExport.style.marginLeft = 'auto';
        const hRight = header.querySelector('.h-right');
        if (hRight) {
            hRight.insertBefore(btnExport, hRight.firstChild);
        }
    }
    
    // MODO TUTORIAL
    const btnTutorial = document.getElementById('btn-tutorial');
    if (btnTutorial) {
        btnTutorial.addEventListener('click', () => {
            AppState.tutorialMode = !AppState.tutorialMode;
            btnTutorial.classList.toggle('active', AppState.tutorialMode);
            const status = document.getElementById('status');
            if (AppState.tutorialMode) {
                status.innerHTML = '<b>📖 Modo Tutorial activado.</b> Verás explicaciones detalladas en cada paso. Pulsa ⏭ Paso para comenzar.';
            } else {
                status.innerHTML = 'Modo Tutorial desactivado. Pulsa ▶ Play o ⏭ Paso.';
            }
        });
    }
    
    // GRÁFICO DE COMPLEJIDAD
    function updateComplexityChart() {
        const canvas = document.getElementById('complexity-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const n = AppState.array.length;
        const currentStep = AppState.currentStepIdx + 1;
        const totalSteps = AppState.steps.length;
        const theoretical = n * n; // O(n²) aproximado
        
        // Actualizar texto
        document.getElementById('c-steps').textContent = `${currentStep}/${totalSteps}`;
        document.getElementById('c-theoretical').textContent = `~${theoretical}`;
        
        // Dibujar gráfico
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Línea teórica O(n²) - curva cuadrática
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.3)';
        ctx.lineWidth = 2;
        for (let x = 0; x < canvas.width; x++) {
            const t = x / canvas.width;
            const y = canvas.height - (t * t * canvas.height * 0.9);
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
        
        // Progreso actual
        if (totalSteps > 0) {
            const progress = currentStep / totalSteps;
            const x = progress * canvas.width;
            ctx.beginPath();
            ctx.strokeStyle = '#00f2ff';
            ctx.lineWidth = 3;
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
            
            // Punto indicador
            ctx.beginPath();
            ctx.fillStyle = '#00f2ff';
            ctx.arc(x, canvas.height - (progress * progress * canvas.height * 0.9), 4, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // Llamar a updateComplexityChart en cada paso
    const originalUpdateStats = updateStats;
    window.updateStats = function() {
        originalUpdateStats();
        updateComplexityChart();
    };
    
    // Inicializar gráfico
    updateComplexityChart();

    // Exponer estado global
    window.AppState = AppState;
    window.getAppState = () => ({
        ...AppState,
        currentStep: AppState.steps[AppState.currentStepIdx]
    });
});