require('dotenv').config({ path: '.env.local' }); // Load env vars
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({
    region: process.env.AWS_REGION || 'ap-south-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
});

const docClient = DynamoDBDocumentClient.from(client);

/**
 * Generic function to update records in DynamoDB
 * @param {string} tableName - The DynamoDB table name
 * @param {Array<Object>} records - Array of records to update. 
 *        Each must contain `keys` (primary keys) and `updates` (fields to set).
 */
async function updateRecords(tableName, records) {
    for (const record of records) {
        const { keys, updates } = record;

        let updateExpression = 'SET';
        const expressionAttributeNames = {};
        const expressionAttributeValues = {};

        const updateKeys = Object.keys(updates);

        updateKeys.forEach((key, index) => {
            // Using aliases (#field, :val) handles DynamoDB reserved keywords automatically (like 'desc')
            const attributeNameAlias = `#field${index}`;
            const attributeValueAlias = `:val${index}`;

            updateExpression += ` ${attributeNameAlias} = ${attributeValueAlias}`;
            if (index < updateKeys.length - 1) updateExpression += ',';

            expressionAttributeNames[attributeNameAlias] = key;
            expressionAttributeValues[attributeValueAlias] = updates[key];
        });

        const command = new UpdateCommand({
            TableName: tableName,
            Key: keys,
            UpdateExpression: updateExpression,
            ExpressionAttributeNames: expressionAttributeNames,
            ExpressionAttributeValues: expressionAttributeValues,
        });

        try {
            await docClient.send(command);
            console.log(`✅ Successfully updated record in ${tableName} w/ keys:`, keys);
        } catch (error) {
            console.error(`❌ Error updating record in ${tableName} w/ keys:`, keys);
            console.error(error.message);
        }
    }
}

// ==========================================
// Data Configuration
// ==========================================

async function run() {
    // 1. Specify the table name
    const TABLE_NAME = 'product_variants';

    // 2. Specify the records and the exact data you want to insert/update
    const recordsToUpdate = [
        {
            // The exact Primary Key(s) for the record
            keys: { PK: 'VARIANT#REPLACE_WITH_ROSELIA_VARIANT_ID' },

            // The fields you want to add or update
            updates: {
                shortDesc: "Hickoku Roselia – Soft Rose Attar\nA delicate rose fragrance that feels elegant, airy, and timeless.",
                desc: "Roselia is a soft expression of blooming roses wrapped in elegance and light. It opens with a gentle\nfreshness that feels airy and refined, unfolding into a graceful floral heart. As it settles, a clean\nmusky base lingers on the skin, creating a subtle yet captivating presence.\nDesigned for those who appreciate understated luxury, Roselia is perfect for everyday elegance\nand intimate moments."
            }
        }
        // Add more variant objects here if needed
    ];

    console.log(`Starting update for ${recordsToUpdate.length} records in table: ${TABLE_NAME}`);
    await updateRecords(TABLE_NAME, recordsToUpdate);
    console.log('Finished updating records.');
}

run();
