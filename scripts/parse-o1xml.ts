const filePattern = /<file path="([^"]+)">([\s\S]*?)<\/file>/g;

async function parseAndWriteFiles(xmlPath: string) {
  const content = await Bun.file(xmlPath).text();
  
  // Find all file matches in the XML
  const matches = content.matchAll(filePattern);
  
  for (const match of matches) {
    const [_, path, content] = match;
    // Remove the first empty line and trim any trailing whitespace
    const cleanContent = content.trim();
    
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