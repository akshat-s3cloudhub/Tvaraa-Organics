import os
import re

# Define the new header HTML
NEW_HEADER = '''            <a class="navbar-brand" href="index.html">
                <img src="assets/img/Logo_Black.png" alt="Tvaraa Organics" class="navbar-logo">
            </a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ms-auto align-items-lg-center">
                    <li class="nav-item"><a class="nav-link" href="index.html">Home</a></li>
                    <li class="nav-item"><a class="nav-link" href="about.html">About</a></li>
                    <li class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle" href="#" id="servicesDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                            Services
                        </a>
                        <ul class="dropdown-menu">
                            <li><a class="dropdown-item" href="contract-manufacturing.html">Contract Manufacturing</a></li>
                            <li><a class="dropdown-item" href="private-label.html">Private Label</a></li>
                            <li><a class="dropdown-item" href="third-party-manufacturing.html">Third Party Manufacturing</a></li>
                            <li><a class="dropdown-item" href="rd-formulation.html">R&D & Formulation</a></li>
                            <li><a class="dropdown-item" href="packaging-solutions.html">Packaging Solutions</a></li>
                            <li><a class="dropdown-item" href="regulatory-services.html">Regulatory Services</a></li>
                        </ul>
                    </li>
                    <li class="nav-item"><a class="nav-link" href="products.html">Products</a></li>
                    <li class="nav-item"><a class="nav-link" href="process.html">Process</a></li>
                    <li class="nav-item"><a class="nav-link" href="certificates.html">Certificates</a></li>
                    <li class="nav-item"><a class="nav-link" href="faq.html">FAQ</a></li>
                    <li class="nav-item"><a class="nav-link" href="contact.html">Contact</a></li>
                    <li class="nav-item"><a class="nav-link btn btn-primary ms-2 px-4" href="get-a-quote.html">Get Quote</a></li>
                </ul>
            </div>'''

def update_header_in_file(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # Find the nav element and replace its content
        pattern = r'(<nav[^>]*>\s*<div class="container">\s*<a[^>]*>.*?</nav>)'
        
        if re.search(pattern, content, re.DOTALL):
            new_content = re.sub(
                pattern, 
                f'<nav class="navbar navbar-expand-lg navbar-light fixed-top tvaraa-navbar" id="mainNav">\n        <div class="container">\n{NEW_HEADER}\n        </div>\n    </nav>',
                content,
                flags=re.DOTALL
            )
            
            with open(file_path, 'w', encoding='utf-8') as file:
                file.write(new_content)
            print(f"Updated: {file_path}")
            return True
        return False
    except Exception as e:
        print(f"Error processing {file_path}: {str(e)}")
        return False

def main():
    html_files = [f for f in os.listdir('.') if f.endswith('.html')]
    updated_files = 0
    
    for file in html_files:
        if update_header_in_file(file):
            updated_files += 1
    
    print(f"\nUpdated {updated_files} out of {len(html_files)} HTML files.")

if __name__ == "__main__":
    main()
