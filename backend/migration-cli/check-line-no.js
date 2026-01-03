/**
 * Check if line_no exists in DBF or needs to be generated
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import DBF from 'dbffile';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function checkDbf() {
  const dbfPath = path.join(__dirname, '../../source/moe.DBF');
  
  console.log('=== Checking moe.DBF Structure ===\n');
  
  if (!fs.existsSync(dbfPath)) {
    console.log(`❌ DBF file not found: ${dbfPath}`);
    return;
  }
  
  console.log(`✅ DBF file found: ${dbfPath}`);
  const stats = fs.statSync(dbfPath);
  console.log(`   Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB\n`);
  
  try {
    const table = await DBF.open(dbfPath);
    
    console.log(`Total records: ${table.recordCount}`);
    console.log(`Fields: ${table.fields.length}\n`);
    
    console.log('Field names:');
    table.fields.forEach((field, i) => {
      console.log(`  ${i + 1}. ${field.name} (${field.type}, length: ${field.length}, decimals: ${field.decimals})`);
    });
    
    const hasLineNo = table.fields.some(f => 
      f.name.toLowerCase() === 'line_no' || 
      f.name.toLowerCase() === 'line_no' ||
      f.name.toLowerCase() === 'lineno' ||
      f.name.toLowerCase() === 'line'
    );
    
    console.log(`\nHas line_no field? ${hasLineNo ? '✅ YES' : '❌ NO'}\n`);
    
    if (!hasLineNo) {
      console.log('=== SOLUTION: line_no needs to be generated ===');
      console.log('Since line_no is not in the DBF, we need to generate it during extraction or transformation.');
      console.log('line_no should be a sequential number (1, 2, 3...) for each oe_no group.\n');
      
      // Check sample records by oe_no
      console.log('Sample records by oe_no (to understand grouping):');
      const sampleRecords = [];
      for (let i = 0; i < Math.min(20, table.recordCount); i++) {
        const record = await table.readRecord(i);
        sampleRecords.push(record);
      }
      
      // Group by oe_no
      const grouped = {};
      sampleRecords.forEach((rec, idx) => {
        const oeNo = rec.OE_NO || rec.oe_no || rec.OE_NO || '';
        if (!grouped[oeNo]) {
          grouped[oeNo] = [];
        }
        grouped[oeNo].push({ index: idx, record: rec });
      });
      
      Object.entries(grouped).slice(0, 5).forEach(([oeNo, records]) => {
        console.log(`\n  OE_NO: ${oeNo} (${records.length} detail records)`);
        records.forEach((r, i) => {
          const itemNo = r.record.ITEM_NO || r.record.item_no || r.record.ITEM_NO || '';
          console.log(`    Line ${i + 1}: item_no=${itemNo}`);
        });
      });
    } else {
      console.log('\n=== Checking if line_no values are populated ===');
      const sampleRecords = [];
      for (let i = 0; i < Math.min(10, table.recordCount); i++) {
        const record = await table.readRecord(i);
        sampleRecords.push(record);
      }
      
      sampleRecords.forEach((rec, i) => {
        const lineNo = rec.LINE_NO || rec.line_no || rec.LINE_NO || '';
        const oeNo = rec.OE_NO || rec.oe_no || rec.OE_NO || '';
        console.log(`Record ${i}: oe_no=${oeNo}, line_no=${lineNo}`);
      });
    }
    
    await table.close();
    
  } catch (error) {
    console.error('Error reading DBF:', error);
  }
}

checkDbf().catch(console.error);

