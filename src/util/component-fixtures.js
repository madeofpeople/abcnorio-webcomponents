// Build-time registry for component-local fixture files used by the fixture export route.
const fixtureModules = import.meta.glob('../components/*/*.fixture.js', { eager: true });
const componentModules = import.meta.glob('../components/*/*.astro', { eager: true });

function fail(message) {
  throw new Error(message);
}

function assertPlainObject(value, message) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    fail(message);
  }

  return value;
}

function assertModuleDefault(moduleValue, message) {
  if (!moduleValue?.default) {
    fail(message);
  }

  return moduleValue.default;
}

function parseFixturePath(fixturePath) {
  const pathParts = fixturePath.split('/');
  const componentName = pathParts.at(-2);
  const fixtureFileName = pathParts.at(-1);
  const expectedFixtureFile = `${componentName}.fixture.js`;

  if (!componentName || fixtureFileName !== expectedFixtureFile) {
    fail(`Fixture file "${fixturePath}" must match its folder name.`);
  }

  return {
    componentName,
    componentPath: fixturePath.replace('.fixture.js', '.astro'),
  };
}

function normalizeFixture(componentName, variantName, fixture) {
  const normalizedFixture = assertPlainObject(
    fixture,
    `Fixture \"${componentName}/${variantName}\" must export an object.`,
  );

  const props = normalizedFixture.props === undefined
    ? {}
    : assertPlainObject(
        normalizedFixture.props,
        `Fixture \"${componentName}/${variantName}\" props must be an object.`,
      );

  const slots = normalizedFixture.slots === undefined
    ? {}
    : assertPlainObject(
        normalizedFixture.slots,
        `Fixture \"${componentName}/${variantName}\" slots must be an object.`,
      );

  return { props, slots };
}

function buildFixtureEntries() {
  return Object.entries(fixtureModules).flatMap(([fixturePath, fixtureModule]) => {
    const { componentName, componentPath } = parseFixturePath(fixturePath);
    const component = assertModuleDefault(
      componentModules[componentPath],
      `Fixture file "${fixturePath}" is missing matching component "${componentPath}".`,
    );

    const fixtures = assertPlainObject(
      fixtureModule.default,
      `Fixture file \"${fixturePath}\" must default export an object.`,
    );

    if (!('default' in fixtures)) {
      fail(`Fixture file "${fixturePath}" must define a default fixture.`);
    }

    return Object.entries(fixtures).map(([variantName, fixture]) => ({
      componentName,
      variantName,
      slug: variantName === 'default' ? componentName : `${componentName}/${variantName}`,
      componentPath,
      component,
      fixture: normalizeFixture(componentName, variantName, fixture),
    }));
  });
}

const fixtureEntries = buildFixtureEntries();

export function getFixtureStaticPaths() {
  return fixtureEntries.map((entry) => ({
    params: {
      slug: entry.slug,
    },
    props: {
      componentPath: entry.componentPath,
      fixture: entry.fixture,
    },
  }));
}

export function getFixtureComponentByPath(componentPath) {
  return assertModuleDefault(
    componentModules[componentPath],
    `Unknown fixture component path: ${componentPath}`,
  );
}

export function getFixtureEntryBySlug(slugParam) {
  const slug = Array.isArray(slugParam) ? slugParam.join('/') : String(slugParam || '');
  return fixtureEntries.find((entry) => entry.slug === slug) ?? null;
}