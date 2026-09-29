import { EnvironmentConfig } from '../../types';

/**
 * QA environment configuration.
 *
 * Points at the Zinc Bank demo application (zincbank.cydeo.io), a simulated
 * bank used for QA education.
 */
export const qaConfig: EnvironmentConfig = {
  name: 'qa',
  baseUrl: 'https://zincbank.cydeo.io',
};
