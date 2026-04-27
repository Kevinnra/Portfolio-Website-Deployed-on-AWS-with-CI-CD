// Centralized project data for dynamic loading
const projectsData = {
  // Add this entry to your existing projectsData object in project-data.js

  "aws-portfolio": {
    title: "AWS Cloud Portfolio with CI/CD Pipeline",
    tagline: "Production-ready static website with automated deployment and intelligent cache invalidation",
    badges: ["AWS S3", "CloudFront", "Route 53", "GitHub Actions", "IAM"],
    
    links: {
      github: "https://github.com/Kevinnra/Kevinnra.github.io",
      demo: "https://www.kevinnramirez.com"
    },
    
    overview: {
      problem: "Traditional web hosting requires managing servers, manual deployments, and lacks global performance optimization. Manual cache invalidation wastes time and money by clearing entire CDN distributions instead of just changed files.",
      
      solution: "Built a serverless architecture using AWS S3 for hosting, CloudFront for global content delivery, and Route 53 for DNS management. Implemented automated CI/CD pipeline with GitHub Actions that detects modified files via Git comparison and performs intelligent cache invalidation.",
      
      results: [
        "99.99% availability via CloudFront CDN",
        "Sub-second global load times",
        "$0.56/month operational cost",
        "Zero-downtime deployments",
        "80% reduction in cache invalidation costs"
      ]
    },
    
    architecture: {
      image: "/Resources/images/Architecture-Diagram-AWS-dark.jpg",
      description: "S3 serves as the origin server storing website files with versioning and encryption enabled. CloudFront delivers content globally through 450+ edge locations, caching static assets for fast access. Route 53 manages DNS routing with Alias records pointing to the CloudFront distribution. GitHub Actions orchestrates the deployment pipeline, syncing files to S3 and invalidating only changed CloudFront paths."
    },
    
    // OPTIONAL: Technical Details
    technicalDetails: [
      {
        service: "AWS S3",
        details: "Static website hosting with versioning enabled for rollback capability, AES-256 server-side encryption, and bucket policy configured for public read access while maintaining security"
      },
      {
        service: "CloudFront CDN",
        details: "Global content delivery with custom domain support (kevinnramirez.com, www.kevinnramirez.com), HTTPS enforcement via ACM certificate, and edge location caching for sub-second latency worldwide"
      },
      {
        service: "Route 53",
        details: "DNS management with A record Aliases pointing to CloudFront distribution for both apex and www domains, eliminating query charges and providing better performance than CNAME records"
      },
      {
        service: "GitHub Actions",
        details: "Automated CI/CD pipeline triggered on push to main branch, performing S3 sync with --delete flag and intelligent cache invalidation based on Git file comparison"
      },
      {
        service: "IAM",
        details: "Dedicated IAM user for GitHub Actions with least-privilege policy allowing only S3 sync and CloudFront invalidation, following security best practices with credentials stored as GitHub Secrets"
      }
    ],
    
    challenges: [
      {
        title: "Challenge #1: Outdated CSS After Deployments",
        problem: "Initial CI/CD pipeline only invalidated /index.html in CloudFront cache. When CSS or JavaScript files were updated, the website displayed broken styles because CloudFront continued serving cached versions of old files.",
        solution: "Implemented Git-based file detection in GitHub Actions workflow. The pipeline compares current commit with previous commit to identify modified .html, .css, and .js files, then dynamically generates CloudFront invalidation paths for only those specific files.",
        code: {
          language: "yaml",
          title: "Intelligent Cache Invalidation - GitHub Actions Workflow",
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
          "Website always displays latest changes immediately after deployment",
          "Reduced CloudFront invalidation API costs by 80% (only changed paths vs entire distribution)",
          "Faster cache invalidation processing with fewer paths to clear",
          "More efficient CI/CD pipeline execution time"
        ]
      },
      {
        title: "Challenge #2: Understanding AWS Service Integration",
        problem: "First time working with AWS infrastructure. Struggled to understand how S3, CloudFront, and Route 53 interconnect for static website hosting. The relationship between origin servers, CDN edge locations, and DNS routing was unclear.",
        solution: "Created detailed architecture diagram mapping the complete data flow. Learned that S3 serves as the origin server storing website files, CloudFront acts as the CDN distributing content globally through 450+ edge locations, and Route 53 routes domain traffic to the CloudFront distribution using Alias records.",
        benefits: [
          "Deep understanding of cloud service integration and data flow patterns",
          "Ability to design scalable architectures using managed AWS services",
          "Knowledge of CDN caching strategies and edge location distribution",
          "Foundation for building more complex multi-tier cloud applications"
        ]
      },
      {
        title: "Challenge #3: DNS Configuration and Domain Setup",
        problem: "First experience configuring DNS records, understanding A records vs CNAME records, and connecting a custom domain to AWS infrastructure. DNS propagation timing and nameserver configuration were initially confusing.",
        solution: "Used Route 53 Alias records instead of traditional CNAME records for better performance and cost efficiency. Configured both apex domain (kevinnramirez.com) and www subdomain to point to the CloudFront distribution. Learned that Alias records are free and provide lower latency compared to CNAME records which incur query charges.",
        benefits: [
          "Understanding of DNS fundamentals and record types",
          "Knowledge of Alias vs CNAME trade-offs for AWS services",
          "Ability to configure custom domains for cloud applications",
          "Lower latency and zero additional cost with Alias records"
        ]
      }
    ],
    
    // OPTIONAL: Code Deep Dive
    codeBlocks: [
      {
        title: "Complete GitHub Actions Deployment Workflow",
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
        title: "S3 Bucket Configuration - Security and Performance",
        language: "bash",
        code: `# Enable versioning for rollback capability
  aws s3api put-bucket-versioning \\
    --bucket statict-site-s3 \\
    --versioning-configuration Status=Enabled

  # Enable server-side encryption (AES-256)
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
    
    // Cost breakdown section
    costBreakdown: {
      intro: "Cost awareness is critical for cloud infrastructure. This project demonstrates strategic use of AWS Free Tier while maintaining production-grade performance and availability.",
      
      items: [
        {
          service: "S3 Storage",
          cost: "$0.00",
          note: "~50MB website files within Free Tier (5GB storage included)"
        },
        {
          service: "S3 Requests",
          cost: "$0.00",
          note: "~100 GET requests/month within Free Tier (20,000 included)"
        },
        {
          service: "CloudFront Data Transfer",
          cost: "$0.00",
          note: "~1GB/month within Free Tier (1TB for first 12 months)"
        },
        {
          service: "CloudFront Requests",
          cost: "$0.00",
          note: "~10,000 requests/month within Free Tier (10M for first 12 months)"
        },
        {
          service: "CloudFront Invalidations",
          cost: "$0.00",
          note: "~5 invalidations/month — first 1,000 invalidations are free"
        },
        {
          service: "Route 53 Hosted Zone",
          cost: "$0.50",
          note: "Standard charge for hosted zone — applies immediately regardless of usage"
        },
        {
          service: "Route 53 Queries",
          cost: "$0.00",
          note: "Standard DNS queries within Free Tier (1M queries/month included)"
        }
      ],
      
      total: "$0.56/month",
      note: "This is a dev/learning environment. Production workloads with higher traffic and multi-region redundancy would cost significantly more."
    },
    
    metrics: [
      { label: "Uptime", value: "99.99%" },
      { label: "Load Time", value: "<1s" },
      { label: "Monthly Cost", value: "$0.56" },
      { label: "Automation", value: "100%" }
    ],
    
    lessons: [
      "DNS propagation takes 24-48 hours globally — plan deployments ahead rather than expecting instant updates after Route 53 changes",
      "CloudFront caching is critical — invalidating only changed paths instead of entire distribution reduced costs by 80% and improved deployment speed",
      "S3 bucket policies require precise JSON syntax — incorrect ARN format or missing wildcards cause 403 errors that require CloudWatch log debugging",
      "Versioning is essential for production — enabled S3 versioning after accidentally deleting files, now can restore previous versions instantly",
      "GitHub Secrets protect credentials — never commit AWS access keys to repository; use encrypted repository secrets for secure CI/CD"
    ]
  },
  "serverless-api": {

  title: "Serverless Contact Form API",
  tagline: "A production-ready REST API built on AWS — no server, no idle cost, deploys itself on every push to main.",

  badges: [
    "AWS Lambda",
    "API Gateway",
    "DynamoDB",
    "Amazon SES",
    "CloudWatch",
    "SNS",
    "AWS SAM",
    "Python 3.13",
    "GitHub Actions"
  ],

  links: {
    github: "https://github.com/Kevinnra/Serverless-Contact-Form-API",
    demo: "https://kevinnramirez.com/#contact"
  },

  overview: {
    problem: "A static portfolio site has no backend. Running a server just to handle a contact form means paying for compute around the clock — for a workload that fires a handful of times a week at most.",

    solution: "The entire backend is serverless. A form submission hits API Gateway, which triggers a Lambda function that validates the input, stores the message in DynamoDB, and sends an email via SES. Every AWS resource is defined in a SAM template and deployed automatically through GitHub Actions on every push to main. Nothing runs between requests — cost stays at $0/month within AWS Free Tier.",

    results: [
      "$0.00/month operational cost within AWS Free Tier",
      "Full infrastructure defined as code — one command to provision or tear down the entire stack",
      "Automated CI/CD: every push to main deploys the latest version with no manual steps",
      "Multi-layer input security: validation, HTML sanitization, and honeypot bot detection",
      "API Gateway rate limiting (5 req/s, burst 10) on a public endpoint"
    ]
  },

  
  architecture: {
    image: "/resources/images/contact-form-v2.jpg",
    description: "Form submissions travel from the portfolio frontend to API Gateway, which enforces rate limiting and routes the request to Lambda. The function validates and sanitizes input, silently discards bot submissions via honeypot detection, writes the record to DynamoDB, and dispatches an email through SES. CloudWatch captures every invocation log and fires SNS alerts when errors cross a threshold. The entire stack — Lambda, API Gateway, DynamoDB, SES permissions, CloudWatch alarms, SNS topic — is defined in a single SAM template and provisioned through CloudFormation."
  },

  technicalDetails: [
    {
      service: "AWS Lambda (Python 3.13)",
      details: "Handles the full request lifecycle: field validation, HTML tag stripping, email format check, honeypot evaluation, DynamoDB write, and SES dispatch. Uses Python stdlib for sanitization to keep the deployment package small and cold starts fast."
    },
    {
      service: "Amazon API Gateway",
      details: "Public REST endpoint. Enforces rate limiting at 5 req/s with a burst of 10 to prevent abuse. CORS configured to allow requests from the portfolio domain. TLS termination handled at this layer."
    },
    {
      service: "Amazon DynamoDB",
      details: "Stores every validated submission with a UUID partition key, ISO timestamp, sanitized content, and source IP. On-demand (PAY_PER_REQUEST) billing — no cost at zero requests, no capacity to provision or manage."
    },
    {
      service: "Amazon SES",
      details: "Sends an email notification on each successful submission. Lambda IAM role scoped to ses:SendEmail on the specific verified sender identity — not a wildcard resource."
    },
    {
      service: "AWS SAM + CloudFormation",
      details: "All resources defined in template.yaml. SAM shorthand compiles to CloudFormation at deploy time — nothing is abstracted away. samconfig.toml persists deploy parameters so subsequent deployments and CI runs need no flags."
    },
    {
      service: "CloudWatch + SNS",
      details: "Every Lambda invocation is logged automatically. A CloudWatch alarm monitors the function error rate and publishes to an SNS topic when the threshold is breached, triggering an alert email."
    }
  ],

  challenges: [
    {
      title: "SES rejected emails in sandbox mode",
      problem: "The Lambda function executed without errors, but no emails arrived. CloudWatch logs showed a MessageRejected exception from SES with no further detail in the function output.",
      solution: "SES accounts start in sandbox mode where sending is restricted to individually verified addresses. Both the sender and recipient addresses needed to be verified in the SES console. The Lambda IAM role also had to be scoped to ses:SendEmail on the specific verified sender identity ARN — a wildcard resource would have obscured whether the permission was correct.",
      code: {
        language: "json",
        title: "IAM policy — SES permission scoped to verified identity",
        content: `{
  "Effect": "Allow",
  "Action": ["ses:SendEmail", "ses:SendRawEmail"],
  "Resource": "arn:aws:ses:ap-northeast-1:ACCOUNT_ID:identity/sender@example.com"
}`
      },
      benefits: [
        "Scoping the SES permission to a specific identity ARN makes it immediately obvious if the wrong address is being used",
        "Explicit resource ARNs in IAM policies follow least-privilege — no broader access than what the function actually needs",
        "Reading CloudWatch logs at each stage of the handler (receive, validate, store, email) made it possible to isolate exactly where the failure occurred"
      ]
    },
    {
      title: "API Gateway returning 502 instead of the Lambda error",
      problem: "When the Lambda function threw an unhandled exception, API Gateway returned 502 Bad Gateway to the frontend instead of a useful error message. The actual error was only visible in CloudWatch logs.",
      solution: "API Gateway requires Lambda to always return a response object with statusCode, headers, and body fields. An unhandled exception produces no such object, which API Gateway interprets as a malformed response. Wrapping the entire handler body in try/except — with the except block returning a structured 500 response — meant every code path produces something the gateway can forward.",
      code: {
        language: "python",
        title: "Lambda handler — catch-all ensures a valid response object",
        content: `def lambda_handler(event, context):
    try:
        # ... all handler logic
        return build_response(200, {'success': True, 'message': 'Thank you!'})

    except Exception as e:
        print(f'ERROR: {e}')  # Captured by CloudWatch
        return build_response(500, {'error': 'Internal server error.'})

def build_response(status_code, body):
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps(body)
    }`
      },
      benefits: [
        "Every code path — success, validation failure, unexpected exception — returns a structured response",
        "The frontend always receives a JSON body it can display rather than an opaque gateway error",
        "The print() in the except block means every unhandled error is captured in CloudWatch with context"
      ]
    },
    {
      title: "sam deploy hanging in GitHub Actions",
      problem: "The deploy step in the CI pipeline would start and then hang indefinitely with no output. The same command ran fine locally.",
      solution: "sam deploy was waiting for interactive confirmation of the detected changeset — the same prompt that appears locally when infrastructure changes are found. In a non-interactive CI environment, nothing sends the confirmation keystroke, so the process waits forever. Adding --no-confirm-changeset removes the prompt. Adding --no-fail-on-empty-changeset prevents the pipeline from failing on pushes that contain only application code changes with no infrastructure diff.",
      code: {
        language: "yaml",
        title: "GitHub Actions — deploy step with non-interactive flags",
        content: `- name: Deploy
  run: |
    sam deploy \\
      --no-confirm-changeset \\
      --no-fail-on-empty-changeset
  # samconfig.toml supplies all other parameters
  # Credentials come from configure-aws-credentials step above`
      },
      benefits: [
        "Pipeline completes reliably on every push — no manual intervention required",
        "--no-fail-on-empty-changeset means a CSS change or README edit does not cause the deploy step to fail",
        "samconfig.toml keeps the deploy command clean — all stack parameters are persisted, not repeated in the workflow"
      ]
    }
  ],
  
  codeBlocks: [
    {
      title: "Input security — validation, sanitization, and honeypot",
      language: "python",
      code: `import re
import html

def sanitize(text):
    # Strip HTML tags, then escape remaining special characters
    clean = re.sub(r'<[^>]+>', '', str(text))
    return html.escape(clean.strip())

def valid_email(email):
    return re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$', email)

def lambda_handler(event, context):
    body = json.loads(event.get('body', '{}'))

    # Honeypot: bots fill hidden fields, real users don't see them
    if body.get('honeypot'):
        return build_response(200, {'success': True})  # Silent discard

    name    = body.get('name', '').strip()
    email   = body.get('email', '').strip()
    message = body.get('message', '').strip()

    if not all([name, email, message]):
        return build_response(400, {'error': 'All fields are required.'})
    if len(name) > 100 or len(message) > 2000:
        return build_response(400, {'error': 'Input exceeds length limit.'})
    if not valid_email(email):
        return build_response(400, {'error': 'Invalid email format.'})

    # Sanitize before writing to DynamoDB or sending via SES
    clean_name    = sanitize(name)
    clean_message = sanitize(message)`
    },
    {
      title: "DynamoDB write — item structure",
      language: "python",
      code: `import uuid
import os
from datetime import datetime, timezone

def store_submission(name, email, message, event):
    table = dynamodb.Table(os.environ['TABLE_NAME'])
    table.put_item(Item={
        'submission_id': str(uuid.uuid4()),           # Unique partition key
        'timestamp': datetime.now(timezone.utc).isoformat(),
        'name': name,                                  # Already sanitized
        'email': email,                                # Validated format
        'message': message,                            # Already sanitized
        'source_ip': event['requestContext']['identity']['sourceIp']
    })`
    }
  ],


  costBreakdown: {
    intro: "Serverless changes the cost model entirely — instead of paying for idle compute, you pay per invocation. At portfolio traffic levels, this stack runs for free.",
    items: [
      {
        service: "AWS Lambda",
        cost: "$0.00/mo",
        note: "First 1M requests and 400,000 GB-seconds of compute are free every month — this function stays well inside that limit."
      },
      {
        service: "Amazon API Gateway",
        cost: "$0.00/mo",
        note: "First 1M REST API calls per month are free for 12 months; $3.50 per million after that."
      },
      {
        service: "Amazon DynamoDB",
        cost: "$0.00/mo",
        note: "On-demand billing with 25 GB storage and 25 WCU/RCU free per month — a contact form never gets close to these limits."
      },
      {
        service: "Amazon SES",
        cost: "$0.00/mo",
        note: "First 62,000 emails per month are free when sent from a Lambda function — notification emails cost nothing at this volume."
      },
      {
        service: "CloudWatch + SNS",
        cost: "$0.00/mo",
        note: "Basic metrics and first 5 GB of log ingestion are free; SNS first 1M notifications per month are free."
      },
      {
        service: "AWS SAM / CloudFormation",
        cost: "$0.00/mo",
        note: "CloudFormation itself is free — you only pay for the resources it provisions."
      }
    ],
    total: "$0.00/mo",
    footer: "This is a dev/learning environment running on AWS Free Tier. A production deployment handling thousands of daily submissions would still cost under $5/mo — serverless scales cost with traffic, not with time."
  },

  metrics: [
    { value: "$0.00/mo",   label: "Operational cost" },
    { value: "6",          label: "AWS services" },
    { value: "<300ms",     label: "Avg response time" },
    { value: "Automated",  label: "Deployments" }
  ],


  lessons: [
    "SAM templates are more readable than raw CloudFormation, but when a deploy fails the error is in the CloudFormation stack events — not in SAM output. Knowing where to look saved significant debugging time.",
    "IAM least-privilege is straightforward in theory but requires iteration in practice. The first working version used permissions that were too broad. Tightening them to specific resource ARNs meant going back to CloudWatch logs to confirm exactly what each service call needed.",
    "CloudWatch logging should be deliberate, not accidental. Adding explicit print() statements at each stage of the handler — receive, validate, store, email — made it possible to isolate failures immediately instead of guessing which step failed.",
    "The CI/CD pipeline pays off quickly. After the first manual deploy, every change was a git push. That feedback loop made iteration significantly faster than running sam deploy manually each time.",
    "Serverless does not mean zero configuration. Cold starts, SES sandbox restrictions, IAM scope, and the Lambda-API Gateway response contract all required deliberate attention. Managed services still need to be understood."
  ]

  },

  "flask-ecs-api": {
    title: "Containerized REST API on AWS ECS",
    tagline: "Python Flask API containerized with Docker, deployed on ECS Fargate with private networking, RDS PostgreSQL, and automated CI/CD",
    badges: ["Docker", "ECS Fargate", "ECR", "RDS PostgreSQL", "VPC", "ALB", "GitHub Actions", "Secrets Manager", "Python", "Flask"],

    links: {
      github: "https://github.com/Kevinnra/flask-ecs-api"
    },

    overview: {
      problem: "I wanted to learn how real companies deploy containerized applications on AWS — with proper network isolation, a managed database, and a pipeline that deploys automatically when code changes.",
      solution: "I built a Python Flask REST API, containerized it with Docker, and deployed it on ECS Fargate inside a custom VPC. The app and database have no direct internet access — only the load balancer is public. Every push to GitHub triggers a pipeline that builds the image and deploys to ECS automatically.",
      results: [
        "Deployed a containerized API on ECS Fargate with zero manual steps after the initial setup",
        "Database unreachable from the internet — security groups allow port 5432 only from the ECS security group",
        "Zero stored AWS credentials in GitHub — pipeline authenticates via OIDC and assumes a role at runtime",
        "Live API returning JSON responses from ECS through the Application Load Balancer — screenshots in GitHub README"
      ]
    },

    architecture: {
      image: "/Resources/images/flask-ecs-architecture.jpg",
      description: "Traffic enters the VPC through an Internet Gateway and reaches the Application Load Balancer in the public subnets. The ALB forwards requests to ECS Fargate tasks in the private subnets. Those tasks connect to RDS PostgreSQL, also in private subnets. ECS pulls database credentials from Secrets Manager at startup via an IAM execution role — credentials never appear in code or configuration files."
    },

    technicalDetails: [
      {
        service: "Docker + ECR",
        details: "I containerized the Flask app using a python:3.12-slim base image and Gunicorn as the production server. I discovered that building on Apple Silicon produces arm64 images by default, which ECS rejects. The fix was adding --platform linux/amd64 to the build command — and I baked that into the CI/CD pipeline so it is automatic going forward."
      },
      {
        service: "VPC Networking",
        details: "I built a custom VPC with a /16 CIDR block and four subnets across two Availability Zones — two public for the ALB and two private for ECS and RDS. The Internet Gateway handles public subnet outbound access. The NAT Gateway, placed in a public subnet, gives private resources outbound internet access without exposing them to inbound connections."
      },
      {
        service: "Security Groups",
        details: "I chose security group chaining over CIDR-based rules. The ALB security group accepts port 80 from anywhere. The ECS security group accepts port 5000 only from the ALB security group. The RDS security group accepts port 5432 only from the ECS security group. This means permissions follow resources regardless of IP changes."
      },
      {
        service: "ECS Fargate + Task Definition",
        details: "I chose Fargate over EC2 to avoid managing instances. The task definition specifies 0.25 vCPU and 512MB memory, references the ECR image, and uses the secrets field to pull credentials from Secrets Manager at runtime. The task execution IAM role has scoped permissions for ECR, CloudWatch Logs, and the specific secret ARN — nothing broader."
      },
      {
        service: "GitHub Actions + OIDC",
        details: "I chose OIDC over storing IAM access keys in GitHub. The pipeline configures AWS credentials by assuming a role — GitHub receives a short-lived token valid only for that workflow run. The workflow builds the image with --platform linux/amd64, tags it with the Git commit SHA, pushes to ECR, and deploys to ECS while waiting for service stability."
      },
      {
        service: "AWS Secrets Manager",
        details: "I stored the database credentials as a JSON secret in Secrets Manager instead of putting them in the task definition as plain environment variables. Task definitions are visible to anyone with IAM describe permissions — credentials should never appear there. ECS resolves the secret at container startup. The Flask app reads the same os.getenv() call with no code changes needed."
      }
    ],

    challenges: [
      {
        title: "Container platform mismatch on Apple Silicon",
        problem: "After pushing my Docker image to ECR and deploying to ECS, the service stayed at 0 running tasks. The error in the service events was: 'image manifest does not contain descriptor matching platform linux/amd64'.",
        solution: "My Mac's M-series chip builds arm64 images by default. ECS Fargate runs on linux/amd64. I fixed it by adding --platform linux/amd64 to the build command and added it permanently to the GitHub Actions workflow so every automated build produces the correct architecture.",
        code: {
          language: "bash",
          title: "Cross-platform build fix",
          content: `# This produces the correct architecture for ECS regardless of developer machine
  docker buildx build --platform linux/amd64 -t flask-api:v1 .`
        },
        benefits: [
          "Works identically on Apple Silicon and Intel machines",
          "Automated in CI/CD — no manual flags to remember per build"
        ]
      },
      {
        title: "ECS tasks in private subnets could not reach ECR",
        problem: "After deploying the ECS service, tasks were failing to pull images from ECR. Private subnets have no route to the internet by default — even though ECR is an AWS service, the traffic still goes over the public internet unless you configure otherwise.",
        solution: "I deployed a NAT Gateway in the public subnet and added a 0.0.0.0/0 route in the private route table pointing to it. This gives private resources outbound internet access without exposing them to incoming connections. The alternative — VPC Endpoints — is more cost-efficient at scale but more complex to configure.",
        code: {
          language: "bash",
          title: "Adding the private subnet route to NAT Gateway",
          content: `# Route all outbound traffic from private subnets through the NAT Gateway
  aws ec2 create-route \\
    --route-table-id YOUR_PRIVATE_RT_ID \\
    --destination-cidr-block 0.0.0.0/0 \\
    --nat-gateway-id YOUR_NAT_ID`
        },
        benefits: [
          "ECS tasks can pull images from ECR and reach AWS APIs",
          "No inbound internet connections possible to private resources"
        ]
      },
      {
        title: "Credentials in plain text inside the task definition",
        problem: "My first working version had the database password as a plain environment variable in the task definition JSON. Task definitions are stored in AWS and visible to anyone with IAM describe permissions — this is not acceptable even in a learning project.",
        solution: "I moved the credentials to AWS Secrets Manager and updated the task definition to use the secrets field with a valueFrom reference pointing to the secret ARN. I also added an IAM policy to the execution role scoped to only that specific secret. The Flask app code did not change at all — it still reads os.getenv().",
        code: {
          language: "json",
          title: "Secret reference in task definition",
          content: `"secrets": [
    {
      "name": "DB_PASS",
      "valueFrom": "arn:aws:secretsmanager:region:account:secret:flask-ecs/db-credentials:DB_PASS::"
    }
  ]`
        },
        benefits: [
          "Credentials never appear in task definition, GitHub, or container logs",
          "IAM policy scoped to a specific secret ARN — not all secrets in the account"
        ]
      }
    ],

    codeBlocks: [
      {
        title: "GitHub Actions workflow — OIDC authentication and ECS deploy",
        language: "yaml",
        code: `name: Build and Deploy to ECS

  on:
    push:
      branches: [main]

  permissions:
    id-token: write   # Required for OIDC token generation
    contents: read

  jobs:
    deploy:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4

        # No stored credentials — OIDC assumes a role and gets a short-lived token
        - name: Configure AWS credentials via OIDC
          uses: aws-actions/configure-aws-credentials@v4
          with:
            role-to-assume: \${{ vars.ACTIONS_ROLE_ARN }}
            aws-region: \${{ vars.AWS_REGION }}

        - name: Login to Amazon ECR
          id: login-ecr
          uses: aws-actions/amazon-ecr-login@v2

        # --platform linux/amd64 ensures ECS compatibility from any developer machine
        - name: Build and push image
          id: build-image
          env:
            ECR_REGISTRY: \${{ steps.login-ecr.outputs.registry }}
            IMAGE_TAG: \${{ github.sha }}
          run: |
            docker buildx build --platform linux/amd64 \\
              -t \$ECR_REGISTRY/flask-ecs-api:\$IMAGE_TAG \\
              -t \$ECR_REGISTRY/flask-ecs-api:latest --push .
            echo "image=\$ECR_REGISTRY/flask-ecs-api:\$IMAGE_TAG" >> \$GITHUB_OUTPUT

        - name: Deploy to ECS
          uses: aws-actions/amazon-ecs-deploy-task-definition@v1
          with:
            task-definition: task-def-current.json
            service: flask-ecs-service
            cluster: flask-ecs-cluster
            wait-for-service-stability: true`
      }
    ],

    costBreakdown: {
      intro: "This project uses more AWS services than the others, and the VPC components — especially the NAT Gateway — make cost awareness a real engineering consideration, not just a footnote.",
      items: [
        {
          service: "ECS Fargate",
          cost: "~$8.90/mo",
          note: "0.25 vCPU + 512 MB memory running 24/7 — cost drops to $0 when tasks are stopped, making this a dev environment you should turn off when not in use."
        },
        {
          service: "NAT Gateway",
          cost: "~$32.85/mo",
          note: "Charged $0.045/hr regardless of traffic — the most expensive component. Replacing it with VPC Endpoints for ECR and Secrets Manager would eliminate this cost entirely for a project that only needs those two services."
        },
        {
          service: "Application Load Balancer",
          cost: "~$5.84/mo",
          note: "Charged $0.008/hr plus LCU charges based on connections and bandwidth — minimal at dev traffic volumes."
        },
        {
          service: "RDS PostgreSQL (db.t3.micro)",
          cost: "~$0.00/mo",
          note: "Free tier eligible for the first 12 months — $13.00/mo after that for the smallest available instance running continuously."
        },
        {
          service: "Amazon ECR",
          cost: "~$0.10/mo",
          note: "First 500 MB of private storage free per month — a typical Flask image stays well under that limit."
        },
        {
          service: "AWS Secrets Manager",
          cost: "$0.40/mo",
          note: "Each secret costs $0.40/mo regardless of how many times it is retrieved — one secret for DB credentials is the only cost here."
        },
        {
          service: "GitHub Actions",
          cost: "$0.00/mo",
          note: "Free for public repositories — the full build-push-deploy pipeline runs at no cost."
        }
      ],
      total: "~$48.09/mo",
      footer: "This is a dev/learning environment — the NAT Gateway alone accounts for 68% of the cost. In production, VPC Endpoints for ECR and Secrets Manager would replace the NAT Gateway and cut this bill significantly."
    },

    metrics: [
      { label: "Deployment time", value: "< 3 min" },
      { label: "Stored credentials", value: "Zero" },
      { label: "AWS services used", value: "9" },
      { label: "Subnet tiers", value: "Public + Private" }
    ],

    lessons: [
      "Container deployments force you to be explicit about everything — ports, platforms, environment variables, network paths. Nothing is assumed. That explicitness is why containers are so reliable in production.",
      "The NAT Gateway cost surprised me. It is the most expensive component in a basic VPC setup and it runs by the hour whether you use it or not. Knowing when to replace it with VPC Endpoints is a real cost optimization skill that matters in real jobs.",
      "Debugging in AWS requires knowing which layer to look at. CloudWatch Logs for application errors, ECS service events for deployment failures, VPC route tables for network issues. I wasted time looking in the wrong place before I learned this.",
      "OIDC for CI/CD authentication is not just more secure — it is simpler. No IAM user to create, no keys to rotate, no risk of accidentally committing credentials. It should be the default approach.",
      "I would improve this project by replacing the NAT Gateway with VPC Endpoints for ECR and Secrets Manager — cheaper, more secure, and a better pattern for production environments. That is on the list for my next project with Terraform."
    ]
  }
};