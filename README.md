# aws-codeartifact-mvn-login
Required: `aws-actions/configure-aws-credentials`

### `repo-name`
Comma-delimited Repository Names... :D

### `repo-domain`
Domain of the CA repo

### `account-number`
Number of the owning account

### `settings-xml-path`
Folder path for settings.xml location, default ~/.m2

### `region`
AWS CodeArtifact Region

### `duration`
Token duration in seconds, default 900

## Changes in thie fork
There is no mirror option currently. This fork allows us to configure multiple repos on a single domain.

## Example

```yml
Test:
  runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          role-to-assume: arn:aws:iam::*****
          aws-region: us-east-1
          
      - name: aws-codeartifact-mvn-login
        uses: lonewolfworks/aws-codeartifact-mvn-login@v****
        with:
          repo-name: release
          repo-domain: lonewolfworks
          account-number: 1234567
          region: us-east-1
```
