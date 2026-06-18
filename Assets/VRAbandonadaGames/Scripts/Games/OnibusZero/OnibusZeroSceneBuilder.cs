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

namespace VRAbandonadaGames.Games.OnibusZero
{
    public static class OnibusZeroSceneBuilder
    {
        private const string SceneFolder = "Assets/VRAbandonadaGames/Scenes/Games/OnibusZero";
        private const string ScenePath = SceneFolder + "/OnibusZero_Main.unity";
        private const string ScriptFolder = "Assets/VRAbandonadaGames/Scripts/Games/OnibusZero";
        private const string PrefabFolder = "Assets/VRAbandonadaGames/Prefabs/Games/OnibusZero";
        private const string DataFolder = "Assets/VRAbandonadaGames/Data/Games/OnibusZero";
        private const string ReportFolder = "Assets/VRAbandonadaGames/Reports/OnibusZero";
        private const string ExperienceAssetPath = DataFolder + "/OnibusZero_Experience.asset";
        private const string ReportPath = ReportFolder + "/TIJOLO_01_ONIBUS_ZERO_PLAYABLE_PROTOTYPE_REPORT.md";
        private const string HubScenePath = "Assets/VRAbandonadaGames/Scenes/VRA_Games_PrototypeHub.unity";
        private const string ImportedPrefabPath = "Assets/VRAbandonadaGames/Prefabs/Imported";

        [MenuItem("VR Abandonada Games/Games/Onibus Zero/Rebuild Main Scene")]
        public static void RebuildMainScene()
        {
            EnsureFolders();
            EnsureExperienceAsset();

            var scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);
            var camera = CreateMainCamera();
            CreateLight();

            var environmentRoot = new GameObject("Environment");
            BuildTrack(environmentRoot.transform);
            BuildCityBackdrop(environmentRoot.transform);
            BuildDecor(environmentRoot.transform);

            var gameplayRoot = new GameObject("Gameplay");
            var gameManager = new GameObject("OnibusZeroGameManager").AddComponent<OnibusZeroGameManager>();
            gameManager.transform.SetParent(gameplayRoot.transform, false);

            var bus = CreateBus(gameplayRoot.transform, gameManager);
            camera.GetComponent<OnibusZeroCameraFollow>().SetTarget(bus.transform);

            CreateStops(gameplayRoot.transform, gameManager);
            CreateCheckpoints(gameplayRoot.transform, gameManager);
            CreateObstacles(gameplayRoot.transform);
            var ui = CreateUi();
            AssignReferences(gameManager, bus.GetComponent<OnibusZeroBusController>(), ui);

            EditorSceneManager.SaveScene(scene, ScenePath);
            EnsureBuildSettings();
            EnsureHubButton();
            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();
        }

        [MenuItem("VR Abandonada Games/Games/Onibus Zero/Validate Game Scene")]
        public static void ValidateGameScene()
        {
            EnsureFolders();
            File.WriteAllLines(ReportPath, BuildReport(CollectValidationIssues()));
            AssetDatabase.Refresh();
        }

        [MenuItem("VR Abandonada Games/Games/Onibus Zero/Generate Game Report")]
        public static void GenerateGameReport()
        {
            EnsureFolders();
            File.WriteAllLines(ReportPath, BuildReport(CollectValidationIssues()));
            AssetDatabase.Refresh();
        }

        private static void EnsureFolders()
        {
            Directory.CreateDirectory(SceneFolder);
            Directory.CreateDirectory(ScriptFolder);
            Directory.CreateDirectory(PrefabFolder);
            Directory.CreateDirectory(DataFolder);
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

            asset.experienceName = "Corrida do Onibus Zero";
            asset.description = "Arcade urbano sobre conectar bairros, pegar passageiros e reduzir a tarifa.";
            asset.theme = "Transporte publico, cidade e mobilidade popular.";
            asset.mainScenePath = ScenePath;
            asset.gameType = GameExperienceType.Simulation;
            asset.estimatedDuration = "1 a 3 minutos";
            asset.targetAudience = "Redes sociais/publico geral";
            asset.educationalMessage = "Transporte publico bom conecta a cidade.";
            asset.callToAction = "Cidade boa e cidade onde todo mundo consegue circular.";
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
            camera.backgroundColor = new Color(0.74f, 0.87f, 0.94f, 1f);
            cameraObject.transform.position = new Vector3(0f, 24f, -15f);
            cameraObject.transform.rotation = Quaternion.Euler(56f, 0f, 0f);
            cameraObject.AddComponent<AudioListener>();
            cameraObject.AddComponent<OnibusZeroCameraFollow>();
            return camera;
        }

