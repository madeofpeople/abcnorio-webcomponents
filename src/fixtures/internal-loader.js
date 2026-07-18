const fixtureModules = import.meta.glob('../components/**/*.fixture.js', { eager: true });

function fail(message) {
  throw new Error(message);
}

function assertPlainObject(value, message) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    fail(message);
  }

  return value;
}

function parseFixturePath(fixturePath) {
  const pathParts = fixturePath.split('/');
  const componentName = pathParts.at(-2);
  const fixtureFileName = pathParts.at(-1);
  const expectedFixtureFile = `${componentName}.fixture.js`;

  if (!componentName || fixtureFileName !== expectedFixtureFile) {
    fail(`Fixture file "${fixturePath}" must match its folder name.`);
  }

  return componentName;
}

function normalizeFixture(componentName, variantName, fixture) {
  const normalizedFixture = assertPlainObject(
    fixture,
    `Fixture "${componentName}/${variantName}" must export an object.`,
  );

  const props = normalizedFixture.props === undefined
    ? {}
    : assertPlainObject(
        normalizedFixture.props,
        `Fixture "${componentName}/${variantName}" props must be an object.`,
      );

  const slots = normalizedFixture.slots === undefined
    ? {}
    : assertPlainObject(
        normalizedFixture.slots,
        `Fixture "${componentName}/${variantName}" slots must be an object.`,
      );

  return { props, slots };
}

function buildFixtureEntries() {
  return Object.entries(fixtureModules).flatMap(([fixturePath, fixtureModule]) => {
    const componentName = parseFixturePath(fixturePath);
    const fixtures = assertPlainObject(
      fixtureModule.default,
      `Fixture file "${fixturePath}" must default export an object.`,
    );

    if (!('default' in fixtures)) {
      fail(`Fixture file "${fixturePath}" must define a default fixture.`);
    }

    return Object.entries(fixtures).map(([variantName, fixture]) => ({
      componentName,
      variantName,
      slug: variantName === 'default' ? componentName : `${componentName}/${variantName}`,
      ...normalizeFixture(componentName, variantName, fixture),
    }));
  });
}

const fixtureEntries = buildFixtureEntries();
const fixtureEntriesBySlug = new Map(fixtureEntries.map((entry) => [entry.slug, entry]));
const defaultFixtureEntriesByComponent = new Map(
  fixtureEntries
    .filter((entry) => entry.variantName === 'default')
    .map((entry) => [entry.componentName, entry]),
);

export function listFixtureEntries() {
  return [...fixtureEntries];
}

export function getFixtureEntryBySlug(slugParam) {
  const slug = Array.isArray(slugParam) ? slugParam.join('/') : String(slugParam || '');
  return fixtureEntriesBySlug.get(slug) ?? null;
}

export function getDefaultFixtureEntryByComponent(componentName) {
  return defaultFixtureEntriesByComponent.get(componentName) ?? null;
}
