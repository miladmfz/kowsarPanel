
export const environment = {

  appVersion: '1.0.0',
  production: false,



  //  Build
  //api_Url: 'http://178.131.31.161:60005/api/',
  api_Url: 'http://5.160.152.173:60005/api/',
  //api_Url: 'http://192.110.110.219:60005/api/',

  // development
  //  api_Url: 'http://localhost:60006/api/',


  // //// Qoqnos_Coffee
  // api_Url: 'http://94.139.164.68:60005/api/',



};
let api_Url = 'http://localhost:60006/api/';

export function getServiceUrl() {
  return `${api_Url}`;
}
