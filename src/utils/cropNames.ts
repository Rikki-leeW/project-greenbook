const CROP_ALIASES: Record<string, { key: string; label: string }> = {
  potato: { key: 'potato', label: 'Potatoes' },
  potatoes: { key: 'potato', label: 'Potatoes' },
  potatos: { key: 'potato', label: 'Potatoes' },
  tomato: { key: 'tomato', label: 'Tomatoes' },
  tomatoes: { key: 'tomato', label: 'Tomatoes' },
  cucumber: { key: 'cucumber', label: 'Cucumbers' },
  cucumbers: { key: 'cucumber', label: 'Cucumbers' },
  capsicum: { key: 'capsicum', label: 'Capsicums' },
  capsicums: { key: 'capsicum', label: 'Capsicums' },
  pumpkin: { key: 'pumpkin', label: 'Pumpkins' },
  pumpkins: { key: 'pumpkin', label: 'Pumpkins' },
  cauliflower: { key: 'cauliflower', label: 'Cauliflowers' },
  cauliflowers: { key: 'cauliflower', label: 'Cauliflowers' },
  flower: { key: 'flower', label: 'Flowers' },
  flowers: { key: 'flower', label: 'Flowers' },
  broccoli: { key: 'broccoli', label: 'Broccoli' },
  carrot: { key: 'carrot', label: 'Carrots' },
  carrots: { key: 'carrot', label: 'Carrots' },
  onion: { key: 'onion', label: 'Onions' },
  onions: { key: 'onion', label: 'Onions' },
  bean: { key: 'bean', label: 'Beans' },
  beans: { key: 'bean', label: 'Beans' },
  pea: { key: 'pea', label: 'Peas' },
  peas: { key: 'pea', label: 'Peas' },
  zucchini: { key: 'zucchini', label: 'Zucchinis' },
  zucchinis: { key: 'zucchini', label: 'Zucchinis' },
};

function cleanCropName(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

function findCropAlias(value: string): { key: string; label: string } | undefined {
  const cleaned = cleanCropName(value).toLocaleLowerCase();
  const exact = CROP_ALIASES[cleaned];

  if (exact) {
    return exact;
  }

  /*
   * Older test records sometimes stored a descriptive story label in the
   * crop field (for example "My testing potato variations"). Recognise a
   * known crop as a complete word so those records still group correctly,
   * without guessing at unrelated labels such as "DATABASES".
   */
  const words = cleaned.match(/[a-z]+/g) ?? [];

  for (const word of words) {
    const alias = CROP_ALIASES[word];

    if (alias) {
      return alias;
    }
  }

  return undefined;
}

export function getCanonicalCropKey(value: string): string {
  const cleaned = cleanCropName(value).toLocaleLowerCase();
  return findCropAlias(cleaned)?.key ?? cleaned;
}

export function getCropCategoryLabel(value: string): string {
  const cleaned = cleanCropName(value);
  const alias = findCropAlias(cleaned);

  if (alias) {
    return alias.label;
  }

  if (!cleaned || /s$/i.test(cleaned)) {
    return cleaned;
  }

  return `${cleaned}s`;
}

export function buildCropCategoryOptions(
  cropNames: string[],
): Array<{ value: string; label: string }> {
  const options = new Map<string, string>();

  cropNames.forEach(cropName => {
    const key = getCanonicalCropKey(cropName);

    if (key && !options.has(key)) {
      options.set(key, getCropCategoryLabel(cropName));
    }
  });

  return Array.from(options, ([value, label]) => ({ value, label }))
    .sort((first, second) => first.label.localeCompare(second.label));
}
