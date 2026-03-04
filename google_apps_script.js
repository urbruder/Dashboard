/**
 * Instructions:
 * 1. Open your Google Sheet "US_Jobs_SR_V4.0".
 * 2. Go to Extensions -> Apps Script.
 * 3. Delete any existing code and paste this code.
 * 4. Replace WEBHOOK_URL with your actual backend URL once deployed 
 *    (e.g., https://your-server.com/api/webhook) or use a tunnel like ngrok for local testing.
 * 5. Save the project and then create a Trigger:
 *    - Click the clock icon (Triggers) on the left menu.
 *    - Click "Add Trigger" (bottom right).
 *    - Choose function to run: onEditTrigger
 *    - Select event type: On edit
 *    - Save (it will ask you to grant permissions).
 */

const WEBHOOK_URL = 'YOUR_WEBHOOK_URL_HERE'; // e.g., 'https://your-ngrok-url.app/api/webhook'

function onEditTrigger(e) {
    // Send the POST request to your backend webhook
    try {
        const payload = {
            timestamp: new Date().toISOString(),
            user: e && e.user ? e.user.getEmail() : 'Unknown',
            range: e && e.range ? e.range.getA1Notation() : 'Unknown',
        };

        const options = {
            method: 'post',
            contentType: 'application/json',
            payload: JSON.stringify(payload)
        };

        UrlFetchApp.fetch(WEBHOOK_URL, options);
    } catch (err) {
        Logger.log('Error triggering webhook: ' + err.toString());
    }
}
