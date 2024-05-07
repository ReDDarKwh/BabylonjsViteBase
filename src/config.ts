import defaultConfig from "./config/default.json";
import projectConfig from "./config/project.json";

type ProjectConfig = {
    input: {
        mappings: { [key: string]: { [key: string]: string[] } };
    };
};

export const CONFIG: ProjectConfig = deepMerge(
    defaultConfig as ProjectConfig,
    projectConfig
);

function deepMerge(target: any, source: any) {
    const result = { ...target, ...source };
    for (const key of Object.keys(result)) {
        result[key] =
            typeof target[key] == "object" && typeof source[key] == "object"
                ? deepMerge(target[key], source[key])
                : result[key];
    }
    return result;
}
