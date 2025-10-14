import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => {
	const env = loadEnv(mode, process.cwd(), "");
	const devProxyTarget = env.VITE_DEV_PROXY_TARGET || "http://localhost:5000";

	let componentTagger: (() => any) | undefined;
	if (mode === "development") {
		try {
			// Dynamically import only in dev; ignore if not installed
			// Avoid static module resolution for lint/TS when package is absent
			const mod: any = await import("lovable-" + "tagger");
			componentTagger = mod?.componentTagger;
		} catch {}
	}

	return {
		server: {
			host: "::",
			port: 8080,
			proxy: env.VITE_API_URL ? {} : {
				"/api": {
					target: devProxyTarget,
					changeOrigin: true,
					rewrite: (path: string) => path.replace(/^\/api/, ""),
				},
			},
		},
		plugins: [react(), mode === "development" && componentTagger && componentTagger()].filter(Boolean),
		resolve: {
			alias: {
				"@": path.resolve(__dirname, "./src"),
			},
		},
	};
});
