/**
 * AI Prompts Manager for Tvaraa Organics
 * Manages loading and accessing AI image/video generation prompts
 */

class AIPromptsManager {
    constructor() {
        this.prompts = null;
        this.loaded = false;
    }

    /**
     * Load prompts data from JSON file
     */
    async loadPrompts() {
        try {
            const response = await fetch('./assets/data/ai-prompts.json');
            this.prompts = await response.json();
            this.loaded = true;
            return this.prompts;
        } catch (error) {
            console.error('Error loading AI prompts:', error);
            throw error;
        }
    }

    /**
     * Get all prompts organized by category
     */
    getAllPrompts() {
        if (!this.loaded) {
            throw new Error('Prompts not loaded. Call loadPrompts() first.');
        }
        return this.prompts;
    }

    /**
     * Get prompts for a specific category
     * @param {string} category - Category name (e.g., 'widescreen_banners', 'supporting_images')
     */
    getCategory(category) {
        if (!this.loaded) {
            throw new Error('Prompts not loaded. Call loadPrompts() first.');
        }
        return this.prompts.categories[category] || null;
    }

    /**
     * Get a specific prompt by category and key
     * @param {string} category - Category name
     * @param {string} key - Prompt key
     */
    getPrompt(category, key) {
        const categoryData = this.getCategory(category);
        if (!categoryData) return null;
        
        // Handle nested subcategories
        if (categoryData.subcategories) {
            for (const subcat of Object.values(categoryData.subcategories)) {
                if (subcat.prompts && subcat.prompts[key]) {
                    return subcat.prompts[key];
                }
            }
        }
        
        return categoryData.prompts ? categoryData.prompts[key] || null : null;
    }

    /**
     * Get prompts for a specific page
     * @param {string} pageName - Name of the page (e.g., 'Home Hero', 'About Us')
     */
    getPromptsByPage(pageName) {
        if (!this.loaded) {
            throw new Error('Prompts not loaded. Call loadPrompts() first.');
        }

        const results = [];
        
        // Search through all categories
        for (const [categoryKey, categoryData] of Object.entries(this.prompts.categories)) {
            // Check direct prompts
            if (categoryData.prompts) {
                for (const [promptKey, promptData] of Object.entries(categoryData.prompts)) {
                    if (promptData.page === pageName || promptData.video === pageName) {
                        results.push({
                            category: categoryKey,
                            key: promptKey,
                            ...promptData
                        });
                    }
                }
            }
            
            // Check subcategories
            if (categoryData.subcategories) {
                for (const [subcatKey, subcatData] of Object.entries(categoryData.subcategories)) {
                    if (subcatData.prompts) {
                        for (const [promptKey, promptData] of Object.entries(subcatData.prompts)) {
                            if (promptData.page === pageName || promptData.asset === pageName) {
                                results.push({
                                    category: categoryKey,
                                    subcategory: subcatKey,
                                    key: promptKey,
                                    ...promptData
                                });
                            }
                        }
                    }
                }
            }
        }
        
        return results;
    }

    /**
     * Get all widescreen banner prompts
     */
    getWidescreenBanners() {
        return this.getCategory('widescreen_banners');
    }

    /**
     * Get all supporting image prompts
     */
    getSupportingImages() {
        return this.getCategory('supporting_images');
    }

    /**
     * Get all square image prompts
     */
    getSquareImages() {
        return this.getCategory('square_images');
    }

    /**
     * Get all video prompts
     */
    getVideos() {
        return this.getCategory('videos');
    }

