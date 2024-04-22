
export function getServiceUrl() {
  return `${serviceEndpoint}/api/`;
}

export function getIdentityUrl() {
  return `${identityEndpoint}`;
}

export const environment = {

  appVersion: '1.0.0',
  production: false,


  //baseUrl: 'http://178.131.31.161:60005/api/web/',
  //baseUrl_KowsarWeb: 'http://178.131.31.161:60005/api/KowsarWeb/'

  api_Url: 'http://localhost:60006/api/',
  baseUrl: 'http://localhost:60006/api/web/',
  baseUrl_KowsarWeb: 'http://localhost:60006/api/KowsarWeb/'





};


let serviceEndpoint = 'http://localhost:5041';

//let serviceEndpoint = 'https://localhost:7168';
let identityEndpoint = 'https://localhost:44310';
