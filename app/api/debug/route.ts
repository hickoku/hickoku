import { NextResponse } from "next/server";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});
const docClient = DynamoDBDocumentClient.from(client);

export async function GET() {
  try {
    const res = await docClient.send(new ScanCommand({ TableName: "product_variants" }));
    const keys = new Set<string>();
    res.Items?.forEach(i => Object.keys(i).forEach(k => keys.add(k)));
    
    // Find any key that sounds like characteristic
    const charKey = Array.from(keys).find(k => k.toLowerCase().includes('char'));
    
    return NextResponse.json({ 
       keys: Array.from(keys),
       charKey,
       sampleWithChar: res.Items?.find(i => charKey && i[charKey])
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message });
  }
}
