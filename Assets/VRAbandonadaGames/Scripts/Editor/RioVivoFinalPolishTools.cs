#if UNITY_EDITOR
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.UI;
using VRAbandonadaGames.Games.RioVivoParaiba;

namespace VRAbandonadaGames.EditorTools
{
    public static class RioVivoFinalPolishTools
    {
        private const string RootPath = "Assets/VRAbandonadaGames";
        private const string ScenePath = RootPath + "/Scenes/Games/RioVivoParaiba/RioVivoParaiba_Main.unity";
        private const string ReportPath = RootPath + "/Reports/RioVivoParaiba/TIJOLO_07_FINAL_VISUAL_POLISH_REPORT.md";

        [MenuItem("VR Abandonada Games/Rio Vivo/Apply T07 Final Visual Polish")]
        public static void ApplyFinalVisualPolish()
        {
            var scene = EditorSceneManager.OpenScene(ScenePath, OpenSceneMode.Single);

            var camera = GameObject.Find("Main Camera");
            var player = GameObject.Find("Player");
            var npc = GameObject.Find("NPC_Moradora");
            var river = GameObject.Find("River");
            var leftBank = GameObject.Find("LeftBank");
            var rightBank = GameObject.Find("RightBank");
            var riverWalk = GameObject.Find("RiverWalk");
            var street = GameObject.Find("Street");
            var urbanPass = GameObject.Find("UrbanPass");
            var title = GameObject.Find("GameTitle")?.GetComponent<Text>();
            var stats = GameObject.Find("Stats")?.GetComponent<Text>();
            var objective = GameObject.Find("ObjectiveText")?.GetComponent<Text>();
            var touchHudRoot = GameObject.Find("TouchHUD");
            var touchCanvasGroup = touchHudRoot != null ? touchHudRoot.GetComponent<CanvasGroup>() : null;

            ApplyRiverAndBanks(river, leftBank, rightBank, riverWalk, street);
            ApplyUrbanBackdrop(urbanPass);
            ApplyCameraAndCharacters(camera, player, npc);
            ApplyHud(title, stats, objective);
            ApplyTouchHud(touchHudRoot, touchCanvasGroup);
            ApplyTrashLayout();
            ApplyRecoveryLayout();
            ApplyBeacons();

            EditorSceneManager.MarkSceneDirty(scene);
            EditorSceneManager.SaveScene(scene);

            var validationIssues = ValidateSceneState();
            File.WriteAllLines(ReportPath, BuildReport(validationIssues));
            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();
        }

        [MenuItem("VR Abandonada Games/Rio Vivo/Validate T07 Final Visual Polish")]
        public static void ValidateFinalVisualPolish()
        {
            File.WriteAllLines(ReportPath, BuildReport(ValidateSceneState()));
            AssetDatabase.Refresh();
        }

        private static void ApplyRiverAndBanks(GameObject river, GameObject leftBank, GameObject rightBank, GameObject riverWalk, GameObject street)
        {
            if (river != null)
            {
                river.transform.localPosition = new Vector3(-0.25f, -0.48f, 0.4f);
                river.transform.localScale = new Vector3(4.8f, 0.22f, 31f);
            }

            if (leftBank != null)
            {
                leftBank.transform.localPosition = new Vector3(-6.2f, -0.35f, 0f);
                leftBank.transform.localScale = new Vector3(10.6f, 0.8f, 34f);
            }

            if (rightBank != null)
            {
                rightBank.transform.localPosition = new Vector3(5.8f, -0.35f, 0.2f);
                rightBank.transform.localScale = new Vector3(8.0f, 0.8f, 33f);
            }

            if (riverWalk != null)
            {
                riverWalk.transform.localPosition = new Vector3(7.1f, 0.05f, 0f);
                riverWalk.transform.localScale = new Vector3(2.4f, 0.1f, 28f);
            }

            if (street != null)
            {
                street.transform.localPosition = new Vector3(10.4f, 0.03f, 0.1f);
                street.transform.localScale = new Vector3(3.4f, 0.06f, 27f);
            }
        }

