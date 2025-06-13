# WASM HTML Minifier Demo

A Bootstrap 5 landing page demonstrating WebAssembly technology with an interactive HTML minifier powered by Rust and the `@minify-html/wasm` package.

## Features

- 📖 **Educational Landing Page**: Explains WebAssembly technology and its benefits
- 🔧 **Interactive Minifier**: Try HTML minification directly in the browser
- ⚡ **High Performance**: Uses Rust-compiled WASM for ultra-fast minification
- 🎨 **Modern UI**: Built with Bootstrap 5 for a clean, responsive design
- 📊 **Browser Compatibility Table**: Shows WASM support across browsers

## Quick Start

### Prerequisites

- Node.js 16+ (for npm package management)
- A local web server (Python's built-in server works great)

### Setup

1. **Clone and install dependencies:**
   ```bash
   git clone <your-repo>
   cd wasm-minify
   npm install
   ```

2. **Build WASM files:**
   ```bash
   npm run build
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   ```
   http://localhost:8081
   ```

## Available Scripts

- `npm run build` - Extract and setup WASM files from npm package
- `npm run dev` - Build WASM files and start development server
- `npm run serve` - Start development server (assumes WASM files are already built)
- `npm run install-wasm` - Extract WASM files only

## Project Structure

```
wasm-minify/
├── index.html              # Main landing page
├── package.json            # npm configuration
├── scripts/
│   └── install-wasm.js     # WASM extraction script
├── wasm/                   # Generated WASM files (gitignored)
│   ├── minify_html_wasm.js
│   ├── index_bg.js
│   └── minify_html_wasm_bg.wasm
└── README.md
```

## How It Works

### WASM Integration

This project demonstrates how to integrate WASM modules in browser-based applications without bundlers:

1. **npm Dependency Management**: The `@minify-html/wasm` package is managed as a regular npm dependency
2. **Build-time Extraction**: A Node.js script extracts the WASM files from `node_modules`
3. **Custom Wrapper**: Generates a browser-compatible wrapper that handles WASM initialization
4. **Direct Import**: The HTML page imports the WASM module using ES6 imports

### Key Benefits

- ✅ **Version Control**: WASM dependency versions are locked in `package.json`
- ✅ **Reproducible Builds**: Anyone can run `npm install && npm run build` to get the same setup
- ✅ **No Bundler Required**: Works with simple file serving
- ✅ **Automatic Updates**: Update WASM packages with standard `npm update`

## Technical Details

### WASM Module Loading

The project uses a custom initialization pattern that:
- Fetches the WASM binary using `fetch()` to avoid MIME type issues
- Properly sets up import bindings that the WASM module expects
- Handles fallbacks for servers without proper WASM MIME type configuration
- Manages memory and exports correctly

### Browser Compatibility

Works in all modern browsers supporting:
- ES Modules
- WebAssembly
- Fetch API
- TextEncoder/TextDecoder

**Supported browsers:** Chrome 61+, Firefox 60+, Safari 11+, Edge 16+

## Development

### Adding New WASM Packages

To integrate other WASM packages:

1. Add the package to `package.json`:
   ```bash
   npm install @your-wasm/package
   ```

2. Modify `scripts/install-wasm.js` to extract the new package files

3. Update the import paths in your HTML/JS files

### Customizing the Minifier

The minifier accepts various configuration options:

```javascript
const config = {
    keep_spaces_between_attributes: false,
    keep_comments: false,
    minify_css: true,
    minify_js: true,
    remove_processing_instructions: false,
    // ... more options
};
```

See the [minify-html documentation](https://github.com/wilsonzlin/minify-html) for all available options.

## Deployment

### Production Build

```bash
npm run build
```

### Server Requirements

- Serve `.wasm` files with `application/wasm` MIME type (recommended but not required)
- Support for ES modules (most modern servers do this automatically)

### Example Server Configurations

**Apache (.htaccess):**
```apache
AddType application/wasm .wasm
```

**Nginx:**
```nginx
location ~* \.wasm$ {
    add_header Content-Type application/wasm;
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with `npm run dev`
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Related Resources

- [WebAssembly Official Site](https://webassembly.org/)
- [minify-html Package](https://github.com/wilsonzlin/minify-html)
- [WASM Browser Implementation Guide](./MINIFY-WASM-BROWSER-IMPLEMENTATION.md)
- [Bootstrap 5 Documentation](https://getbootstrap.com/docs/5.3/) 