import { App, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class MyStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps = {}) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, 'ecsDemo', { maxAzs: 2, natGateways: 1 });
    const cluster = new ecs.Cluster(this, 'democluster', {
      clusterName: 'democluster',
      vpc,
      defaultCloudMapNamespace: {
        name: 'demo',
      },
    });
    const mocktaskDefinition = new ecs.FargateTaskDefinition(this, 'mocktaskDefinition', {
      cpu: 256,
      memoryLimitMiB: 512,
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