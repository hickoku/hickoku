require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

const args = process.argv.slice(2);
if (args.length < 2) {
    console.error("❌ Usage: node scripts/update-dynamo-csv.js <tableName> <pathToCsv>");
    console.error("Example: node scripts/update-dynamo-csv.js product_variants data.csv");
    process.exit(1);
}

const TABLE_NAME = args[0];
const CSV_PATH = args[1];

if (!fs.existsSync(CSV_PATH)) {
    console.error(`❌ CSV file not found at: ${CSV_PATH}`);
    process.exit(1);
}

// 1. Initialize AWS Client
const client = new DynamoDBClient({
    region: process.env.AWS_REGION || 'ap-south-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
});
const docClient = DynamoDBDocumentClient.from(client);

// 2. Native Custom CSV Parser (Handles Excel quoting and Multiline strings safely)
function parseCSV(content) {
    const result = [];
    let row = [];
    let cell = '';
    let insideQuotes = false;

    for (let i = 0; i < content.length; i++) {
        const char = content[i];
        const nextChar = content[i + 1];

        if (insideQuotes) {
            // Escaped quotes "" -> "
            if (char === '"' && nextChar === '"') {
                cell += '"';
                i++;
            } else if (char === '"') {
                insideQuotes = false;
            } else {
                cell += char;
            }
        } else {
            if (char === '"') {
                insideQuotes = true;
            } else if (char === ',') {
                row.push(cell);
                cell = '';
            } else if (char === '\n' || char === '\r') {
                row.push(cell);
                // Only push if the row isn't completely empty
                if (row.join('').trim() !== '') {
                    result.push(row);
                }
                row = [];
                cell = '';
                if (char === '\r' && nextChar === '\n') {
                    i++; // skip \n
                }
            } else {
                cell += char;
            }
        }
    }

    // Push the very last row if there wasn't a trailing newline
    if (cell || row.length > 0) {
        row.push(cell);
        if (row.join('').trim() !== '') {
            result.push(row);
        }
    }

    if (result.length < 2) return [];

    const headers = result[0].map(h => h.trim());
    const data = [];
    for (let i = 1; i < result.length; i++) {
        const obj = {};
        for (let j = 0; j < headers.length; j++) {
            if (headers[j]) { // ensure skip empty headers
                obj[headers[j]] = result[i][j] ? result[i][j].trim() : '';
            }
        }
        data.push(obj);
    }
    return data;
}

// 3. Process and Update Records
async function run() {
    console.log(`Starting bulk update for table: ${TABLE_NAME} from ${CSV_PATH}...`);

    // Read and Parse CSV
    const csvContent = fs.readFileSync(CSV_PATH, 'utf-8');
    const records = parseCSV(csvContent);

    if (records.length === 0) {
        console.error("❌ No valid rows found in the CSV.");
        process.exit(1);
    }

    let successCount = 0;
    let failCount = 0;

    for (const row of records) {
        // Find the Primary Key. Accept "PK" or "pk"
        const pkHeader = Object.keys(row).find(k => k.toLowerCase() === 'pk');
        if (!pkHeader || !row[pkHeader]) {
            console.warn("⚠️ Skipping row missing 'PK' column:", row);
            failCount++;
            continue;
        }

        const pkValue = row[pkHeader];
        // Remove PK from the 'updates' payload
        const updates = { ...row };
        delete updates[pkHeader];

        if (Object.keys(updates).length === 0) {
            console.warn(`⚠️ Skipping PK ${pkValue}: No other fields to update.`);
            failCount++;
            continue;
        }

        let updateExpression = 'SET';
        const expressionAttributeNames = {};
        const expressionAttributeValues = {};
        const updateKeys = Object.keys(updates);

        updateKeys.forEach((key, index) => {
            const attributeNameAlias = `#field${index}`;
            const attributeValueAlias = `:val${index}`;

            updateExpression += ` ${attributeNameAlias} = ${attributeValueAlias}`;
            if (index < updateKeys.length - 1) updateExpression += ',';

            expressionAttributeNames[attributeNameAlias] = key;
            expressionAttributeValues[attributeValueAlias] = updates[key];
        });

        const command = new UpdateCommand({
            TableName: TABLE_NAME,
            Key: { PK: pkValue }, // Assuming Partition Key is literally "PK"
            UpdateExpression: updateExpression,
            ExpressionAttributeNames: expressionAttributeNames,
            ExpressionAttributeValues: expressionAttributeValues,
        });

        try {
            await docClient.send(command);
            console.log(`✅ Updated PK: ${pkValue}`);
            successCount++;
        } catch (error) {
            console.error(`❌ Failed PK: ${pkValue}`, error.message);
            failCount++;
        }
    }

    console.log(`\n🎉 Job Complete!`);
    console.log(`Success: ${successCount}`);
    console.log(`Failed: ${failCount}`);
}

run();
