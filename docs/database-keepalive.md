# Database Keepalive Solution

This solution prevents Supabase databases from being suspended due to inactivity by implementing automated health checks and workflow management.

## 🎯 Purpose

-   **Prevent database suspension**: Supabase databases on free/pro tiers can be paused due to inactivity
-   **Maintain GitHub Actions**: Prevent GitHub from suspending cron-based workflows after 60 days of repository inactivity
-   **Automated monitoring**: Regular health checks for both development and production databases

## 🔧 Components

### 1. GitHub Actions Workflow (`.github/workflows/database-keepalive.yml`)

**Schedule**: Runs every 6 hours (`0 */6 * * *`)

**Features**:

-   ✅ Health checks for both development and production databases
-   🔄 Automatic workflow keepalive mechanism
-   🛡️ Error handling and detailed logging
-   🎯 Manual trigger support via `workflow_dispatch`

### 2. Health Check Script (`scripts/database-health-check.mjs`)

**Features**:

-   📊 Performs simple queries to keep databases active
-   🔍 Comprehensive error handling and logging
-   🎯 Can be run manually or from CI/CD
-   ⚡ Uses ES modules for modern Node.js compatibility

## 🚀 Setup Instructions

### 1. Environment Variables

Add these secrets to the GitHub repository:

```bash
SUPABASE_SERVICE_ROLE_KEY_DEV=development_supabase_service_key
SUPABASE_SERVICE_ROLE_KEY_PROD=production_supabase_service_key
```

### 2. Manual Testing

Test the health check script locally:

```bash
# Set environment variables
export SUPABASE_SERVICE_ROLE_KEY_DEV="dev_service_key_here"
export SUPABASE_SERVICE_ROLE_KEY_PROD="prod_service_key_here"

# Run the health check
node scripts/database-health-check.mjs
```

### 3. Workflow Configuration

The workflow is automatically configured with:

-   **Development DB**: `https://gyal******jmxv.supabase.co`
-   **Production DB**: `https://ppoz******inpt.supabase.co`

Update these URLs in both files if the database URLs change.

## 📊 How It Works

### Database Health Checks

1. **Connection**: Creates Supabase client with URL and service key
2. **Query**: Executes simple query on `information_schema.tables`
3. **Validation**: Checks for errors and logs results
4. **Activity**: Database registers activity and avoids suspension

### Workflow Keepalive

1. **Repository Activity Check**: Monitors days since last commit
2. **API Integration**: Uses GitHub API to refresh workflow status
3. **Automatic Prevention**: Prevents 60-day suspension rule
4. **Smart Logic**: Only acts when repository is inactive (>25 days)

## 🔍 Monitoring

### Successful Run Example

```
🚀 Starting database health checks...

🔍 Performing health check for Development database...
✅ Development database is healthy
📊 Query executed successfully at: 2024-01-15T10:30:00.000Z

🔍 Performing health check for Production database...
✅ Production database is healthy
📊 Query executed successfully at: 2024-01-15T10:30:00.000Z

📋 Health Check Summary:
==================================================
✅ Development: Healthy
✅ Production: Healthy
==================================================
⏰ Executed at: 1/15/2024, 10:30:00 AM
🎯 Purpose: Prevent Supabase database suspension due to inactivity
🎉 All databases are healthy!
```

### Error Handling

The system gracefully handles:

-   🔌 Connection failures
-   🚫 Authentication errors
-   ⚠️ Query timeouts
-   📊 Invalid responses

## 🛠️ Customization

### Frequency Adjustment

To change the schedule, modify the cron expression:

```yaml
on:
    schedule:
        # Every 12 hours instead of 6
        - cron: '0 */12 * * *'

        # Daily at 2 AM UTC
        - cron: '0 2 * * *'

        # Every 3 days at noon
        - cron: '0 12 */3 * *'
```

### Database URLs

Update URLs in both files if they change:

```javascript
// scripts/database-health-check.mjs
const SUPABASE_DEV_URL = 'https://new-dev-url.supabase.co'
const SUPABASE_PROD_URL = 'https://new-prod-url.supabase.co'
```

```yaml
# .github/workflows/database-keepalive.yml
env:
    SUPABASE_DEV_URL: https://new-dev-url.supabase.co
    SUPABASE_PROD_URL: https://new-prod-url.supabase.co
```

### Additional Checks

Extend the health check script to include:

```javascript
// Add more comprehensive checks
const healthChecks = [
    // Check specific tables
    supabase.from('pools').select('id').limit(1),

    // Check functions
    supabase.rpc('custom_function_name'),

    // Check storage
    supabase.storage.from('bucket_name').list('', { limit: 1 }),
]
```

## 🔒 Security

-   ✅ Uses production environment for secrets
-   🔐 Password stored as GitHub secret (never exposed)
-   🛡️ Minimal permissions (`actions: write`, `contents: read`)
-   🎯 Read-only database operations

## 📈 Benefits

1. **Zero Manual Intervention**: Fully automated solution
2. **Cost Effective**: Prevents database suspension without additional costs
3. **Reliable**: Robust error handling and logging
4. **Flexible**: Easy to customize and extend
5. **Monitoring**: Clear visibility into database health

## 🚨 Troubleshooting

### Common Issues

**Database Connection Failed**:

-   Verify `SUPABASE_SERVICE_ROLE_KEY_DEV` and `SUPABASE_SERVICE_ROLE_KEY_PROD` secrets are set correctly
-   Check database URLs are current
-   Ensure databases are not already suspended

**Workflow Not Running**:

-   Check if workflow file has valid YAML syntax
-   Verify repository has Actions enabled
-   Check if branch protection rules affect workflows

**Permission Errors**:

-   Ensure GitHub token has correct permissions
-   Check repository settings allow workflow modifications

### Debug Mode

Enable verbose logging by modifying the script:

```javascript
// Add debug logging
console.log('Debug: Environment variables loaded')
console.log('Debug: Creating Supabase client...')
```

## 📝 Notes

-   The workflow runs on the `production` environment to access secrets
-   Database queries are minimal and read-only to avoid performance impact
-   The keepalive mechanism only activates when repository is inactive
-   All operations are logged for monitoring and debugging

Based on the [GitHub Keepalive Workflow](https://github.com/marketplace/actions/keepalive-workflow) best practices and Supabase documentation.
