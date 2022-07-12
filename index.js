const core = require('@actions/core');
const exec = require('@actions/exec');
const io = require('@actions/io');
const fs = require('fs');
const codeArtifact = require('@aws-sdk/client-codeartifact');

async function run() {
  const region = core.getInput('region', { required: true });
  const domain = core.getInput('repo-domain', { required: true });
  const account = core.getInput('account-number', { required: true });
  const duration = core.getInput('duration', { required: false });
  const repo = core.getInput('repo-name', { required: true });
  const path = core.getInput('settings-xml-path', { required: true });
  
  const client = new codeArtifact.CodeartifactClient({ region: region });
  const authCommand = new codeArtifact.GetAuthorizationTokenCommand({
    domain: domain,
    domainOwner: account,
    durationSeconds: duration
  });

  const response = await client.send(authCommand);
  const authToken = response.authorizationToken;
  if (response.authorizationToken === undefined) {
    throw Error(`Auth Failed: ${response.$metadata.httpStatusCode} (${response.$metadata.requestId})`);
  }

  maven(domain, account, region, repo, authToken, path);
  
  core.setOutput('registry', `https://${domain}-${account}.d.codeartifact.${region}.amazonaws.com`);
  core.setSecret(authToken);
}

async function maven(domain, account, region, repo, authToken, path) {
  
  await io.rmRF(path);
  fs.exists(path, function(exists) {

  if(exists) {
      console.log('File exists. Deleting now ...');
      fs.unlinkSync(path);
  } else {
      console.log('File not found, so not deleting.');
  }

  });
  var repositories = repo.split(',');
  var settingsXml = builder.create('settings');
  var serversXml = settingsXml.ele('xmlbuilder').ele('servers');
  
  for(repository in repositories) {
      var eachServer = serversXml.ele('server');
      eachServer.ele('id', `${domain}-${repository}`);
      eachServer.ele('username', 'aws')
      eachServer.ele('password', authToken);
  }
  // Instead of defining an ActiveProfile, just define a single profile with multiple repositories that is activeByDefault
  // Central is built-in so we shouldnt have to add apache repos
  var profileXml = settingsXml.ele('profiles').ele('profile');
  profileXml.ele('id', 'all-repos'); 
  profileXml.ele('activation').ele('activeByDefault', true);

  var repositoriesXml = profileXml.ele('repositories')
  for(repository in respositories) {
      var eachRepository = repositoriesXml.ele('repository');
      eachRepository.ele('id', `${domain}-${repository}`);
      eachRepository.ele('url', `https://${domain}-${account}.d.codeartifact.${region}.amazonaws.com/maven/${repository}/`);
  }
  settingsXml.end({ pretty: true});

  fs.writeFile(path, settingsXml, { flag: 'wx' }, (callback) => {
    if (callback) core.setFailed(callback);
  });
}

module.exports = run;

if (require.main === module) {
    run();
}
