import { App, Stack, StackProps } from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecsp from 'aws-cdk-lib/aws-ecs-patterns';
import { Construct } from 'constructs';

export class MyStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps = {}) {
    super(scope, id, props);
    const vpc = new ec2.Vpc(this, 'ecsDemo', { maxAzs: 2, natGateways: 0 });
    const cluster = new ecs.Cluster(this, 'democluster', { clusterName: 'democluster', vpc });
    const taskDefinition = new ecs.FargateTaskDefinition(this, 'taskDefinition', {
      cpu: 256,
      memoryLimitMiB: 512,
      runtimePlatform: { operatingSystemFamily: ecs.OperatingSystemFamily.LINUX, cpuArchitecture: ecs.CpuArchitecture.ARM64 },
    });
    taskDefinition.addContainer('nginx', { image: ecs.ContainerImage.fromRegistry('public.ecr.aws/nginx/nginx:1.27-arm64v8'), portMappings: [{ containerPort: 80 }] });
    new ecsp.ApplicationLoadBalancedFargateService(this, 'api', {
      cluster,
      assignPublicIp: true,
      listenerPort: 80,
      cpu: 256,
      memoryLimitMiB: 512,
      capacityProviderStrategies: [
        {
          capacityProvider: 'FARGATE_SPOT', weight: 100,
        },
      ],
      taskDefinition,
      taskSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
      serviceName: 'nginx',
      publicLoadBalancer: true,
      desiredCount: 1,
    });


  }
}

// for development, use account/region from cdk cli
const devEnv = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const app = new App();

new MyStack(app, 'ecs-fargate-spot-arm64-dev', { env: devEnv });
// new MyStack(app, 'ecs-fargate-spot-arm64-prod', { env: prodEnv });

app.synth();