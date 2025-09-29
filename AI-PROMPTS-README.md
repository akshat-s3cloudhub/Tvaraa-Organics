# AI Prompts System for Tvaraa Organics

This system provides a complete solution for managing and using AI image generation prompts for the Tvaraa Organics website. It includes structured data, a JavaScript API, a Python batch generator, and a web-based management interface.

## 📁 Files Overview

### Core Files
- `assets/data/ai-prompts.json` - Structured prompts data
- `assets/js/ai-prompts.js` - JavaScript API for working with prompts
- `generate_images.py` - Python script for batch AI image generation
- `ai-prompts-manager.html` - Web interface for managing prompts
- `requirements.txt` - Python dependencies

## 🚀 Quick Start

### 1. View and Manage Prompts
Open `ai-prompts-manager.html` in your web browser to:
- Browse all prompts by category
- Filter by aspect ratio or search for specific prompts
- Copy prompts to clipboard for AI tools
- Export data as CSV or JSON

### 2. Use in Website (JavaScript)
```javascript
// Load the prompts system
await aiPrompts.loadPrompts();

// Get a specific prompt
const homeHeroPrompt = aiPrompts.getPrompt('widescreen_banners', 'home_hero');

// Get all prompts for a page
const aboutUsPrompts = aiPrompts.getPromptsByPage('About Us');

// Get prompts by aspect ratio
const squarePrompts = aiPrompts.getPromptsByAspectRatio('1:1');
```

### 3. Generate Images with Python
```bash
# Install dependencies
pip install -r requirements.txt

# Set up API keys (choose your preferred service)
export OPENAI_API_KEY="your-openai-api-key"
export STABILITY_API_KEY="your-stability-api-key"

# List available categories
python generate_images.py --list-categories

# Generate images for a specific category
python generate_images.py --category widescreen_banners --service openai

# Generate all images (with limit)
python generate_images.py --limit 5
```

## 📊 Data Structure

The prompts are organized into categories:

### Widescreen Banners (1920x1080, 16:9)
- Home Hero, About Us, Services, etc.
- Perfect for page headers and hero sections

### Supporting Images (1200x800, 3:2)
- Team photos, ingredient shots, etc.
- Professional photography style

### Square Images (800x800 & 600x600, 1:1)
- Product categories, service icons
- Social media and grid layouts

### Videos (1920x1080, 16:9)
- Homepage hero video, process video
- For video generation tools

## 🎨 AI Image Generation

### Supported Services
- **OpenAI DALL-E 3** - High quality, best for photorealistic images
- **Stability AI** - Good for creative and artistic images
- **Midjourney** - Via proxy services (requires setup)

### Setup Instructions

#### OpenAI Setup
1. Get API key from https://platform.openai.com/
2. Set environment variable: `OPENAI_API_KEY=your_key`
3. Use with: `--service openai`

#### Stability AI Setup
1. Get API key from https://platform.stability.ai/
2. Set environment variable: `STABILITY_API_KEY=your_key`
3. Use with: `--service stability`

### Generation Examples
```bash
# Generate only widescreen banners with OpenAI
python generate_images.py --category widescreen_banners --service openai

# Generate 3 images per category with Stability AI
python generate_images.py --service stability --limit 3

# Dry run to see what would be generated
python generate_images.py --dry-run

# Custom output directory
python generate_images.py --output-dir ./my_generated_images
```

## 🌐 Web Interface Features

### AI Prompts Manager (`ai-prompts-manager.html`)

#### Features:
- **Browse by Category**: Organized sections for each image type
- **Filter & Search**: Find prompts by aspect ratio, keywords, or page
- **One-Click Copy**: Copy prompts directly to clipboard
- **Export Options**: Download as CSV for spreadsheets or JSON for other tools
- **Statistics Dashboard**: Overview of total prompts and categories
- **Responsive Design**: Works on desktop and mobile

#### Usage:
1. Open the HTML file in any modern web browser
2. Use filters to narrow down prompts
3. Click "Copy Prompt" to copy to clipboard
4. Paste into your favorite AI image generation tool
5. Use suggested filenames for consistent organization

