import { EnvironmentConfig } from '../../types';

/**
 * Dev environment configuration.
 *
 * Points at the Zinc Bank demo application (zincbank.cydeo.io), a simulated
 * bank used for QA education.
 */
export const devConfig: EnvironmentConfig = {
  name: 'dev',
  baseUrl: 'https://zincbank.cydeo.io',
};