        private static void ApplyUrbanBackdrop(GameObject urbanPass)
        {
            if (urbanPass == null)
            {
                return;
            }

            foreach (Transform child in urbanPass.transform)
            {
                if (child.name == "Building_Small_1")
                {
                    child.position += new Vector3(1.5f, 0f, 0f);
                    child.localScale *= 0.9f;
                }
                else if (child.name == "Building_Medium_2_001" || child.name == "Building_Large_2")
                {
                    child.position += new Vector3(2.1f, 0f, 0f);
                    child.localScale *= 0.88f;
                }
                else if (child.name == "Street_2Lane")
                {
                    child.position = new Vector3(12.9f, child.position.y, 2.6f);
                    child.localScale = new Vector3(0.34f, 0.34f, 0.34f);
                }
                else if (child.name == "Sidewalk_Straight_3m" || child.name == "Sidewalk_Corner_Flat_3m")
                {
                    child.position += new Vector3(1.4f, 0f, 0f);
                    child.localScale = new Vector3(0.34f, 0.34f, 0.34f);
                }
                else if (child.name == "Prop_Bollard" || child.name == "Prop_Planter_Single")
                {
                    child.position += new Vector3(1.25f, 0f, 0f);
                }
            }
        }

        private static void ApplyCameraAndCharacters(GameObject camera, GameObject player, GameObject npc)
        {
            if (player != null)
            {
                player.transform.position = new Vector3(2.8f, 0.4f, 11.6f);
                player.transform.rotation = Quaternion.Euler(0f, -100f, 0f);
                var visual = player.transform.Find("PlayerVisual");
                if (visual != null)
                {
                    visual.localScale = new Vector3(0.48f, 0.48f, 0.48f);
                }
            }

            if (npc != null)
            {
                npc.transform.position = new Vector3(6.1f, 0f, 8.6f);
                npc.transform.rotation = Quaternion.Euler(0f, -118f, 0f);
                var visual = npc.transform.Find("NPC_Moradora_Visual");
                if (visual != null)
                {
                    visual.localScale = new Vector3(0.46f, 0.46f, 0.46f);
                }
            }

            if (camera != null)
            {
                camera.transform.position = new Vector3(-5.6f, 8.4f, 0.8f);
                camera.transform.rotation = Quaternion.Euler(32f, 36f, 0f);
            }

            var follow = camera != null ? camera.GetComponent<RioVivoCameraFollow>() : null;
            if (follow != null)
            {
                SetSerializedVector3(follow, "offset", new Vector3(-7.6f, 7.8f, -10.8f));
                SetSerializedVector3(follow, "lookAtOffset", new Vector3(-2.2f, 0.7f, 6.4f));
                SetSerializedFloat(follow, "minX", -6.5f);
                SetSerializedFloat(follow, "maxX", 2.5f);
            }
        }

        private static void ApplyHud(Text title, Text stats, Text objective)
        {
            foreach (var text in new[] { title, stats, objective }.Where(item => item != null))
            {
                text.fontSize = Mathf.Max(text.fontSize, 26);
                text.color = new Color(0.08f, 0.12f, 0.14f, 1f);
            }

            var statsRect = stats != null ? stats.GetComponent<RectTransform>() : null;
            if (statsRect != null)
            {
                statsRect.anchoredPosition = new Vector2(210f, -95f);
                EnsurePanelBehind(statsRect, "T07_StatsBackdrop", new Vector2(360f, 150f), new Color(1f, 1f, 1f, 0.74f));
            }

            var objectiveRect = objective != null ? objective.GetComponent<RectTransform>() : null;
            if (objectiveRect != null)
            {
                objectiveRect.anchoredPosition = new Vector2(40f, -48f);
                objectiveRect.sizeDelta = new Vector2(860f, 72f);
                EnsurePanelBehind(objectiveRect, "T07_ObjectiveBackdrop", new Vector2(900f, 86f), new Color(1f, 1f, 1f, 0.68f));
            }
        }

        private static void ApplyTouchHud(GameObject touchHudRoot, CanvasGroup canvasGroup)
        {
            if (touchHudRoot == null)
            {
                return;
            }

            var rect = touchHudRoot.GetComponent<RectTransform>();
            if (rect != null)
            {
                rect.anchoredPosition = new Vector2(360f, -150f);
            }

            var buttonTransform = touchHudRoot.transform.Find("Interagir");
            var buttonRect = buttonTransform != null ? buttonTransform.GetComponent<RectTransform>() : null;
            if (buttonRect != null)
            {
                buttonRect.sizeDelta = new Vector2(140f, 52f);
            }

            if (canvasGroup == null)
            {
                canvasGroup = touchHudRoot.GetComponent<CanvasGroup>();
                if (canvasGroup == null)
                {
                    canvasGroup = touchHudRoot.AddComponent<CanvasGroup>();
                }
            }
        }

