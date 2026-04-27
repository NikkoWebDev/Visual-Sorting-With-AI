/**
 * ai-assistant.js
 * Cerebro del Chat interactivo con integración de OpenRouter.
 * Optimizado para devolver respuestas con formato enriquecido.
 */

const AIAssistant = {
    apiKey: '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',
    history: [],

    // Configuración del comportamiento de la IA
    systemPrompt: `Eres el Núcleo de Inteligencia de la Facultad de Ingeniería UNAL.
    Tu especialidad absoluta es el algoritmo Selection Sort.
    
    REGLAS DE FORMATO:
    - Usa **negritas** para conceptos técnicos (ej: **O(n^2)**, **swaps**, **in-place**).
    - Usa bloques de código para ejemplos en Java: \`\`\`java [código] \`\`\`.
    - Si el usuario pregunta comparaciones, usa una lista en markdown para entenderse mejor.
    - Mantén las respuestas técnicas, concisas y de alto nivel académico.
    - No menciones nombres personales. Eres una IA de soporte académico.
    - Recuerda que tu menu de chat mide 400 x 227 en una pantalla de 1920x1080 cuidado con pasarte y que tus mensajes sean ilegibles
    
    CONTEXTO ACTUAL:
    Si el usuario pregunta sobre el estado actual, usa los datos que se te proporcionen del simulador.`,

    /**
     * Procesa la pregunta del usuario y gestiona la llamada a la API.
     */
    async ask(question) {
        const chatBox = document.getElementById('chat-msgs');
        const state = window.getAppState ? window.getAppState() : null;

        // 1. Mostrar mensaje del usuario
        this.appendMessage('user', question);

        // 2. Crear burbuja de carga para la IA
        const loadingId = this.appendLoadingBubble();

        // 3. Construir el prompt con contexto dinámico
        const contextStatus = state && state.currentStep
            ? `Estado del algoritmo: El usuario está en el paso ${state.currentStepIdx + 1}. Mensaje actual: "${state.currentStep.msg}".`
            : "El algoritmo aún no ha iniciado.";

        try {
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${this.apiKey}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "openrouter/auto",
                    messages: [
                        { role: "system", content: `${this.systemPrompt}\n\nCONTEXTO REAL: ${contextStatus}` },
                        ...this.history,
                        { role: "user", content: question }
                    ]
                })
            });

            const data = await response.json();
            const answer = data.choices[0].message.content;

            // Guardar en historial
            this.history.push({ role: "user", content: question });
            this.history.push({ role: "assistant", content: answer });

            // 4. Actualizar burbuja con la respuesta formateada
            this.updateBubble(loadingId, answer);

        } catch (error) {
            console.error("AI Error:", error);
            this.updateBubble(loadingId, "Lo siento, el Núcleo de Datos está experimentando latencia. Verifica tu conexión.");
        }
    },

    /**
     * Formatea el texto Markdown a HTML básico para la UI.
     * Ahora soporta tablas, listas, y más formatos.
     */
    parseMarkdown(text) {
        // Escapar HTML primero
        let html = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        
        // Tablas Markdown
        const tableRegex = /\|([^\n]*)\|\n\|[-:\s|]+\|\n((?:\|[^\n]*\|\n?)+)/g;
        html = html.replace(tableRegex, (match, header, rows) => {
            const headers = header.split('|').filter(h => h.trim()).map(h => `<th>${h.trim()}</th>`).join('');
            const bodyRows = rows.trim().split('\n').map(row => {
                const cells = row.split('|').filter(c => c.trim()).map(c => `<td>${c.trim()}</td>`).join('');
                return `<tr>${cells}</tr>`;
            }).join('');
            return `<table class="ai-table"><thead><tr>${headers}</tr></thead><tbody>${bodyRows}</tbody></table>`;
        });
        
        return html
            // Negritas
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            // Bloques de código
            .replace(/```java([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
            // Código en línea (no dentro de bloques)
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            // Listas
            .replace(/^\s*[-*]\s+(.+)$/gm, '<li>$1</li>')
            // Encabezados
            .replace(/^###\s+(.+)$/gm, '<h3>$1</h3>')
            .replace(/^##\s+(.+)$/gm, '<h2>$1</h2>')
            .replace(/^#\s+(.+)$/gm, '<h1>$1</h1>')
            // Saltos de línea (solo si no está dentro de tabla)
            .replace(/<\/table>\s*<br>/g, '</table>')
            .replace(/\n/g, '<br>');
    },

    appendMessage(role, text) {
        const chatBox = document.getElementById('chat-msgs');
        const div = document.createElement('div');
        div.className = `bubble b-${role}`;
        div.innerHTML = role === 'ai' ? this.parseMarkdown(text) : text;
        chatBox.appendChild(div);
        chatBox.scrollTop = chatBox.scrollHeight;
    },

    appendLoadingBubble() {
        const chatBox = document.getElementById('chat-msgs');
        const id = 'ai-' + Date.now();
        const div = document.createElement('div');
        div.id = id;
        div.className = 'bubble b-ai';
        div.innerHTML = '<div class="typing-indicator"><span></span><span></span><span></span></div>';
        chatBox.appendChild(div);
        chatBox.scrollTop = chatBox.scrollHeight;
        return id;
    },

    /**
     * Limpia todo el historial del chat excepto el mensaje inicial.
     */
    clearChat() {
        const chatBox = document.getElementById('chat-msgs');
        const initialMsg = chatBox.querySelector('.bubble');
        chatBox.innerHTML = '';
        if (initialMsg) {
            chatBox.appendChild(initialMsg);
        }
        this.history = [];
    },

    /**
     * Agrega sugerencias de preguntas debajo del input.
     */
    renderSuggestions() {
        const suggestions = [
            '¿Por qué es O(n²)?',
            'Comparar con Bubble Sort',
            'Mostrar código en Python',
            '¿Cuándo usar Selection Sort?'
        ];
        
        const existing = document.querySelector('.chat-suggestions');
        if (existing) existing.remove();
        
        const chatIn = document.querySelector('.chat-in');
        const div = document.createElement('div');
        div.className = 'chat-suggestions';
        div.innerHTML = suggestions.map(s => 
            `<button class="suggestion-chip" onclick="AIAssistant.ask('${s.replace(/'/g, "\\'")}')">${s}</button>`
        ).join('');
        chatIn.parentNode.insertBefore(div, chatIn);
    },

    updateBubble(id, text) {
        const el = document.getElementById(id);
        if (el) {
            el.innerHTML = this.parseMarkdown(text);
            document.getElementById('chat-msgs').scrollTop = 99999;
        }
    }
};

// Listeners de la UI del chat
document.addEventListener('DOMContentLoaded', () => {
    const btnSend = document.getElementById('csend');
    const input = document.getElementById('cinput');
    
    // Crear botón de borrar chat si no existe
    let btnClear = document.getElementById('btn-clear-chat');
    if (!btnClear) {
        btnClear = document.createElement('button');
        btnClear.id = 'btn-clear-chat';
        btnClear.className = 'btn-clear-chat';
        btnClear.title = 'Borrar chat';
        btnClear.innerHTML = '🗑';
        const chatHead = document.querySelector('.chat-head');
        if (chatHead) chatHead.appendChild(btnClear);
    }
    
    btnClear.onclick = () => AIAssistant.clearChat();

    const handleSend = () => {
        const text = input.value.trim();
        if (text) {
            input.value = '';
            AIAssistant.ask(text);
        }
    };

    btnSend.onclick = handleSend;
    input.onkeypress = (e) => { if (e.key === 'Enter') handleSend(); };
    
    // Renderizar sugerencias iniciales
    AIAssistant.renderSuggestions();
});

window.AIAssistant = AIAssistant;