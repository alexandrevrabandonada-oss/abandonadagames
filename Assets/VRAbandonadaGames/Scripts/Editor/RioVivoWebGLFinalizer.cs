#if UNITY_EDITOR
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using UnityEditor;
using UnityEditor.Build.Reporting;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;
using VRAbandonadaGames.Games.RioVivoParaiba;

namespace VRAbandonadaGames.EditorTools
{
    public static class RioVivoWebGLFinalizer
    {
        private const string RootPath = "Assets/VRAbandonadaGames";
        private const string HubScenePath = RootPath + "/Scenes/VRA_Games_PrototypeHub.unity";
        private const string ScenePath = RootPath + "/Scenes/Games/RioVivoParaiba/RioVivoParaiba_Main.unity";
        private const string ReportPath = RootPath + "/Reports/RioVivoParaiba/TIJOLO_08_WEBGL_FINALIZER_REPORT.md";
        private const string BuildPath = "Builds/WebGL/RioVivoParaiba_Test";

        [MenuItem("VR Abandonada Games/Rio Vivo/Apply T08 WebGL Finalizer")]
        public static void ApplyT08WebGLFinalizer()
        {
            var scene = EditorSceneManager.OpenScene(ScenePath, OpenSceneMode.Single);

            EnsureBuildSettings();
            EnsureTouchHud(scene);
            ApplyHudFinalPass(scene);
            ApplyCameraFinalPass(scene);
            ApplyRiverMarginPass(scene);

            EditorSceneManager.MarkSceneDirty(scene);
            EditorSceneManager.SaveScene(scene);

            var issues = CollectValidationIssues(scene);
            File.WriteAllLines(ReportPath, BuildReport(issues, buildReport: null));
            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();
        }

        [MenuItem("VR Abandonada Games/Rio Vivo/Validate T08 WebGL Finalizer")]
        public static void ValidateT08WebGLFinalizer()
        {
            var scene = EditorSceneManager.OpenScene(ScenePath, OpenSceneMode.Single);
            EnsureBuildSettings();
            var issues = CollectValidationIssues(scene);
            File.WriteAllLines(ReportPath, BuildReport(issues, buildReport: null));
            AssetDatabase.Refresh();
        }

        [MenuItem("VR Abandonada Games/Rio Vivo/Build T08 WebGL Test")]
        public static void BuildT08WebGLTest()
        {
            var scene = EditorSceneManager.OpenScene(ScenePath, OpenSceneMode.Single);
            EnsureBuildSettings();
            EnsureTouchHud(scene);
            ApplyHudFinalPass(scene);
            ApplyCameraFinalPass(scene);
            ApplyRiverMarginPass(scene);
            EditorSceneManager.MarkSceneDirty(scene);
            EditorSceneManager.SaveScene(scene);

            var issues = CollectValidationIssues(scene);
            BuildReportSummary buildReport = null;

            if (issues.Count == 0)
            {
                buildReport = RunWebGLBuild();
            }

            File.WriteAllLines(ReportPath, BuildReport(issues, buildReport));
            AssetDatabase.Refresh();

            if (buildReport != null && buildReport.Succeeded)
            {
                Debug.Log("Rio Vivo T08 WebGL build concluido em " + BuildPath);
            }
        }

        private static void EnsureBuildSettings()
        {
            var scenes = EditorBuildSettings.scenes.ToList();
            EnsureBuildScene(scenes, HubScenePath);
            EnsureBuildScene(scenes, ScenePath);
            EditorBuildSettings.scenes = scenes.ToArray();

            PlayerSettings.WebGL.compressionFormat = WebGLCompressionFormat.Brotli;
            PlayerSettings.WebGL.dataCaching = true;
            PlayerSettings.runInBackground = false;
            PlayerSettings.defaultInterfaceOrientation = UIOrientation.LandscapeLeft;
        }

