#if UNITY_EDITOR
using System.IO;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.Events;
using UnityEngine.UI;
using VRAbandonadaGames.Runtime;
using VRAbandonadaGames.Social;

namespace VRAbandonadaGames.EditorTools
{
    public static class PrototypeHubSceneBootstrap
    {
        [MenuItem("VR Abandonada Games/Scenes/Rebuild Prototype Hub")]
        public static void RebuildPrototypeHub()
        {
            Directory.CreateDirectory("Assets/VRAbandonadaGames/Scenes");

            var scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);

            var camera = new GameObject("Main Camera");
            camera.tag = "MainCamera";
            var cameraComponent = camera.AddComponent<Camera>();
            cameraComponent.clearFlags = CameraClearFlags.SolidColor;
            cameraComponent.backgroundColor = new Color(0.94f, 0.93f, 0.88f, 1f);
            camera.transform.position = new Vector3(0f, 6f, -10f);
            camera.transform.rotation = Quaternion.Euler(20f, 0f, 0f);

            var light = new GameObject("Directional Light");
            var lightComponent = light.AddComponent<Light>();
            lightComponent.type = LightType.Directional;
            light.transform.rotation = Quaternion.Euler(50f, -30f, 0f);

            var ground = GameObject.CreatePrimitive(PrimitiveType.Plane);
            ground.name = "Ground";
            ground.transform.localScale = new Vector3(2f, 1f, 2f);

            var hub = new GameObject("GameHubCore");
            var hubCore = hub.AddComponent<GameHubCore>();
            var shareSystem = hub.AddComponent<SocialShareResultSystem>();
            var sceneLoader = hub.AddComponent<VRAHubSceneLoader>();

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

            CreateText(canvasObject.transform, "Title", "VR Abandonada Games", new Vector2(0f, 310f), 40);
            CreateText(canvasObject.transform, "Subtitle", "Prototipo de plataforma de jogos interativos", new Vector2(0f, 265f), 22);
            CreateText(canvasObject.transform, "PrototypeNotice", "Prototipo em desenvolvimento", new Vector2(0f, -300f), 20);

            var buttonNames = new[]
            {
                "Rio Vivo Paraiba",
                "Corrida do Onibus Zero",
                "Cidade em Disputa",
                "VRQuest",
                "Territorio Tomado",
                "Recicla VR",
                "Trabalhador em Turno"
            };

            for (var index = 0; index < buttonNames.Length; index++)
            {
                var onClick = index == 0 ? new UnityAction(sceneLoader.LoadRioVivoParaiba) : null;
                CreateButton(canvasObject.transform, buttonNames[index], new Vector2(0f, 170f - (index * 52f)), onClick);
            }

            CreateButton(canvasObject.transform, "Testar Resultado Compartilhavel", new Vector2(0f, -205f), shareSystem.CopyShareText);
            CreateResultPanel(canvasObject.transform);

            EditorSceneManager.SaveScene(scene, "Assets/VRAbandonadaGames/Scenes/VRA_Games_PrototypeHub.unity");
            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();
        }

        private static void CreateText(Transform parent, string objectName, string value, Vector2 anchoredPosition, int fontSize)
        {
            var textObject = new GameObject(objectName);
            textObject.transform.SetParent(parent, false);
            var rect = textObject.AddComponent<RectTransform>();
            rect.sizeDelta = new Vector2(900f, 60f);
            rect.anchoredPosition = anchoredPosition;

            var text = textObject.AddComponent<Text>();
            text.text = value;
            text.alignment = TextAnchor.MiddleCenter;
            text.font = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
            text.fontSize = fontSize;
            text.color = Color.black;
        }

        private static void CreateButton(Transform parent, string label, Vector2 anchoredPosition, UnityAction onClick)
        {
            var buttonObject = new GameObject(label);
            buttonObject.transform.SetParent(parent, false);

            var rect = buttonObject.AddComponent<RectTransform>();
            rect.sizeDelta = new Vector2(520f, 40f);
            rect.anchoredPosition = anchoredPosition;

            var image = buttonObject.AddComponent<Image>();
            image.color = new Color(0.89f, 0.78f, 0.43f, 0.95f);

            var button = buttonObject.AddComponent<Button>();
            button.targetGraphic = image;
            if (onClick != null)
            {
                button.onClick.AddListener(onClick);
            }

            CreateText(buttonObject.transform, "Label", label, Vector2.zero, 18);
        }

        private static void CreateResultPanel(Transform parent)
        {
            var panelObject = new GameObject("ResultPanel");
            panelObject.transform.SetParent(parent, false);

            var rect = panelObject.AddComponent<RectTransform>();
            rect.sizeDelta = new Vector2(620f, 120f);
            rect.anchoredPosition = new Vector2(0f, -120f);

            var image = panelObject.AddComponent<Image>();
            image.color = new Color(1f, 1f, 1f, 0.88f);

            CreateText(panelObject.transform, "ResultTitle", "Resultado compartilhavel", new Vector2(0f, 30f), 22);
            CreateText(panelObject.transform, "ResultBody", "Titulo, pontuacao, frase educativa e chamada para acao serao exibidos aqui.", new Vector2(0f, -10f), 18);
        }
    }
}
#endif