        private static void CreateLight()
        {
            var light = new GameObject("Directional Light");
            var source = light.AddComponent<Light>();
            source.type = LightType.Directional;
            source.intensity = 1.2f;
            source.color = new Color(1f, 0.96f, 0.84f, 1f);
            light.transform.rotation = Quaternion.Euler(42f, -35f, 0f);
        }

        private static void BuildTrack(Transform parent)
        {
            CreatePrimitive(parent, "CityBase", PrimitiveType.Plane, Vector3.zero, new Vector3(5f, 1f, 5f), "Ground037");
            CreatePrimitive(parent, "RoadNorth", PrimitiveType.Cube, new Vector3(0f, 0.06f, 12f), new Vector3(22f, 0.1f, 4f), "Asphalt002");
            CreatePrimitive(parent, "RoadSouth", PrimitiveType.Cube, new Vector3(0f, 0.06f, -12f), new Vector3(22f, 0.1f, 4f), "Asphalt002");
            CreatePrimitive(parent, "RoadWest", PrimitiveType.Cube, new Vector3(-12f, 0.06f, 0f), new Vector3(4f, 0.1f, 18f), "Asphalt002");
            CreatePrimitive(parent, "RoadEast", PrimitiveType.Cube, new Vector3(12f, 0.06f, 0f), new Vector3(4f, 0.1f, 18f), "Asphalt002");
            CreatePrimitive(parent, "RoadCenter", PrimitiveType.Cube, new Vector3(0f, 0.05f, 0f), new Vector3(10f, 0.08f, 8f), "Concrete010");

            CreatePrimitive(parent, "LaneMarkNorth", PrimitiveType.Cube, new Vector3(0f, 0.12f, 12f), new Vector3(20f, 0.02f, 0.2f), null, new Color(1f, 0.92f, 0.35f, 1f));
            CreatePrimitive(parent, "LaneMarkSouth", PrimitiveType.Cube, new Vector3(0f, 0.12f, -12f), new Vector3(20f, 0.02f, 0.2f), null, new Color(1f, 0.92f, 0.35f, 1f));
            CreatePrimitive(parent, "LaneMarkWest", PrimitiveType.Cube, new Vector3(-12f, 0.12f, 0f), new Vector3(0.2f, 0.02f, 16f), null, new Color(1f, 0.92f, 0.35f, 1f));
            CreatePrimitive(parent, "LaneMarkEast", PrimitiveType.Cube, new Vector3(12f, 0.12f, 0f), new Vector3(0.2f, 0.02f, 16f), null, new Color(1f, 0.92f, 0.35f, 1f));
        }

        private static void BuildCityBackdrop(Transform parent)
        {
            PlaceImportedPrefab(parent, "building-a", new Vector3(-18f, 0f, -18f), Vector3.one * 1.5f);
            PlaceImportedPrefab(parent, "building-c", new Vector3(-18f, 0f, 0f), Vector3.one * 1.45f);
            PlaceImportedPrefab(parent, "building-e", new Vector3(-18f, 0f, 18f), Vector3.one * 1.5f);
            PlaceImportedPrefab(parent, "building-h", new Vector3(18f, 0f, -18f), Vector3.one * 1.5f);
            PlaceImportedPrefab(parent, "building-i", new Vector3(18f, 0f, 0f), Vector3.one * 1.45f);
            PlaceImportedPrefab(parent, "building-skyscraper-a", new Vector3(18f, 0f, 18f), Vector3.one * 1.25f);
        }

        private static void BuildDecor(Transform parent)
        {
            for (var i = -2; i <= 2; i++)
            {
                CreatePrimitive(parent, "BusStopMarker_N_" + i, PrimitiveType.Cube, new Vector3(i * 4f, 0.12f, 9.6f), new Vector3(1.4f, 0.03f, 0.8f), null, new Color(0.28f, 0.84f, 1f, 1f));
                CreatePrimitive(parent, "BusStopMarker_S_" + i, PrimitiveType.Cube, new Vector3(i * 4f, 0.12f, -9.6f), new Vector3(1.4f, 0.03f, 0.8f), null, new Color(0.28f, 0.84f, 1f, 1f));
            }
        }

