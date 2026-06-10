// Build-time registry for component-local fixture files used by the fixture export route.
const fixtureModules = import.meta.glob('../components/*/*.fixture.js', { eager: true });
const componentModules = import.meta.glob('../components/*/*.astro', { eager: true });

function assertPlainObject(value, message) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(message);
  }

  return value;
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
    const pathParts = fixturePath.split('/');
    const componentName = pathParts.at(-2);
    const fixtureFileName = pathParts.at(-1);
    const expectedFixtureFile = `${componentName}.fixture.js`;

    if (!componentName || fixtureFileName !== expectedFixtureFile) {
      throw new Error(`Fixture file \"${fixturePath}\" must match its folder name.`);
    }

    const componentPath = fixturePath.replace('.fixture.js', '.astro');
    const componentModule = componentModules[componentPath];

    if (!componentModule?.default) {
      throw new Error(`Fixture file \"${fixturePath}\" is missing matching component \"${componentPath}\".`);
    }

    const fixtures = assertPlainObject(
      fixtureModule.default,
      `Fixture file \"${fixturePath}\" must default export an object.`,
    );

    if (!('default' in fixtures)) {
      throw new Error(`Fixture file \"${fixturePath}\" must define a default fixture.`);
    }

    return Object.entries(fixtures).map(([variantName, fixture]) => ({
      componentName,
      variantName,
      slug: variantName === 'default' ? componentName : `${componentName}/${variantName}`,
      component: componentModule.default,
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
  }));
}

export function getFixtureEntryBySlug(slugParam) {
  const slug = Array.isArray(slugParam) ? slugParam.join('/') : String(slugParam || '');
  return fixtureEntries.find((entry) => entry.slug === slug) ?? null;
}