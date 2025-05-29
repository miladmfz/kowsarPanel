
export const environment = {

  appVersion: '1.0.0',
  production: false,


  //  Build
  api_Url: 'http://itmali.ir/webapi/',

  // development
  //api_Url: 'http://localhost:60006/api/',


  // //// Qoqnos_Coffee
  //api_Url: 'http://94.139.164.68:60005/api/',



  //// Qoqnos_panel
  //api_Url: 'http://178.252.165.114:60005/api/',

  // //// Qoqnos_panel_local
  //api_Url: 'http://192.168.170.2:60005/api/',

};
let api_Url = 'http://localhost:60006/api/';

export function getServiceUrl() {
  return `${api_Url}`;
}