        private static GameObject CreateBus(Transform parent, OnibusZeroGameManager gameManager)
        {
            var busRoot = new GameObject("OnibusPopular");
            busRoot.transform.SetParent(parent, false);
            busRoot.transform.position = new Vector3(0f, 0.7f, -12f);

            var body = busRoot.AddComponent<Rigidbody>();
            body.mass = 2f;

            var collider = busRoot.AddComponent<BoxCollider>();
            collider.size = new Vector3(2.2f, 1.4f, 4.6f);

            var controller = busRoot.AddComponent<OnibusZeroBusController>();
            SetSerializedReference(controller, "gameManager", gameManager);

            var visualRoot = new GameObject("BusVisual");
            visualRoot.transform.SetParent(busRoot.transform, false);

            CreatePrimitive(visualRoot.transform, "Body", PrimitiveType.Cube, new Vector3(0f, 0f, 0f), new Vector3(2f, 1.2f, 4f), null, new Color(0.92f, 0.22f, 0.18f, 1f));
            CreatePrimitive(visualRoot.transform, "Roof", PrimitiveType.Cube, new Vector3(0f, 0.85f, 0f), new Vector3(1.8f, 0.25f, 3.8f), null, new Color(0.98f, 0.84f, 0.25f, 1f));
            CreatePrimitive(visualRoot.transform, "WindowLeft", PrimitiveType.Cube, new Vector3(-1.02f, 0.3f, 0f), new Vector3(0.08f, 0.55f, 3f), null, new Color(0.6f, 0.88f, 1f, 0.9f));
            CreatePrimitive(visualRoot.transform, "WindowRight", PrimitiveType.Cube, new Vector3(1.02f, 0.3f, 0f), new Vector3(0.08f, 0.55f, 3f), null, new Color(0.6f, 0.88f, 1f, 0.9f));
            CreateWheel(visualRoot.transform, new Vector3(-0.9f, -0.65f, 1.35f));
            CreateWheel(visualRoot.transform, new Vector3(0.9f, -0.65f, 1.35f));
            CreateWheel(visualRoot.transform, new Vector3(-0.9f, -0.65f, -1.35f));
            CreateWheel(visualRoot.transform, new Vector3(0.9f, -0.65f, -1.35f));

            return busRoot;
        }

        private static List<OnibusZeroPassengerStop> CreateStops(Transform parent, OnibusZeroGameManager gameManager)
        {
            var stopPositions = new[]
            {
                new Vector3(-8f, 0.4f, -9.2f),
                new Vector3(8f, 0.4f, -9.2f),
                new Vector3(9.2f, 0.4f, 8f),
                new Vector3(-9.2f, 0.4f, 8f)
            };

            var createdStops = new List<OnibusZeroPassengerStop>();
            for (var i = 0; i < stopPositions.Length; i++)
            {
                var stopRoot = new GameObject("PassengerStop_" + (i + 1));
                stopRoot.transform.SetParent(parent, false);
                stopRoot.transform.position = stopPositions[i];
                var trigger = stopRoot.AddComponent<BoxCollider>();
                trigger.isTrigger = true;
                trigger.size = new Vector3(2.8f, 2f, 2.8f);

                var stop = stopRoot.AddComponent<OnibusZeroPassengerStop>();
                SetSerializedReference(stop, "gameManager", gameManager);

                CreatePrimitive(stopRoot.transform, "Pole", PrimitiveType.Cylinder, new Vector3(0f, 0.8f, 0f), new Vector3(0.12f, 0.8f, 0.12f), null, new Color(0.15f, 0.2f, 0.28f, 1f));
                CreatePrimitive(stopRoot.transform, "Sign", PrimitiveType.Cube, new Vector3(0f, 1.7f, 0f), new Vector3(0.8f, 0.5f, 0.08f), null, new Color(0.22f, 0.82f, 1f, 1f));
                var fx = CreatePrimitive(stopRoot.transform, "PickupFX", PrimitiveType.Cylinder, new Vector3(0f, 0.05f, 0f), new Vector3(0.8f, 0.02f, 0.8f), null, new Color(1f, 0.9f, 0.2f, 1f));
                fx.SetActive(false);
                SetSerializedReference(stop, "pickupFx", fx);

                var passengers = new OnibusZeroPassenger[2];
                for (var passengerIndex = 0; passengerIndex < passengers.Length; passengerIndex++)
                {
                    var passengerRoot = GameObject.CreatePrimitive(PrimitiveType.Capsule);
                    passengerRoot.name = "Passenger_" + (i + 1) + "_" + (passengerIndex + 1);
                    passengerRoot.transform.SetParent(stopRoot.transform, false);
                    passengerRoot.transform.localPosition = new Vector3(passengerIndex == 0 ? -0.5f : 0.5f, 0.9f, 0.6f);
                    passengerRoot.transform.localScale = new Vector3(0.45f, 0.7f, 0.45f);
                    var renderer = passengerRoot.GetComponent<Renderer>();
                    renderer.sharedMaterial = MakeColorMaterial(new Color(0.95f, 0.95f - (passengerIndex * 0.2f), 0.4f + (i * 0.08f), 1f));
                    passengers[passengerIndex] = passengerRoot.AddComponent<OnibusZeroPassenger>();
                }

                SetSerializedArray(stop, "passengers", passengers);
                createdStops.Add(stop);
            }

            return createdStops;
        }

