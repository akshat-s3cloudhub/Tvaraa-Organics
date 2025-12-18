# Header update script for Tvaraa Organics
$header = @"
            <a class="navbar-brand" href="index.html">
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
            </div>
"@

$header = $header -replace "`r`n","`n" -replace "`n","`r`n"

$htmlFiles = Get-ChildItem -Path . -Filter "*.html" -Recurse
$updatedCount = 0

foreach ($file in $htmlFiles) {
    try {
        $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
        
        # Replace the nav section while preserving the nav tag and container
        $newContent = $content -replace '(?s)<nav[^>]*>.*?<div class="container">.*?</nav>', 
            ('<nav class="navbar navbar-expand-lg navbar-light fixed-top tvaraa-navbar" id="mainNav">' + 
             '<div class="container">' + $header + '</div></nav>')
        
        if ($newContent -ne $content) {
            $newContent | Set-Content -Path $file.FullName -NoNewline -Encoding UTF8
            $updatedCount++
            Write-Host "Updated: $($file.FullName)"
        }
    }
    catch {
        Write-Host "Error processing $($file.FullName): $_"
    }
}

Write-Host "`nUpdate complete. $updatedCount files were updated."
