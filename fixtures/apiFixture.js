import { test as base } from '@playwright/test';
import ApiClient from '../api/apiClient';

export const test = base.extend({
  apiClient: async ({}, use) => {
    const client = new ApiClient();
    await use(client);
  }
});