        private static void CreateCheckpoints(Transform parent, OnibusZeroGameManager gameManager)
        {
            var points = new[]
            {
                new Vector3(-5f, 0.5f, -12f),
                new Vector3(5f, 0.5f, -12f),
                new Vector3(12f, 0.5f, -4f),
                new Vector3(12f, 0.5f, 6f),
                new Vector3(0f, 0.5f, 12f),
                new Vector3(-12f, 0.5f, 0f)
            };

            for (var i = 0; i < points.Length; i++)
            {
                var root = new GameObject("RouteCheckpoint_" + (i + 1));
                root.transform.SetParent(parent, false);
                root.transform.position = points[i];
                var trigger = root.AddComponent<BoxCollider>();
                trigger.isTrigger = true;
                trigger.size = new Vector3(2f, 1.5f, 2f);

                var checkpoint = root.AddComponent<OnibusZeroRouteCheckpoint>();
                SetSerializedReference(checkpoint, "gameManager", gameManager);
                var marker = CreatePrimitive(root.transform, "Marker", PrimitiveType.Cylinder, Vector3.zero, new Vector3(0.8f, 0.02f, 0.8f), null, new Color(0.98f, 0.82f, 0.18f, 1f));
                SetSerializedReference(checkpoint, "markerRenderer", marker.GetComponent<MeshRenderer>());
            }
        }

        private static void CreateObstacles(Transform parent)
        {
            var positions = new[]
            {
                new Vector3(-3f, 0.35f, -12f), new Vector3(3f, 0.35f, -12f),
                new Vector3(12f, 0.35f, -8f), new Vector3(12f, 0.35f, 2f),
                new Vector3(7f, 0.35f, 12f), new Vector3(-7f, 0.35f, 12f),
                new Vector3(-12f, 0.35f, 7f), new Vector3(-12f, 0.35f, -5f)
            };

            for (var i = 0; i < positions.Length; i++)
            {
                var root = new GameObject("Obstacle_" + (i + 1));
                root.transform.SetParent(parent, false);
                root.transform.position = positions[i];
                root.layer = 0;
                var visual = CreatePrimitive(root.transform, "Visual", i % 2 == 0 ? PrimitiveType.Cylinder : PrimitiveType.Cube, Vector3.zero, i % 2 == 0 ? new Vector3(0.7f, 0.2f, 0.7f) : new Vector3(0.8f, 0.8f, 0.8f), null, i % 2 == 0 ? new Color(0.12f, 0.12f, 0.12f, 1f) : new Color(1f, 0.48f, 0.16f, 1f));
                if (i % 2 == 0)
                {
                    root.AddComponent<SphereCollider>().radius = 0.75f;
                }
                else
                {
                    root.AddComponent<BoxCollider>().size = new Vector3(1f, 1f, 1f);
                }

                var obstacle = root.AddComponent<OnibusZeroObstacle>();
                SetSerializedReference(obstacle, "feedbackRenderer", visual.GetComponent<Renderer>());
            }
        }

        private static UiRefs CreateUi()
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

            var hudRoot = CreatePanel(canvasObject.transform, "HUD", new Vector2(-670f, 360f), new Vector2(420f, 250f), new Color(1f, 1f, 1f, 0.84f));
            var title = CreateText(hudRoot.transform, "Title", "Corrida do Onibus Zero", new Vector2(0f, 90f), new Vector2(360f, 34f), 28, TextAnchor.MiddleCenter);
            title.color = new Color(0.08f, 0.09f, 0.12f, 1f);
            var objective = CreateText(hudRoot.transform, "Objective", "Pegue passageiros e reduza a tarifa!", new Vector2(0f, 55f), new Vector2(360f, 34f), 18, TextAnchor.MiddleCenter);
            var timer = CreateText(hudRoot.transform, "Timer", "Tempo: 90s", new Vector2(0f, 20f), new Vector2(360f, 30f), 22, TextAnchor.MiddleLeft);
            var passengers = CreateText(hudRoot.transform, "Passengers", "Passageiros: 0", new Vector2(0f, -12f), new Vector2(360f, 30f), 22, TextAnchor.MiddleLeft);
            var fare = CreateText(hudRoot.transform, "Fare", "Tarifa: R$ 5.00", new Vector2(0f, -44f), new Vector2(360f, 30f), 22, TextAnchor.MiddleLeft);
            var support = CreateText(hudRoot.transform, "Support", "Apoio: 0", new Vector2(0f, -76f), new Vector2(360f, 30f), 22, TextAnchor.MiddleLeft);
            var combo = CreateText(hudRoot.transform, "Combo", "Combo: x1", new Vector2(0f, -108f), new Vector2(360f, 30f), 22, TextAnchor.MiddleLeft);
            var quick = CreateText(hudRoot.transform, "QuickMessage", "Linha cheia!", new Vector2(0f, -144f), new Vector2(360f, 30f), 20, TextAnchor.MiddleCenter);

