class WidgetInsightsJs extends CWidget {
    onInitialize() {
        super.onInitialize();
        this._analysisType = null;
        this._outputContainer = null;
        this._analyseBtn = null;
    }

    setContents(response) {
        if (!this._analysisType) {
            super.setContents(response);
            this._body.innerHTML = `
            <div class="options" style="text-align: center; margin-bottom: 20px;">
                <select id="analysisType">
                    <option value="Summary">Summary</option>
                    <option value="Insights">Insights</option>
                    <option value="Diagnosis">Diagnosis</option>
                    <option value="Comparison">Comparison</option>
                    <option value="Forecast">Forecast</option>
                    <option value="What would you do?">What would you do?</option>
                </select>
                <button id="analyseBtn">Analyse</button>
            </div>
            <div id="dashboard-container" class="dashboard-grid" style="height: 300px;">
                <div id="outputContainer" class="widget-output"></div>
            </div>
            `;

            this._analysisType = this._body.querySelector('#analysisType');
            this._outputContainer = this._body.querySelector('#outputContainer');
            this._analyseBtn = this._body.querySelector('#analyseBtn');

            this._applyThemeStyles();
            
            this._loadHtml2Canvas().then(() => {
                this._analyseBtn.addEventListener('click', this._onAnalyseBtnClick.bind(this));
            }).catch(error => {
                console.error('Failed to load html2canvas:', error);
            });
        }
    }

    _applyThemeStyles() {
        const theme = this._getZabbixTheme();
        if (theme === "dark") {
            this._outputContainer.style.backgroundColor = "#1e1e2e";
            this._outputContainer.style.color = "#ffffff";
            this._outputContainer.style.border = "1px solid #444";
            this._outputContainer.style.boxShadow = "0 0 10px rgba(255, 255, 255, 0.1)";
        } else {
            this._outputContainer.style.backgroundColor = "#f9f9f9";
            this._outputContainer.style.color = "#000000";
            this._outputContainer.style.border = "1px solid #ccc";
            this._outputContainer.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.1)";
        }
    }

    _getZabbixTheme() {
        const body = document.body;
        if (body.classList.contains("theme-dark")) {
            return "dark";
        } else if (body.classList.contains("theme-blue")) {
            return "blue";
        } else {
            return "default";
        }
    }

    _loadHtml2Canvas() {
        return new Promise((resolve, reject) => {
            if (typeof html2canvas !== 'undefined') {
                return resolve();
            }

            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    async _onAnalyseBtnClick() {
        console.log("Analyse button clicked...");
        const analysisType = this._analysisType.value;
        console.log("Selected analysis type:", analysisType);
        this._outputContainer.innerHTML = 'Analyzing...';

        try {
            console.log("Capturing the dashboard...");
            const canvas = await html2canvas(document.querySelector('main'));
            console.log("Canvas created:", canvas);
            const dataUrl = canvas.toDataURL('image/png');
            console.log("Data URL created");

            const base64Image = dataUrl.split(',')[1];
            const prompt = this._getPromptForAnalysisType(analysisType);

            console.log("Sending captured image to Gemini API...");
            const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=YOUR_API_KEY', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            { text: prompt },
                            {
                                inline_data: {
                                    mime_type: "image/png",
                                    data: base64Image
                                }
                            }
                        ]
                    }]
                })
            });

            const responseData = await response.json();
            console.log("Response from Gemini:", responseData);
            const responseContent = responseData.candidates[0].content.parts[0].text;
            this._outputContainer.innerHTML = `<div class="widget-result">${responseContent}</div>`;
            console.log("Analysis result:", responseContent);
        } catch (error) {
            console.error('Error during analysis:', error);
            this._outputContainer.innerHTML = '<div class="widget-error">An error occurred during analysis.</div>';
        }
    }
}

// Register the widget
addWidgetClass(WidgetInsightsJs);
