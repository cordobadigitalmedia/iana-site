import { parse } from 'csv-parse/sync';
import { readFileSync } from 'fs';

// Simulating file content (in a real scenario, this would come from the uploaded file)
const csvContent = `Date,Description,Withdrawals,Deposits,Balance
2023-05-01,Initial Balance,,,10000.00
2023-05-02,Deposit,,1000.00,11000.00
2023-05-03,Withdrawal,500.00,,10500.00
2023-05-04,Interest,,50.00,10550.00`;

// Parse CSV content
const records = parse(csvContent, {
  columns: true,
  skip_empty_lines: true,
});

// Process records
const transactions = records.map(record => ({
  date: record.Date,
  description: record.Description,
  withdrawals: record.Withdrawals ? parseFloat(record.Withdrawals) : null,
  deposits: record.Deposits ? parseFloat(record.Deposits) : null,
  balance: parseFloat(record.Balance),
}));

console.log('Processed transactions:');
console.log(JSON.stringify(transactions, null, 2));

