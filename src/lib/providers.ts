import { promises as fs } from "node:fs";
import path from "node:path";
import type { Provider, ProviderRateSource, ProviderType, StaticPair } from "@/lib/routing/types";

export class ProviderConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProviderConfigError";
  }
}

type RawObject = Record<string, unknown>;

const providerTypes = new Set<ProviderType>(["fiat_broker", "stablecoin_venue"]);
const rateSources = new Set<ProviderRateSource>(["live_api", "static"]);

export async function loadProviders(filePath = path.join(process.cwd(), "providers.json")) {
  let raw: string;

  try {
    raw = await fs.readFile(filePath, "utf8");
  } catch {
    throw new ProviderConfigError("providers.json could not be read.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new ProviderConfigError("providers.json is malformed JSON.");
  }

  if (!isObject(parsed) || !Array.isArray(parsed.providers)) {
    throw new ProviderConfigError("providers.json must contain a providers array.");
  }

  return parsed.providers.map((provider, index) => normalizeProvider(provider, index));
}

export function getConfiguredCurrencies(providers: Provider[]) {
  const currencies = new Set<string>();

  providers.forEach((provider) => {
    provider.pairs?.forEach((pair) => {
      currencies.add(pair.from);
      currencies.add(pair.to);
    });
  });

  return currencies;
}

function normalizeProvider(provider: unknown, index: number): Provider {
  if (!isObject(provider)) {
    throw new ProviderConfigError(`Provider at index ${index} is not an object.`);
  }

  const name = readString(provider, "name", index);
  const type = readProviderType(provider, index);
  const rateSource = readRateSource(provider, index);
  const feeModel = readFeeModel(provider, index);
  const api = readApi(provider, rateSource, index);
  const pairs = readPairs(provider, rateSource, index);

  return {
    name,
    type,
    rate_source: rateSource,
    api,
    fee_model: feeModel,
    pairs
  };
}

function readString(provider: RawObject, key: string, index: number) {
  const value = provider[key];

  if (typeof value !== "string" || value.trim().length === 0) {
    throw new ProviderConfigError(`Provider at index ${index} has an invalid ${key}.`);
  }

  return value.trim();
}

function readProviderType(provider: RawObject, index: number): ProviderType {
  const value = provider.type;

  if (typeof value !== "string" || !providerTypes.has(value as ProviderType)) {
    throw new ProviderConfigError(`Provider at index ${index} has an invalid type.`);
  }

  return value as ProviderType;
}

function readRateSource(provider: RawObject, index: number): ProviderRateSource {
  const value = provider.rate_source;

  if (typeof value !== "string" || !rateSources.has(value as ProviderRateSource)) {
    throw new ProviderConfigError(`Provider at index ${index} has an invalid rate_source.`);
  }

  return value as ProviderRateSource;
}

function readFeeModel(provider: RawObject, index: number): Provider["fee_model"] {
  const feeModel = provider.fee_model;

  if (!isObject(feeModel)) {
    throw new ProviderConfigError(`Provider at index ${index} has an invalid fee_model.`);
  }

  if (feeModel.fee_currency !== "source") {
    throw new ProviderConfigError(`Provider at index ${index} must charge fees in source currency.`);
  }

  const feePercent = feeModel.fee_percent;
  const feeFlat = feeModel.fee_flat;

  if (!isFiniteNonNegativeNumber(feePercent) || !isFiniteNonNegativeNumber(feeFlat)) {
    throw new ProviderConfigError(`Provider at index ${index} has invalid fee values.`);
  }

  return {
    fee_percent: feePercent,
    fee_flat: feeFlat,
    fee_currency: "source"
  };
}

function readApi(provider: RawObject, rateSource: ProviderRateSource, index: number): Provider["api"] {
  if (rateSource !== "live_api") {
    return undefined;
  }

  const api = provider.api;

  if (!isObject(api) || typeof api.endpoint !== "string" || typeof api.docs !== "string") {
    throw new ProviderConfigError(`Live provider at index ${index} has an invalid api block.`);
  }

  return {
    endpoint: api.endpoint,
    docs: api.docs
  };
}

function readPairs(provider: RawObject, rateSource: ProviderRateSource, index: number): StaticPair[] | undefined {
  if (rateSource !== "static") {
    return undefined;
  }

  if (!Array.isArray(provider.pairs)) {
    throw new ProviderConfigError(`Static provider at index ${index} must define pairs.`);
  }

  return provider.pairs.map((pair, pairIndex) => {
    if (!isObject(pair)) {
      throw new ProviderConfigError(`Pair ${pairIndex} for provider ${index} is invalid.`);
    }

    if (
      typeof pair.from !== "string" ||
      typeof pair.to !== "string" ||
      !isFinitePositiveNumber(pair.rate)
    ) {
      throw new ProviderConfigError(`Pair ${pairIndex} for provider ${index} is malformed.`);
    }

    return {
      from: pair.from.toUpperCase(),
      to: pair.to.toUpperCase(),
      rate: pair.rate
    };
  });
}

function isObject(value: unknown): value is RawObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isFinitePositiveNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function isFiniteNonNegativeNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}
