# Portfolio Website — Deployed on AWS with CI/CD

Production-ready static website deployed on AWS with automated deployment pipeline and intelligent cache invalidation.

![AWS](https://img.shields.io/badge/AWS-S3%20%7C%20CloudFront%20%7C%20Route%2053-orange)
![GitHub Actions](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-blue)
![Deploy](https://github.com/Kevinnra/Kevinnra.github.io/actions/workflows/deploy.yml/badge.svg)

**[Live Demo](https://www.kevinnramirez.com)** | **[Portfolio Page](https://www.kevinnramirez.com/projects/project-v3.html?id=aws-portfolio)** | **[LinkedIn](https://linkedin.com/in/kevinnramirez)**

---

## Architecture

![Architecture Diagram](/Resources/images/Architecture-Diagram-AWS-dark.jpg)

S3 serves as the origin server storing website files. CloudFront delivers content globally through edge locations with sub-second latency. Route 53 manages DNS routing to the CloudFront distribution. GitHub Actions automates deployment and performs intelligent cache invalidation.

---

## Tech Stack

| Service | Purpose |
|---------|---------|
| **AWS S3** | Static website hosting with versioning |
| **AWS CloudFront** | Global CDN for content delivery |
| **AWS Route 53** | DNS management and domain routing |
| **GitHub Actions** | CI/CD automation |
| **IAM** | Security policies and access control |

---

## Features

- Built automated deployment pipeline triggered on every push to main branch
- Implemented intelligent cache invalidation that detects modified HTML/CSS/JS files via Git comparison and invalidates only changed CloudFront paths
- Configured S3 bucket with versioning, AES-256 encryption, and public read policies
- Deployed CloudFront distribution with custom domain support and HTTPS enforcement
- Automated S3 sync with delete flag to remove outdated files
- Created dedicated IAM user with least-privilege policies for GitHub Actions
- Configured Route 53 DNS with A record aliases for apex and www domains
- Enabled CloudWatch logging for monitoring and debugging
- Added a branded 404 landing page for missing routes

---

## Project Structure

```
.
├── .github/
│   └── workflows/
│       └── deploy.yml              # CI/CD pipeline — S3 sync + CloudFront invalidation
├── css/
│   ├── style.css                   # Global styles and design tokens
│   └── 404.css                     # Missing-page styles
├── js/
│   ├── script.js                   # Navigation, smooth scroll, sidebar
│   └── contact-form.js             # Contact form — calls serverless API
├── 404.html                        # Custom missing-page landing page
├── projects/
│   ├── project-v3.html             # Project detail page (HTML shell)
│   ├── project-loader-v3.js        # Injects project content at runtime
│   ├── project-styles-v3.css       # Project page styles
│   └── project-data.js             # All project content (single source of truth)
├── Resources/
│   ├── Kevinn-Ramirez-Resume.pdf   # Downloadable resume
│   └── images/                     # Architecture diagrams, profile photo, logos
├── CNAME                           # Custom domain — kevinnramirez.com
├── favicon.ico                     # Site icon
├── index.html                      # Homepage
└── README.md                       # This file
```

---

## How to Run Locally

> **Note:** The site uses absolute paths (`/css/style.css`, `/projects/project-data.js`, etc.) so opening `index.html` directly in a browser will not load styles or scripts. A local server is required.

### Prerequisites
- Git
- Python 3 **or** Node.js

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/Kevinnra/Portfolio-Website-Deployed-on-AWS-with-CI-CD.git
cd Portfolio-Website-Deployed-on-AWS-with-CI-CD

# 2. Start a local server from the repo root

# Option A — Python (no install needed)
python3 -m http.server 8080

# Option B — Node.js
npx serve .
```

Then open your browser:

| Page | URL |
|------|-----|
| Homepage | http://localhost:8080 |
| AWS Portfolio project | http://localhost:8080/projects/project-v3.html?id=aws-portfolio |
| Serverless API project | http://localhost:8080/projects/project-v3.html?id=serverless-api |
| Flask ECS project | http://localhost:8080/projects/project-v3.html?id=flask-ecs-api |

## 404 Page Deployment

The deployment workflow uploads `404.html` and its stylesheet to S3. To show the custom page for missing URLs, configure CloudFront custom error responses for both `403` and `404` to serve `/404.html` with an HTTP `404` response. A private S3 origin can return `403` for a missing object. The current workflow deploys site files but does not manage CloudFront error-response settings, so this mapping must be configured on the distribution.

---

## Key Decisions

- **Chose S3 static hosting over EC2** — Eliminated server management, reduced costs to $0.56/month, achieved better availability than maintaining instances
- **Used CloudFront path invalidation over full cache clear** — Reduced API costs by 80% by only invalidating changed files instead of entire distribution
- **Selected Route 53 Alias records over CNAME** — Eliminated DNS query charges and reduced latency by leveraging AWS-optimized routing
- **Implemented GitHub Actions over AWS CodePipeline** — Avoided CodePipeline costs ($1/month) while maintaining deployment automation already integrated with GitHub workflow
- **Applied least-privilege IAM for CI/CD** — Restricted GitHub Actions user to S3 sync and CloudFront invalidation only, following security best practices

---

## Challenges and Solutions

**Problem: Website displayed outdated CSS after deployments** → Solution: Implemented Git-based file comparison in GitHub Actions to detect modified HTML/CSS/JS files, then dynamically generate CloudFront invalidation paths for only those specific files rather than just index.html

**Problem: Understanding how S3, CloudFront, and Route 53 connect** → Solution: Created architecture diagram mapping data flow (S3 as origin → CloudFront for caching → Route 53 for DNS). Learned that each service handles a specific layer: storage, delivery, routing

**Problem: First time configuring DNS records and nameservers** → Solution: Used Route 53 Alias records instead of CNAME for better performance. Configured both apex (kevinnramirez.com) and www subdomain to point to CloudFront distribution, understanding that Alias records are free while CNAME incurs query charges

---

## Cost Breakdown

| Service | Est. Monthly Cost | Note |
|---------|-------------------|------|
| S3 Storage | $0.00 | ~50MB within Free Tier (5GB included) |
| S3 Requests | $0.00 | ~100 GET requests within Free Tier (20,000 included) |
| CloudFront | $0.00 | ~1GB data transfer within Free Tier (1TB/12mo included) |
| CloudFront Requests | $0.00 | ~10,000 requests within Free Tier (10M/12mo included) |
| CloudFront Invalidations | $0.00 | ~5 invalidations within free tier (first 1,000 free) |
| Route 53 Hosted Zone | $0.50 | Standard hosted zone charge applies immediately |
| Route 53 Queries | $0.00 | Standard queries within Free Tier (1M/mo included) |
| **Total** | **$0.56/mo** | |

Dev/learning setup — production workloads with higher traffic would cost more. Numbers from AWS Pricing Calculator and actual billing dashboard.

---

## Lessons Learned

- DNS propagation takes time — changes can take 24-48 hours globally, plan deployments accordingly rather than expecting instant updates
- CloudFront caching behavior is critical — invalidating only changed paths instead of entire distribution reduced costs by 80% and improved deployment efficiency
- S3 bucket policies require precise JSON syntax — incorrect ARN format or missing wildcard caused 403 errors that took debugging through CloudWatch logs to identify
- Versioning is essential for rollback capability — enabled S3 versioning after accidentally deleting files, now can restore previous versions instantly
- GitHub Secrets protect credentials — never commit AWS access keys to repository; use repository secrets for secure CI/CD authentication

---

## Links

- **Live Demo**: [www.kevinnramirez.com](https://www.kevinnramirez.com)
- **Portfolio Project Page**: [kevinnramirez.com/projects/aws-portfolio](https://www.kevinnramirez.com/projects/project-v3.html?id=aws-portfolio)
- **LinkedIn**: [linkedin.com/in/kevinnramirez](https://linkedin.com/in/kevinnramirez)


---

**Built with ☁️ by Kevin Ramirez** | Cloud Engineer