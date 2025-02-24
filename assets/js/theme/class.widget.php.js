
class WidgetInsightsJs extends CWidget {
    onInitialize() {
        super.onInitialize();
        this._analysisType = null;
        this._outputContainer = null;
        this._analyseBtn = null;
    }
	
	_getCurrentTheme() {
		if (document.body.classList.contains('theme-dark')) {
			return 'dark';
		} else if (document.body.classList.contains('theme-blue')) {
			return 'blue';
		}
		return 'default';
	}

	_applyThemeStyles() {
		const theme = this._getCurrentTheme();
		const outputContainer = this._body.querySelector('#outputContainer');
		
		const themeStyles = {
			dark: {
				background: '#1e1e2e',
				color: '#ffffff',
				border: '#555',
				shadow: 'rgba(0, 0, 0, 0.5)'
			},
			blue: {
				background: '#eef5fb',
				color: '#0d3c61',
				border: '#a1c6e1',
				shadow: 'rgba(0, 0, 50, 0.2)'
			},
			default: {
				background: '#f9f9f9',
				color: '#000000',
				border: '#ccc',
				shadow: 'rgba(0, 0, 0, 0.1)'
			}
		};

		const styles = themeStyles[theme];

		outputContainer.style.backgroundColor = styles.background;
		outputContainer.style.color = styles.color;
		outputContainer.style.border = `1px solid ${styles.border}`;
		outputContainer.style.boxShadow = `0 0 10px ${styles.shadow}`;
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

			// Observe theme changes dynamically
			const observer = new MutationObserver(() => this._applyThemeStyles());
			observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

            this._loadHtml2Canvas().then(() => {
                this._analyseBtn.addEventListener('click', this._onAnalyseBtnClick.bind(this));
            }).catch(error => {
                console.error('Failed to load html2canvas:', error);
            });
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

    _getPromptForAnalysisType(analysisType) {
        const prompts = {
			'Summary': "This image shows a Zabbix dashboard. Focus only on the panels within the dashboard. DO NOT INCLUDE the AI Analyser panel in your analysis. Provide a brief summary of what the dashboard is displaying, emphasizing the most critical and relevant points. Lighter colors in the heatmap indicate higher usage, while darker colors indicate lower usage. Always start with 'This dashboard shows...' and ensure the summary captures key insights without going into excessive detail.",
			'Insights': "This image shows a Zabbix control panel. Focus only on the panels within the control panel. DO NOT INCLUDE the AI Analyser panel in your analysis. Explain what the data is displaying and share any insights you can extract. Lighter colors in the heatmap indicate higher usage, while darker colors indicate lower usage. Always start with 'This control panel shows...' and provide detailed information about the data presented, highlighting any trends, patterns, or anomalies observed.",			
			'Diagnosis': "This image shows a Zabbix control panel. Let’s focus only on the panels within the control panel. DO NOT INCLUDE the AI Analyser panel in your analysis. Analyze the data to detect any potential issues or concerns, highlighting correlations and any critical points of concern. Lighter colors in the heatmap indicate higher usage, while darker colors indicate lower usage. Always start with 'This control panel shows...' and provide a detailed diagnosis of any possible problems or inefficiencies indicated by the data.",			
			'Comparison': "This image shows a Zabbix control panel. Let’s focus only on the panels within the control panel. DO NOT INCLUDE the AI Analyser panel in your analysis. Compare the data across different panels to highlight any correlations, discrepancies, or significant differences. Lighter colors in the heatmap indicate higher usage, while darker colors indicate lower usage. Always start with 'This control panel shows...' and provide a comparative analysis, explaining how the data from different panels relate to each other.",			
			'Forecast': "This image shows a Zabbix control panel. Let’s focus only on the panels within the control panel. DO NOT INCLUDE the AI Analyser panel in your analysis. Based on the current data, provide a forecast of future usage trends and patterns. Lighter colors in the heatmap indicate higher usage, while darker colors indicate lower usage. Always start with 'This control panel shows...' and offer insights into what future data might look like, explaining the basis of your predictions.",			
			'What would you do?': "This image shows a Zabbix dashboard. Focus only on the panels within the dashboard. DO NOT INCLUDE the AI Analyser panel in your analysis. Based on the data displayed, suggest proactive actions that a system administrator should take to prevent issues and optimize performance. Lighter colors in the heatmap indicate higher usage, while darker colors indicate lower usage. Start with 'Based on this dashboard, the recommended proactive actions are:' and provide at least five specific actions, explaining the reasoning behind each and their expected impact. Then, imagine you are a system optimization consultant. Develop a long-term continuous improvement strategy based on the displayed data, outlining a 3- to 6-month plan. Start with 'To continuously improve the system shown in this dashboard, I recommend the following strategy:' and detail specific objectives, metrics to track, and suggested changes in infrastructure or processes. Explain how each part of the strategy relates to the observed data in the dashboard and how these recommendations could enhance performance in the future."
		};
        return prompts[analysisType];
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

            // Adjusted to handle Gemini's response structure.
            const responseContent = responseData.candidates[0].content.parts[0].text;
            this._outputContainer.innerHTML = `<div style="border: 1px solid #ccc; padding: 10px; border-radius: 5px; background-color: #f9f9f9;">${responseContent}</div>`;
            console.log("Analysis result:", responseContent);

        } catch (error) {
            console.error('Error during analysis:', error);
            this._outputContainer.innerHTML = '<div style="border: 1px solid #f00; padding: 10px; border-radius: 5px; background-color: #fee;">An error occurred during analysis.</div>';
        }
    }
}

// Register the widget
addWidgetClass(WidgetInsightsJs);