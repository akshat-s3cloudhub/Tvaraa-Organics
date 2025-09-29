#!/usr/bin/env python3
"""
AI Image Generation Script for Tvaraa Organics
Batch processes AI prompts to generate images using various AI services
"""

import json
import os
import asyncio
import argparse
import logging
from typing import Dict, List, Optional, Any
from pathlib import Path
import aiohttp
import time

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('image_generation.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class ImageGenerationConfig:
    """Configuration for image generation services"""
    
    # Supported services - add your API keys to environment variables
    SUPPORTED_SERVICES = {
        'openai': {
            'url': 'https://api.openai.com/v1/images/generations',
            'api_key_env': 'OPENAI_API_KEY',
            'default_model': 'dall-e-3',
            'max_size': '1024x1024'
        },
        'stability': {
            'url': 'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image',
            'api_key_env': 'STABILITY_API_KEY',
            'default_model': 'stable-diffusion-xl-1024-v1-0'
        },
        'midjourney': {
            # Note: Midjourney doesn't have a direct API - this would require a third-party service
            'url': 'https://api.midjourney-proxy.com/generate',  # Example proxy service
            'api_key_env': 'MIDJOURNEY_API_KEY'
        }
    }

class AIImageGenerator:
    """Main class for generating images from AI prompts"""
    
    def __init__(self, service: str = 'openai', output_dir: str = './generated_images'):
        self.service = service.lower()
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        
        self.config = ImageGenerationConfig.SUPPORTED_SERVICES.get(self.service)
        if not self.config:
            raise ValueError(f"Unsupported service: {service}")
        
        self.api_key = os.getenv(self.config['api_key_env'])
        if not self.api_key:
            raise ValueError(f"API key not found. Set {self.config['api_key_env']} environment variable.")
        
        self.prompts_data = None
        
    async def load_prompts(self, prompts_file: str = './assets/data/ai-prompts.json'):
        """Load prompts from JSON file"""
        try:
            with open(prompts_file, 'r', encoding='utf-8') as f:
                self.prompts_data = json.load(f)
            logger.info(f"Loaded prompts from {prompts_file}")
        except Exception as e:
            logger.error(f"Error loading prompts: {e}")
            raise
    
    def get_image_size_for_aspect_ratio(self, aspect_ratio: str) -> tuple:
        """Convert aspect ratio to appropriate image dimensions"""
        size_map = {
            '16:9': (1920, 1080),   # Widescreen
            '3:2': (1200, 800),     # Supporting images
            '1:1': (1024, 1024),    # Square
            '2:1': (1024, 512)      # Client logos
        }
        return size_map.get(aspect_ratio, (1024, 1024))
    
    async def generate_openai_image(self, prompt: str, size: str = "1024x1024", quality: str = "hd") -> Dict:
        """Generate image using OpenAI DALL-E"""
        headers = {
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json'
        }
        
        payload = {
            'model': 'dall-e-3',
            'prompt': prompt,
            'n': 1,
            'size': size,
            'quality': quality,
            'response_format': 'url'
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(self.config['url'], headers=headers, json=payload) as response:
                if response.status == 200:
                    return await response.json()
                else:
                    error_text = await response.text()
                    raise Exception(f"OpenAI API error: {response.status} - {error_text}")
    
    async def generate_stability_image(self, prompt: str, width: int = 1024, height: int = 1024) -> bytes:
        """Generate image using Stability AI"""
        headers = {
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json'
        }
        
        payload = {
            'text_prompts': [{'text': prompt, 'weight': 1}],
            'width': width,
            'height': height,
            'steps': 50,
            'seed': 0,
            'cfg_scale': 7,
            'samples': 1
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(self.config['url'], headers=headers, json=payload) as response:
                if response.status == 200:
                    return await response.read()
                else:
                    error_text = await response.text()
                    raise Exception(f"Stability AI error: {response.status} - {error_text}")
    
    async def download_image(self, url: str, filename: str) -> bool:
        """Download image from URL"""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url) as response:
                    if response.status == 200:
                        content = await response.read()
                        file_path = self.output_dir / filename
                        with open(file_path, 'wb') as f:
                            f.write(content)
                        logger.info(f"Downloaded: {filename}")
                        return True
                    else:
                        logger.error(f"Failed to download {url}: {response.status}")
                        return False
        except Exception as e:
            logger.error(f"Error downloading {url}: {e}")
            return False
    
    async def generate_single_image(self, prompt_data: Dict, category_info: Dict) -> bool:
        """Generate a single image from prompt data"""
        try:
            prompt = prompt_data['prompt']
            filename = prompt_data.get('filename_suggestion', 'generated_image.jpg')
            
            # Clean filename for file system
            filename = "".join(c for c in filename if c.isalnum() or c in '.-_').rstrip()
            if not filename.lower().endswith(('.jpg', '.jpeg', '.png')):
                filename += '.jpg'
            
            logger.info(f"Generating: {filename}")
            logger.debug(f"Prompt: {prompt[:100]}...")
            
            if self.service == 'openai':
                # Determine size based on aspect ratio
                aspect_ratio = category_info.get('aspect_ratio', '1:1')
                width, height = self.get_image_size_for_aspect_ratio(aspect_ratio)
                
                # OpenAI only supports specific sizes
                if width == height:
                    size = "1024x1024"
                elif width > height:
                    size = "1792x1024"
                else:
                    size = "1024x1792"
                
                result = await self.generate_openai_image(prompt, size)
                image_url = result['data'][0]['url']
                return await self.download_image(image_url, filename)
                
            elif self.service == 'stability':
                aspect_ratio = category_info.get('aspect_ratio', '1:1')
                width, height = self.get_image_size_for_aspect_ratio(aspect_ratio)
                
                image_data = await self.generate_stability_image(prompt, width, height)
                file_path = self.output_dir / filename
                with open(file_path, 'wb') as f:
                    f.write(image_data)
                logger.info(f"Generated: {filename}")
                return True
            
            else:
                logger.warning(f"Service {self.service} not implemented yet")
                return False
                
        except Exception as e:
            logger.error(f"Error generating image for {filename}: {e}")
            return False
    
    async def generate_category_images(self, category: str, limit: Optional[int] = None):
        """Generate images for a specific category"""
        if not self.prompts_data:
            raise ValueError("Prompts not loaded. Call load_prompts() first.")
        
        category_data = self.prompts_data['categories'].get(category)
        if not category_data:
            logger.error(f"Category '{category}' not found")
            return
        
        logger.info(f"Generating images for category: {category}")
        
        # Create category-specific output directory
        category_dir = self.output_dir / category
        category_dir.mkdir(exist_ok=True)
        self.output_dir = category_dir
        
        generated_count = 0
        
        # Process direct prompts
        if category_data.get('prompts'):
            for key, prompt_data in category_data['prompts'].items():
                if limit and generated_count >= limit:
                    break
                    
                success = await self.generate_single_image(prompt_data, category_data)
                if success:
                    generated_count += 1
                
                # Rate limiting
                await asyncio.sleep(1)
        
        # Process subcategory prompts
        if category_data.get('subcategories'):
            for subcat_key, subcat_data in category_data['subcategories'].items():
                if subcat_data.get('prompts'):
                    # Create subcategory directory
                    subcat_dir = category_dir / subcat_key
                    subcat_dir.mkdir(exist_ok=True)
                    original_output_dir = self.output_dir
                    self.output_dir = subcat_dir
                    
                    for key, prompt_data in subcat_data['prompts'].items():
                        if limit and generated_count >= limit:
                            break
                            
                        success = await self.generate_single_image(prompt_data, subcat_data)
                        if success:
                            generated_count += 1
                        
                        # Rate limiting
                        await asyncio.sleep(1)
                    
                    self.output_dir = original_output_dir
        
        logger.info(f"Generated {generated_count} images for category: {category}")
    
    async def generate_all_images(self, limit_per_category: Optional[int] = None):
        """Generate images for all categories"""
        if not self.prompts_data:
            raise ValueError("Prompts not loaded. Call load_prompts() first.")
        
        for category in self.prompts_data['categories'].keys():
            if category == 'videos':  # Skip video category for image generation
                continue
                
            await self.generate_category_images(category, limit_per_category)
            logger.info(f"Completed category: {category}")
    
    def list_categories(self) -> List[str]:
        """List available categories"""
        if not self.prompts_data:
            return []
        return list(self.prompts_data['categories'].keys())
    
    def get_prompts_summary(self) -> Dict[str, int]:
        """Get summary of prompts by category"""
        if not self.prompts_data:
            return {}
        
        summary = {}
        for category, data in self.prompts_data['categories'].items():
            count = 0
            if data.get('prompts'):
                count += len(data['prompts'])
            if data.get('subcategories'):
                for subcat in data['subcategories'].values():
                    if subcat.get('prompts'):
                        count += len(subcat['prompts'])
            summary[category] = count
        
        return summary

async def main():
    """Main function"""
    parser = argparse.ArgumentParser(description='Generate AI images from Tvaraa Organics prompts')
    parser.add_argument('--service', choices=['openai', 'stability'], default='openai',
                       help='AI service to use for image generation')
    parser.add_argument('--category', type=str, help='Specific category to generate (optional)')
    parser.add_argument('--output-dir', type=str, default='./generated_images',
                       help='Output directory for generated images')
    parser.add_argument('--limit', type=int, help='Limit number of images per category')
    parser.add_argument('--prompts-file', type=str, default='./assets/data/ai-prompts.json',
                       help='Path to prompts JSON file')
    parser.add_argument('--list-categories', action='store_true',
                       help='List available categories and exit')
    parser.add_argument('--dry-run', action='store_true',
                       help='Show what would be generated without actually generating')
    
    args = parser.parse_args()
    
    try:
        generator = AIImageGenerator(service=args.service, output_dir=args.output_dir)
        await generator.load_prompts(args.prompts_file)
        
        if args.list_categories:
            categories = generator.list_categories()
            summary = generator.get_prompts_summary()
            print("Available categories:")
            for cat in categories:
                print(f"  {cat}: {summary.get(cat, 0)} prompts")
            return
        
        if args.dry_run:
            summary = generator.get_prompts_summary()
            print("Dry run - would generate:")
            for cat, count in summary.items():
                if cat != 'videos':
                    limit_text = f" (limited to {args.limit})" if args.limit else ""
                    print(f"  {cat}: {min(count, args.limit) if args.limit else count} images{limit_text}")
            return
        
        if args.category:
            await generator.generate_category_images(args.category, args.limit)
        else:
            await generator.generate_all_images(args.limit)
            
        print("Image generation completed!")
        
    except Exception as e:
        logger.error(f"Error: {e}")
        return 1

if __name__ == '__main__':
    asyncio.run(main())