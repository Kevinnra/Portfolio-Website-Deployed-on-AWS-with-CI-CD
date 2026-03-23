// Centralized project data for dynamic loading
const projectsData = {
  "aws-portfolio": {
    title: "Personal Portfolio Hosting on AWS",
    tagline: "Production-ready static website with automated CI/CD pipeline",
    badges: ["AWS S3", "CloudFront", "Route 53", "GitHub Actions", "IAM"],
    
    links: {
      github: "https://github.com/Kevinnra/Kevinnra.github.io",
      demo: "https://www.kevinnramirez.com"
    },
    
    overview: {
      problem: "Traditional web hosting lacks scalability, global performance optimization, and automated deployment workflows. Manual updates are error-prone and time-consuming, while conventional hosting providers offer limited control over infrastructure.",
      
      solution: "Implemented a serverless, globally distributed architecture using AWS services with full infrastructure automation through GitHub Actions. The solution achieves enterprise-grade performance at minimal cost while maintaining complete control over the deployment pipeline.",
      
      results: [
        "99.99% availability via CloudFront CDN",
        "Sub-second global load times",
        "$0.56/month operational cost",
        "Zero-downtime deployments",
        "100% deployment automation"
      ]
    },
    
    architecture: {
      image: "/Resources/images/Architecture-Diagram-AWS-dark.jpg",
      description: "The architecture follows a serverless pattern where S3 serves as the origin server, CloudFront handles global content delivery through edge locations, and Route 53 manages DNS routing. GitHub Actions orchestrates the entire deployment process, implementing intelligent cache invalidation to ensure content freshness while minimizing API costs."
    },
    
    // Optional: Technical Details
    technicalDetails: [
      {
        service: "AWS S3",
        details: "Static website hosting with versioning enabled, AES-256 encryption, and optimized bucket policies for public read access"
      },
      {
        service: "CloudFront CDN",
        details: "Global content delivery with custom domain support, HTTPS enforcement, and intelligent caching strategies"
      },
      {
        service: "Route 53",
        details: "DNS management with A record aliases pointing to CloudFront distribution for both apex and www domains"
      },
      {
        service: "GitHub Actions",
        details: "Automated CI/CD pipeline with file change detection and selective cache invalidation"
      },
      {
        service: "IAM Security",
        details: "Dedicated users with least-privilege policies for development and CI/CD operations"
      }
    ],
    
    // Optional: Key Features
    // features: [
    //   {
    //     title: "Intelligent Cache Invalidation",
    //     description: "Pipeline automatically detects modified HTML, CSS, and JavaScript files using Git comparison, then invalidates only those specific CloudFront paths. This reduces API costs by 80% while ensuring users always see the latest content."
    //   },
    //   {
    //     title: "Zero-Downtime Deployments",
    //     description: "S3 versioning combined with CloudFront's edge caching ensures continuous availability during updates. The deployment process includes automated health checks and rollback capabilities."
    //   },
    //   {
    //     title: "Security Best Practices",
    //     description: "Implementation includes dedicated IAM users with minimal permissions, S3 server-side encryption, GitHub Secrets for credential management, and no hardcoded secrets in source code."
    //   }
    // ],
    
    challenges: [
      {
        title: "Challenge #1: Broken Website After CSS Updates",
        problem: "Initial CI/CD pipeline only invalidated index.html in CloudFront cache. When CSS or JavaScript files were updated, the website displayed outdated styles due to cached content, breaking the visual appearance and functionality.",
        solution: "Implemented Git-based file change detection that compares current commit with previous commit to identify modified files. The pipeline dynamically generates CloudFront invalidation paths for only the changed HTML, CSS, and JS files.",
        code: {
          language: "yaml",
          title: "Intelligent Cache Invalidation - GitHub Actions",
          content: `- name: Check if important files were modified
  id: check_files
  run: |
    echo "Checking which files were modified..."
    CHANGED_FILES=$(git diff --name-only \${{ github.event.before }} \${{ github.sha }} | grep -E '\\.(html|css|js)$' || true)
    
    if [ -n "$CHANGED_FILES" ]; then
      echo "Changed files:"
      echo "$CHANGED_FILES"
      
      # Convert file list to CloudFront paths format
      PATHS=$(echo "$CHANGED_FILES" | sed 's|^|/|' | tr '\\n' ' ')
      echo "paths=$PATHS" >> $GITHUB_OUTPUT
      echo "has_changes=true" >> $GITHUB_OUTPUT
    else
      echo "No HTML, CSS, or JS files changed"
      echo "has_changes=false" >> $GITHUB_OUTPUT
    fi

- name: Invalidate CloudFront cache
  if: steps.check_files.outputs.has_changes == 'true'
  run: |
    echo "Invalidating CloudFront for changed files..."
    aws cloudfront create-invalidation \\
      --distribution-id \${{ secrets.CLOUDFRONT_DIST_ID }} \\
      --paths \${{ steps.check_files.outputs.paths }}`
        },
        benefits: [
          "Website always reflects latest changes immediately",
          "Reduced CloudFront invalidation costs by 80%",
          "Faster cache invalidation processing",
          "More efficient pipeline execution"
        ]
      },
      {
        title: "Challenge #2: Understanding AWS Service Integration",
        problem: "Initially struggled to understand how S3, CloudFront, and Route 53 interconnect for static website hosting. The relationship between origin servers, CDN edge locations, and DNS routing was unclear.",
        solution: "Created detailed architecture diagrams and documented the complete data flow. Learned that S3 serves as the origin server storing website files, CloudFront acts as the CDN distributing content globally through edge locations, and Route 53 routes domain traffic to the CloudFront distribution.",
        benefits: [
          "Deep understanding of cloud service integration",
          "Ability to design scalable architectures",
          "Knowledge of CDN and caching strategies",
          "Foundation for future cloud projects"
        ]
      },
      {
        title: "Challenge #3: DNS Configuration with Custom Domain",
        problem: "First experience configuring DNS records, understanding A records vs CNAME records, and connecting a custom domain to AWS infrastructure. The DNS propagation process and nameserver configuration were initially confusing.",
        solution: "Used AWS Route 53 Alias records instead of traditional CNAME records for better performance and no additional cost. Configured both apex domain (kevinnramirez.com) and www subdomain to point to the CloudFront distribution.",
        benefits: [
          "Understanding of DNS fundamentals",
          "Knowledge of Alias vs CNAME trade-offs",
          "Ability to configure custom domains",
          "Lower latency with Alias records"
        ]
      }
    ],
    
    // Optional: Code Deep Dive
    codeBlocks: [
      {
        title: "Complete GitHub Actions Workflow",
        language: "yaml",
        code: `name: Deploy to S3
on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout source
        uses: actions/checkout@v3
        with:
          fetch-depth: 2  # Need at least 2 commits to compare
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: \${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: \${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ap-northeast-1
      
      - name: Sync files to S3
        run: |
          aws s3 sync . s3://statict-site-s3 --delete
      
      - name: Check if important files were modified
        id: check_files
        run: |
          CHANGED_FILES=$(git diff --name-only \${{ github.event.before }} \${{ github.sha }} | grep -E '\\.(html|css|js)$' || true)
          
          if [ -n "$CHANGED_FILES" ]; then
            PATHS=$(echo "$CHANGED_FILES" | sed 's|^|/|' | tr '\\n' ' ')
            echo "paths=$PATHS" >> $GITHUB_OUTPUT
            echo "has_changes=true" >> $GITHUB_OUTPUT
          fi
      
      - name: Invalidate CloudFront cache
        if: steps.check_files.outputs.has_changes == 'true'
        run: |
          aws cloudfront create-invalidation \\
            --distribution-id \${{ secrets.CLOUDFRONT_DIST_ID }} \\
            --paths \${{ steps.check_files.outputs.paths }}`
      },
      {
        title: "S3 Bucket Configuration",
        language: "bash",
        code: `# Enable versioning for rollback capability
aws s3api put-bucket-versioning \\
  --bucket statict-site-s3 \\
  --versioning-configuration Status=Enabled

# Enable server-side encryption
aws s3api put-bucket-encryption \\
  --bucket statict-site-s3 \\
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'

# Configure static website hosting
aws s3 website s3://statict-site-s3/ \\
  --index-document index.html

# Apply bucket policy for public read access
aws s3api put-bucket-policy \\
  --bucket statict-site-s3 \\
  --policy '{
    "Version": "2012-10-17",
    "Statement": [{
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::statict-site-s3/*"
    }]
  }'`
      }
    ],
    
    metrics: [
      { label: "Uptime", value: "99.99%" },
      { label: "Load Time", value: "<1s" },
      { label: "Monthly Cost", value: "$0.56" },
      { label: "Automation", value: "100%" }
    ],
    
    lessons: [
      "Cloud services work as building blocks - understanding each service's role is crucial for proper architecture design",
      "Cache invalidation is critical in CDN architectures - granular invalidation improves both performance and cost-efficiency",
      "Security best practices matter from day one - implementing least-privilege IAM policies and proper secrets management prevents future vulnerabilities",
      "Infrastructure automation reduces human error - CI/CD pipelines ensure consistent, repeatable deployments",
      "Cost optimization requires intentional design - leveraging AWS Free Tier and optimizing API calls keeps operational costs minimal"
    ]
  },

  "serverless-api": {
    title: "Serverless Contact Form API",
    tagline: "Production-ready REST API built with AWS Lambda, DynamoDB, and SES — deployed automatically via GitHub Actions and AWS SAM",
    badges: ["AWS Lambda", "API Gateway", "DynamoDB", "Amazon SES", "CloudWatch", "SNS", "AWS SAM", "Python", "CI/CD"],

    links: {
      github: "https://github.com/Kevinnra/Serverless-Contact-Form-API",
      demo: "https://www.kevinnramirez.com/#contact"
    },

    overview: {
      problem: "Static portfolio websites need a backend to receive visitor messages — but running a dedicated server 24/7 for a simple contact form is wasteful, expensive, and over-engineered. Traditional hosting solutions introduce maintenance overhead and ongoing costs for minimal traffic.",

      solution: "Built a fully serverless REST API on AWS that costs effectively $0/month within the free tier, scales automatically to any traffic level, and deploys itself on every Git push. No servers to manage, no runtime to maintain, no manual deployments — the infrastructure defines itself through AWS SAM templates.",

      results: [
        "$0.00/month operational cost within AWS Free Tier",
        "< 300ms average API response time globally",
        "100% automated deployments via GitHub Actions + AWS SAM",
        "Zero infrastructure management — fully event-driven architecture",
        "Security hardened: input sanitization, rate limiting, and honeypot bot detection"
      ]
    },

    architecture: {
      image: "/Resources/images/contact-form-v2.jpg",
      description: "Contact form submissions are sent from the portfolio site to API Gateway, where rate limiting is applied before invoking Lambda. The Python handler validates and sanitizes input, silently filters bot traffic through a honeypot check, stores valid messages in DynamoDB, and triggers SES email notifications. CloudWatch records execution logs and SNS raises alerts when error thresholds are exceeded. All infrastructure is declared in a SAM template and automatically deployed through GitHub Actions on every push to main."
    },

    technicalDetails: [
      {
      service: "AWS Lambda (Python 3.13)",
      details: "Serverless handler orchestrates the entire workflow: validating input, sanitizing HTML content, implementing honeypot bot detection, writing to DynamoDB, and sending email notifications. Dependencies are kept lean to minimize cold start delays."
      },
      {
      service: "Amazon API Gateway",
      details: "REST endpoint with rate throttling capped at 5 requests/second (with bursts up to 10) to deter abuse. CORS setup restricts requests to the portfolio domain exclusively."
      },
      {
        service: "Amazon DynamoDB",
        details: "NoSQL table stores every validated form submission with timestamp, sanitized content, and request metadata. On-demand capacity mode — pay only for actual requests, never over-provisioned."
      },
      {
        service: "Amazon SES",
        details: "Sends formatted email notifications to the portfolio owner on each successful submission. Configured with verified sender and recipient addresses; documented production SES graduation process."
      },
      {
        service: "AWS SAM + CloudFormation",
        details: "All infrastructure defined as code in template.yaml. SAM transforms higher-level shorthand into CloudFormation resources, making serverless IaC dramatically more concise than raw CloudFormation."
      },
      {
        service: "CloudWatch + SNS",
        details: "Automatic log capture for every Lambda invocation. Custom alarms detect error rate spikes and publish alerts to SNS, which delivers notifications via email."
      }
    ],

    challenges: [
      {
        title: "Challenge #1: Infrastructure as Code with AWS SAM",
        problem: "First experience with Infrastructure as Code for serverless resources. Understanding how SAM transforms into CloudFormation, managing parameters, and wiring together Lambda, API Gateway, DynamoDB, SES, and CloudWatch in a single template was a significant learning curve.",
        solution: "Used sam deploy --guided for initial setup, which generates a samconfig.toml file that saves all configuration for subsequent deployments. Studied the SAM resource transformation documentation to understand how SAM shorthand maps to underlying CloudFormation. This became the conceptual foundation for later Terraform work.",
        code: {
          language: "yaml",
          title: "SAM Template — Core Resources (template.yaml)",
          content: `AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31

Parameters:
  SenderEmail:
    Type: String
  RecipientEmail:
    Type: String
  Environment:
    Type: String
    Default: prod

Globals:
  Function:
    Timeout: 10
    Runtime: python3.13

Resources:
  ContactFormFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: contact_form/
      Handler: app.lambda_handler
      Environment:
        Variables:
          TABLE_NAME: !Ref SubmissionsTable
          SENDER_EMAIL: !Ref SenderEmail
          RECIPIENT_EMAIL: !Ref RecipientEmail
      Policies:
        - DynamoDBWritePolicy:
            TableName: !Ref SubmissionsTable
        - SESCrudPolicy:
            IdentityName: !Ref SenderEmail
      Events:
        ContactForm:
          Type: Api
          Properties:
            Path: /contact
            Method: post
            RestApiId: !Ref ContactApi

  ContactApi:
    Type: AWS::Serverless::Api
    Properties:
      StageName: !Ref Environment
      ThrottlingRateLimit: 5
      ThrottlingBurstLimit: 10

  SubmissionsTable:
    Type: AWS::DynamoDB::Table
    Properties:
      BillingMode: PAY_PER_REQUEST
      AttributeDefinitions:
        - AttributeName: submission_id
          AttributeType: S
      KeySchema:
        - AttributeName: submission_id
          KeyType: HASH`
        },
        benefits: [
          "Entire infrastructure versioned in Git alongside application code",
          "Reproducible deployments — destroy and recreate the stack in minutes",
          "Built conceptual bridge to Terraform for future projects",
          "samconfig.toml eliminates parameter re-entry on every deploy"
        ]
      },
      {
        title: "Challenge #2: Input Security — Validation, Sanitization & Bot Detection",
        problem: "A public API endpoint with no authentication is a target for spam bots, script injection attempts, and malicious payloads. Needed to protect DynamoDB from junk data and prevent XSS content from being stored or forwarded via SES.",
        solution: "Implemented a multi-layer security approach in the Lambda handler: strict input validation (required fields, length limits, email format regex), HTML tag stripping and character escaping before any storage or email operations, and a honeypot field technique where bots that fill a hidden form field receive a fake 200 response while nothing is stored or processed.",
        code: {
          language: "python",
          title: "Lambda Handler — Security Layer (app.py)",
          content: `import json
import re
import html
import boto3
from datetime import datetime, timezone

dynamodb = boto3.resource('dynamodb')
ses = boto3.client('ses')

def sanitize_input(text):
    """Strip HTML tags and escape special characters."""
    clean = re.sub(r'<[^>]+>', '', str(text))
    return html.escape(clean.strip())

def validate_email(email):
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def lambda_handler(event, context):
    body = json.loads(event.get('body', '{}'))

    # Honeypot check — bots fill hidden fields, humans don't
    if body.get('honeypot'):
        return {'statusCode': 200,
                'body': json.dumps({'success': True, 'message': 'Message received.'})}

    name = body.get('name', '').strip()
    email = body.get('email', '').strip()
    message = body.get('message', '').strip()

    # Validation
    if not all([name, email, message]):
        return {'statusCode': 400, 'body': json.dumps({'error': 'All fields required.'})}
    if len(name) > 100 or len(message) > 2000:
        return {'statusCode': 400, 'body': json.dumps({'error': 'Input too long.'})}
    if not validate_email(email):
        return {'statusCode': 400, 'body': json.dumps({'error': 'Invalid email format.'})}

    # Sanitize before storage
    clean_name = sanitize_input(name)
    clean_message = sanitize_input(message)

    # Store in DynamoDB, send SES email...`
        },
        benefits: [
          "XSS payloads neutralized before storage or email forwarding",
          "Spam bots silently discarded — no storage, no email, no error that reveals detection",
          "Rate limiting at API Gateway layer provides first line of defense",
          "Defense-in-depth: multiple independent security layers"
        ]
      },
      {
        title: "Challenge #3: Automated CI/CD for SAM Deployments",
        problem: "Manually running sam build and sam deploy after every code change was tedious and error-prone. Needed a way to automatically deploy updates when pushing to GitHub, using the same credential security practices as the AWS portfolio project.",
        solution: "Extended the GitHub Actions pattern from Project 1 to handle SAM deployments. The workflow configures AWS credentials from secrets, runs sam build to package the Lambda function, then sam deploy using the saved samconfig.toml configuration. Deploys are fully automated on push to main.",
        code: {
          language: "yaml",
          title: "GitHub Actions — SAM Deploy Workflow (.github/workflows/deploy.yml)",
          content: `name: Deploy Serverless API

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.13'

      - name: Install AWS SAM CLI
        run: pip install aws-sam-cli

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: \${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: \${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ap-northeast-1

      - name: Build SAM application
        run: sam build

      - name: Deploy to AWS
        run: sam deploy --no-confirm-changeset --no-fail-on-empty-changeset`
        },
        benefits: [
          "Zero manual deployment steps after initial setup",
          "Every Git push to main triggers a validated, reproducible deployment",
          "AWS credentials stored as GitHub Secrets — never in source code",
          "samconfig.toml stores all deploy parameters — no flags needed in CI"
        ]
      }
    ],

//     codeBlocks: [
//       {
//         title: "DynamoDB Item Structure",
//         language: "python",
//         code: `# Item stored in DynamoDB for each valid submission
// item = {
//     'submission_id': str(uuid.uuid4()),      # Unique partition key
//     'timestamp': datetime.now(timezone.utc).isoformat(),
//     'name': clean_name,                       # HTML-sanitized
//     'email': email,                           # Validated format
//     'message': clean_message,                 # HTML-sanitized, max 2000 chars
//     'source_ip': event['requestContext']['identity']['sourceIp'],
//     'user_agent': event['headers'].get('User-Agent', 'unknown')
// }`
//       },
//       {
//         title: "IAM Least-Privilege Execution Role",
//         language: "json",
//         code: `{
//   "Version": "2012-10-17",
//   "Statement": [
//     {
//       "Effect": "Allow",
//       "Action": ["dynamodb:PutItem"],
//       "Resource": "arn:aws:dynamodb:ap-northeast-1:*:table/contact-submissions-*"
//     },
//     {
//       "Effect": "Allow",
//       "Action": ["ses:SendEmail", "ses:SendRawEmail"],
//       "Resource": "arn:aws:ses:ap-northeast-1:*:identity/your-email@example.com"
//     },
//     {
//       "Effect": "Allow",
//       "Action": ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"],
//       "Resource": "arn:aws:logs:*:*:*"
//     }
//   ]
// }`
//       }
//     ],

    metrics: [
      { label: "Monthly Cost", value: "$0.00" },
      { label: "Avg Response", value: "<300ms" },
      { label: "Automation", value: "100%" },
      { label: "AWS Services", value: "6" }
    ],

    lessons: [
      "Serverless architecture patterns — event-driven design, stateless functions, and managed services",
      "AWS SAM and CloudFormation — Infrastructure as Code for serverless resources",
      "API Gateway configuration — REST APIs, throttling, CORS, and stage variables",
      "DynamoDB data modeling — NoSQL design, on-demand capacity, and item structure",
      "IAM least-privilege — scoping Lambda execution roles to the minimum required permissions",
      "CI/CD with GitHub Actions — automated SAM deployments triggered on push",
      "Security fundamentals — input validation, sanitization, rate limiting, and bot detection"
    ]
  },

  // Template for future projects
  "project-template": {
    title: "Project Title Here",
    tagline: "Brief description of the project",
    badges: ["Tech1", "Tech2", "Tech3"],
    
    links: {
      github: "https://github.com/username/repo",
      demo: "https://demo-url.com" // optional
    },
    
    overview: {
      problem: "What problem does this solve?",
      solution: "How did you solve it?",
      results: [
        "Result 1",
        "Result 2",
        "Result 3"
      ]
    },
    
    architecture: {
      image: "/Resources/images/project-architecture.png",
      description: "Explanation of the architecture"
    },
    
    // Optional sections - only include if you have content
    technicalDetails: [
      {
        service: "Technology Name",
        details: "Details about how it's used"
      }
    ],
    
    features: [
      {
        title: "Feature Name",
        description: "Feature description"
      }
    ],
    
    challenges: [
      {
        title: "Challenge Title",
        problem: "What was the problem?",
        solution: "How did you solve it?",
        code: {
          language: "yaml", // or "bash", "python", "javascript"
          title: "Code Title",
          content: `your code here`
        },
        benefits: [
          "Benefit 1",
          "Benefit 2"
        ]
      }
    ],
    
    codeBlocks: [
      {
        title: "Code Block Title",
        language: "python",
        code: `# Your code here`
      }
    ],
    
    metrics: [
      { label: "Metric 1", value: "Value 1" },
      { label: "Metric 2", value: "Value 2" }
    ],
    
    lessons: [
      "Lesson learned 1",
      "Lesson learned 2"
    ]
  }
};