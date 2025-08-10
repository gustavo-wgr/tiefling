# Tiefling - 3D Image Converter and Viewer

A web-based 3D image converter and viewer that generates depth maps from images and renders them in 3D. Features VR support and works entirely in the browser.

## Features

- **AI-Powered Depth Map Generation**: Uses ONNX models to generate depth maps from any image
- **3D Rendering**: Real-time 3D visualization with mouse/touch controls
- **VR Support**: Full WebXR support for immersive viewing
- **Multiple Display Modes**: Full, Half SBS, Full SBS, and Anaglyph modes
- **Offline Processing**: All processing happens locally in your browser
- **Drag & Drop**: Easy image upload via drag and drop
- **Bookmarklet**: Quick access from other websites

## Live Demo

Visit: [https://gustavo-wgr.github.io/tiefling/](https://gustavo-wgr.github.io/tiefling/)

## GitHub Pages Deployment

This project is configured for GitHub Pages deployment. The site is served from the root directory.

### Setup Instructions:

1. **Fork or Clone** this repository
2. **Enable GitHub Pages**:
   - Go to your repository Settings
   - Scroll to "Pages" section
   - Source: "Deploy from a branch"
   - Branch: `main` (or your default branch)
   - Folder: `/` (root directory)
3. **Wait for deployment** (usually takes a few minutes)
4. Your site will be live at `https://yourusername.github.io/tiefling/`

### File Structure for GitHub Pages:

```
/
├── index.html          # Main HTML file
├── manifest.json       # PWA manifest
├── favicon.ico         # Site icon
├── css/                # Stylesheets
│   ├── main.css
│   └── simplebar.css
├── js/                 # JavaScript files
│   ├── main.js
│   ├── worker.js
│   ├── alpine.esm.js
│   ├── simplebar.min.js
│   ├── bookmarklet.js
│   └── tiefling/
│       ├── tiefling.js
│       ├── webxr-manager.js
│       ├── node_modules/     # Three.js and ONNX dependencies
│       └── onnx-wasm/        # ONNX WASM files
├── img/                # Images and examples
│   ├── examples/
│   ├── logo.png
│   └── favicon.ico
└── models/             # AI model files
    └── depthanythingv2-vits-dynamic-quant.onnx
```

## Local Development

To run this locally:

1. Clone the repository
2. Serve the files using a local web server:
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   
   # Using PHP
   php -S localhost:8000
   ```
3. Open `http://localhost:8000` in your browser

## Browser Compatibility

- **Modern Browsers**: Chrome, Firefox, Safari, Edge
- **WebGL Support**: Required for 3D rendering
- **WebXR Support**: Optional for VR functionality
- **Web Workers**: Required for AI processing

## Dependencies

- **Three.js**: 3D rendering engine
- **ONNX Runtime Web**: AI model inference
- **Alpine.js**: Reactive UI framework
- **SimpleBar**: Custom scrollbars

## License

MIT License - see LICENSE file for details.

## Credits

Created by Robert Gerlach - [https://robsite.net](https://robsite.net)

Original repository: [https://github.com/combatwombat/tiefling](https://github.com/combatwombat/tiefling)
