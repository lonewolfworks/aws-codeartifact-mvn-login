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

## New features provided by this fork
This fork allows us to configure multiple repos on a single domain. 
For example, the maven release plugin checks out the dev tag to target/checkout and gets info on that (snapshot) artifact, we need to specify credentials for  the snapshot repo as well as the release repo.

## Example

```yml
name: Release Build and Deploy to CodeArtifact
on: 
  release:
  push:
    branches:
      - master
jobs:
  build-artifact:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout Repo
      uses: actions/checkout@v3
      with:
        set-safe-directory: /github/workspace
    - name: Set up JDK 8
      uses: actions/setup-java@v3
      with:
        java-version: '8.0.232'
        distribution: 'adopt'
    - name: Configure AWS Credentials
      uses: aws-actions/configure-aws-credentials@v1
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: us-east-1
    - name: aws-codeartifact-mvn-login
      uses: cfedersp/aws-codeartifact-mvn-login@main
      with:
        settings-xml-path: /home/runner/work/my-project/my-project/settings.xml
        repo-name: my-releases,my-snapshots
        repo-domain: my-domain
        account-number: 123456789
        region: us-east-1
    - name: Maven Release
      uses: qcastel/github-actions-maven-release@v1.12.34
      env:
        JAVA_HOME: /usr/lib/jvm/java-1.8-openjdk/
      with:
        git-release-bot-name: release-bot
        maven-options: -s /github/workspace/settings.xml -Dresume=false
        ssh-private-key: ${{ secrets.SSH_PRIVATE_KEY }}
        version-minor: true
```
