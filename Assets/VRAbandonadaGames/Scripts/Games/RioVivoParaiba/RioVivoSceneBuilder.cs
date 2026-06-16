#if UNITY_EDITOR
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;
using VRAbandonadaGames.Runtime;

namespace VRAbandonadaGames.Games.RioVivoParaiba
{
    public static class RioVivoSceneBuilder
    {
        private const string SceneFolder = "Assets/VRAbandonadaGames/Scenes/Games/RioVivoParaiba";
        private const string ScenePath = SceneFolder + "/RioVivoParaiba_Main.unity";
        private const string ScriptFolder = "Assets/VRAbandonadaGames/Scripts/Games/RioVivoParaiba";
        private const string PrefabFolder = "Assets/VRAbandonadaGames/Prefabs/Games/RioVivoParaiba";
        private const string DataFolder = "Assets/VRAbandonadaGames/Data/Games/RioVivoParaiba";
        private const string AudioFolder = "Assets/VRAbandonadaGames/Audio/RioVivoParaiba";
        private const string ExperienceAssetPath = DataFolder + "/RioVivoParaiba_Experience.asset";
        private const string ReportFolder = "Assets/VRAbandonadaGames/Reports/RioVivoParaiba";
        private const string ReportPath = ReportFolder + "/TIJOLO_05_RIO_VIVO_POLISH_REPORT.md";
        private const string ValidationPath = ReportFolder + "/RIO_VIVO_VALIDATION.md";
        private const string ImportedPrefabPath = "Assets/VRAbandonadaGames/Prefabs/Imported";
        private const string HubScenePath = "Assets/VRAbandonadaGames/Scenes/VRA_Games_PrototypeHub.unity";

        [MenuItem("VR Abandonada Games/Games/Rio Vivo Paraiba/Rebuild Main Scene")]
        public static void RebuildMainScene()
        {
            EnsureFolders();
            EnsureExperienceAsset();

            var scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);
            var camera = CreateMainCamera();
            CreateDirectionalLight();

            var environmentRoot = new GameObject("Environment");
            BuildGround(environmentRoot.transform);
            var river = BuildRiver(environmentRoot.transform);
            BuildBridgeAndRoad(environmentRoot.transform);
            BuildUrbanBackdrop(environmentRoot.transform);
            BuildNature(environmentRoot.transform);
            BuildGuidance(environmentRoot.transform);

            var gameplayRoot = new GameObject("Gameplay");
            var gameManager = new GameObject("RioVivoGameManager").AddComponent<RioVivoGameManager>();
            gameManager.transform.SetParent(gameplayRoot.transform, false);

            var audioManager = CreateAudioManager(gameplayRoot.transform);
            var mobileAdapter = new GameObject("RioVivoMobileInputAdapter").AddComponent<RioVivoMobileInputAdapter>();
            mobileAdapter.transform.SetParent(gameplayRoot.transform, false);

            var player = CreatePlayer(gameplayRoot.transform, gameManager);
            camera.GetComponent<RioVivoCameraFollow>().SetTarget(player.transform);

            CreateNpc(gameplayRoot.transform);
            CreateTrashItems(gameplayRoot.transform);
            CreateRecoveryPoints(gameplayRoot.transform);

            var uiRefs = CreateUi();
            AssignRuntimeReferences(gameManager, audioManager, uiRefs.Hud, uiRefs.ResultPanel, uiRefs.TouchHud, player.GetComponent<RioVivoPlayerController>(), mobileAdapter);

            EnsureSceneInBuildSettings();

            EditorSceneManager.SaveScene(scene, ScenePath);
            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();
        }

        [MenuItem("VR Abandonada Games/Games/Rio Vivo Paraiba/Validate Game Scene")]
        public static void ValidateGameScene()
        {
            WriteValidationReport(CollectPolishedValidationIssues());
        }

        [MenuItem("VR Abandonada Games/Games/Rio Vivo Paraiba/Validate Polished Game")]
        public static void ValidatePolishedGame()
        {
            WriteValidationReport(CollectPolishedValidationIssues());
        }

        [MenuItem("VR Abandonada Games/Games/Rio Vivo Paraiba/Generate Game Report")]
        public static void GenerateGameReport()
        {
            EnsureFolders();
            var issues = CollectPolishedValidationIssues();
            File.WriteAllLines(ReportPath, BuildPolishReport(issues));
            AssetDatabase.Refresh();
        }

        public static List<string> CollectPolishedValidationIssues()
        {
            var issues = new List<string>();
            if (!File.Exists(ScenePath))
            {
                issues.Add("Missing main scene: " + ScenePath);
                return issues;
            }

            var scene = EditorSceneManager.OpenScene(ScenePath, OpenSceneMode.Single);
            try
            {
                RequireObject<RioVivoGameManager>(scene, issues, "GameManager");
                RequireObject<RioVivoPlayerController>(scene, issues, "Player");
                RequireObject<RioVivoCameraFollow>(scene, issues, "Camera");
                RequireObject<RioVivoHUD>(scene, issues, "HUD");
                RequireObject<RioVivoResultPanel>(scene, issues, "Result panel");
                RequireObject<RioVivoAudioManager>(scene, issues, "Audio manager");
                RequireObject<RioVivoWaterAnimator>(scene, issues, "Water animator");
                RequireObject<RioVivoMobileInputAdapter>(scene, issues, "Mobile input adapter");
                RequireObject<RioVivoTouchHUD>(scene, issues, "Touch HUD");

                if (FindObjectsInScene<RioVivoTrashItem>(scene).Count < 8)
                {
                    issues.Add("Expected at least 8 trash items.");
                }

                if (FindObjectsInScene<RioVivoRecoveryPoint>(scene).Count < 3)
                {
                    issues.Add("Expected 3 recovery points.");
                }

                if (FindObjectsInScene<RioVivoNPC>(scene).Count < 1)
                {
                    issues.Add("Expected at least 1 NPC.");
                }

                foreach (var root in scene.GetRootGameObjects())
                {
                    foreach (var component in root.GetComponentsInChildren<Component>(true))
                    {
                        if (component == null)
                        {
                            issues.Add("Missing script reference in scene.");
                            break;
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
                                issues.Add("Error shader detected on renderer: " + renderer.name);
                            }
                        }
                    }
                }

                if (!EditorBuildSettings.scenes.Any(item => item.path == ScenePath && item.enabled))
                {
                    issues.Add("Rio Vivo scene not enabled in Build Settings.");
                }

                if (!EditorBuildSettings.scenes.Any(item => item.path == HubScenePath && item.enabled))
                {
                    issues.Add("Hub scene not enabled in Build Settings.");
                }

                if (!File.Exists("Assets/VRAbandonadaGames/Docs/WEBGL_BUILD_GUIDE.md"))
                {
                    issues.Add("Missing WEBGL_BUILD_GUIDE.md.");
                }

                if (!File.Exists("Assets/VRAbandonadaGames/Reports/WebGL/WEBGL_READINESS_REPORT.md"))
                {
                    issues.Add("Missing WEBGL_READINESS_REPORT.md.");
                }
            }
            finally
            {
                EditorSceneManager.SaveOpenScenes();
            }

