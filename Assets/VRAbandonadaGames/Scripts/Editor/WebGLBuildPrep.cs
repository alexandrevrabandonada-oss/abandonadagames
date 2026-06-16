#if UNITY_EDITOR
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using UnityEditor;
using UnityEngine;

namespace VRAbandonadaGames.EditorTools
{
    public static class WebGLBuildPrep
    {
        private const string ReportPath = "Assets/VRAbandonadaGames/Reports/WebGL/WEBGL_READINESS_REPORT.md";

        [MenuItem("VR Abandonada Games/Build/Prepare WebGL Settings")]
        public static void PrepareWebGLSettings()
        {
            Directory.CreateDirectory(Path.GetDirectoryName(ReportPath) ?? "Assets/VRAbandonadaGames/Reports/WebGL");

            var issues = new List<string>();
            var warnings = new List<string>();

            var enabledScenes = EditorBuildSettings.scenes.Where(scene => scene.enabled).Select(scene => scene.path).ToList();
            if (!enabledScenes.Any(path => path.Contains("VRA_Games_PrototypeHub")))
            {
                issues.Add("Hub scene missing from Build Settings.");
            }

            if (!enabledScenes.Any(path => path.Contains("RioVivoParaiba_Main")))
            {
                issues.Add("Rio Vivo Paraiba scene missing from Build Settings.");
            }

            var heavyTextures = AssetDatabase.FindAssets("t:Texture", new[] { "Assets/VRAbandonadaGames" })
                .Select(AssetDatabase.GUIDToAssetPath)
                .Select(path => new FileInfo(path.Replace("Assets", Application.dataPath)))
                .Where(file => file.Exists && file.Length > 2_000_000)
                .OrderByDescending(file => file.Length)
                .Take(10)
                .ToList();

            if (heavyTextures.Count > 0)
            {
                warnings.Add("Heavy textures found (>2 MB): " + heavyTextures.Count);
            }

            File.WriteAllLines(ReportPath, BuildLines(issues, warnings, enabledScenes, heavyTextures));
            AssetDatabase.Refresh();
            Debug.Log("VR Abandonada Games: WebGL readiness report written to " + ReportPath);
        }

        private static IEnumerable<string> BuildLines(
            List<string> issues,
            List<string> warnings,
            List<string> enabledScenes,
            List<FileInfo> heavyTextures)
        {
            var lines = new List<string>
            {
                "# WebGL Readiness Report",
                string.Empty,
                "Generated: " + DateTime.UtcNow.ToString("u"),
                string.Empty,
                "## Summary",
                issues.Count == 0 ? "- Base WebGL readiness prepared." : "- WebGL readiness has blocking issues.",
                string.Empty,
                "## Scenes in Build Settings"
            };

            lines.AddRange(enabledScenes.Select(scene => "- " + scene));
            lines.Add(string.Empty);
            lines.Add("## Recommended Quality");
            lines.Add("- WebGL: High is currently selected by project defaults, but Low or Medium is recommended for public browser builds.");
            lines.Add("- Keep shadows limited and audio compressed.");
            lines.Add(string.Empty);
            lines.Add("## Warnings");
            if (warnings.Count == 0)
            {
                lines.Add("- No major warnings.");
            }
            else
            {
                lines.AddRange(warnings.Select(warning => "- " + warning));
            }

            lines.Add(string.Empty);
            lines.Add("## Heavy Assets");
            if (heavyTextures.Count == 0)
            {
                lines.Add("- No textures above 2 MB were found in the scanned set.");
            }
            else
            {
                lines.AddRange(heavyTextures.Select(file => "- " + file.FullName.Replace("\\", "/") + " | " + file.Length + " bytes"));
            }

            lines.Add(string.Empty);
            lines.Add("## Blocking Issues");
            if (issues.Count == 0)
            {
                lines.Add("- No blocking issues detected by this prep step.");
            }
            else
            {
                lines.AddRange(issues.Select(issue => "- " + issue));
            }

            return lines;
        }
    }
}
#endif