            var supportBar = CreatePanel(hudRoot.transform, "SupportBarBg", new Vector2(0f, -180f), new Vector2(320f, 20f), new Color(0.2f, 0.25f, 0.32f, 0.25f));
            var supportFillObject = CreatePanel(supportBar.transform, "SupportFill", Vector2.zero, new Vector2(320f, 20f), new Color(0.24f, 0.84f, 0.4f, 1f));
            var fillImage = supportFillObject.GetComponent<Image>();
            fillImage.type = Image.Type.Filled;
            fillImage.fillMethod = Image.FillMethod.Horizontal;
            fillImage.fillAmount = 0f;

            var resultRoot = CreatePanel(canvasObject.transform, "ResultPanel", Vector2.zero, new Vector2(780f, 420f), new Color(0.06f, 0.08f, 0.1f, 0.88f));
            resultRoot.SetActive(false);
            var resultTitle = CreateText(resultRoot.transform, "ResultTitle", "A - Tarifa popular", new Vector2(0f, 140f), new Vector2(700f, 40f), 34, TextAnchor.MiddleCenter);
            resultTitle.color = Color.white;
            var resultStats = CreateText(resultRoot.transform, "ResultStats", string.Empty, new Vector2(0f, 40f), new Vector2(700f, 150f), 24, TextAnchor.UpperCenter);
            resultStats.color = Color.white;
            var resultShare = CreateText(resultRoot.transform, "ResultShare", string.Empty, new Vector2(0f, -70f), new Vector2(700f, 80f), 18, TextAnchor.MiddleCenter);
            resultShare.color = new Color(1f, 0.92f, 0.48f, 1f);

            var resultPanel = resultRoot.AddComponent<OnibusZeroResultPanel>();
            SetSerializedReference(resultPanel, "panelRoot", resultRoot);
            SetSerializedReference(resultPanel, "titleText", resultTitle);
            SetSerializedReference(resultPanel, "statsText", resultStats);
            SetSerializedReference(resultPanel, "shareText", resultShare);

            CreateButton(resultRoot.transform, "Jogar novamente", new Vector2(-140f, -150f), new Vector2(220f, 52f), resultPanel.RestartGame);
            CreateButton(resultRoot.transform, "Voltar ao Hub", new Vector2(140f, -150f), new Vector2(220f, 52f), resultPanel.ReturnToHub);

            var hud = hudRoot.AddComponent<OnibusZeroHUD>();
            SetSerializedReference(hud, "timerText", timer);
            SetSerializedReference(hud, "passengersText", passengers);
            SetSerializedReference(hud, "fareText", fare);
            SetSerializedReference(hud, "supportText", support);
            SetSerializedReference(hud, "comboText", combo);
            SetSerializedReference(hud, "objectiveText", objective);
            SetSerializedReference(hud, "quickMessageText", quick);
            SetSerializedReference(hud, "supportFill", fillImage);

