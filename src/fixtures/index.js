import {
  getDefaultFixtureEntryByComponent,
  getFixtureEntryBySlug,
  listFixtureEntries,
} from './internal-loader.js';

export function listFixtures() {
  return listFixtureEntries();
}

export function getFixtureBySlug(slug) {
  return getFixtureEntryBySlug(slug);
}

export function getDefaultFixtureByComponent(componentName) {
  return getDefaultFixtureEntryByComponent(componentName);
}
