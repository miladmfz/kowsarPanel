import { ModuleRegistry } from 'ag-grid-community';
import {
  AllCommunityModule,
  AllEnterpriseModule,
  LicenseManager,
} from 'ag-grid-enterprise';

let registered = false;

/** Register AG Grid only when a grid-backed feature is loaded. */
export function registerAgGridEnterpriseModules(): void {
  if (registered) return;

  LicenseManager.setLicenseKey('MjAwMDAwMDAwMDAwMA==5a5ea3be8a8aaa9b54ce7186663066431');
  ModuleRegistry.registerModules([
    AllCommunityModule,
    AllEnterpriseModule,
  ]);
  registered = true;
}

registerAgGridEnterpriseModules();