## 🔧 JavaScript API Reference

```javascript
// Initialize
const manager = new AIPromptsManager();
await manager.loadPrompts();

// Core Methods
manager.getAllPrompts()                    // Get complete dataset
manager.getCategory(categoryName)          // Get specific category
manager.getPrompt(category, key)           // Get individual prompt
manager.getPromptsByPage(pageName)         // Find prompts for specific page
manager.getPromptsByAspectRatio(ratio)     // Filter by aspect ratio

// Utility Methods
manager.copyPromptToClipboard(prompt)      // Copy to clipboard
manager.exportToCSV(category)              // Export as CSV
manager.downloadCSV(category, filename)    // Download CSV file

// Quick Access
manager.getWidescreenBanners()             // All widescreen prompts
manager.getSupportingImages()              // All supporting images
manager.getSquareImages()                  // All square images
manager.getVideos()                        // All video prompts
```

## 📝 Customizing Prompts

### Adding New Prompts
1. Edit `assets/data/ai-prompts.json`
2. Follow the existing structure:
```json
{
  "new_prompt": {
    "page": "Page Name",
    "prompt": "Your AI prompt text here...",
    "filename_suggestion": "suggested-filename.jpg"
  }
}
```

### Adding New Categories
1. Add to the `categories` object in the JSON file
2. Include `name`, `dimensions`, `aspect_ratio`, and `prompts`
3. Update the web interface filters if needed

## 🎯 Best Practices

### For AI Image Generation:
- Use the exact prompts as written - they're optimized for quality
- Start with 1-2 test images before batch generating
- Check your API rate limits and costs
- Organize generated images using the suggested filenames

### For Website Integration:
- Load prompts asynchronously to avoid blocking page load
- Cache the prompts data to reduce API calls
- Use the aspect ratio filters to match your layout needs

### For Prompt Management:
- Keep the JSON file properly formatted
- Test changes in the web interface before deploying
- Backup the prompts file before making major changes

## 💰 Cost Considerations

### OpenAI DALL-E 3:
- Standard: $0.040 per image (1024×1024)
- HD: $0.080 per image (1024×1024)
- Higher resolutions cost more

### Stability AI:
- Varies by model and resolution
- Generally cheaper than OpenAI
- Check current pricing at platform.stability.ai

### Tips to Reduce Costs:
- Use `--dry-run` to plan generation
- Start with `--limit` to test prompts
- Generate only needed categories with `--category`
- Review prompts in web interface before generating

## 🚨 Troubleshooting

### Common Issues:

**"API key not found" Error**
- Set environment variables correctly
- Restart terminal after setting variables
- Check API key validity on provider website

**"Failed to load prompts" in Web Interface**
- Ensure `ai-prompts.js` and `ai-prompts.json` are accessible
- Check browser console for specific errors
- Verify file paths are correct

**Python Import Errors**
- Install requirements: `pip install -r requirements.txt`
- Check Python version (3.7+ recommended)
- Use virtual environment if needed

**Generated Images Don't Match Expectations**
- AI results can vary - try generating multiple times
- Adjust prompts if needed for your specific use case
- Consider trying different AI services

## 📄 File Structure
```
Tvaraa-Organics-main/
├── assets/
│   ├── data/
│   │   └── ai-prompts.json          # Structured prompts data
│   └── js/
│       └── ai-prompts.js            # JavaScript API
├── generate_images.py               # Python batch generator
├── ai-prompts-manager.html          # Web management interface
├── requirements.txt                 # Python dependencies
├── AI-PROMPTS-README.md            # This documentation
└── (your existing website files)
```

## 🤝 Support

For questions or issues with this AI prompts system:
1. Check this README for common solutions
2. Review the browser console for JavaScript errors
3. Check the Python error logs for generation issues
4. Verify API keys and rate limits with your AI service provider

---

**Happy image generation! 🎨✨**

*This system was designed specifically for Tvaraa Organics to streamline the creation of professional, brand-consistent imagery across all website sections.*