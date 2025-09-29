# Tvaraa Organics - Website Assets Documentation

## Overview
This document provides complete information about all visual assets used in the Tvaraa Organics website, including their sources, licensing, and usage guidelines.

## Asset Structure
```
assets/
├── img/                           # Final optimized images
│   ├── about-hero.jpg            # Hero background (1920x1080)
│   ├── aromatherapy.jpg          # Product category (800x800)
│   ├── baby-care.jpg             # Product category (800x800)
│   ├── client-1.jpg              # Testimonial photo (300x300)
│   ├── client-2.jpg              # Testimonial photo (300x300)
│   ├── client-3.jpg              # Testimonial photo (300x300)
│   ├── haircare-products.jpg     # Product category (800x800)
│   ├── laboratory-equipment.jpg  # R&D section (1200x800)
│   ├── laboratory-research.jpg   # R&D hero (1920x1080)
│   ├── manufacturing-facility.jpg # Manufacturing hero (1920x1080)
│   ├── organic-manufacturing.jpg # Introduction section (1200x800)
│   ├── packaging-line.jpg        # Packaging section (1200x800)
│   ├── personal-care.jpg         # Product category (800x800)
│   ├── quality-control.jpg       # Quality section (1200x800)
│   ├── scientific-research.jpg   # R&D content (1200x800)
│   ├── skincare-products.jpg     # Product category (800x800)
│   └── supplements.jpg           # Product category (800x800)
├── video/                        # Video assets (future)
├── raw/                          # Original downloaded files
│   ├── images/                   # Raw image files
│   └── videos/                   # Raw video files (future)
├── data/                         # Data files
│   └── ai-prompts.json          # AI generation prompts
└── js/                          # JavaScript files
    └── ai-prompts.js            # Prompts management
```

## Image Inventory

### Hero & Banner Images (1920x1080, 16:9)
| Image | Purpose | Source | License | Used On |
|-------|---------|--------|---------|---------|
| `about-hero.jpg` | Hero backgrounds | Generated Placeholder | Proprietary | about.html, faq.html, get-a-quote.html, process.html |
| `manufacturing-facility.jpg` | Manufacturing hero | Generated Placeholder | Proprietary | contract-manufacturing.html, services.html |
| `laboratory-research.jpg` | R&D hero background | Generated Placeholder | Proprietary | rd-formulation.html |

### Content Images (1200x800, 3:2)
| Image | Purpose | Source | License | Used On |
|-------|---------|--------|---------|---------|
| `organic-manufacturing.jpg` | Introduction section | Generated Placeholder | Proprietary | index.html, contact.html |
| `quality-control.jpg` | Quality control section | Generated Placeholder | Proprietary | contract-manufacturing.html |
| `scientific-research.jpg` | R&D content | Generated Placeholder | Proprietary | rd-formulation.html |
| `laboratory-equipment.jpg` | Lab equipment showcase | Generated Placeholder | Proprietary | rd-formulation.html |
| `packaging-line.jpg` | Packaging section | Generated Placeholder | Proprietary | third-party-manufacturing.html |

### Product Category Images (800x800, 1:1)
| Image | Purpose | Source | License | Used On |
|-------|---------|--------|---------|---------|
| `skincare-products.jpg` | Skincare category | Unsplash (Free) | Free to use | index.html, private-label.html, products.html |
| `haircare-products.jpg` | Haircare category | Generated Placeholder | Proprietary | index.html |
| `supplements.jpg` | Supplements category | Unsplash (Free) | Free to use | index.html |
| `baby-care.jpg` | Baby care category | Unsplash (Free) | Free to use | index.html |
| `personal-care.jpg` | Personal care category | Generated Placeholder | Proprietary | index.html, private-label.html |
| `aromatherapy.jpg` | Aromatherapy category | Unsplash (Free) | Free to use | index.html |

### Client Photos (300x300, 1:1)
| Image | Purpose | Source | License | Used On |
|-------|---------|--------|---------|---------|
| `client-1.jpg` | Sarah Johnson testimonial | Generated Placeholder | Proprietary | index.html, private-label.html |
| `client-2.jpg` | Michael Chen testimonial | Unsplash (Free) | Free to use | index.html, private-label.html |
| `client-3.jpg` | Emma Rodriguez testimonial | Unsplash (Free) | Free to use | index.html, private-label.html |

## Source Attribution

### Unsplash Images (Free License)
The following images were sourced from Unsplash under their free license:
- `skincare-products.jpg` - Natural skincare products
- `supplements.jpg` - Health supplements and vitamins
- `baby-care.jpg` - Baby care products
- `aromatherapy.jpg` - Essential oils and aromatherapy
- `client-2.jpg` - Professional portrait
- `client-3.jpg` - Professional portrait

**License:** Unsplash License (free to use for commercial and personal projects)
**Attribution:** While not required, we acknowledge Unsplash photographers

### Generated Placeholders (Proprietary)
The following images were generated as branded placeholders:
- All hero background images
- Content section images
- Some product category images
- Some client photos

**Features:**
- Branded with "Tvaraa Organics" text
- Professional green color scheme
- Appropriate dimensions for each use case
- Optimized for web performance

## Usage Guidelines

### Image Optimization
All images have been optimized for web usage:
- **Hero images (1920x1080):** <300KB each
- **Content images (1200x800):** <150KB each  
- **Product images (800x800):** <50KB each
- **Client photos (300x300):** <10KB each

### Responsive Usage
Images are used with appropriate responsive techniques:
- CSS `background-size: cover` for hero sections
- `img-fluid` class for content images
- Proper alt text for accessibility

### File Naming Convention
Images follow a consistent naming pattern:
- `{section}-{description}-{purpose}.jpg`
- All lowercase with hyphens
- Descriptive and meaningful names

## Replacement Guidelines

### Updating Images
When replacing placeholder images with professional photos:
1. Maintain the exact same filename
2. Keep the same dimensions
3. Optimize for web (JPG quality 85%)
4. Update this documentation

### AI Generation
For generating new images using AI tools:
1. Use the prompts in `assets/data/ai-prompts.json`
2. Maintain brand consistency (green/natural theme)
3. Follow the dimension requirements
4. Run the `download_assets.py` script for batch generation

### Stock Photo Usage
When using stock photos:
1. Ensure proper licensing
2. Document source and license in this file
3. Consider branded alternatives for consistency
4. Optimize for web performance

## Performance Considerations

### Loading Strategy
- Hero images: Loaded immediately (above fold)
- Content images: Lazy loading implemented
- Product images: Progressive loading

### Browser Support
- Modern image formats supported
- Fallback to JPG for older browsers
- Responsive srcset attributes where beneficial

## Maintenance

### Regular Tasks
- [ ] Monitor image file sizes (quarterly)
- [ ] Update placeholder images with professional photos
- [ ] Verify all external links work
- [ ] Check mobile performance

### Asset Updates
- Version all major asset changes
- Keep backup of replaced images
- Update this documentation with changes
- Test across all pages after updates

## Contact & Support
For questions about website assets:
- Technical: Check `download_assets.py` for automation
- Design: Use AI prompts in `assets/data/ai-prompts.json`
- Updates: Follow the replacement guidelines above

---
**Last Updated:** 2025-09-29  
**Version:** 1.0  
**Maintained by:** Tvaraa Organics Development Team