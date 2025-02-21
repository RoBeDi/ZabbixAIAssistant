# Zabbix AI Assistant

> [!IMPORTANT]
> Always test Zabbix modules in a non-production or staging environment before deploying them in a live production setting. Running scripts directly in production without prior testing can lead to unintended consequences, such as system downtime, data loss, or configuration issues. Testing helps ensure that the script behaves as expected, is compatible with your systems, and performs the required tasks without causing disruptions.
>
> **Best Practice:**
> - **Test in a safe environment:** Use a dedicated test machine or sandbox environment to verify the script’s functionality.
> - **Review logs and output:** Check for any errors, warnings, or unexpected behavior during testing.
> - **Monitor the impact:** After the test, assess the script's impact on system performance, services, and configuration settings.
> 
> By following this approach, you can minimize risks and ensure smooth execution in production environments.

## Updates

## Configuration Steps for AI Script
1.	Create an account in Google AI Studio to obtain the required [API key](https://aistudio.google.com/app/apikey).
2.	In Zabbix, go to **Alerts | Scripts** and select **Create Script**:
	- **Name:** possible cause(s) and Solution(s)
	- **Scope:** Manual event action
	- **Menu path:** AI Assistant
	- **Type:** Webhook
	- **Parameters:** 
		- **Name:** alert_subject - **Value:** {TRIGGER.NAME}
		- **Name:** api_key - **Value:** *Insert your API key*
	- **Script:** *Copy and paste the script content from [Script AI Help](https://github.com/RoBeDi/ZabbixAIAssistant/raw/refs/heads/main/script)*

![image](/images/Create_script.gif)

### Application in the problem panel
Completing the configuration, the AI Assistant is available by selecting a specific alert. From the menu, select the **AI Assistant** and click on the **Possible cause(s) and solution(s)** script.

![image](/images/AI_menu.gif)

#### Result in Dashboard:

![image](/images/DashboardProblem.gif)

#### Result in **Monitoring | Problems**:

![image](/images/MonitoringProblems.gif)

The AI will be able to provide a solution for each problem presented, allowing you to progressively optimize the predetermined thresholds.

> [!NOTE]
> Solutions presented by the AI, are considered to be your starting points. Solutions may not be applicable for the platform.

## Configuration Steps for custom widget
This concept integrates all the functionalities present in the widget (including Summary, Perspectives, Diagnosis, Comparison, and Forecast), since the used prompt can indicate whether it is necessary to make adjustments to the strategic plan or predict future trends based on the panel data built.

1.	Log onto your Zabbix server, open the Terminal and go to the **/usr/share/zabbix/ui/modules** directory
	- Use the following command `cd /usr/share/zabbix/ui/modules` and press enter
2.	Create the **insights** directory with the subdirectories **assets** and **js**.
	-	Use the following command: `sudo mkdir -p insights/assets/js`
3.	Download the **manifest.json** file in the **insights** directory
	-	Use the following command: `sudo curl -o manifest.json https://raw.githubusercontent.com/RoBeDi/ZabbixAIAssistant/refs/heads/main/manifest.json `
4.	Download the **class.widget.php.js** file in the **js** directory
	-	Use the following command: `sudo curl -o class.widget.php.js https://raw.githubusercontent.com/RoBeDi/ZabbixAIAssistant/refs/heads/main/assets/js/class.widget.php.js `
	-	Replace **YOUR_API_KEY** with your Google API key (line 84)
5.	On the Zabbix portal, go to **Administration | General | Modules** and click the **Scan directory** button.
	-	The **Insights Dashboard** module is visible, but requires to be enabled.
6. In any available dashboard or a newly created dashboard, add the new widget **Insights Dashboard** and see the results.