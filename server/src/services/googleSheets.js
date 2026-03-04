import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

export async function fetchSheetData() {
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    // Replace literal '\n' characters inside the environment variable with actual newlines
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const sheetId = process.env.GOOGLE_SHEET_ID;

    if (!email || !privateKey || !sheetId) {
        throw new Error('Missing Google Service Account credentials or Sheet ID in .env');
    }

    // Initialize Auth
    const serviceAccountAuth = new JWT({
        email: email,
        key: privateKey,
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const doc = new GoogleSpreadsheet(sheetId, serviceAccountAuth);

    await doc.loadInfo(); // loads document properties and worksheets

    // 1. Fetch Workflow Tracker
    const workflowSheet = doc.sheetsByTitle['Workflow Tracker'];
    let workflowTracker = [];
    if (workflowSheet) {
        const rows = await workflowSheet.getRows();
        workflowTracker = rows.map(row => row.toObject());
    }

    // 2. Fetch Job Data Tabs: VM, RO, SSO, RO_Top
    const jobTabs = ['VM', 'RO', 'SSO', 'RO_Top'];
    let jobData = [];

    for (const tab of jobTabs) {
        const sheet = doc.sheetsByTitle[tab];
        if (sheet) {
            const rows = await sheet.getRows();
            // Tag the row with its source tab
            const tabData = rows.map(row => ({
                ...row.toObject(),
                _sourceTab: tab
            }));
            jobData = jobData.concat(tabData);
        }
    }

    // 3. Fetch Error Trigger log
    const errorSheet = doc.sheetsByTitle['Error Trigger'];
    let errors = [];
    if (errorSheet) {
        const rows = await errorSheet.getRows();
        errors = rows.map(row => row.toObject());
    }

    return {
        workflowTracker,
        jobData,
        errors,
        lastUpdated: new Date().toISOString()
    };
}