        private static void EnsureBuildScene(List<EditorBuildSettingsScene> scenes, string scenePath)
        {
            var index = scenes.FindIndex(item => item.path == scenePath);
            if (index >= 0)
            {
                scenes[index] = new EditorBuildSettingsScene(scenePath, true);
                return;
            }

            scenes.Add(new EditorBuildSettingsScene(scenePath, true));
        }

        private static void EnsureTouchHud(Scene scene)
        {
            var touchHud = FindComponentInScene<RioVivoTouchHUD>(scene);
            if (touchHud == null)
            {
                var canvas = FindGameObjectInScene(scene, "Canvas");
                if (canvas == null)
                {
                    return;
                }

                var root = CreatePanel(canvas.transform, "TouchHUD", new Vector2(360f, -150f), new Vector2(190f, 110f), new Color(0f, 0f, 0f, 0.18f));
                touchHud = root.AddComponent<RioVivoTouchHUD>();
                var buttonObject = CreateButton(root.transform, "Interagir", Vector2.zero, new Vector2(140f, 52f), null);
                var button = buttonObject.GetComponent<Button>();
                var canvasGroup = root.AddComponent<CanvasGroup>();
                SetReference(touchHud, "root", root);
                SetReference(touchHud, "interactButton", button);
                SetReference(touchHud, "canvasGroup", canvasGroup);
                root.SetActive(false);
            }
            else
            {
                var root = touchHud.gameObject;
                var button = root.transform.Find("Interagir")?.GetComponent<Button>();
                var canvasGroup = root.GetComponent<CanvasGroup>();
                if (canvasGroup == null)
                {
                    canvasGroup = root.AddComponent<CanvasGroup>();
                }

                SetReference(touchHud, "root", root);
                SetReference(touchHud, "interactButton", button);
                SetReference(touchHud, "canvasGroup", canvasGroup);

                var rect = root.GetComponent<RectTransform>();
                if (rect != null)
                {
                    rect.anchoredPosition = new Vector2(360f, -150f);
                    rect.sizeDelta = new Vector2(190f, 110f);
                }

                if (button != null)
                {
                    var buttonRect = button.GetComponent<RectTransform>();
                    if (buttonRect != null)
                    {
                        buttonRect.sizeDelta = new Vector2(140f, 52f);
                    }
                }
            }

            var player = FindComponentInScene<RioVivoPlayerController>(scene);
            if (player != null)
            {
                SetReference(player, "touchHud", touchHud);
            }

            var mobileAdapter = FindComponentInScene<RioVivoMobileInputAdapter>(scene);
            if (mobileAdapter != null)
            {
                SetReference(mobileAdapter, "touchHud", touchHud);
            }
        }

        private static void ApplyHudFinalPass(Scene scene)
        {
            var title = FindGameObjectInScene(scene, "GameTitle")?.GetComponent<Text>();
            var stats = FindGameObjectInScene(scene, "Stats")?.GetComponent<Text>();
            var objective = FindGameObjectInScene(scene, "ObjectiveText")?.GetComponent<Text>();
            var prompt = FindGameObjectInScene(scene, "PromptText")?.GetComponent<Text>();

            foreach (var text in new[] { title, stats, objective, prompt }.Where(item => item != null))
            {
                text.fontSize = Mathf.Max(text.fontSize, text == objective ? 24 : 26);
                text.color = new Color(0.07f, 0.1f, 0.12f, 1f);
            }

            if (stats != null)
            {
                var rect = stats.GetComponent<RectTransform>();
                rect.anchoredPosition = new Vector2(215f, -110f);
                rect.sizeDelta = new Vector2(320f, 150f);
                EnsurePanelBehind(rect, "T08_StatsBackdrop", new Vector2(390f, 170f), new Color(1f, 1f, 1f, 0.8f));
            }

            if (objective != null)
            {
                var rect = objective.GetComponent<RectTransform>();
                rect.anchoredPosition = new Vector2(0f, -54f);
                rect.sizeDelta = new Vector2(660f, 76f);
                objective.alignment = TextAnchor.MiddleCenter;
                EnsurePanelBehind(rect, "T08_ObjectiveBackdrop", new Vector2(710f, 90f), new Color(1f, 1f, 1f, 0.74f));
            }

            if (prompt != null)
            {
                var rect = prompt.GetComponent<RectTransform>();
                rect.anchoredPosition = new Vector2(0f, -300f);
                rect.sizeDelta = new Vector2(520f, 58f);
                prompt.alignment = TextAnchor.MiddleCenter;
                EnsurePanelBehind(rect, "T08_PromptBackdrop", new Vector2(560f, 68f), new Color(1f, 1f, 1f, 0.52f));
            }
        }

