import { describe, expect, it } from "vitest";
import { OpenTelemetryProvider } from "./OpenTelemetryProvider";

describe("OpenTelemetryProvider resourceAttributes", () => {
	it("includes custom resourceAttributes in the OTel Resource", async () => {
		const provider = new OpenTelemetryProvider({
			enabled: true,
			logsExporter: "console",
			serviceName: "cline-test",
			resourceAttributes: {
				"custom.key": "custom-value",
				"deployment.environment": "test",
			},
		});

		const loggerProvider = provider.loggerProvider;
		expect(loggerProvider).not.toBeNull();
		const resource = Reflect.get(loggerProvider!, "resource") as {
			attributes: Record<string, unknown>;
		};
		expect(resource.attributes["custom.key"]).toBe("custom-value");
		expect(resource.attributes["deployment.environment"]).toBe("test");
		// Built-in service.name is present
		expect(resource.attributes["service.name"]).toBe("cline-test");

		await provider.dispose();
	});

	it("does not allow resourceAttributes to override built-in service.name", async () => {
		const provider = new OpenTelemetryProvider({
			enabled: true,
			logsExporter: "console",
			serviceName: "cline-test",
			serviceVersion: "1.2.3",
			resourceAttributes: {
				"service.name": "evil-override",
				"service.version": "9.9.9",
				"custom.key": "custom-value",
			},
		});

		const loggerProvider = provider.loggerProvider;
		expect(loggerProvider).not.toBeNull();
		const resource = Reflect.get(loggerProvider!, "resource") as {
			attributes: Record<string, unknown>;
		};
		// Built-in identity fields take precedence over custom attributes
		expect(resource.attributes["service.name"]).toBe("cline-test");
		expect(resource.attributes["service.version"]).toBe("1.2.3");
		// Custom attributes are still present
		expect(resource.attributes["custom.key"]).toBe("custom-value");

		await provider.dispose();
	});
});
