import StyleDictionary from "style-dictionary";

const sd = new StyleDictionary({
  source: ["src/tokens/global/**/*.json", "src/tokens/semantic/**/*.json"],
  platforms: {
    css: {
      transformGroup: "css",
      buildPath: "src/styles/",
      files: [
        {
          destination: "tokens.css",
          format: "css/variables",
          options: {
            outputReferences: true,
            selector: ":root",
          },
        },
      ],
    },
  },
});

await sd.buildAllPlatforms();