    /**
     * Get prompts suitable for a specific aspect ratio
     * @param {string} aspectRatio - Aspect ratio (e.g., '16:9', '3:2', '1:1', '2:1')
     */
    getPromptsByAspectRatio(aspectRatio) {
        if (!this.loaded) {
            throw new Error('Prompts not loaded. Call loadPrompts() first.');
        }

        const results = [];
        
        for (const [categoryKey, categoryData] of Object.entries(this.prompts.categories)) {
            if (categoryData.aspect_ratio === aspectRatio) {
                // Add all prompts from this category
                if (categoryData.prompts) {
                    for (const [promptKey, promptData] of Object.entries(categoryData.prompts)) {
                        results.push({
                            category: categoryKey,
                            key: promptKey,
                            dimensions: categoryData.dimensions,
                            ...promptData
                        });
                    }
                }
                
                // Check subcategories
                if (categoryData.subcategories) {
                    for (const [subcatKey, subcatData] of Object.entries(categoryData.subcategories)) {
                        if (subcatData.aspect_ratio === aspectRatio && subcatData.prompts) {
                            for (const [promptKey, promptData] of Object.entries(subcatData.prompts)) {
                                results.push({
                                    category: categoryKey,
                                    subcategory: subcatKey,
                                    key: promptKey,
                                    dimensions: subcatData.dimensions,
                                    ...promptData
                                });
                            }
                        }
                    }
                }
            }
        }
        
        return results;
    }

    /**
     * Copy prompt to clipboard
     * @param {string} prompt - The prompt text to copy
     */
    async copyPromptToClipboard(prompt) {
        try {
            await navigator.clipboard.writeText(prompt);
            return true;
        } catch (error) {
            console.error('Failed to copy prompt to clipboard:', error);
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = prompt;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                return true;
            } catch (fallbackError) {
                console.error('Fallback copy also failed:', fallbackError);
                return false;
            } finally {
                document.body.removeChild(textArea);
            }
        }
    }

    /**
     * Export prompts as CSV for easy use with spreadsheet tools
     * @param {string} category - Optional category to export, exports all if not specified
     */
    exportToCSV(category = null) {
        if (!this.loaded) {
            throw new Error('Prompts not loaded. Call loadPrompts() first.');
        }

        const rows = [['Category', 'Subcategory', 'Key', 'Page/Asset', 'Prompt', 'Dimensions', 'Aspect Ratio', 'Filename Suggestion']];
        
        const categoriesToProcess = category ? 
            { [category]: this.prompts.categories[category] } : 
            this.prompts.categories;

        for (const [categoryKey, categoryData] of Object.entries(categoriesToProcess)) {
            // Process direct prompts
            if (categoryData.prompts) {
                for (const [promptKey, promptData] of Object.entries(categoryData.prompts)) {
                    rows.push([
                        categoryKey,
                        '',
                        promptKey,
                        promptData.page || promptData.video || promptData.asset || '',
                        promptData.prompt,
                        categoryData.dimensions || '',
                        categoryData.aspect_ratio || '',
                        promptData.filename_suggestion || ''
                    ]);
                }
            }
            
            // Process subcategories
            if (categoryData.subcategories) {
                for (const [subcatKey, subcatData] of Object.entries(categoryData.subcategories)) {
                    if (subcatData.prompts) {
                        for (const [promptKey, promptData] of Object.entries(subcatData.prompts)) {
                            rows.push([
                                categoryKey,
                                subcatKey,
                                promptKey,
                                promptData.page || promptData.video || promptData.asset || '',
                                promptData.prompt,
                                subcatData.dimensions || categoryData.dimensions || '',
                                subcatData.aspect_ratio || categoryData.aspect_ratio || '',
                                promptData.filename_suggestion || ''
                            ]);
                        }
                    }
                }
            }
        }
        
        return rows.map(row => 
            row.map(cell => `"${cell.toString().replace(/"/g, '""')}"`).join(',')
        ).join('\n');
    }

    /**
     * Download CSV file
     * @param {string} category - Optional category to export
     * @param {string} filename - Optional filename
     */
    downloadCSV(category = null, filename = null) {
        const csv = this.exportToCSV(category);
        const defaultFilename = category ? 
            `ai-prompts-${category}.csv` : 
            'ai-prompts-all.csv';
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename || defaultFilename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }
}

// Create global instance
const aiPrompts = new AIPromptsManager();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AIPromptsManager, aiPrompts };
}

// Also make available globally for direct script inclusion
if (typeof window !== 'undefined') {
    window.aiPrompts = aiPrompts;
    window.AIPromptsManager = AIPromptsManager;
}