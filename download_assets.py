#!/usr/bin/env python3
"""
Asset Downloader for Tvaraa Organics Website
Downloads high-quality images from free stock photo sources
"""

import json
import os
import requests
import time
from pathlib import Path
from PIL import Image
import io

class AssetDownloader:
    """Download and process website assets"""
    
    def __init__(self, manifest_path='assets/asset-manifest.json'):
        self.manifest_path = manifest_path
        self.manifest = None
        self.base_path = Path('.')
        self.img_path = self.base_path / 'assets' / 'img'
        self.raw_path = self.base_path / 'assets' / 'raw' / 'images'
        
        # Create directories
        self.img_path.mkdir(parents=True, exist_ok=True)
        self.raw_path.mkdir(parents=True, exist_ok=True)
        
        # Unsplash API settings (using free access)
        self.unsplash_base = "https://source.unsplash.com"
        
        # High-quality image URLs for organic cosmetics theme - using Unsplash source API
        self.curated_images = {
            'organic-manufacturing': {
                'url': 'https://source.unsplash.com/1200x800/?laboratory,manufacturing,clean',
                'keywords': 'laboratory manufacturing facility clean'
            },
            'skincare-products': {
                'url': 'https://source.unsplash.com/800x800/?skincare,cosmetic,natural,organic',
                'keywords': 'natural skincare cosmetic products jars'
            },
            'haircare-products': {
                'url': 'https://source.unsplash.com/800x800/?shampoo,haircare,natural,bottles',
                'keywords': 'natural shampoo bottles hair care'
            },
            'supplements': {
                'url': 'https://source.unsplash.com/800x800/?supplements,vitamins,pills,health',
                'keywords': 'supplements vitamins pills capsules'
            },
            'baby-care': {
                'url': 'https://source.unsplash.com/800x800/?baby,care,gentle,natural,products',
                'keywords': 'baby care products gentle natural'
            },
            'personal-care': {
                'url': 'https://source.unsplash.com/800x800/?soap,natural,organic,care',
                'keywords': 'natural soap bars organic personal care'
            },
            'aromatherapy': {
                'url': 'https://source.unsplash.com/800x800/?essential,oils,aromatherapy,bottles',
                'keywords': 'essential oils aromatherapy natural'
            },
            'manufacturing-facility': {
                'url': 'https://source.unsplash.com/1920x1080/?factory,manufacturing,modern,clean',
                'keywords': 'modern factory manufacturing facility clean'
            },
            'quality-control': {
                'url': 'https://source.unsplash.com/1200x800/?laboratory,testing,quality,science',
                'keywords': 'laboratory testing quality control'
            },
            'laboratory-research': {
                'url': 'https://source.unsplash.com/1920x1080/?laboratory,research,scientist,work',
                'keywords': 'research laboratory scientists working'
            },
            'scientific-research': {
                'url': 'https://source.unsplash.com/1200x800/?science,research,laboratory,equipment',
                'keywords': 'scientific research laboratory equipment'
            },
            'laboratory-equipment': {
                'url': 'https://source.unsplash.com/1200x800/?laboratory,equipment,scientific,instruments',
                'keywords': 'laboratory equipment scientific instruments'
            },
            'packaging-line': {
                'url': 'https://source.unsplash.com/1200x800/?packaging,production,bottles,manufacturing',
                'keywords': 'packaging production line bottles manufacturing'
            },
            'about-hero': {
                'url': 'https://source.unsplash.com/1920x1080/?herbs,botanical,natural,organic',
                'keywords': 'organic herbs botanical natural ingredients'
            },
            'client-1': {
                'url': 'https://source.unsplash.com/300x300/?professional,woman,business,portrait',
                'keywords': 'professional woman business executive'
            },
            'client-2': {
                'url': 'https://source.unsplash.com/300x300/?professional,man,business,portrait',
                'keywords': 'professional man business founder'
            },
            'client-3': {
                'url': 'https://source.unsplash.com/300x300/?professional,woman,manager,portrait',
                'keywords': 'professional woman brand manager'
            }
        }
        
    def load_manifest(self):
        """Load the asset manifest"""
        try:
            with open(self.manifest_path, 'r') as f:
                self.manifest = json.load(f)
            print(f"✅ Loaded manifest with {len(self.manifest['required_images'])} images")
        except Exception as e:
            print(f"❌ Error loading manifest: {e}")
            return False
        return True
    
    def download_image(self, url, filename, max_retries=3):
        """Download an image with retry logic"""
        for attempt in range(max_retries):
            try:
                print(f"📥 Downloading {filename} (attempt {attempt + 1})...")
                
                headers = {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
                
                response = requests.get(url, headers=headers, timeout=30)
                response.raise_for_status()
                
                # Save raw image
                raw_path = self.raw_path / f"{filename}.original"
                with open(raw_path, 'wb') as f:
                    f.write(response.content)
                
                print(f"✅ Downloaded {filename} ({len(response.content)} bytes)")
                return True
                
            except Exception as e:
                print(f"⚠️  Attempt {attempt + 1} failed for {filename}: {e}")
                if attempt < max_retries - 1:
                    time.sleep(2)
                    continue
                else:
                    print(f"❌ Failed to download {filename} after {max_retries} attempts")
                    return False
        
        return False
    
    def resize_and_optimize_image(self, image_config):
        """Resize and optimize downloaded image"""
        try:
            filename = image_config['filename'].replace('.jpg', '')
            raw_path = self.raw_path / f"{filename}.original"
            
            if not raw_path.exists():
                print(f"❌ Raw image not found: {raw_path}")
                return False
            
            # Parse target dimensions
            width, height = map(int, image_config['dimensions'].split('x'))
            
            # Open and process image
            with Image.open(raw_path) as img:
                # Convert to RGB if needed
                if img.mode != 'RGB':
                    img = img.convert('RGB')
                
                # Resize maintaining aspect ratio
                img.thumbnail((width, height), Image.LANCZOS)
                
                # Create final image with exact dimensions
                final_img = Image.new('RGB', (width, height), (255, 255, 255))
                
                # Center the image
                x = (width - img.width) // 2
                y = (height - img.height) // 2
                final_img.paste(img, (x, y))
                
                # Save optimized image
                output_path = self.img_path / image_config['filename']
                final_img.save(output_path, 'JPEG', quality=85, optimize=True)
                
                file_size = output_path.stat().st_size / 1024  # KB
                print(f"✅ Optimized {image_config['filename']} ({width}x{height}, {file_size:.1f}KB)")
                
            return True
            
        except Exception as e:
            print(f"❌ Error processing {image_config['filename']}: {e}")
            return False
    
    def create_placeholder_image(self, image_config):
        """Create a branded placeholder image"""
        try:
            from PIL import ImageDraw, ImageFont
            
            # Parse dimensions
            width, height = map(int, image_config['dimensions'].split('x'))
            
            # Create gradient background
            img = Image.new('RGB', (width, height), (255, 255, 255))
            draw = ImageDraw.Draw(img)
            
            # Create a soft green gradient
            for y in range(height):
                r = int(240 + (y / height) * 15)  # 240 to 255
                g = int(248 + (y / height) * 7)   # 248 to 255 
                b = int(235 + (y / height) * 20)  # 235 to 255
                draw.line([(0, y), (width, y)], fill=(r, g, b))
            
            # Add subtle leaf pattern
            leaf_color = (200, 230, 200, 50)  # Semi-transparent green
            for i in range(0, width, 80):
                for j in range(0, height, 80):
                    # Simple leaf shape using ellipse
                    draw.ellipse([i+10, j+10, i+30, j+50], fill=(220, 240, 220))
                    draw.ellipse([i+50, j+30, i+70, j+70], fill=(215, 235, 215))
            
            # Add text overlay
            try:
                # Try to use a nice font, fall back to default
                font_size = max(16, min(width//15, height//8))
                font = ImageFont.load_default()
            except:
                font = ImageFont.load_default()
            
            # Brand text
            brand_text = "Tvaraa Organics"
            purpose_text = image_config['purpose'].replace('-', ' ').title()
            
            # Calculate text position
            brand_bbox = draw.textbbox((0, 0), brand_text, font=font)
            purpose_bbox = draw.textbbox((0, 0), purpose_text, font=font)
            
            brand_width = brand_bbox[2] - brand_bbox[0]
            brand_height = brand_bbox[3] - brand_bbox[1]
            purpose_width = purpose_bbox[2] - purpose_bbox[0]
            purpose_height = purpose_bbox[3] - purpose_bbox[1]
            
            # Center the text
            brand_x = (width - brand_width) // 2
            brand_y = (height - brand_height - purpose_height - 20) // 2
            purpose_x = (width - purpose_width) // 2
            purpose_y = brand_y + brand_height + 10
            
            # Draw text with shadow effect
            shadow_color = (180, 200, 180)
            text_color = (80, 120, 80)
            
            # Shadow
            draw.text((brand_x + 2, brand_y + 2), brand_text, font=font, fill=shadow_color)
            draw.text((purpose_x + 2, purpose_y + 2), purpose_text, font=font, fill=shadow_color)
            
            # Main text
            draw.text((brand_x, brand_y), brand_text, font=font, fill=text_color)
            draw.text((purpose_x, purpose_y), purpose_text, font=font, fill=text_color)
            
            # Save placeholder
            output_path = self.img_path / image_config['filename']
            img.save(output_path, 'JPEG', quality=85)
            
            print(f"📄 Created branded placeholder for {image_config['filename']}")
            return True
            
        except Exception as e:
            print(f"❌ Error creating placeholder for {image_config['filename']}: {e}")
            # Fallback to simple placeholder
            try:
                width, height = map(int, image_config['dimensions'].split('x'))
                img = Image.new('RGB', (width, height), (240, 248, 235))
                output_path = self.img_path / image_config['filename']
                img.save(output_path, 'JPEG', quality=85)
                print(f"📄 Created simple placeholder for {image_config['filename']}")
                return True
            except:
                return False
    
    def download_all_images(self):
        """Download all images from the manifest"""
        if not self.load_manifest():
            return False
        
        success_count = 0
        total_images = len(self.manifest['required_images'])
        
        print(f"🚀 Starting download of {total_images} images...")
        
        for image_config in self.manifest['required_images']:
            image_id = image_config['id']
            filename = image_config['filename'].replace('.jpg', '')
            
            # Check if we have a curated URL
            if image_id in self.curated_images:
                url = self.curated_images[image_id]['url']
                
                # Download the image
                if self.download_image(url, filename):
                    # Process and optimize
                    if self.resize_and_optimize_image(image_config):
                        success_count += 1
                    else:
                        # Create placeholder if optimization fails
                        self.create_placeholder_image(image_config)
                else:
                    # Create placeholder if download fails
                    self.create_placeholder_image(image_config)
            else:
                # Create placeholder for images we don't have URLs for
                self.create_placeholder_image(image_config)
                success_count += 1
            
            # Rate limiting
            time.sleep(1)
        
        print(f"\n✅ Completed! Successfully processed {success_count}/{total_images} images")
        return True
    
    def create_image_inventory(self):
        """Create an inventory of downloaded images"""
        if not self.manifest:
            self.load_manifest()
        
        inventory = {
            "generated": time.strftime("%Y-%m-%d %H:%M:%S"),
            "total_images": len(self.manifest['required_images']),
            "images": []
        }
        
        for image_config in self.manifest['required_images']:
            image_path = self.img_path / image_config['filename']
            
            entry = {
                "id": image_config['id'],
                "filename": image_config['filename'],
                "purpose": image_config['purpose'],
                "alt_text": image_config['alt_text'],
                "pages": image_config['pages'],
                "exists": image_path.exists(),
                "file_size_kb": round(image_path.stat().st_size / 1024, 1) if image_path.exists() else 0
            }
            
            # Add source URL if available
            if image_config['id'] in self.curated_images:
                entry['source_url'] = self.curated_images[image_config['id']]['url']
                entry['source'] = "Unsplash (Free)"
            else:
                entry['source'] = "Generated Placeholder"
            
            inventory['images'].append(entry)
        
        # Save inventory
        inventory_path = self.base_path / 'assets' / 'image-inventory.json'
        with open(inventory_path, 'w') as f:
            json.dump(inventory, f, indent=2)
        
        print(f"📋 Created image inventory: {inventory_path}")

def main():
    """Main function"""
    print("🌿 Tvaraa Organics Asset Downloader")
    print("=" * 40)
    
    downloader = AssetDownloader()
    
    if downloader.download_all_images():
        downloader.create_image_inventory()
        print("\n🎉 Asset download and processing completed successfully!")
        print("📁 Images saved to: assets/img/")
        print("📄 Raw files saved to: assets/raw/images/")
        print("📋 Inventory created: assets/image-inventory.json")
    else:
        print("\n❌ Asset download failed!")

if __name__ == "__main__":
    main()