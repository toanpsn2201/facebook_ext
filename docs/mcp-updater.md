# MCP Updater Guide: Daily Facebook Filter Maintenance

This document describes how an external AI Agent can maintain the Facebook Feed Filter by updating the remote configuration daily.

## 1. Remote Configuration Schema
The configuration is stored in `core/config.json`. The schema is as follows:

```json
{
  "version": "string",
  "postContainerSelector": "string (CSS Selector for the main post wrapper)",
  "adSelectors": [
    "string (CSS Selector for identifying ads/sponsored content)"
  ],
  "suggestedPageSelectors": [
    "string (CSS Selector for identifying suggested pages/follow buttons)"
  ],
  "suggestedKeywords": [
    "string (Keywords that appear in suggested posts)"
  ],
  "removalText": "string (Text to display in the removal bar)"
}
```

## 2. The Maintenance Workflow (Daily)

### Step 1: DOM Analysis
The AI Agent should use an MCP tool (like a browser-control MCP or Puppeteer) to:
1. Navigate to `facebook.com`.
2. Scroll through the feed to find a "Sponsored" post and a "Suggested for you" post.
3. Inspect the DOM structure of these posts to find the current unique selectors. Facebook often obfuscates these using random class names, but they often leave consistent attributes like `aria-label`, `data-pagelet`, or specific SVG icon paths.

### Step 2: Config Update via MCP
Once new selectors are identified, the Agent should use the `replace` or `write_file` MCP tool to update `core/config.json` in this repository.

**Example Instruction for the Agent:**
"Update `core/config.json` with the following new `adSelectors`: `['span[aria-labelledby="..."]', 'svg > use[href*="sponsored"]']`."

### Step 3: Deployment
After updating the file, the Agent should:
1. Commit the change to the repository.
2. Push to the main branch.

The Chrome Extension and iOS App are configured to fetch `https://raw.githubusercontent.com/<USER>/facebook_ext/main/core/config.json` on every page load/reload, ensuring they always use the latest rules.

## 3. Recommended Detection Strategies for the Agent
- **Visual Cues:** Look for elements that render the text "Sponsored" even if the HTML is split into many spans.
- **Link Analysis:** Look for links pointing to `/ads/about`.
- **Icon Mapping:** Identify the SVG paths used for the "Sponsored" icon or the "Follow" icon.
- **Role Attributes:** Look for `role="article"` or `data-pagelet` attributes which are often more stable than class names.
