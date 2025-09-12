import { test as base } from '@playwright/test';

// Extend fixtures later if backend auth token seeding is needed.
export const test = base;
export const expect = test.expect;