        private static void ApplyCameraFinalPass(Scene scene)
        {
            var cameraObject = FindGameObjectInScene(scene, "Main Camera");
            if (cameraObject == null)
            {
                return;
            }

            cameraObject.transform.position = new Vector3(-5.2f, 7.2f, 1.6f);
            cameraObject.transform.rotation = Quaternion.Euler(36f, 34f, 0f);

            var follow = cameraObject.GetComponent<RioVivoCameraFollow>();
            if (follow == null)
            {
                return;
            }

            SetVector3(follow, "offset", new Vector3(-7.2f, 6.9f, -9.4f));
            SetVector3(follow, "lookAtOffset", new Vector3(-1.8f, 0.55f, 5.8f));
            SetFloat(follow, "minX", -6.3f);
            SetFloat(follow, "maxX", 2.2f);
            SetFloat(follow, "minZ", -12.5f);
            SetFloat(follow, "maxZ", 12.5f);
        }

        private static void ApplyRiverMarginPass(Scene scene)
        {
            SetTransform(scene, "River", new Vector3(-0.1f, -0.48f, 0.4f), new Vector3(5.1f, 0.22f, 31f));
            SetTransform(scene, "LeftBank", new Vector3(-6.4f, -0.35f, 0.1f), new Vector3(11.2f, 0.8f, 34f));
            SetTransform(scene, "RightBank", new Vector3(5.9f, -0.35f, 0.1f), new Vector3(7.7f, 0.8f, 33f));

            var naturePass = FindGameObjectInScene(scene, "NaturePass");
            if (naturePass != null)
            {
                OffsetIfExists(naturePass.transform, "tree_default", new Vector3(-0.4f, 0f, 1.2f));
                OffsetIfExists(naturePass.transform, "rock_largeA", new Vector3(-0.5f, 0f, 0.5f));
                OffsetIfExists(naturePass.transform, "plant_bush", new Vector3(-0.2f, 0f, -0.6f));
            }
        }

        private static void OffsetIfExists(Transform parent, string childName, Vector3 offset)
        {
            foreach (Transform child in parent.GetComponentsInChildren<Transform>(true))
            {
                if (child.name.IndexOf(childName, StringComparison.OrdinalIgnoreCase) >= 0)
                {
                    child.position += offset;
                }
            }
        }

        private static void SetTransform(Scene scene, string objectName, Vector3 position, Vector3 scale)
        {
            var gameObject = FindGameObjectInScene(scene, objectName);
            if (gameObject == null)
            {
                return;
            }

            gameObject.transform.localPosition = position;
            gameObject.transform.localScale = scale;
        }

