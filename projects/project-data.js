// Centralized project data for dynamic loading
const projectsData = {

  "aws-portfolio": {
    title: "AWS Cloud Portfolio with CI/CD Pipeline",
    tagline: "Static portfolio website hosted on AWS with a CI/CD pipeline that only clears changed files from the CDN cache.",
    badges: ["AWS S3", "CloudFront", "Route 53", "GitHub Actions", "IAM"],

    links: {
      github: "https://github.com/Kevinnra/Kevinnra.github.io",
      demo: "https://www.kevinnramirez.com"
    },

    overview: {
      problem: "Hosting a website on a regular server means paying for compute all the time, handling deployments manually, and clearing the whole CDN cache every time something changes. That last part gets expensive fast.",

      solution: "I used S3 to host the site, CloudFront to serve it from edge locations closer to visitors, and Route 53 to connect my domain. The GitHub Actions pipeline compares commits to find which files actually changed and only clears those from the CloudFront cache.",

      results: [
        "99.99% availability via CloudFront CDN",
        "Pages load in under one second for most visitors",
        "$0.56/month operational cost",
        "Zero-downtime deployments",
        "80% reduction in cache invalidation costs"
      ]
    },

    architecture: {
      image: "/Resources/images/Architecture-Diagram-AWS-dark.jpg",
    },

    technicalDetails: [
      {
        service: "AWS S3",
        details: "Static website hosting with versioning enabled for rollback capability, AES-256 server-side encryption, and bucket policy configured for public read access while maintaining security."
      },
      {
        service: "CloudFront CDN",
        details: "Global content delivery with custom domain support (kevinnramirez.com, www.kevinnramirez.com), HTTPS enforcement via ACM certificate, and edge location caching for sub-second latency worldwide."
      },
      {
        service: "Route 53",
        details: "DNS management with A record Aliases pointing to the CloudFront distribution for both apex and www domains, eliminating query charges and providing better performance than CNAME records."
      },
      {
        service: "GitHub Actions",
        details: "Automated CI/CD pipeline triggered on push to main branch, performing S3 sync with --delete flag and targeted cache invalidation based on Git file comparison."
      },
      {
        service: "IAM",
        details: "Dedicated IAM user for GitHub Actions with least-privilege policy allowing only S3 sync and CloudFront invalidation, with credentials stored as GitHub Secrets."
      }
    ],

    challenges: [
      {
        title: "Challenge #1: Outdated CSS After Deployments",
        problem: "My initial CI/CD pipeline only cleared /index.html from the CloudFront cache. When I updated CSS or JavaScript files, the site showed broken styles because CloudFront kept serving the old cached versions.",
        solution: "I added Git-based file detection to the GitHub Actions workflow. The pipeline compares the current commit with the previous one to find which .html, .css, and .js files changed, then builds invalidation paths for only those files.",
        code: {
          language: "yaml",
          title: "Targeted Cache Invalidation - GitHub Actions Workflow",
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
          "The site always shows the latest version right after a deployment.",
          "CloudFront invalidation costs dropped by 80% because only the changed paths are cleared.",
          "Fewer paths means the invalidation finishes faster."
        ]
      },
      {
        title: "Challenge #2: Understanding AWS Service Integration",
        problem: "This was my first time working with AWS infrastructure. I could not figure out how S3, CloudFront, and Route 53 connect for static website hosting. The relationship between origin servers, CDN edge locations, and DNS routing was not clear to me.",
        solution: "I drew out the full data flow. S3 holds the files. CloudFront caches and serves them from 450+ edge locations around the world. Route 53 points my domain to CloudFront using Alias records. Writing it out helped it click.",
        benefits: [
          "I can now explain how S3, CloudFront, and Route 53 connect and draw the request path from browser to origin.",
          "I understand how CDN edge caching works and when to clear it.",
          "This setup gave me the foundation I needed for every AWS project I built after it."
        ]
      },
      {
        title: "Challenge #3: DNS Configuration and Domain Setup",
        problem: "This was my first time setting up DNS records. Understanding the difference between A records and CNAME records, and connecting a custom domain to AWS, was confusing. DNS propagation timing made it hard to know if my changes were working.",
        solution: "I used Route 53 Alias records instead of CNAME records. I did not know the difference at first. Alias records are free for AWS resources and respond faster. CNAME records charge per query and cannot be used on the root domain. I configured both kevinnramirez.com and www.kevinnramirez.com to point to the CloudFront distribution.",
        benefits: [
          "I now understand the difference between A records, CNAME records, and Alias records.",
          "Alias records cost nothing for AWS-to-AWS routing and work on the root domain where CNAME records do not.",
          "I know how to connect a custom domain to CloudFront and what to expect from DNS propagation timing."
        ]
      }
    ],

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

    costBreakdown: {
      intro: "Knowing what each AWS service costs matters. This project runs almost entirely on the Free Tier, so I want to be clear about what is free and what is not.",

      items: [
        {
          service: "S3 Storage",
          cost: "$0.00",
          note: "~50MB website files within Free Tier (5GB storage included)."
        },
        {
          service: "S3 Requests",
          cost: "$0.00",
          note: "~100 GET requests/month within Free Tier (20,000 included)."
        },
        {
          service: "CloudFront Data Transfer",
          cost: "$0.00",
          note: "~1GB/month within Free Tier (1TB for first 12 months)."
        },
        {
          service: "CloudFront Requests",
          cost: "$0.00",
          note: "~10,000 requests/month within Free Tier (10M for first 12 months)."
        },
        {
          service: "CloudFront Invalidations",
          cost: "$0.00",
          note: "~5 invalidations/month. First 1,000 per month are free."
        },
        {
          service: "Route 53 Hosted Zone",
          cost: "$0.50",
          note: "Standard hosted zone charge. Applies immediately, even with no traffic."
        },
        {
          service: "Route 53 Queries",
          cost: "$0.00",
          note: "Standard DNS queries within Free Tier (1M queries/month included)."
        }
      ],

      total: "$0.56/month",
      note: "This is a learning environment. Production workloads with higher traffic and multi-region redundancy would cost more."
    },

    metrics: [
      { label: "Uptime", value: "99.99%" },
      { label: "Load Time", value: "<1s" },
      { label: "Monthly Cost", value: "$0.56" },
      { label: "Automation", value: "100%" }
    ],

    lessons: [
      "DNS propagation can take 24 to 48 hours. I expected instant updates after changing Route 53 records and it caught me off guard. Plan ahead.",
      "Clearing only the changed paths in CloudFront instead of the whole distribution cut costs by 80%. I did not expect caching decisions to affect billing this much.",
      "S3 bucket policies are strict about syntax. A wrong ARN format or a missing wildcard returns a 403 with no clear reason. I had to read CloudWatch logs to find where the problem was.",
      "I accidentally deleted site files once. S3 versioning let me recover them. I enabled it after that, not before.",
      "AWS access keys should never be in a code repository. I stored them as GitHub Secrets from the start, but I understand now why this rule exists."
    ]
  },

  "serverless-api": {

    title: "Serverless Contact Form API",

    tagline: "A serverless contact form API built on AWS. No server to manage. Deploys automatically on every push to main.",

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

    architecture: {
      image: "/Resources/images/contact-form-v2.jpg",
      description:
        "Form submissions go from the portfolio frontend to API Gateway, which enforces rate limiting and routes the request to Lambda. The function validates and sanitizes input, silently drops bot submissions through a honeypot field, writes the record to DynamoDB, and sends a notification email through SES. CloudWatch logs every invocation and fires SNS alerts when errors cross a threshold. The full stack is defined in template.yaml and deployed through CloudFormation."
    },

    metrics: [
      { value: "$0.00/mo", label: "Operational cost" },
      { value: "6", label: "AWS services" },
      { value: "<300ms", label: "Avg response time" },
      { value: "Automated", label: "Deployments" }
    ],

    overview: {
      problem:
        "A static portfolio site has no backend. Running a server to handle a contact form means paying for compute all the time, even when no one is using it. A contact form gets a handful of submissions per week at most.",

      solution:
        "The entire backend is serverless. A form submission hits API Gateway, which triggers a Lambda function that validates the input, writes the record to DynamoDB, and sends an email through SES. Every AWS resource is defined in a SAM template and deployed automatically through GitHub Actions. Nothing runs between requests, so the cost stays at $0 per month within the AWS Free Tier.",

      results: [
        "$0.00/month operational cost within AWS Free Tier",
        "All infrastructure is defined as code. One command provisions or tears down the full stack.",
        "Automated CI/CD: every push to main deploys the latest version with no manual steps.",
        "Input security with field validation, HTML sanitization, and honeypot bot detection.",
        "API Gateway rate limiting (5 req/s, burst 10) on a fully public endpoint."
      ]
    },

    technicalDetails: [
      {
        service: "AWS Lambda (Python 3.13)",
        details:
          "Handles the full request lifecycle: field validation, HTML tag stripping, email format check, honeypot evaluation, DynamoDB write, and SES dispatch. Uses Python stdlib (re, html) for sanitization. No external packages needed, which keeps the deployment package small and cold starts fast."
      },
      {
        service: "Amazon API Gateway",
        details:
          "Public REST endpoint. Enforces rate limiting at 5 req/s with a burst of 10 to block abuse on an unauthenticated route. CORS configured to allow requests from the portfolio domain only."
      },
      {
        service: "Amazon DynamoDB",
        details:
          "Stores every validated submission with a UUID partition key, ISO timestamp, sanitized content, and source IP. On-demand (PAY_PER_REQUEST) billing means no cost at zero requests and no capacity to provision or monitor."
      },
      {
        service: "Amazon SES",
        details:
          "Sends an email notification on each successful submission. Lambda IAM role scoped to ses:SendEmail on the specific verified sender identity ARN, not a wildcard resource."
      },
      {
        service: "AWS SAM + CloudFormation",
        details:
          "All resources defined in template.yaml. SAM shorthand compiles to CloudFormation at deploy time. Nothing is abstracted from actual provisioning. samconfig.toml persists deploy parameters so CI and local deploys run the same command with no flags."
      },
      {
        service: "CloudWatch + SNS",
        details:
          "Every Lambda invocation is logged automatically. A CloudWatch alarm monitors the function error rate and publishes to an SNS topic when the threshold is breached, triggering an alert email."
      }
    ],

    challenges: [
      {
        title: "SES rejected emails in sandbox mode",

        problem:
          "The Lambda function ran without errors, but no emails arrived. CloudWatch logs showed a MessageRejected exception from SES with no further context in the function output.",

        solution:
          "SES accounts start in sandbox mode where sending is restricted to individually verified addresses. Both the sender and recipient had to be verified in the SES console. The Lambda IAM role also needed to be scoped to ses:SendEmail on the specific verified sender identity ARN. A wildcard resource would have made it harder to tell if the permission was correct.",

        code: {
          language: "json",
          title: "Least-privilege SES permission in the Lambda execution role",
          content:
            `{
    "Effect": "Allow",
    "Action": [
      "ses:SendEmail",
      "ses:SendRawEmail"
    ],
    "Resource": "arn:aws:ses:ap-northeast-1:ACCOUNT_ID:identity/sender@example.com"
  }`
        },

        benefits: [
          "Scoping to a specific identity ARN makes it obvious right away if the wrong address is configured.",
          "Explicit ARNs follow least-privilege. The function can only send from one verified address, not any identity in the account.",
          "Logging at each handler stage isolated the failure to the SES call specifically."
        ]
      },

      {
        title: "API Gateway returning 502 instead of the Lambda error",

        problem:
          "When an unhandled exception occurred in the Lambda function, API Gateway returned 502 Bad Gateway to the frontend. The actual exception was only visible in CloudWatch logs.",

        solution:
          "API Gateway requires Lambda to always return a response object with statusCode, headers, and body. An unhandled exception produces no such object, which the gateway treats as a malformed response. Wrapping the entire handler in try/except, with the except block returning a structured 500, means every code path produces something the gateway can forward.",

        code: {
          language: "python",
          title: "Handler structure: catch-all ensures a valid response on every code path",
          content:
            `def lambda_handler(event, context):
      try:
          # All handler logic runs here
          return build_response(200, {"success": True, "message": "Thank you!"})

      except Exception as e:
          print(f"ERROR: {e}")  # Captured by CloudWatch automatically
          return build_response(500, {"error": "Internal server error."})

  def build_response(status_code, body):
      return {
          "statusCode": status_code,
          "headers": {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
          },
          "body": json.dumps(body)
      }`
        },

        benefits: [
          "Every code path, whether success, validation failure, or unexpected exception, returns a structured JSON response.",
          "The frontend always receives a body it can display rather than an opaque gateway error.",
          "The print() in the except block ensures every unhandled error lands in CloudWatch with context."
        ]
      },

      {
        title: "sam deploy hanging indefinitely in GitHub Actions",

        problem:
          "The deploy step in the CI pipeline would start and then hang with no output. The exact same command completed correctly when run locally.",

        solution:
          "SAM was waiting for interactive confirmation of the detected changeset. In a non-interactive CI environment, nothing sends the confirmation, so the process waits forever. Adding --no-confirm-changeset removes the prompt. Adding --no-fail-on-empty-changeset prevents the pipeline from failing on pushes that contain no infrastructure changes.",

        code: {
          language: "yaml",
          title: "GitHub Actions deploy step: non-interactive flags",
          content:
            `- name: Deploy
    run: |
      sam deploy \\
        --no-confirm-changeset \\
        --no-fail-on-empty-changeset
    # samconfig.toml supplies all stack parameters
    # AWS credentials injected by configure-aws-credentials step above`
        },

        benefits: [
          "Pipeline completes reliably on every push with no manual intervention needed.",
          "--no-fail-on-empty-changeset means code-only pushes do not fail the deploy step.",
          "samconfig.toml keeps the command identical in both local and CI contexts."
        ]
      }
    ],

    codeBlocks: [
      {
        title: "Input security: validation, sanitization, and honeypot",
        language: "python",
        code:
          `import re, html, json

  def sanitize(text):
      # Strip HTML tags, then escape remaining special characters
      clean = re.sub(r"<[^>]+>", "", str(text))
      return html.escape(clean.strip())

  def valid_email(email):
      return re.match(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$", email)

  def lambda_handler(event, context):
      body = json.loads(event.get("body", "{}"))

      # Honeypot: bots fill hidden fields, real users never see them
      if body.get("honeypot"):
          return build_response(200, {"success": True})  # Silent discard

      name    = body.get("name",    "").strip()
      email   = body.get("email",   "").strip()
      message = body.get("message", "").strip()

      if not all([name, email, message]):
          return build_response(400, {"error": "All fields are required."})
      if len(name) > 100 or len(message) > 2000:
          return build_response(400, {"error": "Input exceeds length limit."})
      if not valid_email(email):
          return build_response(400, {"error": "Invalid email format."})

      # Sanitize before any write or send operation
      return process(sanitize(name), email, sanitize(message), event)`
      },
      {
        title: "DynamoDB write: item structure",
        language: "python",
        code:
          `import uuid, os, boto3
  from datetime import datetime, timezone

  dynamodb = boto3.resource("dynamodb")

  def store_submission(name, email, message, event):
      table = dynamodb.Table(os.environ["TABLE_NAME"])
      table.put_item(Item={
          "submission_id": str(uuid.uuid4()),                       # Unique partition key
          "timestamp":     datetime.now(timezone.utc).isoformat(),  # ISO 8601
          "name":          name,                                    # Already sanitized
          "email":         email,                                   # Format-validated
          "message":       message,                                 # Already sanitized
          "source_ip":     event["requestContext"]["identity"]["sourceIp"]
      })`
      }
    ],

    costBreakdown: {
      intro:
        "Cost awareness matters. Knowing why each service costs what it does is part of building responsibly on AWS. This project was designed to stay within the Free Tier for portfolio-level traffic.",

      items: [
        {
          service: "AWS Lambda",
          cost: "$0.00",
          note: "Free Tier covers 1M requests/month. Portfolio traffic is well within this limit."
        },
        {
          service: "Amazon API Gateway",
          cost: "$0.00",
          note: "Free Tier covers 1M REST API calls/month for the first 12 months."
        },
        {
          service: "Amazon DynamoDB",
          cost: "$0.00",
          note: "On-demand billing. Free Tier covers 25 WCU/RCU. Portfolio write volume is negligible."
        },
        {
          service: "Amazon SES",
          cost: "$0.00",
          note: "Free Tier covers 3,000 messages/month sent from a Lambda function."
        },
        {
          service: "Amazon CloudWatch",
          cost: "$0.00",
          note: "Free Tier covers 5GB log ingestion/month and 10 custom alarms."
        },
        {
          service: "Amazon SNS",
          cost: "$0.00",
          note: "Free Tier covers 1,000 email notifications/month."
        }
      ],

      total: "$0.00/mo",

      footer:
        "Learning environment. Production workloads with higher traffic would cost more."
    },

    lessons: [
      "SAM templates are easier to write than raw CloudFormation. But when a deploy fails, the useful error is in the CloudFormation stack events in the AWS console, not in the SAM CLI output. I learned to look there first.",

      "IAM least-privilege requires iteration in practice. The first working version used permissions that were too broad. Tightening them to specific resource ARNs meant reading CloudWatch logs carefully to confirm exactly what each service call needed at runtime.",

      "Structured logging should be deliberate, not accidental. I added explicit log statements at each handler stage: receive, validate, store, and email. That made it possible to isolate failures immediately. Without them, diagnosing the SES sandbox issue would have taken much longer.",

      "The CI/CD pipeline pays off fast. After the first manual deploy, every subsequent change was a git push. That feedback loop made iteration significantly faster than running sam deploy by hand each time.",

      "Serverless does not mean zero configuration. Cold starts, SES sandbox restrictions, IAM scope, and the Lambda-API Gateway response contract all required deliberate attention. Managed services still need to be understood."
    ]

  },

  "flask-ecs-api": {
    title: "Containerized REST API on AWS ECS",
    tagline: "Python Flask API containerized with Docker, deployed on ECS Fargate with private VPC networking, RDS PostgreSQL, and automated CI/CD via GitHub Actions.",
    badges: ["Docker", "ECS Fargate", "ECR", "RDS PostgreSQL", "VPC", "ALB", "Secrets Manager", "GitHub Actions", "OIDC", "Python", "Flask"],

    links: {
      github: "https://github.com/Kevinnra/flask-ecs-api"
    },

    overview: {
      problem: "I wanted to learn how real companies deploy containerized applications on AWS, with proper network isolation, a managed database, and a pipeline that deploys automatically when code changes.",

      solution: "I built a Python Flask REST API, containerized it with Docker, and deployed it on ECS Fargate inside a custom VPC. I worked through it in stages: containerize the app locally, push to ECR, build the VPC networking, deploy RDS, run on ECS, add the ALB, then automate with GitHub Actions. The app and database have no direct internet access. Only the load balancer is public. Every push to main triggers a pipeline that builds the correct image and deploys to ECS with no manual steps.",

      results: [
        "Containerized API running on ECS Fargate behind an Application Load Balancer. Live API screenshots in the GitHub README.",
        "Database unreachable from the internet. Security groups allow port 5432 only from the ECS security group, not from any IP range.",
        "Zero stored AWS credentials. GitHub pipeline authenticates via OIDC and assumes a role at runtime with a short-lived token.",
        "Diagnosed and fixed a container platform mismatch between Apple Silicon and ECS that is a common real-world issue for Mac developers."
      ]
    },

    architecture: {
      image: "/Resources/images/flask-ecs-architecture.jpg",
      description: "Traffic enters the VPC through an Internet Gateway and reaches the Application Load Balancer in the public subnets. The ALB forwards requests to ECS Fargate tasks in the private subnets. Those tasks connect to RDS PostgreSQL, also in private subnets. ECS pulls database credentials from Secrets Manager at container startup through an IAM execution role. The credentials never appear in code, environment files, or the task definition."
    },

    technicalDetails: [
      {
        service: "Docker + ECR",
        details: "I containerized the Flask app using a python:3.12-slim base image with Gunicorn as the production server, not Flask's built-in dev server, which is not safe for production use. Each line in the Dockerfile becomes a cached layer, so I ordered them with dependencies first and application code last. This way rebuilds only re-execute the layers that changed. I pushed the image to ECR, which is AWS's private container registry. ECS needs to pull from somewhere, and ECR integrates directly with IAM so no separate credentials are needed."
      },
      {
        service: "VPC Networking",
        details: "I built a custom VPC with a /16 CIDR block and four subnets across two Availability Zones, two public for the ALB and two private for ECS and RDS. The two-AZ requirement is not optional: AWS requires ALB and RDS to span at least two AZs for availability. The Internet Gateway connects public subnets to the internet. The NAT Gateway, placed in a public subnet, gives private resources outbound internet access without exposing them to inbound connections. I chose NAT Gateway over VPC Endpoints because it is simpler to configure for a learning project. VPC Endpoints are cheaper at scale but require per-service setup."
      },
      {
        service: "Security Groups",
        details: "I used security group chaining instead of CIDR-based rules. The ALB security group accepts port 80 from 0.0.0.0/0. The ECS security group accepts port 5000 only from the ALB security group ID, not from any IP range. The RDS security group accepts port 5432 only from the ECS security group ID. I chose this pattern because it ties permissions to resources, not to IP addresses. If a task restarts and gets a new IP, the permission still works without any changes."
      },
      {
        service: "ECS Fargate + Task Definition",
        details: "I chose Fargate over EC2 because the goal was to learn container orchestration, not instance management. Fargate means AWS handles the underlying compute. I only define CPU, memory, and what to run. The task definition is the blueprint: 0.25 vCPU, 512 MB memory, the ECR image URI, port mappings, environment variables, and secret references. The execution role gives ECS permission to pull from ECR, write to CloudWatch, and read the specific secret from Secrets Manager. The service layer runs the task definition and restarts it if it stops."
      },
      {
        service: "AWS Secrets Manager",
        details: "My first working version had the database password as a plain environment variable in the task definition JSON. I realized this was wrong. Task definitions are visible to anyone with IAM describe permissions. I moved the credentials to Secrets Manager as a JSON object and updated the task definition to use the secrets field with a valueFrom reference pointing to the secret ARN. I also scoped the IAM policy to allow GetSecretValue only on that specific ARN. The Flask app code did not change. It still reads os.getenv(). The difference is where the value comes from at startup."
      },
      {
        service: "GitHub Actions + OIDC",
        details: "I initially planned to use IAM access keys stored as GitHub Secrets, but I chose OIDC instead. With OIDC, GitHub requests a short-lived token from AWS at runtime and assumes a role. No long-lived credentials exist anywhere. The workflow builds the image with --platform linux/amd64 (required for ECS, discovered the hard way), tags it with the Git commit SHA for traceability, pushes to ECR, and deploys to ECS. The wait-for-service-stability flag means the pipeline only marks success after ECS confirms the new tasks are healthy, not just after the API call returns."
      }
    ],

    challenges: [
      {
        title: "Container platform mismatch on Apple Silicon",
        problem: "After pushing my Docker image to ECR and deploying the ECS service, it stayed at 0 running tasks. There was no error in CloudWatch Logs. I checked ECS service events and found: 'image manifest does not contain descriptor matching platform linux/amd64'.",
        solution: "My Mac's M-series chip builds arm64 images by default. ECS Fargate runs on linux/amd64. The fix was adding --platform linux/amd64 to the build command. I also baked it into the GitHub Actions workflow so every automated build produces the correct architecture. It is no longer something to remember manually. This taught me to always check ECS service events first, not CloudWatch, when a task fails to start.",
        code: {
          language: "bash",
          title: "Force linux/amd64 build regardless of developer machine",
          content: `# Without this flag, Apple Silicon builds arm64 -- incompatible with ECS
  docker buildx build --platform linux/amd64 -t flask-api:v1 .`
        },
        benefits: [
          "Works identically on Apple Silicon and Intel machines.",
          "Automated in the CI/CD pipeline. The flag is in deploy.yml, not something to remember per build."
        ]
      },
      {
        title: "ECS tasks in private subnets could not reach ECR",
        problem: "ECS tasks were failing to start because they could not pull the Docker image from ECR. The error was in the ECS service events. Private subnets have no default route to the internet, even for ECR, which is an AWS service reached over the public internet unless you configure otherwise.",
        solution: "I deployed a NAT Gateway in a public subnet, allocated an Elastic IP for it, and added a 0.0.0.0/0 route in the private route table pointing to the NAT Gateway. This gives private resources outbound internet access without any inbound exposure. I later learned that VPC Endpoints for ECR and Secrets Manager would eliminate the NAT Gateway cost entirely. That is the improvement I would make next.",
        code: {
          language: "bash",
          title: "Route all outbound private subnet traffic through NAT Gateway",
          content: `# Private subnets need this route to reach ECR, Secrets Manager, and the internet
  aws ec2 create-route \\
    --route-table-id YOUR_PRIVATE_RT_ID \\
    --destination-cidr-block 0.0.0.0/0 \\
    --nat-gateway-id YOUR_NAT_ID`
        },
        benefits: [
          "ECS tasks can pull images from ECR and read secrets from Secrets Manager.",
          "No inbound internet connections possible to private subnet resources."
        ]
      },
      {
        title: "Database password in plain text in the task definition",
        problem: "My first working version stored the database password as a plain environment variable in task-definition.json. Task definitions are stored in AWS and visible to anyone with IAM describe permissions. This is not acceptable even in a learning project. It is the kind of mistake that causes real security incidents.",
        solution: "I stored the credentials in Secrets Manager as a JSON object with separate keys for DB_USER and DB_PASS. In the task definition, I replaced the plain environment entries with a secrets array using valueFrom to reference the specific secret ARN. I also added an IAM inline policy to the execution role allowing GetSecretValue only on that ARN. ECS resolves the secret at container startup and injects it as an environment variable. The Flask app code was unchanged.",
        code: {
          language: "json",
          title: "Replace plain env var with Secrets Manager reference in task definition",
          content: `"secrets": [
    {
      "name": "DB_PASS",
      "valueFrom": "arn:aws:secretsmanager:ap-northeast-1:ACCOUNT:secret:flask-ecs/db-credentials:DB_PASS::"
    },
    {
      "name": "DB_USER",
      "valueFrom": "arn:aws:secretsmanager:ap-northeast-1:ACCOUNT:secret:flask-ecs/db-credentials:DB_USER::"
    }
  ]`
        },
        benefits: [
          "Credentials never appear in the task definition, GitHub repository, or container logs.",
          "IAM policy scoped to the specific secret ARN, not a wildcard over all secrets."
        ]
      }
    ],

    codeBlocks: [
      {
        title: "GitHub Actions workflow: OIDC auth, linux/amd64 build, ECS deploy",
        language: "yaml",
        code: `name: Build and Deploy to ECS

  on:
    push:
      branches: [main]

  permissions:
    id-token: write   # Required -- allows GitHub to request an OIDC token from AWS
    contents: read

  jobs:
    deploy:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4

        # OIDC: GitHub requests a short-lived token and assumes the role -- no stored keys
        - name: Configure AWS credentials via OIDC
          uses: aws-actions/configure-aws-credentials@v4
          with:
            role-to-assume: \${{ vars.ACTIONS_ROLE_ARN }}
            aws-region: \${{ vars.AWS_REGION }}

        - name: Login to Amazon ECR
          id: login-ecr
          uses: aws-actions/amazon-ecr-login@v2

        # --platform linux/amd64: required for ECS Fargate regardless of runner architecture
        - name: Build and push image to ECR
          id: build-image
          env:
            ECR_REGISTRY: \${{ steps.login-ecr.outputs.registry }}
            IMAGE_TAG: \${{ github.sha }}  # Tag with commit SHA for full traceability
          run: |
            docker buildx build --platform linux/amd64 \\
              -t \$ECR_REGISTRY/flask-ecs-api:\$IMAGE_TAG \\
              -t \$ECR_REGISTRY/flask-ecs-api:latest --push .
            echo "image=\$ECR_REGISTRY/flask-ecs-api:\$IMAGE_TAG" >> \$GITHUB_OUTPUT

        # Download current task definition to update only the image field
        - name: Download task definition
          run: |
            aws ecs describe-task-definition \\
              --task-definition flask-ecs-task \\
              --query taskDefinition > task-def-current.json

        - name: Update image in task definition
          id: task-def
          uses: aws-actions/amazon-ecs-render-task-definition@v1
          with:
            task-definition: task-def-current.json
            container-name: flask-api
            image: \${{ steps.build-image.outputs.image }}

        # wait-for-service-stability: pipeline only succeeds after ECS confirms healthy tasks
        - name: Deploy to ECS
          uses: aws-actions/amazon-ecs-deploy-task-definition@v1
          with:
            task-definition: \${{ steps.task-def.outputs.task-definition }}
            service: flask-ecs-service
            cluster: flask-ecs-cluster
            wait-for-service-stability: true`
      }
    ],

    costBreakdown: {
      intro: "This project has more moving parts than the others. The VPC components, especially the NAT Gateway, make cost awareness important here. I tore down all infrastructure after the project was complete.",
      items: [
        {
          service: "NAT Gateway",
          cost: "~$32.85/mo",
          note: "Charged $0.045/hr regardless of traffic. The largest cost driver in this stack. Replacing it with VPC Endpoints for ECR and Secrets Manager would eliminate this cost entirely."
        },
        {
          service: "ECS Fargate (0.25 vCPU / 512 MB)",
          cost: "~$8.90/mo",
          note: "Charged per vCPU-hour and GB-hour. Cost drops to $0 when tasks are stopped, making it practical to run only during active development sessions."
        },
        {
          service: "Application Load Balancer",
          cost: "~$5.84/mo",
          note: "Charged $0.008/hr plus LCU charges based on connections and bandwidth. Minimal at dev traffic volumes."
        },
        {
          service: "RDS PostgreSQL (db.t3.micro)",
          cost: "~$0.00/mo",
          note: "Free tier eligible for the first 12 months. Approximately $13.00/mo after that for the smallest available instance running continuously."
        },
        {
          service: "AWS Secrets Manager",
          cost: "~$0.40/mo",
          note: "$0.40 per secret per month regardless of retrieval count. One secret for DB credentials is the only charge here."
        },
        {
          service: "Amazon ECR",
          cost: "~$0.10/mo",
          note: "First 500 MB of private storage is free per month. A typical Flask image stays well under that limit."
        },
        {
          service: "GitHub Actions",
          cost: "$0.00/mo",
          note: "Free for public repositories. The full build, push, and deploy pipeline runs at no cost."
        }
      ],
      total: "~$48.09/mo",
      footer: "This is a learning environment. The NAT Gateway alone accounts for 68% of the total cost. Replacing it with VPC Endpoints for ECR and Secrets Manager would reduce this bill significantly."
    },

    metrics: [
      { label: "Deployment time", value: "< 3 min" },
      { label: "Stored credentials", value: "Zero" },
      { label: "AWS services", value: "9" },
      { label: "Subnet tiers", value: "2" }
    ],

    lessons: [
      "I built a Flask REST API running in Docker containers on ECS Fargate, inside a custom VPC with private subnets, an RDS PostgreSQL database, an Application Load Balancer, and Secrets Manager for credentials. The CI/CD pipeline uses GitHub Actions with OIDC and deploys on every push to main. The next thing I would change is replacing the NAT Gateway with VPC Endpoints for ECR and Secrets Manager. That would cut the biggest cost driver and improve network security at the same time.",
      "Container deployments force you to be explicit about everything: ports, platforms, environment variables, network paths. Nothing is assumed. That is exactly why containers behave the same way in development and in production.",
      "The NAT Gateway cost surprised me. It charges by the hour whether tasks are running or not. Understanding when to replace it with VPC Endpoints is a real cost optimization question that comes up in cloud engineering roles.",
      "Debugging a containerized deployment means knowing which layer to check first. CloudWatch Logs for application errors, ECS service events for task startup failures, and VPC route tables for network problems. Looking in the wrong place first wastes a lot of time.",
      "OIDC for CI/CD is more secure than stored access keys and simpler to set up. There is no IAM user to create, no keys to rotate, and no risk of committing credentials by accident. I will use it by default on every future project."
    ]
  },

  "terraform-iac": {
    title: "Multi-Environment AWS Infrastructure with Terraform",
    tagline: "The same Terraform code deploys a 3-tier AWS architecture to dev and prod. Currently in development.",

    badges: [
      "Terraform",
      "EC2",
      "Auto Scaling Group",
      "RDS PostgreSQL",
      "ALB",
      "VPC",
      "GitHub Actions",
      "CloudWatch",
      "IAM OIDC"
    ],

    links: {
      github: "https://github.com/Kevinnra/project-4-terraform-iac"
    },

    overview: {
      problem: "After three projects built through the AWS Console and CLI, I noticed a pattern: every time I set up a new environment, I repeated the same steps. There was no record of what I changed, and no easy way to rebuild from scratch.",
      solution: "I rebuilt the 3-tier architecture from Project 3 in Terraform, split into reusable modules. Dev and prod both run from the same code. Only the variable values are different. GitHub Actions runs terraform plan on every pull request and applies on merge. This project is currently under active development.",
      results: [
        "Currently in development. Check back for updates.",
        "All infrastructure is in code: VPC, subnets, EC2, Auto Scaling Group, RDS, and ALB.",
        "Dev and prod both run from the same module code with different variable files.",
        "State stored in S3 with DynamoDB locking so it never gets lost between sessions.",
        "GitHub Actions runs terraform plan on every PR and applies on merge via OIDC. No stored credentials."
      ]
    },

    architecture: {
      image: "/Resources/images/terraform-iac-architecture.jpg",
      description: "Requests hit an Application Load Balancer in public subnets across two Availability Zones. The ALB forwards traffic to EC2 instances in an Auto Scaling Group, which replaces failed instances automatically. RDS PostgreSQL is in private subnets and is only reachable from the EC2 security group. All resources are defined in reusable Terraform modules and deployed through a GitHub Actions pipeline that uses OIDC. No AWS credentials are stored anywhere in the pipeline."
    },

    technicalDetails: [
      {
        service: "Terraform Modules",
        details: "I split the infrastructure into five modules: vpc, security-groups, alb, compute, and database. Each module takes input variables and exposes outputs. Dev and prod both call the same modules. Changing instance sizes for prod is a one-line change in a tfvars file, not a rewrite of the infrastructure code."
      },
      {
        service: "Remote State Backend",
        details: "State lives in an S3 bucket with DynamoDB locking. Losing a local state file means Terraform loses track of every resource it created. The remote backend also prevents two pipeline runs from applying at the same time and corrupting the state."
      },
      {
        service: "EC2 + Auto Scaling Group",
        details: "EC2 instances pull the Flask API code and start the server through a user_data script on launch. The Auto Scaling Group keeps a minimum of one healthy instance running and replaces any instance that fails its health check automatically. No manual steps needed when a server goes down."
      },
      {
        service: "Application Load Balancer",
        details: "The ALB sits in public subnets across two Availability Zones and health-checks every EC2 instance behind it. Those results feed directly into ASG replacement decisions. The EC2 security group accepts traffic only from the ALB security group, not from a CIDR range, so the rule stays accurate even if IPs change."
      },
      {
        service: "RDS PostgreSQL",
        details: "RDS runs in private subnets with no route to the internet. Its security group accepts port 5432 only from the EC2 security group. I used a security group reference instead of a CIDR rule because CIDR rules break when IP addresses change. The reference follows the resource."
      },
      {
        service: "GitHub Actions + OIDC",
        details: "I used OIDC for the same reason I used it in Project 3. Storing IAM access keys in GitHub is a risk that is easy to avoid. Every pull request runs terraform fmt, terraform validate, and terraform plan. The plan output posts as a PR comment so I can see what Terraform intends to change before merging. Apply runs automatically on merge to main."
      }
    ],

    costBreakdown: {
      intro: "The biggest cost trap in a 3-tier VPC is the NAT Gateway. It charges by the hour whether you use it or not. I left it out and put EC2 in public subnets with tight security groups instead. Everything else gets destroyed at the end of each working session.",
      items: [
        {
          service: "EC2 t3.micro (ASG)",
          cost: "~$0.14/day",
          note: "Only runs during active development sessions. Destroyed at the end of each session so it does not charge overnight."
        },
        {
          service: "RDS db.t3.micro",
          cost: "~$0.21/day",
          note: "Single-AZ, smallest available instance. Free tier eligible for the first 12 months. Destroyed after each working session."
        },
        {
          service: "Application Load Balancer",
          cost: "~$0.19/day",
          note: "Charged per hour plus LCU. Minimal at dev traffic volumes. Destroyed after each session."
        },
        {
          service: "NAT Gateway",
          cost: "$0.00",
          note: "Left out on purpose. EC2 in public subnets with security group chaining covers the same need. This removes the largest cost driver in a typical VPC setup, which runs about $33/mo if left on."
        },
        {
          service: "S3 State Backend + DynamoDB",
          cost: "~$0.01/mo",
          note: "The only infrastructure that stays running permanently. S3 holds the Terraform state file. DynamoDB prevents two applies from running at the same time."
        }
      ],
      total: "~$5-10 total",
      footer: "All compute and database resources get destroyed after each working session. The state backend is the only thing that runs continuously, and it costs almost nothing."
    },

    metrics: [
      { label: "Status",           value: "Building" },
      { label: "Environments",     value: "Dev + Prod" },
      { label: "AWS Services",     value: "8+" },
      { label: "NAT Gateway Cost", value: "$0.00" }
    ],

    lessons: []
  }
};