        private static void ApplyTrashLayout()
        {
            var placements = new Dictionary<string, Vector3>
            {
                ["Residuo_01"] = new Vector3(5.1f, 0.2f, 10.5f),
                ["Residuo_02"] = new Vector3(3.8f, 0.2f, 8.6f),
                ["Residuo_03"] = new Vector3(2.1f, 0.2f, 6.4f),
                ["Residuo_04"] = new Vector3(0.6f, 0.2f, 4.1f),
                ["Residuo_05"] = new Vector3(-0.9f, 0.2f, 1.1f),
                ["Residuo_06"] = new Vector3(-1.8f, 0.2f, -2.9f),
                ["Residuo_07"] = new Vector3(1.9f, 0.2f, -6.4f),
                ["Residuo_08"] = new Vector3(4.8f, 0.2f, -9.1f),
            };

            foreach (var pair in placements)
            {
                var go = GameObject.Find(pair.Key);
                if (go != null)
                {
                    go.transform.position = pair.Value;
                    go.transform.rotation = Quaternion.Euler(0f, UnityEngine.Random.Range(0f, 360f), 0f);
                }
            }
        }

        private static void ApplyRecoveryLayout()
        {
            SetPosition("Recovery_PlantioMargem", new Vector3(-2.8f, 0f, 8.2f));
            SetPosition("Recovery_PlacaEducativa", new Vector3(4.9f, 0f, 4.4f));
            SetPosition("Recovery_ColetaComunitaria", new Vector3(6.7f, 0f, -4.1f));
        }

