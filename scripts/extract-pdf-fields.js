const fs = require('fs/promises');
const path = require('path');
const pdfParse = require('pdf-parse');

async function extractFieldsFromPDF(pdfPath, formType) {
  const dataBuffer = await fs.readFile(pdfPath);
  const data = await pdfParse(dataBuffer);
  
  const text = data.text;
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  const fields = [];
  const sections = [];
  let currentSection = '';
  
  // Common patterns to identify form fields
  const fieldPatterns = [
    /^([A-Z][^:]+):\s*(.*)$/,  // Label: Value
    /^([A-Z][^?]+)\?/,         // Question format
    /^([A-Z][^:]+):$/,         // Label:
  ];
  
  // Look for common field indicators
  const fieldIndicators = [
    'name', 'email', 'address', 'phone', 'date', 'amount', 'loan', 'purpose',
    'applicant', 'guarantor', 'reference', 'employer', 'income', 'expense'
  ];
  
  // Extract sections (usually headers in all caps or numbered)
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Detect section headers (often all caps, numbered, or bold indicators)
    if (line.match(/^[A-Z][A-Z\s]+$/) && line.length > 5 && line.length < 50) {
      if (!sections.includes(line)) {
        sections.push(line);
        currentSection = line;
      }
    }
    
    // Detect numbered sections
    if (line.match(/^\d+[\.\)]\s+[A-Z]/)) {
      const sectionName = line.replace(/^\d+[\.\)]\s+/, '');
      if (!sections.includes(sectionName)) {
        sections.push(sectionName);
        currentSection = sectionName;
      }
    }
    
    // Try to identify form fields
    for (const pattern of fieldPatterns) {
      const match = line.match(pattern);
      if (match) {
        const label = match[1].trim();
        const value = match[2]?.trim() || '';
        
        // Skip if it's clearly not a field (too short, too long, etc.)
        if (label.length < 3 || label.length > 100) continue;
        
        // Check if it contains field indicators
        const lowerLabel = label.toLowerCase();
        const isField = fieldIndicators.some(indicator => lowerLabel.includes(indicator));
        
        if (isField || value === '' || value === '__________' || value.includes('_')) {
          const fieldName = label
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '_')
            .replace(/^_+|_+$/g, '');
          
          // Determine field type
          let fieldType = 'text';
          if (lowerLabel.includes('email')) fieldType = 'email';
          else if (lowerLabel.includes('phone') || lowerLabel.includes('tel')) fieldType = 'tel';
          else if (lowerLabel.includes('date')) fieldType = 'date';
          else if (lowerLabel.includes('amount') || lowerLabel.includes('$') || lowerLabel.includes('income') || lowerLabel.includes('expense')) fieldType = 'number';
          else if (lowerLabel.includes('yes') || lowerLabel.includes('no') || lowerLabel.includes('check')) fieldType = 'checkbox';
          else if (label.length > 50 || lowerLabel.includes('describe') || lowerLabel.includes('explain') || lowerLabel.includes('comment')) fieldType = 'textarea';
          
          // Check if required (often indicated by asterisk or "required")
          const required = label.includes('*') || lowerLabel.includes('required') || lowerLabel.includes('must');
          
          fields.push({
            name: fieldName,
            label: label,
            type: fieldType,
            required: required,
            section: currentSection || undefined,
          });
        }
      }
    }
  }
  
  // If we didn't find many fields, try a different approach - look for common question patterns
  if (fields.length < 5) {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Look for question patterns
      if (line.includes('?') && line.length > 10 && line.length < 200) {
        const question = line.replace(/\?.*$/, '').trim();
        if (question.length > 5) {
          const fieldName = question
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '_')
            .replace(/^_+|_+$/g, '')
            .substring(0, 50);
          
          fields.push({
            name: fieldName,
            label: question + '?',
            type: 'textarea',
            required: false,
            section: currentSection || undefined,
          });
        }
      }
    }
  }
  
  return {
    formName: path.basename(pdfPath, '.pdf'),
    formType: formType,
    fields: fields,
    sections: sections,
  };
}

async function main() {
  const pdfsDir = path.join(process.cwd(), 'pdfs');
  const outputDir = path.join(process.cwd(), 'lib', 'forms', 'schemas');
  
  // Ensure output directory exists
  await fs.mkdir(outputDir, { recursive: true });
  
  const pdfFiles = [
    {
      filename: 'Iana-Preliminary-Application-Personal_Emergency (1).pdf',
      type: 'preliminary-personal',
    },
    {
      filename: 'Iana-Preliminary-Application-Education (1).pdf',
      type: 'preliminary-education',
    },
    {
      filename: 'Iana-Preliminary-Application-Business_Institutional (1).pdf',
      type: 'preliminary-business',
    },
    {
      filename: 'Iana-Final-Application (1).pdf',
      type: 'final',
    },
  ];
  
  for (const pdf of pdfFiles) {
    const pdfPath = path.join(pdfsDir, pdf.filename);
    console.log(`Extracting fields from ${pdf.filename}...`);
    
    try {
      const schema = await extractFieldsFromPDF(pdfPath, pdf.type);
      const outputPath = path.join(outputDir, `${pdf.type}-fields.json`);
      
      await fs.writeFile(
        outputPath,
        JSON.stringify(schema, null, 2),
        'utf-8'
      );
      
      console.log(`✓ Extracted ${schema.fields.length} fields from ${pdf.filename}`);
      console.log(`  Saved to ${outputPath}`);
    } catch (error) {
      console.error(`✗ Error processing ${pdf.filename}:`, error);
    }
  }
  
  console.log('\nExtraction complete!');
}

main().catch(console.error);