        private static List<string> CollectValidationIssues(Scene scene)
        {
            var issues = new List<string>();
            issues.AddRange(RioVivoSceneBuilder.CollectPolishedValidationIssues());
            scene = EditorSceneManager.OpenScene(ScenePath, OpenSceneMode.Single);

            RequireComponent<RioVivoTouchHUD>(scene, issues, "TouchHUD");
            RequireComponent<RioVivoHUD>(scene, issues, "HUD");
            RequireComponent<RioVivoPlayerController>(scene, issues, "Player");
            RequireComponent<RioVivoNPC>(scene, issues, "NPC");
            RequireComponent<RioVivoCameraFollow>(scene, issues, "Camera");
            RequireComponent<RioVivoGameManager>(scene, issues, "GameManager");
            RequireComponent<RioVivoResultPanel>(scene, issues, "Result panel");

            if (FindComponentsInScene<RioVivoTrashItem>(scene).Count < 8)
            {
                issues.Add("Expected 8 or more trash items.");
            }

            if (FindComponentsInScene<RioVivoRecoveryPoint>(scene).Count < 3)
            {
                issues.Add("Expected 3 recovery points.");
            }

            if (FindComponentsInScene<RioVivoObjectiveBeacon>(scene).Count < 1)
            {
                issues.Add("Missing objective beacons.");
            }

            ValidateTouchHudConnections(scene, issues);
            ValidateReturnToHub(scene, issues);
            ValidateMaterialsAndScripts(scene, issues);
            ValidateBuildSettings(issues);

            return issues.Distinct().ToList();
        }

        private static void ValidateTouchHudConnections(Scene scene, List<string> issues)
        {
            var touchHud = FindComponentInScene<RioVivoTouchHUD>(scene);
            if (touchHud == null)
            {
                return;
            }

            var so = new SerializedObject(touchHud);
            if (so.FindProperty("root")?.objectReferenceValue == null)
            {
                issues.Add("TouchHUD root reference is missing.");
            }

            if (so.FindProperty("interactButton")?.objectReferenceValue == null)
            {
                issues.Add("TouchHUD interact button reference is missing.");
            }

            if (so.FindProperty("canvasGroup")?.objectReferenceValue == null)
            {
                issues.Add("TouchHUD canvas group reference is missing.");
            }

            var player = FindComponentInScene<RioVivoPlayerController>(scene);
            if (player != null)
            {
                var playerSo = new SerializedObject(player);
                if (playerSo.FindProperty("touchHud")?.objectReferenceValue == null)
                {
                    issues.Add("Player touch HUD reference is missing.");
                }
            }

            var mobile = FindComponentInScene<RioVivoMobileInputAdapter>(scene);
            if (mobile != null)
            {
                var mobileSo = new SerializedObject(mobile);
                if (mobileSo.FindProperty("touchHud")?.objectReferenceValue == null)
                {
                    issues.Add("Mobile input adapter touch HUD reference is missing.");
                }
            }
        }

        private static void ValidateReturnToHub(Scene scene, List<string> issues)
        {
            var resultPanel = FindComponentInScene<RioVivoResultPanel>(scene);
            if (resultPanel == null)
            {
                return;
            }

            var button = FindButtonsInScene(scene)
                .FirstOrDefault(candidate => string.Equals(candidate.gameObject.name, "Voltar ao Hub", StringComparison.OrdinalIgnoreCase));
            if (button == null)
            {
                issues.Add("Missing 'Voltar ao Hub' button.");
            }
        }

        private static void ValidateMaterialsAndScripts(Scene scene, List<string> issues)
        {
            foreach (var root in scene.GetRootGameObjects())
            {
                foreach (var component in root.GetComponentsInChildren<Component>(true))
                {
                    if (component == null)
                    {
                        issues.Add("Missing script reference in scene.");
                        continue;
                    }

                    if (component is Renderer renderer)
                    {
                        foreach (var material in renderer.sharedMaterials.Where(item => item != null))
                        {
                            if (material.shader != null && material.shader.name == "Hidden/InternalErrorShader")
                            {
                                issues.Add("Error shader detected on " + renderer.name + ".");
                            }

                            if (material.HasProperty("_Color"))
                            {
                                var color = material.color;
                                if (Mathf.Abs(color.r - 1f) < 0.01f
                                    && Mathf.Abs(color.g) < 0.01f
                                    && Mathf.Abs(color.b - 1f) < 0.01f)
                                {
                                    issues.Add("Potential magenta material detected on " + renderer.name + ".");
                                }
                            }
                        }
                    }
                }
            }
        }

