import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createClineTelemetryServiceConfig } from "./telemetry-config";

describe("createClineTelemetryServiceConfig", () => {
	const originalEnv = process.env;

	beforeEach(() => {
		process.env = { ...originalEnv };
	});

	afterEach(() => {
		process.env = originalEnv;
	});

	it("parses CLINE_OTEL_RESOURCE_ATTRIBUTES into resourceAttributes", () => {
		process.env.CLINE_OTEL_RESOURCE_ATTRIBUTES =
			"deployment.environment=production,service.namespace=cline";
		const config = createClineTelemetryServiceConfig();
		expect(config.resourceAttributes).toEqual({
			"deployment.environment": "production",
			"service.namespace": "cline",
		});
	});

	it("returns undefined resourceAttributes when env var is not set", () => {
		delete process.env.CLINE_OTEL_RESOURCE_ATTRIBUTES;
		const config = createClineTelemetryServiceConfig();
		expect(config.resourceAttributes).toBeUndefined();
	});

	it("URL-decodes resource attribute values", () => {
		process.env.CLINE_OTEL_RESOURCE_ATTRIBUTES =
			"service.namespace=my%20service,custom.key=value%2Bwith%2Bplus";
		const config = createClineTelemetryServiceConfig();
		expect(config.resourceAttributes).toEqual({
			"service.namespace": "my service",
			"custom.key": "value+with+plus",
		});
	});
});