            return issues.Distinct().ToList();
        }

        private static void EnsureFolders()
        {
            Directory.CreateDirectory(SceneFolder);
            Directory.CreateDirectory(ScriptFolder);
            Directory.CreateDirectory(PrefabFolder);
            Directory.CreateDirectory(DataFolder);
            Directory.CreateDirectory(AudioFolder);
            Directory.CreateDirectory(ReportFolder);
        }

        private static void EnsureExperienceAsset()
        {
            var asset = AssetDatabase.LoadAssetAtPath<GameExperienceDefinition>(ExperienceAssetPath);
            if (asset == null)
            {
                asset = ScriptableObject.CreateInstance<GameExperienceDefinition>();
                AssetDatabase.CreateAsset(asset, ExperienceAssetPath);
            }

            asset.experienceName = "Rio Vivo Paraiba";
            asset.description = "Mini-jogo educativo sobre recuperacao de margem urbana de rio.";
            asset.theme = "Meio ambiente, cidade e cuidado coletivo.";
            asset.mainScenePath = ScenePath;
            asset.gameType = GameExperienceType.Educational;
            asset.estimatedDuration = "3-5 min";
            asset.targetAudience = "Publico geral/redes sociais";
            asset.educationalMessage = "Cuidar do rio e cuidar da cidade.";
            asset.callToAction = "Organize sua comunidade para proteger rios, pracas e territorios.";
            asset.supportedPlatforms = new[]
            {
                SupportedPlatform.WebDesktop,
                SupportedPlatform.WebMobile,
                SupportedPlatform.Android
            };
            asset.status = GameExperienceStatus.Playable;
            EditorUtility.SetDirty(asset);
        }

        private static Camera CreateMainCamera()
        {
            var cameraObject = new GameObject("Main Camera");
            cameraObject.tag = "MainCamera";
            var camera = cameraObject.AddComponent<Camera>();
            camera.clearFlags = CameraClearFlags.SolidColor;
            camera.backgroundColor = new Color(0.67f, 0.82f, 0.90f, 1f);
            cameraObject.transform.position = new Vector3(0f, 14f, -12f);
            cameraObject.transform.rotation = Quaternion.Euler(47f, 0f, 0f);
            cameraObject.AddComponent<AudioListener>();
            var follow = cameraObject.AddComponent<RioVivoCameraFollow>();
            SetSerializedValue(follow, "offset", new Vector3(0f, 13f, -11f));
            return camera;
        }

        private static void CreateDirectionalLight()
        {
            var light = new GameObject("Directional Light");
            var lightComponent = light.AddComponent<Light>();
            lightComponent.type = LightType.Directional;
            lightComponent.intensity = 1.15f;
            lightComponent.color = new Color(1f, 0.96f, 0.88f, 1f);
            light.transform.rotation = Quaternion.Euler(42f, -28f, 0f);
        }

        private static void BuildGround(Transform parent)
        {
            CreatePrimitive(parent, "LeftBank", PrimitiveType.Cube, new Vector3(-5.2f, -0.35f, 0f), new Vector3(8.4f, 0.8f, 34f), "Grass004");
            CreatePrimitive(parent, "RightBank", PrimitiveType.Cube, new Vector3(5.4f, -0.35f, 0f), new Vector3(8.8f, 0.8f, 34f), "Ground037");
            CreatePrimitive(parent, "RiverWalk", PrimitiveType.Cube, new Vector3(7.2f, 0.05f, 0f), new Vector3(3f, 0.1f, 29f), "Concrete010");
            CreatePrimitive(parent, "Street", PrimitiveType.Cube, new Vector3(10.7f, 0.03f, 0f), new Vector3(4.5f, 0.06f, 29f), "Asphalt002");
        }

        private static GameObject BuildRiver(Transform parent)
        {
            var river = CreatePrimitive(parent, "River", PrimitiveType.Cube, new Vector3(0f, -0.48f, 0f), new Vector3(3.2f, 0.22f, 32f), null);
            var material = new Material(Shader.Find("Standard"));
            material.color = new Color(0.12f, 0.43f, 0.58f, 0.72f);
            material.SetFloat("_Glossiness", 0.85f);
            material.SetFloat("_Metallic", 0.05f);
            material.SetFloat("_Mode", 3f);
            material.SetInt("_SrcBlend", (int)UnityEngine.Rendering.BlendMode.SrcAlpha);
            material.SetInt("_DstBlend", (int)UnityEngine.Rendering.BlendMode.OneMinusSrcAlpha);
            material.SetInt("_ZWrite", 0);
            material.EnableKeyword("_ALPHABLEND_ON");
            material.renderQueue = 3000;
            river.GetComponent<Renderer>().sharedMaterial = material;
            river.AddComponent<RioVivoWaterAnimator>();
            return river;
        }

        private static void BuildBridgeAndRoad(Transform parent)
        {
            PlaceImportedPrefab(parent, "road-bridge", new Vector3(0f, 0.22f, -3f), Vector3.one * 2.2f);
            PlaceImportedPrefab(parent, "bridge-pillar", new Vector3(-2.4f, -0.45f, -3f), Vector3.one * 2f);
            PlaceImportedPrefab(parent, "bridge-pillar-wide", new Vector3(2.4f, -0.45f, -3f), Vector3.one * 2f);
            PlaceImportedPrefab(parent, "road-crossing", new Vector3(10.5f, 0.1f, 0f), Vector3.one * 2f);
            PlaceImportedPrefab(parent, "road-bend-sidewalk", new Vector3(10.5f, 0.1f, 8f), Vector3.one * 2f);
            PlaceImportedPrefab(parent, "light-square", new Vector3(8.8f, 0f, -7f), Vector3.one * 1.5f);
            PlaceImportedPrefab(parent, "light-square", new Vector3(8.8f, 0f, 7f), Vector3.one * 1.5f);
        }

        private static void BuildUrbanBackdrop(Transform parent)
        {
            PlaceImportedPrefab(parent, "building-a", new Vector3(13f, 0f, -11f), Vector3.one * 1.7f);
            PlaceImportedPrefab(parent, "building-c", new Vector3(13f, 0f, -4f), Vector3.one * 1.7f);
            PlaceImportedPrefab(parent, "building-e", new Vector3(13f, 0f, 3f), Vector3.one * 1.7f);
            PlaceImportedPrefab(parent, "building-h", new Vector3(13f, 0f, 10f), Vector3.one * 1.7f);
            PlaceImportedPrefab(parent, "building-skyscraper-a", new Vector3(17f, 0f, -1f), Vector3.one * 1.5f);
            PlaceImportedPrefab(parent, "building-skyscraper-b", new Vector3(18f, 0f, 8f), Vector3.one * 1.4f);
        }

        private static void BuildNature(Transform parent)
        {
            var placements = new[]
            {
                new Placement("tree_default", new Vector3(-7.8f, 0f, -11f), Vector3.one * 2f),
                new Placement("tree_small", new Vector3(-6.8f, 0f, -7f), Vector3.one * 1.9f),
                new Placement("plant_bush", new Vector3(-5.2f, 0f, -2f), Vector3.one * 1.8f),
                new Placement("tree_default", new Vector3(-7.4f, 0f, 4f), Vector3.one * 2f),
                new Placement("tree_small", new Vector3(-6.3f, 0f, 9f), Vector3.one * 1.8f),
                new Placement("rock_largeA", new Vector3(-3.6f, 0f, -8f), Vector3.one * 1.2f),
                new Placement("rock_largeA", new Vector3(-2.6f, 0f, 6f), Vector3.one * 1.1f),
                new Placement("plant_bush", new Vector3(-4.6f, 0f, 12f), Vector3.one * 1.4f),
                new Placement("bridge_stone", new Vector3(-4.5f, 0f, 1f), Vector3.one * 1.2f)
            };

            foreach (var placement in placements)
            {
                PlaceImportedPrefab(parent, placement.Name, placement.Position, placement.Scale);
            }
        }

        private static void BuildGuidance(Transform parent)
        {
            CreatePrimitive(parent, "StartMarker", PrimitiveType.Cylinder, new Vector3(8f, 0.05f, 10.8f), new Vector3(0.6f, 0.04f, 0.6f), null);
            CreatePrimitive(parent, "NpcMarker", PrimitiveType.Cylinder, new Vector3(6.4f, 0.05f, 11.8f), new Vector3(0.6f, 0.04f, 0.6f), null);
        }

        private static RioVivoAudioManager CreateAudioManager(Transform parent)
        {
            var root = new GameObject("RioVivoAudioManager");
            root.transform.SetParent(parent, false);
            var manager = root.AddComponent<RioVivoAudioManager>();

            var ambience = root.AddComponent<AudioSource>();
            ambience.playOnAwake = false;
            ambience.spatialBlend = 0f;

            var effects = root.AddComponent<AudioSource>();
            effects.playOnAwake = false;
            effects.spatialBlend = 0f;

            SetSerializedReference(manager, "ambienceSource", ambience);
            SetSerializedReference(manager, "effectsSource", effects);
            SetSerializedReference(manager, "riverAmbienceClip", LoadClip("river_ambience_generated"));
            SetSerializedReference(manager, "urbanAmbienceClip", LoadClip("urban_ambience_generated"));
            SetSerializedReference(manager, "collectClip", LoadClip("collect_generated"));
            SetSerializedReference(manager, "recoveryClip", LoadClip("recovery_generated"));
            SetSerializedReference(manager, "victoryClip", LoadClip("victory_generated"));
            return manager;
        }

        private static GameObject CreatePlayer(Transform parent, RioVivoGameManager gameManager)
        {
            var playerRoot = new GameObject("Player");
            playerRoot.transform.SetParent(parent, false);
            playerRoot.transform.position = new Vector3(8f, 0.4f, 10f);

            var controller = playerRoot.AddComponent<CharacterController>();
            controller.center = new Vector3(0f, 0.9f, 0f);
            controller.height = 1.8f;
            controller.radius = 0.35f;

            var playerController = playerRoot.AddComponent<RioVivoPlayerController>();
            SetSerializedReference(playerController, "gameManager", gameManager);

            var visual = InstantiateImportedPrefab("characterMedium");
            if (visual != null)
            {
                visual.name = "PlayerVisual";
                visual.transform.SetParent(playerRoot.transform, false);
                visual.transform.localScale = Vector3.one;
            }

            return playerRoot;
        }

        private static void CreateNpc(Transform parent)
        {
            var npcRoot = new GameObject("NPC_Moradora");
            npcRoot.transform.SetParent(parent, false);
            npcRoot.transform.position = new Vector3(6.4f, 0f, 11f);
            npcRoot.AddComponent<SphereCollider>().radius = 1f;
            npcRoot.AddComponent<RioVivoNPC>();

            var visual = InstantiateImportedPrefab("characterMedium");
            if (visual != null)
            {
                visual.transform.SetParent(npcRoot.transform, false);
                visual.transform.localScale = Vector3.one;
                var indicator = CreateIndicator(npcRoot.transform, new Vector3(0f, 2.5f, 0f), "Fale");
                AttachHighlighter(npcRoot, indicator);
            }
        }

        private static void CreateTrashItems(Transform parent)
        {
            var positions = new[]
            {
                new Vector3(6.2f, 0.2f, 8.5f),
                new Vector3(4.5f, 0.2f, 5.8f),
                new Vector3(2.5f, 0.2f, 8.7f),
                new Vector3(-1.5f, 0.2f, 6.1f),
                new Vector3(-3.4f, 0.2f, 1.3f),
                new Vector3(-2.7f, 0.2f, -4.8f),
                new Vector3(3.4f, 0.2f, -8.5f),
                new Vector3(5.7f, 0.2f, -10.4f)
            };

            for (var index = 0; index < positions.Length; index++)
            {
                var item = new GameObject("Residuo_" + (index + 1).ToString("00"));
                item.transform.SetParent(parent, false);
                item.transform.position = positions[index];
                item.AddComponent<BoxCollider>().size = new Vector3(0.9f, 0.6f, 0.9f);
                item.AddComponent<RioVivoTrashItem>();
                item.AddComponent<RioVivoFeedbackFX>();

                var visual = GameObject.CreatePrimitive(index % 2 == 0 ? PrimitiveType.Cube : PrimitiveType.Cylinder);
                visual.name = "Residuo urbano generico";
                visual.transform.SetParent(item.transform, false);
                visual.transform.localPosition = new Vector3(0f, 0.2f, 0f);
                visual.transform.localScale = index % 2 == 0 ? new Vector3(0.45f, 0.28f, 0.35f) : new Vector3(0.25f, 0.35f, 0.25f);
                ApplyColor(visual, index % 3 == 0 ? new Color(0.15f, 0.50f, 0.20f) : new Color(0.70f, 0.70f, 0.75f));
                var indicator = CreateIndicator(item.transform, new Vector3(0f, 1f, 0f), "E");
                AttachHighlighter(item, indicator);
            }
        }

        private static void CreateRecoveryPoints(Transform parent)
        {
            CreatePlantingPoint(parent, new Vector3(-6.3f, 0f, -9.5f));
            CreateEducationalPoint(parent, new Vector3(6.4f, 0f, -0.4f));
            CreateCollectionPoint(parent, new Vector3(7.7f, 0f, 8.4f));
        }

        private static void CreatePlantingPoint(Transform parent, Vector3 position)
        {
            var root = new GameObject("Recovery_PlantioMargem");
            root.transform.SetParent(parent, false);
            root.transform.position = position;
            root.AddComponent<SphereCollider>().radius = 1.2f;
            root.AddComponent<RioVivoFeedbackFX>();
            var recovery = root.AddComponent<RioVivoRecoveryPoint>();
            SetEnumField(recovery, "recoveryType", RioVivoRecoveryType.RiverbankPlanting);

            var inactive = CreatePrimitive(root.transform, "SoloCompactado", PrimitiveType.Cube, new Vector3(0f, 0.05f, 0f), new Vector3(1.8f, 0.1f, 1.8f), "Ground037");
            var active = new GameObject("PlantioAtivo");
            active.transform.SetParent(root.transform, false);
            active.SetActive(false);
            PlaceImportedPrefab(active.transform, "tree_small", Vector3.zero, Vector3.one * 1.5f);
            SetSerializedReference(recovery, "inactiveVisual", inactive);
            SetSerializedReference(recovery, "activeVisual", active);
            var indicator = CreateIndicator(root.transform, new Vector3(0f, 1.6f, 0f), "Plantio");
            AttachHighlighter(root, indicator);
        }

        private static void CreateEducationalPoint(Transform parent, Vector3 position)
        {
            var root = new GameObject("Recovery_PlacaEducativa");
            root.transform.SetParent(parent, false);
            root.transform.position = position;
            root.AddComponent<SphereCollider>().radius = 1.2f;
            root.AddComponent<RioVivoFeedbackFX>();
            var recovery = root.AddComponent<RioVivoRecoveryPoint>();
            SetEnumField(recovery, "recoveryType", RioVivoRecoveryType.EducationalSign);

            var inactive = CreatePrimitive(root.transform, "PosteSemPlaca", PrimitiveType.Cube, new Vector3(0f, 0.8f, 0f), new Vector3(0.2f, 1.6f, 0.2f), "Rust004");
            var active = new GameObject("PlacaAtiva");
            active.transform.SetParent(root.transform, false);
            active.SetActive(false);
            CreatePrimitive(active.transform, "Poste", PrimitiveType.Cube, new Vector3(0f, 0.8f, 0f), new Vector3(0.2f, 1.6f, 0.2f), "Rust004");
            CreatePrimitive(active.transform, "Placa", PrimitiveType.Cube, new Vector3(0f, 1.6f, 0f), new Vector3(1.2f, 0.7f, 0.08f), "Concrete010");
            SetSerializedReference(recovery, "inactiveVisual", inactive);
            SetSerializedReference(recovery, "activeVisual", active);
            var indicator = CreateIndicator(root.transform, new Vector3(0f, 2.2f, 0f), "Placa");
            AttachHighlighter(root, indicator);
        }

        private static void CreateCollectionPoint(Transform parent, Vector3 position)
        {
            var root = new GameObject("Recovery_ColetaComunitaria");
            root.transform.SetParent(parent, false);
            root.transform.position = position;
            root.AddComponent<SphereCollider>().radius = 1.2f;
            root.AddComponent<RioVivoFeedbackFX>();
            var recovery = root.AddComponent<RioVivoRecoveryPoint>();
            SetEnumField(recovery, "recoveryType", RioVivoRecoveryType.CommunityCollectionPoint);

            var inactive = CreatePrimitive(root.transform, "BaseColeta", PrimitiveType.Cube, new Vector3(0f, 0.25f, 0f), new Vector3(1.1f, 0.5f, 1.1f), "Concrete010");
            var active = new GameObject("ColetaAtiva");
            active.transform.SetParent(root.transform, false);
            active.SetActive(false);
            CreatePrimitive(active.transform, "Container", PrimitiveType.Cube, new Vector3(0f, 0.6f, 0f), new Vector3(1.2f, 1.2f, 1.2f), "Rust004");
            SetSerializedReference(recovery, "inactiveVisual", inactive);
            SetSerializedReference(recovery, "activeVisual", active);
            var indicator = CreateIndicator(root.transform, new Vector3(0f, 1.9f, 0f), "Coleta");
            AttachHighlighter(root, indicator);
        }

        private static UiReferences CreateUi()
        {
            var canvasObject = new GameObject("Canvas");
            var canvas = canvasObject.AddComponent<Canvas>();
            canvas.renderMode = RenderMode.ScreenSpaceOverlay;
            var scaler = canvasObject.AddComponent<CanvasScaler>();
            scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
            scaler.referenceResolution = new Vector2(1920f, 1080f);
            canvasObject.AddComponent<GraphicRaycaster>();

            var eventSystem = new GameObject("EventSystem");
            eventSystem.AddComponent<UnityEngine.EventSystems.EventSystem>();
            eventSystem.AddComponent<UnityEngine.EventSystems.StandaloneInputModule>();

            var hudRoot = new GameObject("RioVivoHUD");
            hudRoot.transform.SetParent(canvasObject.transform, false);
            var hud = hudRoot.AddComponent<RioVivoHUD>();

            var title = CreateText(hudRoot.transform, "GameTitle", "Rio Vivo Paraiba", new Vector2(-730f, 470f), new Vector2(500f, 50f), 32, TextAnchor.MiddleLeft);
            var trash = CreateText(hudRoot.transform, "TrashText", "Residuos: 0/8", new Vector2(-730f, 420f), new Vector2(450f, 40f), 24, TextAnchor.MiddleLeft);
            var recovery = CreateText(hudRoot.transform, "RecoveryText", "Pontos recuperados: 0/3", new Vector2(-730f, 380f), new Vector2(450f, 40f), 24, TextAnchor.MiddleLeft);
            var health = CreateText(hudRoot.transform, "HealthText", "Saude do rio: 30%", new Vector2(-730f, 340f), new Vector2(450f, 40f), 24, TextAnchor.MiddleLeft);
            var objective = CreateText(hudRoot.transform, "ObjectiveText", "Objetivo", new Vector2(0f, 470f), new Vector2(980f, 50f), 28, TextAnchor.MiddleCenter);
            var prompt = CreateText(hudRoot.transform, "PromptText", "Use E para interagir.", new Vector2(0f, -470f), new Vector2(980f, 45f), 22, TextAnchor.MiddleCenter);
            var tempMessage = CreateText(hudRoot.transform, "TemporaryMessage", string.Empty, new Vector2(0f, 405f), new Vector2(1000f, 45f), 24, TextAnchor.MiddleCenter);
            tempMessage.gameObject.SetActive(false);

            var dialoguePanel = CreatePanel(canvasObject.transform, "DialoguePanel", new Vector2(0f, -300f), new Vector2(980f, 190f), new Color(0f, 0f, 0f, 0.72f));
            dialoguePanel.SetActive(false);
            var dialogueSpeaker = CreateText(dialoguePanel.transform, "Speaker", "Moradora", new Vector2(0f, 45f), new Vector2(900f, 35f), 28, TextAnchor.MiddleCenter);
            var dialogueBody = CreateText(dialoguePanel.transform, "Body", string.Empty, new Vector2(0f, -20f), new Vector2(900f, 90f), 24, TextAnchor.MiddleCenter);

            var resultPanel = CreateResultPanel(canvasObject.transform);
            var touchHud = CreateTouchHud(canvasObject.transform);

            SetSerializedReference(hud, "gameTitleText", title);
            SetSerializedReference(hud, "trashCountText", trash);
            SetSerializedReference(hud, "recoveryCountText", recovery);
            SetSerializedReference(hud, "riverHealthText", health);
            SetSerializedReference(hud, "objectiveText", objective);
            SetSerializedReference(hud, "promptText", prompt);
            SetSerializedReference(hud, "temporaryMessageText", tempMessage);
            SetSerializedReference(hud, "dialoguePanel", dialoguePanel);
            SetSerializedReference(hud, "dialogueSpeakerText", dialogueSpeaker);
            SetSerializedReference(hud, "dialogueBodyText", dialogueBody);

            return new UiReferences { Hud = hud, ResultPanel = resultPanel, TouchHud = touchHud };
        }

        private static RioVivoResultPanel CreateResultPanel(Transform parent)
        {
            var panel = CreatePanel(parent, "ResultPanel", Vector2.zero, new Vector2(980f, 520f), new Color(1f, 1f, 1f, 0.94f));
            var resultPanel = panel.AddComponent<RioVivoResultPanel>();
            var title = CreateText(panel.transform, "Title", "Rio Vivo Paraiba", new Vector2(0f, 200f), new Vector2(800f, 50f), 34, TextAnchor.MiddleCenter);
            var body = CreateText(panel.transform, "Body", "Voce ajudou a recuperar a margem do rio.", new Vector2(0f, 145f), new Vector2(860f, 60f), 26, TextAnchor.MiddleCenter);
            var stats = CreateText(panel.transform, "Stats", string.Empty, new Vector2(0f, 70f), new Vector2(860f, 100f), 24, TextAnchor.MiddleCenter);
            var share = CreateText(panel.transform, "ShareText", string.Empty, new Vector2(0f, -40f), new Vector2(860f, 120f), 22, TextAnchor.MiddleCenter);
            CreateButton(panel.transform, "Copiar texto", new Vector2(-220f, -200f), new Vector2(220f, 55f), resultPanel.CopyShareText);
            CreateButton(panel.transform, "Voltar ao Hub", new Vector2(0f, -200f), new Vector2(220f, 55f), resultPanel.ReturnToHub);
            CreateButton(panel.transform, "Jogar novamente", new Vector2(220f, -200f), new Vector2(220f, 55f), resultPanel.RestartGame);
            panel.SetActive(false);

            SetSerializedReference(resultPanel, "panelRoot", panel);
            SetSerializedReference(resultPanel, "titleText", title);
            SetSerializedReference(resultPanel, "bodyText", body);
            SetSerializedReference(resultPanel, "statsText", stats);
            SetSerializedReference(resultPanel, "shareText", share);
            return resultPanel;
        }

        private static RioVivoTouchHUD CreateTouchHud(Transform parent)
        {
            var root = CreatePanel(parent, "TouchHUD", new Vector2(760f, -390f), new Vector2(260f, 180f), new Color(0f, 0f, 0f, 0.22f));
            var touchHud = root.AddComponent<RioVivoTouchHUD>();
            var buttonObject = CreateButton(root.transform, "Interagir", Vector2.zero, new Vector2(180f, 60f), null);
            var button = buttonObject.GetComponent<Button>();
            SetSerializedReference(touchHud, "root", root);
            SetSerializedReference(touchHud, "interactButton", button);
            root.SetActive(false);
            return touchHud;
        }

        private static void AssignRuntimeReferences(
            RioVivoGameManager gameManager,
            RioVivoAudioManager audioManager,
            RioVivoHUD hud,
            RioVivoResultPanel resultPanel,
            RioVivoTouchHUD touchHud,
            RioVivoPlayerController playerController,
            RioVivoMobileInputAdapter mobileAdapter)
        {
            SetSerializedReference(gameManager, "hud", hud);
            SetSerializedReference(gameManager, "resultPanel", resultPanel);
            SetSerializedReference(gameManager, "audioManager", audioManager);
            SetSerializedReference(playerController, "hud", hud);
            SetSerializedReference(playerController, "touchHud", touchHud);
            SetSerializedReference(mobileAdapter, "touchHud", touchHud);
        }

        private static void EnsureSceneInBuildSettings()
        {
            var scenes = EditorBuildSettings.scenes.ToList();
            AddOrEnableBuildScene(scenes, HubScenePath);
            AddOrEnableBuildScene(scenes, ScenePath);
            EditorBuildSettings.scenes = scenes.ToArray();
        }

        private static void AddOrEnableBuildScene(List<EditorBuildSettingsScene> scenes, string scenePath)
        {
            var index = scenes.FindIndex(item => item.path == scenePath);
            if (index >= 0)
            {
                scenes[index] = new EditorBuildSettingsScene(scenePath, true);
            }
            else
            {
                scenes.Add(new EditorBuildSettingsScene(scenePath, true));
            }
        }

        private static void WriteValidationReport(List<string> issues)
        {
            Directory.CreateDirectory(ReportFolder);
            File.WriteAllLines(ValidationPath, BuildValidationLines(issues));
            AssetDatabase.Refresh();
        }

        private static IEnumerable<string> BuildValidationLines(List<string> issues)
        {
            var lines = new List<string>
            {
                "# Rio Vivo Paraiba Validation",
                string.Empty,
                "Generated: " + DateTime.UtcNow.ToString("u"),
                string.Empty,
                "## Summary",
                issues.Count == 0 ? "- Validation passed." : "- Validation found issues.",
                string.Empty,
                "## Details"
            };

            if (issues.Count == 0)
            {
                lines.Add("- Scene, player, camera, HUD, result panel and GameManager exist.");
                lines.Add("- Audio manager, water animator and mobile adapter exist.");
                lines.Add("- Trash items: 8 or more confirmed.");
                lines.Add("- Recovery points: 3 confirmed.");
                lines.Add("- NPC count: at least 1 confirmed.");
                lines.Add("- Build Settings include hub and Rio Vivo Paraiba scene.");
                lines.Add("- No missing scripts or error shaders found.");
            }
            else
            {
                lines.AddRange(issues.Select(issue => "- " + issue));
            }

            return lines;
        }

        private static IEnumerable<string> BuildPolishReport(List<string> issues)
        {
            var lines = new List<string>
            {
                "# TIJOLO 05 Rio Vivo Polish Report",
                string.Empty,
                "Generated: " + DateTime.UtcNow.ToString("u"),
                string.Empty,
                "## Diagnostico inicial",
                "- Cena RioVivoParaiba_Main existia, compilava e ja tinha fluxo jogavel.",
                "- Build Settings ja continham hub e Rio Vivo Paraiba.",
                "- Pendencias do Tijolo 04: audio ausente, agua simples, feedback visual minimo, hub sem loading refinado e mobile/WebGL sem preparo.",
                string.Empty,
                "## Melhorias visuais aplicadas",
                "- Agua com material mais polido e animacao leve de cor/UV.",
                "- Mais vegetacao, pedras, postes, predios e marcadores de orientacao.",
                "- Highlight de objetos interagiveis com indicador visual.",
                "- Feedback de pulso em coleta e recuperacao.",
                string.Empty,
                "## Agua implementada",
                "- Script " + ScriptFolder + "/RioVivoWaterAnimator.cs",
                "- Material runtime translucido, brilho suave e animacao leve compativel com Built-in RP/WebGL.",
                string.Empty,
                "## Audios pesquisados",
                "- Pixabay river ambience, flowing river e city ambience pesquisados com licenca explicita exibida no navegador.",
                "- Download automatizado direto foi recusado por protecao anti-bot/Cloudflare no ambiente de shell.",
                string.Empty,
                "## Audios baixados",
                "- Nenhum terceiro foi baixado neste tijolo por restricao de automacao auditavel.",
                "- Foram gerados clipes originais locais para ambiente e feedback, sem dependencia de licenca externa.",
                string.Empty,
                "## Licencas de audio",
                "- Clipes gerados localmente neste workspace: uso proprio do projeto, sem atribuicao externa.",
                "- Fontes pesquisadas no navegador: Pixabay Content License como referencia de pesquisa, sem ingestao automatica.",
                string.Empty,
                "## Assets recusados",
                "- Downloads diretos de Pixabay recusados nesta etapa por bloqueio anti-bot no shell e ausencia de fluxo confiavel de rastreabilidade automatica no workspace.",
                string.Empty,
                "## Scripts criados",
                "- " + ScriptFolder + "/RioVivoWaterAnimator.cs",
                "- " + ScriptFolder + "/RioVivoAudioManager.cs",
                "- " + ScriptFolder + "/RioVivoInteractionHighlighter.cs",
                "- " + ScriptFolder + "/RioVivoFeedbackFX.cs",
                "- " + ScriptFolder + "/RioVivoMobileInputAdapter.cs",
                "- " + ScriptFolder + "/RioVivoTouchHUD.cs",
                "- Assets/VRAbandonadaGames/Scripts/Runtime/VRAHubSceneLoader.cs",
                "- Assets/VRAbandonadaGames/Scripts/Editor/WebGLBuildPrep.cs",
                string.Empty,
                "## Scripts modificados",
                "- " + ScriptFolder + "/RioVivoSceneBuilder.cs",
                "- " + ScriptFolder + "/RioVivoGameManager.cs",
                "- " + ScriptFolder + "/RioVivoPlayerController.cs",
                "- " + ScriptFolder + "/RioVivoInteractable.cs",
                "- " + ScriptFolder + "/RioVivoTrashItem.cs",
                "- " + ScriptFolder + "/RioVivoRecoveryPoint.cs",
                "- Assets/VRAbandonadaGames/Scripts/Editor/PrototypeHubSceneBootstrap.cs",
                string.Empty,
                "## Integracao com Hub",
                "- Botao Rio Vivo Paraiba no hub passa a carregar a cena jogavel via VRAHubSceneLoader.",
                "- Botao Voltar ao Hub no resultado continua retornando para a cena hub.",
                string.Empty,
                "## Preparacao WebGL",
                "- Menu VR Abandonada Games > Build > Prepare WebGL Settings criado.",
                "- Relatorio de prontidao WebGL gerado em Assets/VRAbandonadaGames/Reports/WebGL/WEBGL_READINESS_REPORT.md.",
                "- Guia de build WebGL documentado.",
                string.Empty,
                "## Preparacao mobile",
                "- Adapter de deteccao mobile criado.",
                "- Touch HUD com botao de interacao criado sem quebrar teclado desktop.",
                string.Empty,
                "## Validacoes executadas"
            };

            lines.AddRange(BuildValidationLines(issues).Skip(4));
            lines.Add(string.Empty);
            lines.Add("## Erros encontrados");
            lines.Add(issues.Count == 0 ? "- Nenhum erro impeditivo apos o polish." : string.Empty);
            lines.AddRange(issues.Count == 0 ? Array.Empty<string>() : issues.Select(issue => "- " + issue));
            lines.Add(string.Empty);
            lines.Add("## Erros corrigidos");
            lines.Add("- Hub refinado para carregar o jogo.");
            lines.Add("- Agua simples substituida por solucao mais viva e leve.");
            lines.Add("- Feedback de interacao, audio e mobile touch adicionados.");
            lines.Add(string.Empty);
            lines.Add("## Pendencias");
            lines.Add("- Personagens ainda usam placeholder visual.");
            lines.Add("- Os audios atuais sao clipes originais gerados localmente e podem ser trocados depois por field recordings/CC0 mais ricos.");
            lines.Add("- Joystick virtual ainda e placeholder estrutural; apenas o botao de interacao touch foi preparado.");
            lines.Add(string.Empty);
            lines.Add("## Proximo prompt recomendado");
            lines.Add("`Tijolo 06 — Build WebGL jogavel: gerar build para navegador, testar tamanho, carregamento, cena inicial, bugs e preparar publicacao.`");

            return lines;
        }

        private static T RequireObject<T>(Scene scene, List<string> issues, string label) where T : Component
        {
            var found = FindObjectsInScene<T>(scene).FirstOrDefault();
            if (found == null)
            {
                issues.Add("Missing " + label + " in scene.");
            }

            return found;
        }

        private static List<T> FindObjectsInScene<T>(Scene scene) where T : Component
        {
            var results = new List<T>();
            foreach (var root in scene.GetRootGameObjects())
            {
                results.AddRange(root.GetComponentsInChildren<T>(true));
            }

            return results;
        }

        private static GameObject CreatePrimitive(Transform parent, string name, PrimitiveType primitiveType, Vector3 position, Vector3 scale, string materialContainsName)
        {
            var gameObject = GameObject.CreatePrimitive(primitiveType);
            gameObject.name = name;
            gameObject.transform.SetParent(parent, false);
            gameObject.transform.localPosition = position;
            gameObject.transform.localScale = scale;
            if (!string.IsNullOrEmpty(materialContainsName))
            {
                ApplyImportedMaterial(gameObject, materialContainsName);
            }

            return gameObject;
        }

        private static void PlaceImportedPrefab(Transform parent, string containsName, Vector3 position, Vector3 scale)
        {
            var instance = InstantiateImportedPrefab(containsName);
            if (instance == null)
            {
                return;
            }

            instance.transform.SetParent(parent, false);
            instance.transform.localPosition = position;
            instance.transform.localScale = scale;
        }

        private static GameObject InstantiateImportedPrefab(string containsName)
        {
            var prefabPath = AssetDatabase.FindAssets("t:Prefab", new[] { ImportedPrefabPath })
                .Select(AssetDatabase.GUIDToAssetPath)
                .FirstOrDefault(path => Path.GetFileNameWithoutExtension(path).IndexOf(containsName, StringComparison.OrdinalIgnoreCase) >= 0);

            if (string.IsNullOrEmpty(prefabPath))
            {
                return null;
            }

            var prefab = AssetDatabase.LoadAssetAtPath<GameObject>(prefabPath);
            return prefab == null ? null : PrefabUtility.InstantiatePrefab(prefab) as GameObject;
        }

        private static void ApplyImportedMaterial(GameObject target, string containsName)
        {
            var materialPath = AssetDatabase.FindAssets("t:Material", new[] { ImportedPrefabPath + "/Materials" })
                .Select(AssetDatabase.GUIDToAssetPath)
                .FirstOrDefault(path => Path.GetFileNameWithoutExtension(path).IndexOf(containsName, StringComparison.OrdinalIgnoreCase) >= 0);

            if (string.IsNullOrEmpty(materialPath))
            {
                return;
            }

            var material = AssetDatabase.LoadAssetAtPath<Material>(materialPath);
            var renderer = target.GetComponent<Renderer>();
            if (renderer != null)
            {
                renderer.sharedMaterial = material;
            }
        }

        private static void ApplyColor(GameObject target, Color color)
        {
            var renderer = target.GetComponent<Renderer>();
            if (renderer == null)
            {
                return;
            }

            var material = new Material(Shader.Find("Standard"));
            material.color = color;
            renderer.sharedMaterial = material;
        }

        private static GameObject CreateIndicator(Transform parent, Vector3 localPosition, string label)
        {
            var indicator = new GameObject(label + "_Indicator");
            indicator.transform.SetParent(parent, false);
            indicator.transform.localPosition = localPosition;
            var text = CreateWorldText(indicator.transform, label);
            _ = text;
            indicator.SetActive(false);
            return indicator;
        }

        private static TextMesh CreateWorldText(Transform parent, string label)
        {
            var worldText = new GameObject("WorldText");
            worldText.transform.SetParent(parent, false);
            worldText.transform.localRotation = Quaternion.Euler(60f, 0f, 0f);
            var textMesh = worldText.AddComponent<TextMesh>();
            textMesh.text = label;
            textMesh.fontSize = 48;
            textMesh.characterSize = 0.06f;
            textMesh.color = Color.white;
            textMesh.alignment = TextAlignment.Center;
            textMesh.anchor = TextAnchor.MiddleCenter;
            return textMesh;
        }

        private static void AttachHighlighter(GameObject target, GameObject indicator)
        {
            var highlighter = target.AddComponent<RioVivoInteractionHighlighter>();
            SetSerializedReference(highlighter, "indicator", indicator);
        }

        private static AudioClip LoadClip(string clipName)
        {
            var clipPath = AssetDatabase.FindAssets(clipName, new[] { AudioFolder })
                .Select(AssetDatabase.GUIDToAssetPath)
                .FirstOrDefault(path => Path.GetFileNameWithoutExtension(path).Equals(clipName, StringComparison.OrdinalIgnoreCase));
            return string.IsNullOrEmpty(clipPath) ? null : AssetDatabase.LoadAssetAtPath<AudioClip>(clipPath);
        }

        private static Text CreateText(Transform parent, string objectName, string value, Vector2 anchoredPosition, Vector2 size, int fontSize, TextAnchor alignment)
        {
            var textObject = new GameObject(objectName);
            textObject.transform.SetParent(parent, false);
            var rect = textObject.AddComponent<RectTransform>();
            rect.sizeDelta = size;
            rect.anchoredPosition = anchoredPosition;

            var text = textObject.AddComponent<Text>();
            text.text = value;
            text.alignment = alignment;
            text.font = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
            text.fontSize = fontSize;
            text.color = Color.black;
            return text;
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

            var labelText = CreateText(buttonObject.transform, "Label", label, Vector2.zero, size, 22, TextAnchor.MiddleCenter);
            labelText.color = Color.white;
            return buttonObject;
        }

        private static void SetSerializedReference(UnityEngine.Object target, string propertyName, UnityEngine.Object value)
        {
            var serializedObject = new SerializedObject(target);
            var property = serializedObject.FindProperty(propertyName);
            if (property == null)
            {
                return;
            }

            property.objectReferenceValue = value;
            serializedObject.ApplyModifiedPropertiesWithoutUndo();
        }

        private static void SetSerializedValue<T>(UnityEngine.Object target, string propertyName, T value)
        {
            var serializedObject = new SerializedObject(target);
            var property = serializedObject.FindProperty(propertyName);
            if (property == null)
            {
                return;
            }

            if (typeof(T) == typeof(Vector3))
            {
                property.vector3Value = (Vector3)(object)value;
            }

            serializedObject.ApplyModifiedPropertiesWithoutUndo();
        }

        private static void SetEnumField<TEnum>(UnityEngine.Object target, string propertyName, TEnum value) where TEnum : Enum
        {
            var serializedObject = new SerializedObject(target);
            var property = serializedObject.FindProperty(propertyName);
            if (property == null)
            {
                return;
            }

            property.enumValueIndex = Convert.ToInt32(value);
            serializedObject.ApplyModifiedPropertiesWithoutUndo();
        }

        private sealed class UiReferences
        {
            public RioVivoHUD Hud;
            public RioVivoResultPanel ResultPanel;
            public RioVivoTouchHUD TouchHud;
        }

        private readonly struct Placement
        {
            public Placement(string name, Vector3 position, Vector3 scale)
            {
                Name = name;
                Position = position;
                Scale = scale;
            }

            public string Name { get; }
            public Vector3 Position { get; }
            public Vector3 Scale { get; }
        }
    }
}
#endif