        private static void ValidateBuildSettings(List<string> issues)
        {
            if (!EditorBuildSettings.scenes.Any(item => item.path == HubScenePath && item.enabled))
            {
                issues.Add("Hub scene not enabled in Build Settings.");
            }

            if (!EditorBuildSettings.scenes.Any(item => item.path == ScenePath && item.enabled))
            {
                issues.Add("Rio Vivo scene not enabled in Build Settings.");
            }
        }

        private static BuildReportSummary RunWebGLBuild()
        {
            Directory.CreateDirectory(BuildPath);

            var options = new BuildPlayerOptions
            {
                scenes = EditorBuildSettings.scenes.Where(item => item.enabled).Select(item => item.path).ToArray(),
                locationPathName = BuildPath,
                target = BuildTarget.WebGL,
                options = BuildOptions.None
            };

            var report = BuildPipeline.BuildPlayer(options);
            var files = Directory.Exists(BuildPath)
                ? Directory.GetFiles(BuildPath, "*", SearchOption.AllDirectories)
                : Array.Empty<string>();
            var totalBytes = files.Select(path => new FileInfo(path).Length).Sum();

            return new BuildReportSummary
            {
                Succeeded = report.summary.result == BuildResult.Succeeded,
                Result = report.summary.result.ToString(),
                TotalBytes = totalBytes,
                FileCount = files.Length,
                ErrorCount = report.summary.totalErrors,
                WarningCount = report.summary.totalWarnings
            };
        }

