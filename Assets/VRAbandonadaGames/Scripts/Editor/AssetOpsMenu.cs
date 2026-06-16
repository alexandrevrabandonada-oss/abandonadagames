#if UNITY_EDITOR
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;

namespace VRAbandonadaGames.EditorTools
{
    public static class AssetOpsMenu
    {
        private const string ManifestPath = "Assets/VRAbandonadaGames/ThirdParty/_Licenses/ASSET_MANIFEST.md";
        private static readonly string[] SuspiciousBrands =
        {
            "lego", "pokemon", "mario", "gta", "grand theft auto", "disney", "marvel", "dc"
        };

        [MenuItem("VR Abandonada Games/Assets/Validate Asset Manifest")]
        public static void ValidateAssetManifest()
        {
            var report = new List<string>();
            var manifestText = File.Exists(ManifestPath) ? File.ReadAllText(ManifestPath) : string.Empty;

            report.Add(File.Exists(ManifestPath)
                ? "Manifest found."
                : "Manifest missing: " + ManifestPath);

            foreach (var guid in AssetDatabase.FindAssets(string.Empty, new[] { "Assets" }))
            {
                var path = AssetDatabase.GUIDToAssetPath(guid);
                if (Directory.Exists(path) || path.EndsWith(".meta", StringComparison.OrdinalIgnoreCase))
                {
                    continue;
                }

                var lowerPath = path.ToLowerInvariant();
                foreach (var brand in SuspiciousBrands)
                {
                    if (lowerPath.Contains(brand))
                    {
                        report.Add("Suspicious protected-brand reference: " + path);
                    }
                }

                var fileInfo = new FileInfo(path);
                if (fileInfo.Exists && fileInfo.Length > 25 * 1024 * 1024)
                {
                    report.Add("Large file (>25MB): " + path);
                }

                if (path.Contains("/Imported/")
                    && !path.EndsWith(".md", StringComparison.OrdinalIgnoreCase)
                    && !string.IsNullOrEmpty(manifestText))
                {
                    if (manifestText.IndexOf(Path.GetFileName(path), StringComparison.OrdinalIgnoreCase) < 0)
                    {
                        report.Add("Imported asset missing from manifest: " + path);
                    }
                }
            }

            report.AddRange(CollectProjectHealthIssues());
            WriteReport("Assets/VRAbandonadaGames/Reports/ASSET_VALIDATION_REPORT.md", report, "Asset Manifest Validation");
        }

        private static IEnumerable<string> CollectProjectHealthIssues()
        {
            var issues = new List<string>();

            foreach (var sceneGuid in AssetDatabase.FindAssets("t:Scene", new[] { "Assets" }))
            {
                var scenePath = AssetDatabase.GUIDToAssetPath(sceneGuid);
                var scene = EditorSceneManager.OpenScene(scenePath, OpenSceneMode.Additive);
                try
                {
                    foreach (var root in scene.GetRootGameObjects())
                    {
                        foreach (var component in root.GetComponentsInChildren<Component>(true))
                        {
                            if (component == null)
                            {
                                issues.Add("Missing script reference in scene: " + scenePath);
                                continue;
                            }

                            var renderer = component as Renderer;
                            if (renderer == null)
                            {
                                continue;
                            }

                            foreach (var material in renderer.sharedMaterials.Where(material => material != null))
                            {
                                if (material.shader != null && material.shader.name == "Hidden/InternalErrorShader")
                                {
                                    issues.Add("Magenta/error shader material in scene: " + scenePath + " on " + renderer.name);
                                }
                            }
                        }
                    }
                }
                finally
                {
                    EditorSceneManager.CloseScene(scene, true);
                }
            }

            foreach (var prefabGuid in AssetDatabase.FindAssets("t:Prefab", new[] { "Assets" }))
            {
                var prefabPath = AssetDatabase.GUIDToAssetPath(prefabGuid);
                var prefabRoot = PrefabUtility.LoadPrefabContents(prefabPath);
                try
                {
                    foreach (var component in prefabRoot.GetComponentsInChildren<Component>(true))
                    {
                        if (component == null)
                        {
                            issues.Add("Missing script reference in prefab: " + prefabPath);
                            break;
                        }
                    }
                }
                finally
                {
                    PrefabUtility.UnloadPrefabContents(prefabRoot);
                }
            }

            return issues;
        }

        private static void WriteReport(string path, List<string> lines, string title)
        {
            Directory.CreateDirectory(Path.GetDirectoryName(path) ?? "Assets/VRAbandonadaGames/Reports");
            using var writer = new StreamWriter(path, false);
            writer.WriteLine("# " + title);
            writer.WriteLine();
            writer.WriteLine("Generated: " + DateTime.UtcNow.ToString("u"));
            writer.WriteLine();
            if (lines.Count == 0)
            {
                writer.WriteLine("- No issues found.");
            }
            else
            {
                foreach (var line in lines)
                {
                    writer.WriteLine("- " + line);
                }
            }

            AssetDatabase.Refresh();
            Debug.Log("VR Abandonada Games: report written to " + path);
        }
    }
}
#endif
