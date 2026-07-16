targetScope = 'resourceGroup'

@description('Azure region for all resources (e.g. eastus2, brazilsouth)')
param location string

@description('Environment name for resource naming')
param environmentName string = 'prod'

@description('Workload name for resource naming')
param workloadName string = 'shopapi'

@description('PostgreSQL admin username')
param postgresAdminUsername string = 'shopapi'

@secure()
@description('PostgreSQL admin password (must be strong)')
param postgresAdminPassword string

@description('Database name to create')
param databaseName string = 'shopapi'

@description('Docker image name to deploy (e.g. shop-api:latest)')
param containerImageName string = 'shop-api:latest'

@description('GitHub repository URL for Static Web App CI/CD (leave empty to skip GitHub integration)')
param githubRepositoryUrl string = ''

@description('GitHub branch to deploy from')
param githubBranch string = 'main'

module monitoring 'modules/monitoring.bicep' = {
  name: 'monitoring'
  params: {
    location: location
    environmentName: environmentName
    workloadName: workloadName
  }
}

module identity 'modules/identity.bicep' = {
  name: 'identity'
  params: {
    location: location
    environmentName: environmentName
    workloadName: workloadName
  }
}

module security 'modules/security.bicep' = {
  name: 'security'
  params: {
    location: location
    environmentName: environmentName
    workloadName: workloadName
    identityPrincipalId: identity.outputs.identityPrincipalId
  }
}

module database 'modules/database.bicep' = {
  name: 'database'
  params: {
    location: location
    environmentName: environmentName
    workloadName: workloadName
    postgresAdminUsername: postgresAdminUsername
    postgresAdminPassword: postgresAdminPassword
    databaseName: databaseName
  }
}

module containerRegistry 'modules/container-registry.bicep' = {
  name: 'container-registry'
  params: {
    location: location
    environmentName: environmentName
    workloadName: workloadName
    identityPrincipalId: identity.outputs.identityPrincipalId
  }
}

module compute 'modules/compute.bicep' = {
  name: 'compute'
  params: {
    location: location
    environmentName: environmentName
    workloadName: workloadName
    logAnalyticsCustomerId: monitoring.outputs.logAnalyticsCustomerId
    logAnalyticsPrimarySharedKey: monitoring.outputs.logAnalyticsPrimarySharedKey
    registryLoginServer: containerRegistry.outputs.registryLoginServer
    identityId: identity.outputs.identityId
    keyVaultUri: security.outputs.keyVaultUri
    applicationInsightsConnectionString: monitoring.outputs.applicationInsightsConnectionString
    containerImageName: containerImageName
  }
}

module frontend 'modules/frontend.bicep' = {
  name: 'frontend'
  params: {
    location: location
    environmentName: environmentName
    workloadName: workloadName
    githubRepositoryUrl: githubRepositoryUrl
    githubBranch: githubBranch
  }
}

output containerAppUrl string = compute.outputs.containerAppUrl
output staticSiteUrl string = frontend.outputs.staticSiteUrl
output keyVaultUri string = security.outputs.keyVaultUri
output postgresServerFqdn string = database.outputs.serverFqdn
output applicationInsightsConnectionString string = monitoring.outputs.applicationInsightsConnectionString