        private static IEnumerable<string> BuildReport(List<string> issues, BuildReportSummary buildReport)
        {
            yield return "# TIJOLO 08 WebGL Finalizer Report";
            yield return string.Empty;
            yield return "Generated: " + DateTime.UtcNow.ToString("u");
            yield return string.Empty;
            yield return "## Diagnostico inicial";
            yield return "- O TouchHUD aparecia como pendencia no relatorio anterior, mas a causa raiz era o validador nao considerar objetos inativos.";
            yield return "- A cena ja continha TouchHUD, HUD, camera, player, NPC, beacons e fluxo principal, faltando fechamento de referencias, validacao final e tentativa de build WebGL.";
            yield return string.Empty;
            yield return "## Correcao do TouchHUD";
            yield return "- Validacao corrigida para procurar objetos inativos na cena.";
            yield return "- TouchHUD agora e reparado com CanvasGroup, root e botao Interagir vinculados.";
            yield return "- Referencias de PlayerController e MobileInputAdapter para o TouchHUD sao reatribuiveis pela ferramenta T08.";
            yield return string.Empty;
            yield return "## Ajustes de HUD";
            yield return "- Stats reforcados com backdrop maior e contraste melhor no canto superior esquerdo.";
            yield return "- Objetivo central reduzido em largura e reposicionado para nao ficar perdido no ceu.";
            yield return "- Prompt central ganhou fundo discreto para leitura melhor em resolucoes menores.";
            yield return string.Empty;
            yield return "## Ajustes de camera";
            yield return "- Camera lowered para mostrar menos ceu e mais chao, rio e personagem.";
            yield return "- Offset do follow refinado para leitura de diorama e menor dominancia do predio lateral.";
            yield return string.Empty;
            yield return "## Ajustes visuais finais";
            yield return "- Rio ganhou um pouco mais de presenca visual.";
            yield return "- Margens receberam ajuste de escala e leve redistribuicao de props existentes.";
            yield return "- Build Settings sao reforcados para manter Hub e Rio Vivo habilitados.";
            yield return string.Empty;
            yield return "## Validacao final";
            if (issues.Count == 0)
            {
                yield return "- TouchHUD presente e referenciado.";
                yield return "- HUD, player, NPC, camera, GameManager e painel de resultado presentes.";
                yield return "- 8 residuos ou mais e 3 pontos de recuperacao confirmados.";
                yield return "- Build Settings mantem Hub e Rio Vivo.";
                yield return "- Nao foram detectados missing scripts, error shaders ou material magenta pela validacao T08.";
            }
            else
            {
                foreach (var issue in issues)
                {
                    yield return "- " + issue;
                }
            }

            yield return string.Empty;
            yield return "## Resultado do build WebGL";
            if (buildReport == null)
            {
                yield return issues.Count == 0
                    ? "- Build nao foi executado nesta rodada."
                    : "- Build bloqueado por pendencias de validacao.";
            }
            else
            {
                yield return "- Resultado: " + buildReport.Result;
                yield return "- Arquivos gerados: " + buildReport.FileCount;
                yield return "- Tamanho total: " + buildReport.TotalBytes + " bytes";
                yield return "- Warnings: " + buildReport.WarningCount;
                yield return "- Errors: " + buildReport.ErrorCount;
            }

            yield return string.Empty;
            yield return "## Tamanho do build";
            yield return buildReport == null ? "- Nao disponivel." : "- " + buildReport.TotalBytes + " bytes em " + BuildPath;
            yield return string.Empty;
            yield return "## Erros encontrados";
            if (issues.Count == 0 && (buildReport == null || buildReport.ErrorCount == 0))
            {
                yield return "- Nenhum erro bloqueante detectado pela automacao T08.";
            }
            else
            {
                foreach (var issue in issues)
                {
                    yield return "- " + issue;
                }

                if (buildReport != null && buildReport.ErrorCount > 0)
                {
                    yield return "- Build WebGL retornou erros: " + buildReport.ErrorCount;
                }
            }

            yield return string.Empty;
            yield return "## Erros corrigidos";
            yield return "- Falso positivo de Missing TouchHUD no validador anterior.";
            yield return "- Referencias e visibilidade do TouchHUD preparadas para runtime mobile sem quebrar teclado desktop.";
            yield return "- Enquadramento de camera e legibilidade de HUD refinados para fechamento WebGL.";
            yield return string.Empty;
            yield return "## Pendencias";
            yield return "- Se a Unity estiver aberta em outra instancia, o build por linha de comando continua bloqueado.";
            yield return "- Recomenda-se ultimo conferimento visual em Play Mode para desktop e mobile horizontal.";
            yield return string.Empty;
            yield return "## Proximos passos";
            yield return "- Rodar o menu Apply T08, depois Validate T08 e por fim Build T08 WebGL Test no Editor principal.";
            yield return "- Se a validacao zerar, publicar ou revisar o build gerado em " + BuildPath + ".";
        }

        private static T FindComponentInScene<T>(Scene scene) where T : Component
        {
            return FindComponentsInScene<T>(scene).FirstOrDefault();
        }

        private static List<T> FindComponentsInScene<T>(Scene scene) where T : Component
        {
            var results = new List<T>();
            foreach (var root in scene.GetRootGameObjects())
            {
                results.AddRange(root.GetComponentsInChildren<T>(true));
            }

            return results;
        }

        private static List<Button> FindButtonsInScene(Scene scene)
        {
            var results = new List<Button>();
            foreach (var root in scene.GetRootGameObjects())
            {
                results.AddRange(root.GetComponentsInChildren<Button>(true));
            }

            return results;
        }

        private static GameObject FindGameObjectInScene(Scene scene, string objectName)
        {
            foreach (var root in scene.GetRootGameObjects())
            {
                foreach (var transform in root.GetComponentsInChildren<Transform>(true))
                {
                    if (transform.name == objectName)
                    {
                        return transform.gameObject;
                    }
                }
            }

            return null;
        }

