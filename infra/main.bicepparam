using './main.bicep'

param location = 'eastus2'
param environmentName = 'prod'
param workloadName = 'shopapi'
param postgresAdminUsername = 'shopapi'

param databaseName = 'shopapi'
param containerImageName = 'shop-api:latest'
param githubRepositoryUrl = ''
param githubBranch = 'main'
