@description('Azure region for all resources')
param location string

@description('Environment name for resource naming')
param environmentName string = 'prod'

@description('Workload name for resource naming')
param workloadName string = 'shopapi'

@description('GitHub repository URL (e.g. https://github.com/user/repo)')
param githubRepositoryUrl string = ''

@description('GitHub branch to deploy')
param githubBranch string = 'main'

resource staticWebApp 'Microsoft.Web/staticSites@2024-11-01' = {
  name: 'stapp-${workloadName}-${environmentName}-001'
  location: location
  sku: {
    name: 'Free'
    tier: 'Free'
  }
  properties: {
    repositoryUrl: !empty(githubRepositoryUrl) ? githubRepositoryUrl : null
    branch: !empty(githubRepositoryUrl) ? githubBranch : null
    buildProperties: {
      appLocation: 'frontend'
      apiLocation: ''
      outputLocation: 'dist'
      appBuildCommand: 'npm run build'
      apiBuildCommand: ''
    }
    provider: !empty(githubRepositoryUrl) ? 'GitHub' : null
  }
}

output staticSiteUrl string = staticWebApp.properties.defaultHostname
output staticSiteName string = staticWebApp.name