        private static void RequireComponent<T>(Scene scene, List<string> issues, string label) where T : Component
        {
            if (FindComponentInScene<T>(scene) == null)
            {
                issues.Add("Missing " + label + " in scene.");
            }
        }

        private static void EnsurePanelBehind(RectTransform target, string panelName, Vector2 size, Color color)
        {
            var parent = target.parent;
            if (parent == null)
            {
                return;
            }

            var existing = parent.Find(panelName);
            GameObject panel;
            if (existing != null)
            {
                panel = existing.gameObject;
            }
            else
            {
                panel = new GameObject(panelName, typeof(RectTransform), typeof(Image));
                panel.transform.SetParent(parent, false);
                panel.transform.SetSiblingIndex(target.GetSiblingIndex());
            }

            var rect = panel.GetComponent<RectTransform>();
            rect.sizeDelta = size;
            rect.anchorMin = target.anchorMin;
            rect.anchorMax = target.anchorMax;
            rect.pivot = target.pivot;
            rect.anchoredPosition = target.anchoredPosition;

            var image = panel.GetComponent<Image>();
            image.color = color;
        }

        private static GameObject CreatePanel(Transform parent, string name, Vector2 position, Vector2 size, Color color)
        {
            var panelObject = new GameObject(name);
            panelObject.transform.SetParent(parent, false);
            var rect = panelObject.AddComponent<RectTransform>();
            rect.sizeDelta = size;
            rect.anchoredPosition = position;
            var image = panelObject.AddComponent<Image>();
            image.color = color;
            return panelObject;
        }

        private static GameObject CreateButton(Transform parent, string label, Vector2 position, Vector2 size, UnityEngine.Events.UnityAction onClick)
        {
            var buttonObject = new GameObject(label);
            buttonObject.transform.SetParent(parent, false);
            var rect = buttonObject.AddComponent<RectTransform>();
            rect.sizeDelta = size;
            rect.anchoredPosition = position;
            var image = buttonObject.AddComponent<Image>();
            image.color = new Color(0.12f, 0.46f, 0.28f, 0.95f);
            var button = buttonObject.AddComponent<Button>();
            button.targetGraphic = image;
            if (onClick != null)
            {
                button.onClick.AddListener(onClick);
            }

            var labelObject = new GameObject("Label");
            labelObject.transform.SetParent(buttonObject.transform, false);
            var labelRect = labelObject.AddComponent<RectTransform>();
            labelRect.sizeDelta = size;
            var text = labelObject.AddComponent<Text>();
            text.text = label;
            text.alignment = TextAnchor.MiddleCenter;
            text.font = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
            text.fontSize = 22;
            text.color = Color.white;
            return buttonObject;
        }

        private static void SetReference(UnityEngine.Object target, string propertyName, UnityEngine.Object reference)
        {
            var serializedObject = new SerializedObject(target);
            var property = serializedObject.FindProperty(propertyName);
            if (property == null)
            {
                return;
            }

            property.objectReferenceValue = reference;
            serializedObject.ApplyModifiedPropertiesWithoutUndo();
        }

        private static void SetVector3(UnityEngine.Object target, string propertyName, Vector3 value)
        {
            var serializedObject = new SerializedObject(target);
            var property = serializedObject.FindProperty(propertyName);
            if (property == null)
            {
                return;
            }

            property.vector3Value = value;
            serializedObject.ApplyModifiedPropertiesWithoutUndo();
        }

        private static void SetFloat(UnityEngine.Object target, string propertyName, float value)
        {
            var serializedObject = new SerializedObject(target);
            var property = serializedObject.FindProperty(propertyName);
            if (property == null)
            {
                return;
            }

            property.floatValue = value;
            serializedObject.ApplyModifiedPropertiesWithoutUndo();
        }

        private sealed class BuildReportSummary
        {
            public bool Succeeded;
            public string Result;
            public long TotalBytes;
            public int FileCount;
            public int ErrorCount;
            public int WarningCount;
        }
    }
}
#endif