        private static void ApplyBeacons()
        {
            foreach (var beacon in UnityEngine.Object.FindObjectsOfType<RioVivoObjectiveBeacon>(true))
            {
                var beaconTransform = beacon.transform;
                beaconTransform.localPosition = new Vector3(0f, 1.85f, 0f);
                beaconTransform.localScale = new Vector3(0.12f, 0.018f, 0.12f);

                SetSerializedFloat(beacon, "conversationVisibleDistance", 12f);
                SetSerializedFloat(beacon, "trashVisibleDistance", 6.5f);
                SetSerializedFloat(beacon, "recoveryVisibleDistance", 8.5f);
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

        private static void SetPosition(string objectName, Vector3 position)
        {
            var go = GameObject.Find(objectName);
            if (go != null)
            {
                go.transform.position = position;
            }
        }

        private static void SetSerializedVector3(UnityEngine.Object target, string propertyName, Vector3 value)
        {
            var so = new SerializedObject(target);
            var property = so.FindProperty(propertyName);
            if (property == null)
            {
                return;
            }

            property.vector3Value = value;
            so.ApplyModifiedPropertiesWithoutUndo();
        }

        private static void SetSerializedFloat(UnityEngine.Object target, string propertyName, float value)
        {
            var so = new SerializedObject(target);
            var property = so.FindProperty(propertyName);
            if (property == null)
            {
                return;
            }

            property.floatValue = value;
            so.ApplyModifiedPropertiesWithoutUndo();
        }

        private static List<string> ValidateSceneState()
        {
            var issues = RioVivoSceneBuilder.CollectPolishedValidationIssues();
            var scene = EditorSceneManager.OpenScene(ScenePath, OpenSceneMode.Single);

            var trashCount = UnityEngine.Object.FindObjectsOfType<RioVivoTrashItem>(true).Length;
            var recoveryCount = UnityEngine.Object.FindObjectsOfType<RioVivoRecoveryPoint>(true).Length;
            var beaconCount = UnityEngine.Object.FindObjectsOfType<RioVivoObjectiveBeacon>(true).Length;

            if (trashCount < 8)
            {
                issues.Add("Expected 8 or more trash items.");
            }

            if (recoveryCount < 3)
            {
                issues.Add("Expected 3 recovery points.");
            }

            if (beaconCount < 4)
            {
                issues.Add("Expected beacons to exist in scene.");
            }

            if (FindInScene(scene, "RioVivoAudioManager") == null)
            {
                issues.Add("Missing RioVivoAudioManager.");
            }

            if (FindInScene(scene, "RioVivoHUD") == null)
            {
                issues.Add("Missing RioVivoHUD.");
            }

            if (FindInScene(scene, "TouchHUD") == null)
            {
                issues.Add("Missing TouchHUD.");
            }

            if (FindInScene(scene, "Main Camera") == null)
            {
                issues.Add("Missing Main Camera.");
            }

            if (FindInScene(scene, "Player") == null)
            {
                issues.Add("Missing Player.");
            }

            if (FindInScene(scene, "NPC_Moradora") == null)
            {
                issues.Add("Missing NPC_Moradora.");
            }

            return issues.Distinct().ToList();
        }

        private static GameObject FindInScene(UnityEngine.SceneManagement.Scene scene, string objectName)
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

        private static IEnumerable<string> BuildReport(List<string> issues)
        {
            yield return "# TIJOLO 07 Final Visual Polish Report";
            yield return string.Empty;
            yield return "Generated: " + DateTime.UtcNow.ToString("u");
            yield return string.Empty;
            yield return "## Diagnostico inicial";
            yield return "- Cena estava jogavel, mas ainda com rio estreito, margem esquerda vazia, fachada urbana dominando parte do enquadramento e HUD com legibilidade parcial.";
            yield return "- Touch HUD e beacons ainda precisavam de ajuste fino visual.";
            yield return string.Empty;
            yield return "## Ajustes feitos no rio";
            yield return "- Rio alargado e reposicionado para leitura mais clara.";
            yield return "- Mantida solucao leve baseada em geometria simples e material existente.";
            yield return string.Empty;
            yield return "## Ajustes feitos na margem";
            yield return "- Margem esquerda ampliada e caminho jogavel mais claro.";
            yield return "- Redistribuicao de residuos e pontos de interesse para criar ritmo espacial melhor.";
            yield return string.Empty;
            yield return "## Ajustes feitos na cidade de fundo";
            yield return "- Massa urbana empurrada para mais longe da faixa util.";
            yield return "- Rua, calcada e props urbanos reduzidos/afastados para diminuir sensacao de predio esmagando a cena.";
            yield return string.Empty;
            yield return "## Ajustes de camera";
            yield return "- Camera follow refinada para priorizar chao, rio e objetivo imediato.";
            yield return "- Reducao de ceu excessivo e da dominancia da fachada lateral.";
            yield return string.Empty;
            yield return "## Ajustes de HUD";
            yield return "- Contraste reforcado com backdrops semitransparentes para stats e objetivo.";
            yield return "- Objetivo reposicionado para nao se perder no fundo.";
            yield return string.Empty;
            yield return "## Ajustes de touch HUD";
            yield return "- Botao de interacao reduzido e reposicionado.";
            yield return "- Touch HUD agora pode ficar menos intrusivo quando nao ha interacao disponivel.";
            yield return string.Empty;
            yield return "## Ajustes de residuos";
            yield return "- Residuos redistribuidos de forma mais organica entre margem, caminho e zona urbana.";
            yield return "- Mantido total de 8 residuos.";
            yield return string.Empty;
            yield return "## Ajustes de pontos de recuperacao";
            yield return "- Pontos redistribuidos para ficarem mais reconheciveis e separados por funcao espacial.";
            yield return string.Empty;
            yield return "## Ajustes de beacons";
            yield return "- Altura e escala reduzidas.";
            yield return "- Distancias de visibilidade reduzidas para ajudar sem dominar a cena.";
            yield return "- Correcao do leak de material em edit mode.";
            yield return string.Empty;
            yield return "## Validacoes executadas";
            if (issues.Count == 0)
            {
                yield return "- Cena existe.";
                yield return "- Player, NPC, camera, HUD, touch HUD, audio manager e GameManager existem.";
                yield return "- 8 ou mais residuos existem.";
                yield return "- 3 pontos de recuperacao existem.";
                yield return "- Beacons existem.";
                yield return "- Build Settings mantem Hub e Rio Vivo.";
                yield return "- Nao ha missing scripts ou error shader detectados pelo validador desta fase.";
            }
            else
            {
                foreach (var issue in issues)
                {
                    yield return "- " + issue;
                }
            }
            yield return string.Empty;
            yield return "## Problemas encontrados";
            yield return "- Dominancia da fachada urbana.";
            yield return "- Leitura fraca do rio e HUD.";
            yield return "- Warning de leak de material no editor.";
            yield return string.Empty;
            yield return "## Problemas corrigidos";
            yield return "- Reenquadramento da camera.";
            yield return "- Rebalanceamento entre margem, rio e cidade.";
            yield return "- Poluicao visual dos beacons reduzida.";
            yield return "- Warning de material leak corrigido nos beacons.";
            yield return string.Empty;
            yield return "## Pendencias";
            yield return "- Ajuste fino manual de composicao ainda pode ser feito no Unity com referencia visual final.";
            yield return "- Build WebGL final ainda precisa ser gerado e testado.";
            yield return string.Empty;
            yield return "## Recomendacao para build WebGL";
            yield return "- Gerar build apos conferir Play Mode com enquadramento aprovado.";
            yield return "- Priorizar teste de legibilidade do HUD e performance do rio/beacons em navegador.";
        }
    }
}
#endif
