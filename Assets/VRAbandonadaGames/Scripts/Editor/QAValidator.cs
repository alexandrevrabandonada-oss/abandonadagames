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
    public static class QAValidator
    {
        private static readonly string[] RequiredFolders =
        {
            "Assets/VRAbandonadaGames/Core",
            "Assets/VRAbandonadaGames/Scripts",
            "Assets/VRAbandonadaGames/Scripts/Editor",
            "Assets/VRAbandonadaGames/Scripts/Runtime",
            "Assets/VRAbandonadaGames/Scripts/Platform",
            "Assets/VRAbandonadaGames/Scripts/Mobile",
            "Assets/VRAbandonadaGames/Scripts/Social",
            "Assets/VRAbandonadaGames/Scripts/QA",
            "Assets/VRAbandonadaGames/Scenes",
            "Assets/VRAbandonadaGames/Prefabs",
            "Assets/VRAbandonadaGames/Prefabs/Imported",
            "Assets/VRAbandonadaGames/Data",
            "Assets/VRAbandonadaGames/ThirdParty",
            "Assets/VRAbandonadaGames/ThirdParty/_Licenses",
            "Assets/VRAbandonadaGames/Reports",
            "Assets/VRAbandonadaGames/Docs",
            "Assets/VRAbandonadaGames/Settings"
        };

        [MenuItem("VR Abandonada Games/QA/Run Full Validation")]
        public static void RunFullValidation()
        {
            var issues = new List<string>();

            foreach (var folder in RequiredFolders)
            {
                if (!AssetDatabase.IsValidFolder(folder))
                {
                    issues.Add("Missing folder: " + folder);
                }
            }

            if (!File.Exists("Assets/VRAbandonadaGames/Scenes/VRA_Games_PrototypeHub.unity"))
            {
                issues.Add("Missing prototype scene.");
            }

            if (!File.Exists("Assets/VRAbandonadaGames/ThirdParty/_Licenses/ASSET_MANIFEST.md"))
            {
                issues.Add("Missing asset manifest.");
            }

            if (!File.Exists("Assets/VRAbandonadaGames/Reports/TIJOLO_01_FOUNDATION_REPORT.md"))
            {
                issues.Add("Missing foundation report.");
            }

            foreach (var scriptGuid in AssetDatabase.FindAssets("t:Script", new[] { "Assets/VRAbandonadaGames" }))
            {
                var scriptPath = AssetDatabase.GUIDToAssetPath(scriptGuid);
                if (scriptPath.Contains("/Editor/"))
                {
                    continue;
                }

                if (scriptPath.EndsWith("Editor.cs", StringComparison.OrdinalIgnoreCase))
                {
                    issues.Add("Potential editor script outside Editor folder: " + scriptPath);
                }
            }

            foreach (var sceneGuid in AssetDatabase.FindAssets("t:Scene", new[] { "Assets/VRAbandonadaGames/Scenes" }))
            {
                var path = AssetDatabase.GUIDToAssetPath(sceneGuid);
                var scene = default(UnityEngine.SceneManagement.Scene);
                try
                {
                    scene = EditorSceneManager.OpenScene(path, OpenSceneMode.Additive);
                    ValidateScene(path, scene, issues);
                }
                catch (Exception exception)
                {
                    issues.Add("Scene failed to open: " + path + " | " + exception.Message);
                }
                finally
                {
                    if (scene.IsValid())
                    {
                        EditorSceneManager.CloseScene(scene, true);
                    }
                }
            }

            foreach (var prefabGuid in AssetDatabase.FindAssets("t:Prefab", new[] { "Assets/VRAbandonadaGames" }))
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

            issues.AddRange(AssetOpsAutomation.CollectValidationIssues());

            WriteReport("Assets/VRAbandonadaGames/Reports/FULL_VALIDATION_REPORT.md", issues);
        }

        private static void ValidateScene(string path, UnityEngine.SceneManagement.Scene scene, List<string> issues)
        {
            foreach (var root in scene.GetRootGameObjects())
            {
                foreach (var component in root.GetComponentsInChildren<Component>(true))
                {
                    if (component == null)
                    {
                        issues.Add("Missing script reference in scene: " + path);
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
                            issues.Add("Magenta/error shader material in scene: " + path + " on " + renderer.name);
                        }
                    }
                }
            }
        }

        private static void WriteReport(string path, List<string> issues)
        {
            Directory.CreateDirectory(Path.GetDirectoryName(path) ?? "Assets/VRAbandonadaGames/Reports");
            using var writer = new StreamWriter(path, false);
            writer.WriteLine("# Full Validation Report");
            writer.WriteLine();
            writer.WriteLine("Generated: " + DateTime.UtcNow.ToString("u"));
            writer.WriteLine();
            writer.WriteLine("## Summary");
            writer.WriteLine(issues.Count == 0 ? "- Validation passed." : "- Validation found issues.");
            writer.WriteLine();
            writer.WriteLine("## Details");
            if (issues.Count == 0)
            {
                writer.WriteLine("- No issues found.");
            }
            else
            {
                foreach (var issue in issues)
                {
                    writer.WriteLine("- " + issue);
                }
            }

            AssetDatabase.Refresh();
            Debug.Log("VR Abandonada Games: QA report written to " + path);
        }
    }
}
#endif
