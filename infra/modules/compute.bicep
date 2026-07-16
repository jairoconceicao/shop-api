@description('Azure region for all resources')
param location string

@description('Environment name for resource naming')
param environmentName string = 'prod'

@description('Workload name for resource naming')
param workloadName string = 'shopapi'

@description('Log Analytics Workspace customer ID')
param logAnalyticsCustomerId string

@description('Log Analytics Workspace shared key')
@secure()
param logAnalyticsPrimarySharedKey string

@description('Container Registry login server')
param registryLoginServer string

@description('Managed Identity resource ID')
param identityId string

@description('Key Vault URI')
param keyVaultUri string

@description('Application Insights connection string')
param applicationInsightsConnectionString string

@description('Docker image name (e.g. shop-api:latest)')
param containerImageName string = 'shop-api:latest'

resource containerAppEnvironment 'Microsoft.App/managedEnvironments@2025-01-01' = {
  name: 'cae-${workloadName}-${environmentName}-001'
  location: location
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: logAnalyticsCustomerId
        sharedKey: logAnalyticsPrimarySharedKey
      }
    }
  }
}

resource containerApp 'Microsoft.App/containerApps@2025-01-01' = {
  name: 'ca-${workloadName}-${environmentName}-001'
  location: location
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${identityId}': {}
    }
  }
  properties: {
    environmentId: containerAppEnvironment.id
    configuration: {
      activeRevisionsMode: 'Single'
      registries: [
        {
          server: registryLoginServer
          identity: identityId
        }
      ]
      ingress: {
        external: true
        targetPort: 8080
        transport: 'http'
        allowInsecure: false
      }
    }
    template: {
      containers: [
        {
          name: 'shop-api'
          image: '${registryLoginServer}/${containerImageName}'
          resources: {
            cpu: json('0.5')
            memory: '1Gi'
          }
          env: [
            {
              name: 'ASPNETCORE_ENVIRONMENT'
              value: 'Production'
            }
            {
              name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'
              value: applicationInsightsConnectionString
            }
          ]
        }
      ]
      scale: {
        minReplicas: 0
        maxReplicas: 2
      }
    }
  }
}

output containerAppUrl string = containerApp.properties.configuration.ingress.fqdn
output containerAppEnvironmentId string = containerAppEnvironment.id
output containerAppName string = containerApp.name
