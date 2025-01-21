const filePattern = /<file path="([^"]+)">([\s\S]*?)<\/file>/g;
const cdataPattern = /\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*/;

async function parseAndWriteFiles(xmlPath: string) {
  const content = await Bun.file(xmlPath).text();
  
  // Find all file matches in the XML
  const matches = content.matchAll(filePattern);
  
  for (const match of matches) {
    const [_, path, rawContent] = match;
    
    // Check if content is wrapped in CDATA and extract if needed
    const cdataMatch = rawContent.match(cdataPattern);
    const fileContent = cdataMatch ? cdataMatch[1] : rawContent;
    
    // Remove the first empty line and trim any trailing whitespace
    const cleanContent = fileContent.trim();
    
    try {
      await Bun.write(path, cleanContent);
      console.log(`✓ Wrote ${path}`);
    } catch (error) {
      console.error(`✗ Failed to write ${path}:`, error);
    }
  }
}

// Run the script
const xmlFile = process.argv[2];
if (!xmlFile) {
  console.error('Please provide an XML file path');
  process.exit(1);
}

parseAndWriteFiles(xmlFile).catch(console.error); 