            return new UiRefs { Hud = hud, ResultPanel = resultPanel };
        }

        private static void AssignReferences(OnibusZeroGameManager gameManager, OnibusZeroBusController bus, UiRefs ui)
        {
            SetSerializedReference(gameManager, "hud", ui.Hud);
            SetSerializedReference(gameManager, "resultPanel", ui.ResultPanel);
            SetSerializedReference(bus, "gameManager", gameManager);
        }

        private static void EnsureBuildSettings()
        {
            var scenes = EditorBuildSettings.scenes.ToList();
            AddOrEnableScene(scenes, HubScenePath);
            AddOrEnableScene(scenes, ScenePath);
            EditorBuildSettings.scenes = scenes.ToArray();
        }

        private static void EnsureHubButton()
        {
            if (!File.Exists(HubScenePath))
            {
                return;
            }

            var hubScene = EditorSceneManager.OpenScene(HubScenePath, OpenSceneMode.Single);
            var loader = UnityEngine.Object.FindFirstObjectByType<VRAHubSceneLoader>();
            if (loader == null)
            {
                return;
            }

            var button = FindButton("Corrida do Onibus Zero");
            if (button == null)
            {
                return;
            }

            while (button.onClick.GetPersistentEventCount() > 0)
            {
                UnityEditor.Events.UnityEventTools.RemovePersistentListener(button.onClick, 0);
            }
            UnityEditor.Events.UnityEventTools.AddPersistentListener(button.onClick, loader.LoadOnibusZero);
            EditorUtility.SetDirty(button);
            EditorSceneManager.MarkSceneDirty(hubScene);
            EditorSceneManager.SaveScene(hubScene);
        }

        private static Button FindButton(string objectName)
        {
            foreach (var button in UnityEngine.Object.FindObjectsByType<Button>(FindObjectsInactive.Include, FindObjectsSortMode.None))
            {
                if (button.gameObject.name == objectName)
                {
                    return button;
                }
            }

            return null;
        }

        private static void AddOrEnableScene(List<EditorBuildSettingsScene> scenes, string scenePath)
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

        private static List<string> CollectValidationIssues()
        {
            var issues = new List<string>();
            if (!File.Exists(ScenePath))
            {
                issues.Add("Missing main scene: " + ScenePath);
                return issues;
            }

            var scene = EditorSceneManager.OpenScene(ScenePath, OpenSceneMode.Single);
            Require<OnibusZeroBusController>(scene, issues, "Onibus");
            Require<OnibusZeroCameraFollow>(scene, issues, "Camera");
            Require<OnibusZeroHUD>(scene, issues, "HUD");
            Require<OnibusZeroGameManager>(scene, issues, "GameManager");
            Require<OnibusZeroResultPanel>(scene, issues, "Result panel");

            if (FindAll<OnibusZeroPassengerStop>(scene).Count < 4) issues.Add("Expected at least 4 passenger stops.");
            if (FindAll<OnibusZeroPassenger>(scene).Count < 8) issues.Add("Expected at least 8 passengers.");
            if (FindAll<OnibusZeroObstacle>(scene).Count < 8) issues.Add("Expected at least 8 obstacles.");
            if (FindAll<OnibusZeroRouteCheckpoint>(scene).Count < 6) issues.Add("Expected at least 6 checkpoints.");
            if (FindButtonInScene(scene, "Jogar novamente") == null) issues.Add("Missing Jogar novamente button.");
            if (FindButtonInScene(scene, "Voltar ao Hub") == null) issues.Add("Missing Voltar ao Hub button.");
            if (!EditorBuildSettings.scenes.Any(item => item.path == ScenePath && item.enabled)) issues.Add("Onibus Zero scene not enabled in Build Settings.");

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
                        }
                    }
                }
            }

            return issues.Distinct().ToList();
        }

        private static T Require<T>(Scene scene, List<string> issues, string label) where T : Component
        {
            var found = FindAll<T>(scene).FirstOrDefault();
            if (found == null)
            {
                issues.Add("Missing " + label + " in scene.");
            }

            return found;
        }

        private static List<T> FindAll<T>(Scene scene) where T : Component
        {
            var results = new List<T>();
            foreach (var root in scene.GetRootGameObjects())
            {
                results.AddRange(root.GetComponentsInChildren<T>(true));
            }

            return results;
        }

        private static Button FindButtonInScene(Scene scene, string name)
        {
            return FindAll<Button>(scene).FirstOrDefault(button => button.gameObject.name == name);
        }

        private static IEnumerable<string> BuildReport(List<string> issues)
        {
            yield return "# TIJOLO 01 Onibus Zero Playable Prototype Report";
            yield return string.Empty;
            yield return "Generated: " + DateTime.UtcNow.ToString("u");
            yield return string.Empty;
            yield return "## Diagnostico inicial";
            yield return "- Rio Vivo provou pipeline tecnico, entao este tijolo prioriza arcade, ritmo, replay curto e leitura imediata.";
            yield return "- A base do projeto ja tinha hub, build settings, definicao de experiencia e assets urbanos reaproveitaveis.";
            yield return string.Empty;
            yield return "## Assets reaproveitados";
            yield return "- Materiais urbanos: Asphalt002, Concrete010 e Ground037.";
            yield return "- Predios importados da pasta Urban.";
            yield return "- Estrutura do hub e GameExperienceDefinition existentes.";
            yield return string.Empty;
            yield return "## Scripts criados";
            yield return "- OnibusZeroGameManager.cs";
            yield return "- OnibusZeroBusController.cs";
            yield return "- OnibusZeroCameraFollow.cs";
            yield return "- OnibusZeroPassengerStop.cs";
            yield return "- OnibusZeroPassenger.cs";
            yield return "- OnibusZeroObstacle.cs";
            yield return "- OnibusZeroRouteCheckpoint.cs";
            yield return "- OnibusZeroHUD.cs";
            yield return "- OnibusZeroResultPanel.cs";
            yield return "- OnibusZeroSceneBuilder.cs";
            yield return string.Empty;
            yield return "## Cena criada";
            yield return "- Circuito urbano em loop com 4 lados jogaveis e leitura top-down/isometrica.";
            yield return "- Onibus placeholder bonito com primitivas e cor forte.";
            yield return "- 4 pontos de onibus, 8 passageiros, 8 obstaculos e 6 checkpoints.";
            yield return string.Empty;
            yield return "## Mecanicas implementadas";
            yield return "- Partida curta de 90 segundos.";
            yield return "- Coleta de passageiros em baixa velocidade com tecla E.";
            yield return "- Checkpoints reduzem tarifa e aumentam bairros conectados.";
            yield return "- Colisao com obstaculos quebra combo e tira tempo.";
            yield return string.Empty;
            yield return "## HUD";
            yield return "- Tempo, passageiros, tarifa, apoio popular, combo, objetivo e mensagem rapida.";
            yield return "- Barra visual de apoio popular.";
            yield return string.Empty;
            yield return "## Sistema de combo";
            yield return "- Combo cresce com pickups, checkpoints e acoes limpas.";
            yield return "- Combo maximo e exibido no painel final.";
            yield return string.Empty;
            yield return "## Sistema de tarifa";
            yield return "- Tarifa comeca em R$ 5.00 e cai conforme checkpoints e eficiencia.";
            yield return "- Ranking final depende da combinacao de tarifa e apoio.";
            yield return string.Empty;
            yield return "## Obstaculos";
            yield return "- Obstaculos simples de rua com feedback visual no impacto.";
            yield return "- Colisao reduz apoio e tempo restante.";
            yield return string.Empty;
            yield return "## Pontos de onibus";
            yield return "- Cada ponto recebe passageiros visuais e trigger de coleta.";
            yield return "- Pickup ativa feedback curto e acelera o ritmo de progressao.";
            yield return string.Empty;
            yield return "## Resultado compartilhavel";
            yield return "- Frase curta gerada com passageiros, bairros, tarifa final e rank.";
            yield return string.Empty;
            yield return "## Validacao";
            if (issues.Count == 0)
            {
                yield return "- Cena existe e compoe com onibus, camera, HUD e GameManager.";
                yield return "- Contagem minima de stops, passageiros, obstaculos e checkpoints atendida.";
                yield return "- Painel final e botoes principais presentes.";
                yield return "- Cena incluida no Build Settings.";
            }
            else
            {
                foreach (var issue in issues)
                {
                    yield return "- " + issue;
                }
            }

            yield return string.Empty;
            yield return "## Erros encontrados";
            if (issues.Count == 0)
            {
                yield return "- Nenhum erro bloqueante detectado pelo validador do tijolo.";
            }
            else
            {
                foreach (var issue in issues)
                {
                    yield return "- " + issue;
                }
            }

            yield return string.Empty;
            yield return "## Erros corrigidos";
            yield return "- Arquitetura inicial do novo jogo criada sem alterar o loop de Rio Vivo.";
            yield return "- Hub preparado para expor o Onibus Zero por metodo dedicado.";
            yield return string.Empty;
            yield return "## Pendencias";
            yield return "- Audio arcade ainda nao foi adicionado neste primeiro tijolo.";
            yield return "- Mobile HUD ficou apenas preparado na arquitetura geral, nao finalizado.";
            yield return "- Pode haver ajuste fino futuro de sensacao de direcao e densidade de props.";
            yield return string.Empty;
            yield return "## Proximo prompt recomendado";
            yield return "`Tijolo 02 — Onibus Zero juice pass: deixar a corrida mais gostosa, com audio, FX, celebracao de pickup, melhor curva de combo e mais polish visual.`";
        }

        private static GameObject CreatePrimitive(Transform parent, string name, PrimitiveType type, Vector3 position, Vector3 scale, string materialContainsName)
        {
            return CreatePrimitive(parent, name, type, position, scale, materialContainsName, null);
        }

        private static GameObject CreatePrimitive(Transform parent, string name, PrimitiveType type, Vector3 position, Vector3 scale, string materialContainsName, Color? overrideColor)
        {
            var gameObject = GameObject.CreatePrimitive(type);
            gameObject.name = name;
            gameObject.transform.SetParent(parent, false);
            gameObject.transform.localPosition = position;
            gameObject.transform.localScale = scale;

            if (!string.IsNullOrEmpty(materialContainsName))
            {
                ApplyImportedMaterial(gameObject, materialContainsName);
            }
            else if (overrideColor.HasValue)
            {
                var renderer = gameObject.GetComponent<Renderer>();
                renderer.sharedMaterial = MakeColorMaterial(overrideColor.Value);
            }

            return gameObject;
        }

        private static void CreateWheel(Transform parent, Vector3 position)
        {
            CreatePrimitive(parent, "Wheel", PrimitiveType.Cylinder, position, new Vector3(0.45f, 0.16f, 0.45f), null, new Color(0.08f, 0.08f, 0.08f, 1f))
                .transform.localRotation = Quaternion.Euler(90f, 0f, 0f);
        }

        private static void PlaceImportedPrefab(Transform parent, string containsName, Vector3 position, Vector3 scale)
        {
            var prefabPath = AssetDatabase.FindAssets("t:Prefab", new[] { ImportedPrefabPath })
                .Select(AssetDatabase.GUIDToAssetPath)
                .FirstOrDefault(path => Path.GetFileNameWithoutExtension(path).IndexOf(containsName, StringComparison.OrdinalIgnoreCase) >= 0);

            if (string.IsNullOrEmpty(prefabPath))
            {
                return;
            }

            var prefab = AssetDatabase.LoadAssetAtPath<GameObject>(prefabPath);
            if (prefab == null)
            {
                return;
            }

            var instance = PrefabUtility.InstantiatePrefab(prefab) as GameObject;
            instance.transform.SetParent(parent, false);
            instance.transform.localPosition = position;
            instance.transform.localScale = scale;
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

        private static Material MakeColorMaterial(Color color)
        {
            var material = new Material(Shader.Find("Standard"));
            material.color = color;
            return material;
        }

        private static GameObject CreatePanel(Transform parent, string name, Vector2 position, Vector2 size, Color color)
        {
            var panel = new GameObject(name);
            panel.transform.SetParent(parent, false);
            var rect = panel.AddComponent<RectTransform>();
            rect.sizeDelta = size;
            rect.anchoredPosition = position;
            var image = panel.AddComponent<Image>();
            image.color = color;
            return panel;
        }

        private static Text CreateText(Transform parent, string name, string value, Vector2 position, Vector2 size, int fontSize, TextAnchor anchor)
        {
            var textObject = new GameObject(name);
            textObject.transform.SetParent(parent, false);
            var rect = textObject.AddComponent<RectTransform>();
            rect.sizeDelta = size;
            rect.anchoredPosition = position;

            var text = textObject.AddComponent<Text>();
            text.text = value;
            text.alignment = anchor;
            text.font = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
            text.fontSize = fontSize;
            text.color = new Color(0.08f, 0.09f, 0.12f, 1f);
            return text;
        }

        private static GameObject CreateButton(Transform parent, string label, Vector2 position, Vector2 size, UnityEngine.Events.UnityAction onClick)
        {
            var buttonObject = new GameObject(label);
            buttonObject.transform.SetParent(parent, false);
            var rect = buttonObject.AddComponent<RectTransform>();
            rect.sizeDelta = size;
            rect.anchoredPosition = position;
            var image = buttonObject.AddComponent<Image>();
            image.color = new Color(0.95f, 0.76f, 0.18f, 0.96f);
            var button = buttonObject.AddComponent<Button>();
            button.targetGraphic = image;
            if (onClick != null)
            {
                button.onClick.AddListener(onClick);
            }

            var labelText = CreateText(buttonObject.transform, "Label", label, Vector2.zero, size, 22, TextAnchor.MiddleCenter);
            labelText.color = new Color(0.08f, 0.09f, 0.12f, 1f);
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

        private static void SetSerializedArray(UnityEngine.Object target, string propertyName, UnityEngine.Object[] values)
        {
            var serializedObject = new SerializedObject(target);
            var property = serializedObject.FindProperty(propertyName);
            if (property == null || !property.isArray)
            {
                return;
            }

            property.arraySize = values.Length;
            for (var index = 0; index < values.Length; index++)
            {
                property.GetArrayElementAtIndex(index).objectReferenceValue = values[index];
            }

            serializedObject.ApplyModifiedPropertiesWithoutUndo();
        }

        private sealed class UiRefs
        {
            public OnibusZeroHUD Hud;
            public OnibusZeroResultPanel ResultPanel;
        }
    }
}
#endif
