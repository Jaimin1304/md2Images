# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a web application for converting Markdown text to PNG images. The project is now structured as separate HTML, CSS, and JavaScript files for better maintainability, providing a complete Markdown-to-image conversion tool with the following features:

- Real-time Markdown preview with GitHub-style rendering
- Adjustable image width (300px to 1200px)
- Support for splitting long documents using cut lines (`---`)
- Single image export or batch export to ZIP file
- Client-side processing (no server required)

## Architecture

### Multi-File Structure

- **index.html**: Main HTML structure with external references
- **styles.css**: All CSS styling including dark theme, Markdown rendering, and animations
- **script.js**: All JavaScript functionality for the application
- **md2Images.html**: Original single-file version (legacy)

The application uses CDN libraries: marked.js (Markdown parsing), html2canvas (image generation), JSZip (batch export)

### Key Components

- **Toolbar**: Width slider, cut line controls, export button
- **Input Panel**: Left-side textarea for Markdown input with real-time parsing
- **Preview Panel**: Right-side rendered preview with adjustable width
- **Export System**: Single image or multi-image ZIP export using html2canvas

### Export Workflow

1. Content validation and error handling
2. Split content at divider lines (if present)
3. Create temporary DOM elements for each section
4. Generate PNG images using html2canvas
5. Package multiple images into ZIP using JSZip
6. Download single PNG or ZIP file

## Development Notes

### Running the Application

- Open `index.html` directly in a web browser (or use `md2Images.html` for the legacy single-file version)
- No build process, server, or dependencies required
- Fully client-side application

### Styling Approach

- External CSS file (`styles.css`) with dark theme for editor interface
- Clean white background for preview/export areas
- GitHub-style Markdown rendering in preview
- Responsive design with 50/50 split layout

### Key Functions (script.js)

- `updatePreview()`: Real-time Markdown parsing and rendering
- `exportImages()`: Main export controller with error handling
- `exportSingleImage()`: Single PNG generation using html2canvas
- `exportMultipleImages()`: Batch processing and ZIP creation
- `showUserMessage()`: User feedback system
- `init()`: Application initialization
- `setupWidthControl()`: Width slider functionality

### Technology Stack

- Vanilla JavaScript (ES6+)
- External CDN libraries: marked.js 4.3.0, html2canvas 1.4.1, JSZip 3.10.1
- CSS3 with custom properties and animations
- HTML5 canvas for image generation
