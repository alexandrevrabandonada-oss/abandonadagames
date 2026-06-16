#if UNITY_EDITOR
using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Text;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.Events;
using UnityEngine.UI;

namespace VRAbandonadaGames.EditorTools
{
    public static class AssetOpsAutomation
    {
        private const string RootPath = "Assets/VRAbandonadaGames";
        private const string DownloadedPath = RootPath + "/ThirdParty/Downloaded";
        private const string ImportedPrefabPath = RootPath + "/Prefabs/Imported";
        private const string ReportPath = RootPath + "/Reports/AssetOps";
        private const string SearchPlanPath = ReportPath + "/ASSET_SEARCH_PLAN_T03.md";
        private const string FinalReportPath = ReportPath + "/TIJOLO_03_ASSETOPS_REPORT.md";
        private const string ManifestPath = RootPath + "/ThirdParty/_Licenses/ASSET_MANIFEST.md";
        private const string RegistryPath = RootPath + "/Data/AssetRegistry/asset_registry.json";
        private const string TestScenePath = RootPath + "/Scenes/AssetTests/T03_RiverAssetIntegration_Test.unity";

        private static readonly AssetSource[] ApprovedAssets =
        {
            new AssetSource(
                "T03-NATURE-001",
                "Kenney Nature Kit",
                "Nature",
                "Kenney",
                "Kenney",
                "https://kenney.nl/assets/nature-kit",
                "CC0",
                false,
                DownloadedPath + "/Nature/kenney_nature-kit.zip",
                DownloadedPath + "/Nature/KenneyNatureKit",
                "Nature foundation for riverbanks, rocks, trees and generic signs.",
                "Approved: clear CC0 license and direct download."),
            new AssetSource(
                "T03-BRIDGES-001",
                "Kenney City Kit (Roads)",
                "Bridges",
                "Kenney",
                "Kenney",
                "https://kenney.nl/assets/city-kit-roads",
                "CC0",
                false,
                DownloadedPath + "/Bridges/kenney_city-kit-roads.zip",
                DownloadedPath + "/Bridges/KenneyCityKitRoads",
                "Bridge and road pieces for generic urban river crossings.",
                "Approved: clear CC0 license and direct download."),
            new AssetSource(
                "T03-URBAN-001",
                "Kenney City Kit (Commercial)",
                "Urban",
                "Kenney",
                "Kenney",
                "https://kenney.nl/assets/city-kit-commercial",
                "CC0",
                false,
                DownloadedPath + "/Urban/kenney_city-kit-commercial_2.1.zip",
                DownloadedPath + "/Urban/KenneyCityKitCommercial",
                "Urban props and buildings for a generic city edge around the river.",
                "Approved: clear CC0 license and direct download."),
            new AssetSource(
                "T03-CHAR-001",
                "Kenney Animated Characters Retro",
                "Characters",
                "Kenney",
                "Kenney",
                "https://kenney.nl/assets/animated-characters-retro",
                "CC0",
                false,
                DownloadedPath + "/Characters/kenney_animated-characters-retro.zip",
                DownloadedPath + "/Characters/KenneyAnimatedCharactersRetro",
                "Placeholder NPCs for the first asset integration scene.",
                "Approved: clear CC0 license and direct download."),
            new AssetSource(
                "T03-MAT-001",
                "ambientCG Asphalt002 2K JPG",
                "Materials",
                "ambientCG",
                "ambientCG",
                "https://ambientcg.com/view?id=Asphalt002",
                "CC0",
                false,
                DownloadedPath + "/Materials/Asphalt002_2K-JPG.zip",
                DownloadedPath + "/Materials/Asphalt002",
                "Asphalt material for streets and paved edges.",
                "Approved: CC0 texture source."),
            new AssetSource(
                "T03-MAT-002",
                "ambientCG Concrete010 2K JPG",
                "Materials",
                "ambientCG",
                "ambientCG",
                "https://ambientcg.com/view?id=Concrete010",
                "CC0",
                false,
                DownloadedPath + "/Materials/Concrete010_2K-JPG.zip",
                DownloadedPath + "/Materials/Concrete010",
                "Concrete material for bridge and urban structures.",
                "Approved: CC0 texture source."),
            new AssetSource(
                "T03-MAT-003",
                "ambientCG Grass004 2K JPG",
                "Materials",
                "ambientCG",
                "ambientCG",
                "https://ambientcg.com/view?id=Grass004",
                "CC0",
                false,
                DownloadedPath + "/Materials/Grass004_2K-JPG.zip",
                DownloadedPath + "/Materials/Grass004",
                "Grass material for riverbanks and vegetation patches.",
                "Approved: CC0 texture source."),
            new AssetSource(
                "T03-MAT-004",
                "ambientCG Rust004 2K JPG",
                "Materials",
                "ambientCG",
                "ambientCG",
                "https://ambientcg.com/view?id=Rust004",
                "CC0",
                false,
                DownloadedPath + "/Materials/Rust004_2K-JPG.zip",
                DownloadedPath + "/Materials/Rust004",
                "Rust material for metal props and pollution storytelling.",
                "Approved: CC0 texture source."),
            new AssetSource(
                "T03-RIVER-001",
                "ambientCG Ground037 2K JPG",
                "River",
                "ambientCG",
                "ambientCG",
                "https://ambientcg.com/view?id=Ground037",
                "CC0",
                false,
                DownloadedPath + "/River/Ground037_2K-JPG.zip",
                DownloadedPath + "/River/Ground037",
                "Ground texture for mud and rough riverbank transitions.",
                "Approved: CC0 texture source.")
        };

        private static readonly RejectedAsset[] RejectedAssets =
        {
            new RejectedAsset(
                "OpenGameArt Park Props Lowpoly",
                "https://opengameart.org/content/park-props-lowpoly",
                "CC-BY 3.0",
                "Rejected for Tijolo 03 because the pipeline prioritizes CC0/permissive sources first and this stage already has enough approved CC0 assets."),
            new RejectedAsset(
                "OpenGameArt Free Trashes",
                "https://opengameart.org/content/free-trashes",
                "Collection / mixed clarity",
                "Rejected because the page is a collection surface, not a single asset with a directly auditable pack-level license and provenance."),
            new RejectedAsset(
                "Quaternius Animated Men Pack",
                "https://quaternius.com/packs/animatedmen.html",
                "CC0",
                "Deferred for now because the exposed download path is a Google Drive folder, which is less reliable for unattended scripted retrieval in this workspace.")
        };

        [MenuItem("VR Abandonada Games/AssetOps/Run Asset Search Plan")]
        public static void RunAssetSearchPlan()
        {
            Directory.CreateDirectory(ReportPath);
            var lines = new List<string>
            {
                "# Asset Search Plan T03",
                string.Empty,
                "Generated: " + DateTime.UtcNow.ToString("u"),
                string.Empty,
                "## Categories Researched",
                "- River",
                "- Bridges",
                "- Nature",
                "- Urban",
                "- Materials",
                "- Characters",
                "- Audio",
                string.Empty,
                "## Keywords Used",
                "- river low poly",
                "- river environment",
                "- water shader free",
                "- riverbank",
                "- bridge low poly",
                "- urban bridge",
                "- nature pack",
                "- city props low poly",
                "- trash props",
                "- road props",
                "- street props",
                "- low poly people",
                "- low poly NPC",
                "- concrete material CC0",
                "- asphalt material CC0",
                "- grass material CC0",
                "- rust material CC0",
                "- water material CC0",
                string.Empty,
                "## Sources Consulted",
                "- Kenney",
                "- ambientCG",
                "- Quaternius",
                "- OpenGameArt",
                string.Empty,
                "## Quality Criteria",
                "- Clear engine-compatible formats such as FBX, OBJ, PNG or JPG",
                "- Low-poly or lightweight assets suitable for WebGL and mobile",
                "- Generic urban or riverine look without protected brands",
                "- Packs that help assemble a believable river test scene quickly",
                string.Empty,
                "## License Criteria",
                "- Prioritize CC0 and clearly permissive sources",
                "- Accept attribution-bearing licenses only when traceability is simple",
                "- Reject unclear pack provenance or mixed-license collection pages",
                string.Empty,
                "## Approved For Download"
            };

            lines.AddRange(ApprovedAssets.Select(asset =>
                "- " + asset.Name + " | " + asset.Category + " | " + asset.License + " | " + asset.SourceUrl));

            lines.Add(string.Empty);
            lines.Add("## Rejected Or Deferred");
            lines.AddRange(RejectedAssets.Select(asset =>
                "- " + asset.Name + " | " + asset.License + " | " + asset.Reason));

            File.WriteAllLines(SearchPlanPath, lines);
            AssetDatabase.Refresh();
            Debug.Log("VR Abandonada Games: asset search plan written to " + SearchPlanPath);
        }

        [MenuItem("VR Abandonada Games/AssetOps/Import Approved Assets")]
        public static void ImportApprovedAssets()
        {
            Directory.CreateDirectory(Path.GetDirectoryName(RegistryPath) ?? RootPath + "/Data/AssetRegistry");
            Directory.CreateDirectory(Path.GetDirectoryName(ManifestPath) ?? RootPath + "/ThirdParty/_Licenses");

            var registry = new AssetRegistryFile();

            foreach (var asset in ApprovedAssets)
            {
                EnsureExtracted(asset);
            }

            AssetDatabase.Refresh();

            foreach (var asset in ApprovedAssets)
            {

                if (asset.Category == "Materials" || asset.Category == "River")
                {
                    CreateMaterialRecord(asset, registry);
                    continue;
                }

                CreatePrefabRecords(asset, registry);
            }

            WriteRegistry(registry);
            WriteManifest();
            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();
            Debug.Log("VR Abandonada Games: approved assets imported and registered.");
        }

        [MenuItem("VR Abandonada Games/AssetOps/Build River Asset Test Scene")]
        public static void BuildRiverAssetTestScene()
        {
            Directory.CreateDirectory(Path.GetDirectoryName(TestScenePath) ?? RootPath + "/Scenes/AssetTests");
            var scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);

            var camera = new GameObject("Main Camera");
            camera.tag = "MainCamera";
            var cameraComponent = camera.AddComponent<Camera>();
            cameraComponent.clearFlags = CameraClearFlags.SolidColor;
            cameraComponent.backgroundColor = new Color(0.80f, 0.88f, 0.95f, 1f);
            camera.transform.position = new Vector3(0f, 10f, -18f);
            camera.transform.rotation = Quaternion.Euler(24f, 0f, 0f);

            var light = new GameObject("Directional Light");
            var lightComponent = light.AddComponent<Light>();
            lightComponent.type = LightType.Directional;
            light.transform.rotation = Quaternion.Euler(45f, -30f, 0f);

            var environmentRoot = new GameObject("Environment");
            BuildTerrain(environmentRoot.transform);
            BuildWater(environmentRoot.transform);
            PlacePrefabByName(environmentRoot.transform, "road-bridge", new Vector3(0f, 0.2f, 0f), new Vector3(2f, 2f, 2f));
            PlacePrefabByName(environmentRoot.transform, "bridge-pillar", new Vector3(-2.8f, -0.3f, 0f), Vector3.one * 2f);
            PlacePrefabByName(environmentRoot.transform, "bridge-pillar-wide", new Vector3(2.8f, -0.3f, 0f), Vector3.one * 2f);
            PlacePrefabByName(environmentRoot.transform, "tree_default", new Vector3(-7f, 0f, 3f), Vector3.one * 2f);
            PlacePrefabByName(environmentRoot.transform, "tree_small", new Vector3(6f, 0f, 4f), Vector3.one * 2f);
            PlacePrefabByName(environmentRoot.transform, "plant_bush", new Vector3(-5f, 0f, -2f), Vector3.one * 1.5f);
            PlacePrefabByName(environmentRoot.transform, "rock_largeA", new Vector3(4f, 0f, -3f), Vector3.one * 1.5f);
            PlacePrefabByName(environmentRoot.transform, "sign", new Vector3(-1.5f, 0f, 5f), Vector3.one * 1.5f);
            PlacePrefabByName(environmentRoot.transform, "trash", new Vector3(5f, 0f, 1f), Vector3.one);
            PlacePrefabByName(environmentRoot.transform, "dumpster", new Vector3(7f, 0f, 1f), Vector3.one);
            PlacePrefabByName(environmentRoot.transform, "bench", new Vector3(-6f, 0f, 5f), Vector3.one);
            PlaceCharacter(environmentRoot.transform);
            CreateEducationalSign(environmentRoot.transform);
            CreateCanvasTitle();

            EditorSceneManager.SaveScene(scene, TestScenePath);
            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();
            Debug.Log("VR Abandonada Games: river asset test scene written to " + TestScenePath);
        }

        [MenuItem("VR Abandonada Games/AssetOps/Validate Downloaded Assets")]
        public static void ValidateDownloadedAssets()
        {
            var issues = CollectValidationIssues();
            WriteAssetOpsValidationReport(issues);
        }

        [MenuItem("VR Abandonada Games/AssetOps/Generate AssetOps Report")]
        public static void GenerateAssetOpsReport()
        {
            Directory.CreateDirectory(ReportPath);
            var lines = new List<string>
            {
                "# TIJOLO 03 AssetOps Report",
                string.Empty,
                "Generated: " + DateTime.UtcNow.ToString("u"),
                string.Empty,
                "## Diagnostico inicial",
                "- Projeto Unity ativado e compilando desde o Tijolo 02.",
                "- Internet disponivel: sim.",
                "- Ferramentas de download disponiveis: curl, tar, Expand-Archive, Invoke-WebRequest.",
                "- Pipeline grafico atual: Built-in Render Pipeline (`m_CustomRenderPipeline: 0`).",
                "- Formatos suportados no conjunto escolhido: FBX, OBJ, PNG, JPG, zip.",
                string.Empty,
                "## Fontes pesquisadas",
                "- Kenney",
                "- ambientCG",
                "- Quaternius",
                "- OpenGameArt",
                string.Empty,
                "## Palavras-chave usadas",
                "- river low poly",
                "- river environment",
                "- bridge low poly",
                "- urban bridge",
                "- nature pack",
                "- city props low poly",
                "- trash props",
                "- low poly NPC",
                "- concrete material CC0",
                "- asphalt material CC0",
                "- grass material CC0",
                "- rust material CC0",
                string.Empty,
                "## Assets aprovados",
            };

            lines.AddRange(ApprovedAssets.Select(asset =>
                "- " + asset.Name + " | " + asset.License + " | " + asset.SourceUrl));

            lines.Add(string.Empty);
            lines.Add("## Assets recusados ou adiados");
            lines.AddRange(RejectedAssets.Select(asset =>
                "- " + asset.Name + " | " + asset.License + " | " + asset.Reason));

            lines.Add(string.Empty);
            lines.Add("## Assets baixados");
            foreach (var path in Directory.GetFiles(DownloadedPath, "*.zip", SearchOption.AllDirectories))
            {
                lines.Add("- " + path.Replace("\\", "/"));
            }

            lines.Add(string.Empty);
            lines.Add("## Assets importados");
            foreach (var path in AssetDatabase.FindAssets("t:Model", new[] { DownloadedPath })
                         .Select(AssetDatabase.GUIDToAssetPath)
                         .Where(path => path.EndsWith(".fbx", StringComparison.OrdinalIgnoreCase)))
            {
                lines.Add("- " + path);
            }

            lines.Add(string.Empty);
            lines.Add("## Prefabs criados");
            foreach (var path in AssetDatabase.FindAssets("t:Prefab", new[] { ImportedPrefabPath })
                         .Select(AssetDatabase.GUIDToAssetPath))
            {
                lines.Add("- " + path);
            }

            lines.Add(string.Empty);
            lines.Add("## Materiais criados");
            foreach (var path in AssetDatabase.FindAssets("t:Material", new[] { ImportedPrefabPath + "/Materials" })
                         .Select(AssetDatabase.GUIDToAssetPath))
            {
                lines.Add("- " + path);
            }

            lines.Add(string.Empty);
            lines.Add("## Cena de teste");
            lines.Add("- " + TestScenePath);
            lines.Add(string.Empty);
            lines.Add("## Manifesto atualizado");
            lines.Add("- " + ManifestPath);
            lines.Add(string.Empty);
            lines.Add("## Validacao executada");
            var validationIssues = CollectValidationIssues();
            lines.Add(validationIssues.Count == 0
                ? "- AssetOps validation passed."
                : "- AssetOps validation found issues.");
            lines.AddRange(validationIssues.Select(issue => "- " + issue));
            lines.Add(string.Empty);
            lines.Add("## Pendencias");
            lines.Add("- Audio livre ainda nao foi baixado nesta etapa.");
            lines.Add("- Pode ser necessario ajustar visualmente materiais e escalas no editor para o mini-jogo final.");
            lines.Add("- NPC importado ainda esta em modo placeholder e sem blend tree configurada.");
            lines.Add(string.Empty);
            lines.Add("## Proximos assets recomendados");
            lines.Add("- Um water shader livre e leve compativel com Built-in RP.");
            lines.Add("- Audio ambiente de agua/cidade com licenca CC0 ou permissiva clara.");
            lines.Add("- Props especificos de residuos urbanos auditados com mesma politica de licenca.");
            lines.Add(string.Empty);
            lines.Add("## Proximo prompt recomendado");
            lines.Add("`Tijolo 04 — Rio Vivo Paraiba: criar o primeiro mini-jogo jogavel usando os assets importados.`");

            File.WriteAllLines(FinalReportPath, lines);
            AssetDatabase.Refresh();
            Debug.Log("VR Abandonada Games: AssetOps report written to " + FinalReportPath);
        }

        public static List<string> CollectValidationIssues()
        {
            var issues = new List<string>();
            var knownFiles = new HashSet<string>(ApprovedAssets.Select(asset => Path.GetFileName(asset.ArchivePath)), StringComparer.OrdinalIgnoreCase);

            foreach (var asset in ApprovedAssets)
            {
                if (!File.Exists(asset.ArchivePath))
                {
                    issues.Add("Missing downloaded archive: " + asset.ArchivePath);
                }

                if (!Directory.Exists(asset.ExtractPath))
                {
                    issues.Add("Missing extracted asset folder: " + asset.ExtractPath);
                }
            }

            foreach (var file in Directory.GetFiles(DownloadedPath, "*.zip", SearchOption.AllDirectories))
            {
                if (!knownFiles.Contains(Path.GetFileName(file)))
                {
                    issues.Add("Downloaded zip outside approved list: " + file.Replace("\\", "/"));
                }

                var length = new FileInfo(file).Length;
                if (length > 100L * 1024L * 1024L)
                {
                    issues.Add("Archive larger than 100MB: " + file.Replace("\\", "/"));
                }
            }

            if (!File.Exists(ManifestPath))
            {
                issues.Add("Missing asset manifest.");
            }
            else
            {
                var manifest = File.ReadAllText(ManifestPath);
                foreach (var asset in ApprovedAssets)
                {
                    if (manifest.IndexOf(asset.Id, StringComparison.OrdinalIgnoreCase) < 0)
                    {
                        issues.Add("Manifest missing asset id: " + asset.Id);
                    }
                }
            }

            if (!File.Exists(RegistryPath))
            {
                issues.Add("Missing asset registry json.");
            }

            var suspiciousBrands = new[] { "lego", "pokemon", "mario", "gta", "raulino", "nike", "disney" };
            foreach (var path in AssetDatabase.FindAssets(string.Empty, new[] { DownloadedPath, ImportedPrefabPath })
                         .Select(AssetDatabase.GUIDToAssetPath))
            {
                var lower = path.ToLowerInvariant();
                if (suspiciousBrands.Any(lower.Contains))
                {
                    issues.Add("Suspicious protected-brand name: " + path);
                }
            }

            var duplicateNames = AssetDatabase.FindAssets(string.Empty, new[] { ImportedPrefabPath })
                .Select(AssetDatabase.GUIDToAssetPath)
                .GroupBy(Path.GetFileNameWithoutExtension, StringComparer.OrdinalIgnoreCase)
                .Where(group => group.Count() > 1);

            foreach (var duplicate in duplicateNames)
            {
                issues.Add("Duplicate imported asset name: " + duplicate.Key);
            }

            foreach (var prefabPath in AssetDatabase.FindAssets("t:Prefab", new[] { ImportedPrefabPath })
                         .Select(AssetDatabase.GUIDToAssetPath))
            {
                var root = PrefabUtility.LoadPrefabContents(prefabPath);
                try
                {
                    foreach (var component in root.GetComponentsInChildren<Component>(true))
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
                    PrefabUtility.UnloadPrefabContents(root);
                }
            }

            return issues.Distinct().ToList();
        }

        private static void EnsureExtracted(AssetSource asset)
        {
            if (Directory.Exists(asset.ExtractPath) && Directory.EnumerateFiles(asset.ExtractPath, "*", SearchOption.AllDirectories).Any())
            {
                return;
            }

            Directory.CreateDirectory(asset.ExtractPath);
            ZipFile.ExtractToDirectory(asset.ArchivePath, asset.ExtractPath, true);
        }

        private static void CreateMaterialRecord(AssetSource asset, AssetRegistryFile registry)
        {
            var colorPath = Directory.GetFiles(asset.ExtractPath, "*_Color.*", SearchOption.AllDirectories).FirstOrDefault();
            if (string.IsNullOrEmpty(colorPath))
            {
                return;
            }

            var assetRelativeColor = ToAssetPath(colorPath);
            var materialFolder = ImportedPrefabPath + "/Materials";
            Directory.CreateDirectory(materialFolder);
            var materialPath = materialFolder + "/VRA_Mat_" + Path.GetFileNameWithoutExtension(colorPath).Replace("_Color", string.Empty) + ".mat";

            var material = AssetDatabase.LoadAssetAtPath<Material>(materialPath);
            if (material == null)
            {
                material = new Material(Shader.Find("Standard"));
                AssetDatabase.CreateAsset(material, materialPath);
            }

            material.mainTexture = AssetDatabase.LoadAssetAtPath<Texture2D>(assetRelativeColor);

            var normalPath = Directory.GetFiles(asset.ExtractPath, "*_NormalGL.*", SearchOption.AllDirectories).FirstOrDefault()
                ?? Directory.GetFiles(asset.ExtractPath, "*_NormalDX.*", SearchOption.AllDirectories).FirstOrDefault();
            if (!string.IsNullOrEmpty(normalPath))
            {
                var importer = AssetImporter.GetAtPath(ToAssetPath(normalPath)) as TextureImporter;
                if (importer != null && importer.textureType != TextureImporterType.NormalMap)
                {
                    importer.textureType = TextureImporterType.NormalMap;
                    importer.SaveAndReimport();
                }

                material.EnableKeyword("_NORMALMAP");
                material.SetTexture("_BumpMap", AssetDatabase.LoadAssetAtPath<Texture2D>(ToAssetPath(normalPath)));
            }

            EditorUtility.SetDirty(material);
            registry.entries.Add(new AssetRegistryEntry
            {
                name = asset.Name,
                category = asset.Category,
                projectPath = asset.ExtractPath,
                prefabOrMaterialPath = materialPath,
                license = asset.License,
                author = asset.Author,
                recommendedUse = asset.PlannedUse,
                tags = new[] { asset.Category, "material", "rio-vivo-paraiba" }
            });
        }

        private static void CreatePrefabRecords(AssetSource asset, AssetRegistryFile registry)
        {
            var targetFolder = ImportedPrefabPath + "/" + asset.Category;
            Directory.CreateDirectory(targetFolder);

            var modelFiles = Directory.GetFiles(asset.ExtractPath, "*.fbx", SearchOption.AllDirectories)
                .Where(path => !path.Contains("/Animations/") && !path.Contains("\\Animations\\"))
                .Take(18)
                .ToArray();

            foreach (var modelFile in modelFiles)
            {
                var assetPath = ToAssetPath(modelFile);
                var modelAsset = AssetDatabase.LoadAssetAtPath<GameObject>(assetPath);
                if (modelAsset == null)
                {
                    continue;
                }

                var prefabPath = targetFolder + "/" + Path.GetFileNameWithoutExtension(modelFile) + ".prefab";
                var existing = AssetDatabase.LoadAssetAtPath<GameObject>(prefabPath);
                if (existing == null)
                {
                    var instance = PrefabUtility.InstantiatePrefab(modelAsset) as GameObject;
                    if (instance == null)
                    {
                        continue;
                    }

                    try
                    {
                        instance.name = Path.GetFileNameWithoutExtension(modelFile);
                        PrefabUtility.SaveAsPrefabAsset(instance, prefabPath);
                    }
                    finally
                    {
                        UnityEngine.Object.DestroyImmediate(instance);
                    }
                }

                registry.entries.Add(new AssetRegistryEntry
                {
                    name = Path.GetFileNameWithoutExtension(modelFile),
                    category = asset.Category,
                    projectPath = assetPath,
                    prefabOrMaterialPath = prefabPath,
                    license = asset.License,
                    author = asset.Author,
                    recommendedUse = asset.PlannedUse,
                    tags = new[] { asset.Category, "prefab", "rio-vivo-paraiba" }
                });
            }
        }

        private static void BuildTerrain(Transform parent)
        {
            var leftBank = GameObject.CreatePrimitive(PrimitiveType.Cube);
            leftBank.name = "RiverBank_Left";
            leftBank.transform.SetParent(parent, false);
            leftBank.transform.position = new Vector3(-5.5f, -0.2f, 0f);
            leftBank.transform.localScale = new Vector3(9f, 0.4f, 20f);
            ApplyMaterial(leftBank, "Grass004");

            var rightBank = GameObject.CreatePrimitive(PrimitiveType.Cube);
            rightBank.name = "RiverBank_Right";
            rightBank.transform.SetParent(parent, false);
            rightBank.transform.position = new Vector3(5.5f, -0.2f, 0f);
            rightBank.transform.localScale = new Vector3(9f, 0.4f, 20f);
            ApplyMaterial(rightBank, "Ground037");

            var road = GameObject.CreatePrimitive(PrimitiveType.Cube);
            road.name = "RoadEdge";
            road.transform.SetParent(parent, false);
            road.transform.position = new Vector3(5.5f, 0.02f, -5f);
            road.transform.localScale = new Vector3(4f, 0.05f, 8f);
            ApplyMaterial(road, "Asphalt002");
        }

        private static void BuildWater(Transform parent)
        {
            var water = GameObject.CreatePrimitive(PrimitiveType.Cube);
            water.name = "River";
            water.transform.SetParent(parent, false);
            water.transform.position = new Vector3(0f, -0.35f, 0f);
            water.transform.localScale = new Vector3(4f, 0.2f, 18f);

            var material = new Material(Shader.Find("Standard"));
            material.color = new Color(0.18f, 0.48f, 0.62f, 0.92f);
            material.SetFloat("_Glossiness", 0.75f);
            water.GetComponent<Renderer>().sharedMaterial = material;
        }

        private static void PlacePrefabByName(Transform parent, string containsName, Vector3 position, Vector3 scale)
        {
            var prefabPath = AssetDatabase.FindAssets("t:Prefab", new[] { ImportedPrefabPath })
                .Select(AssetDatabase.GUIDToAssetPath)
                .FirstOrDefault(path => Path.GetFileNameWithoutExtension(path).IndexOf(containsName, StringComparison.OrdinalIgnoreCase) >= 0);

            if (string.IsNullOrEmpty(prefabPath))
            {
                return;
            }

            var prefab = AssetDatabase.LoadAssetAtPath<GameObject>(prefabPath);
            var instance = PrefabUtility.InstantiatePrefab(prefab) as GameObject;
            if (instance == null)
            {
                return;
            }

            instance.transform.SetParent(parent, false);
            instance.transform.position = position;
            instance.transform.localScale = scale;
        }

        private static void PlaceCharacter(Transform parent)
        {
            var prefabPath = AssetDatabase.FindAssets("t:Prefab", new[] { ImportedPrefabPath + "/Characters" })
                .Select(AssetDatabase.GUIDToAssetPath)
                .FirstOrDefault(path => Path.GetFileNameWithoutExtension(path).Equals("characterMedium", StringComparison.OrdinalIgnoreCase));
            if (string.IsNullOrEmpty(prefabPath))
            {
                return;
            }

            var prefab = AssetDatabase.LoadAssetAtPath<GameObject>(prefabPath);
            var instance = PrefabUtility.InstantiatePrefab(prefab) as GameObject;
            if (instance == null)
            {
                return;
            }

            instance.name = "NPC_Placeholder";
            instance.transform.SetParent(parent, false);
            instance.transform.position = new Vector3(-2f, 0f, 2f);
            instance.transform.localScale = Vector3.one;
        }

        private static void CreateEducationalSign(Transform parent)
        {
            var signRoot = new GameObject("EducationalSign");
            signRoot.transform.SetParent(parent, false);
            signRoot.transform.position = new Vector3(2f, 0f, 5f);

            var post = GameObject.CreatePrimitive(PrimitiveType.Cube);
            post.transform.SetParent(signRoot.transform, false);
            post.transform.localPosition = new Vector3(0f, 1f, 0f);
            post.transform.localScale = new Vector3(0.15f, 2f, 0.15f);
            ApplyMaterial(post, "Rust004");

            var plate = GameObject.CreatePrimitive(PrimitiveType.Cube);
            plate.transform.SetParent(signRoot.transform, false);
            plate.transform.localPosition = new Vector3(0f, 2f, 0f);
            plate.transform.localScale = new Vector3(1.7f, 0.9f, 0.08f);
            ApplyMaterial(plate, "Concrete010");
        }

        private static void CreateCanvasTitle()
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

            CreateText(canvasObject.transform, "Title", "Teste de assets - Rio Vivo Paraiba", new Vector2(0f, 330f), 34);
        }

        private static void CreateText(Transform parent, string objectName, string value, Vector2 anchoredPosition, int fontSize)
        {
            var textObject = new GameObject(objectName);
            textObject.transform.SetParent(parent, false);
            var rect = textObject.AddComponent<RectTransform>();
            rect.sizeDelta = new Vector2(1200f, 60f);
            rect.anchoredPosition = anchoredPosition;

            var text = textObject.AddComponent<Text>();
            text.text = value;
            text.alignment = TextAnchor.MiddleCenter;
            text.font = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
            text.fontSize = fontSize;
            text.color = Color.black;
        }

        private static void ApplyMaterial(GameObject target, string containsName)
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

        private static void WriteManifest()
        {
            var builder = new StringBuilder();
            builder.AppendLine("# Asset Manifest");
            builder.AppendLine();
            builder.AppendLine("| ID | Name | Category | Author | Source | URL | License | Attribution Required | Download Date | Source Folder | Unity Destination | Planned Use | Legal Notes |");
            builder.AppendLine("| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |");

            foreach (var asset in ApprovedAssets)
            {
                builder.AppendLine("| "
                    + asset.Id + " | "
                    + asset.Name + " | "
                    + asset.Category + " | "
                    + asset.Author + " | "
                    + asset.SourceName + " | "
                    + asset.SourceUrl + " | "
                    + asset.License + " | "
                    + (asset.RequiresAttribution ? "Yes" : "No") + " | "
                    + DateTime.UtcNow.ToString("yyyy-MM-dd") + " | "
                    + asset.ExtractPath.Replace("|", "/") + " | "
                    + (ImportedPrefabPath + "/" + asset.Category).Replace("|", "/") + " | "
                    + asset.PlannedUse + " | "
                    + asset.LegalNotes + " |");
            }

            File.WriteAllText(ManifestPath, builder.ToString());
        }

        private static void WriteRegistry(AssetRegistryFile registry)
        {
            var json = JsonUtility.ToJson(registry, true);
            File.WriteAllText(RegistryPath, json);
        }

        private static void WriteAssetOpsValidationReport(List<string> issues)
        {
            Directory.CreateDirectory(ReportPath);
            var path = ReportPath + "/ASSETOPS_VALIDATION_REPORT.md";
            using var writer = new StreamWriter(path, false);
            writer.WriteLine("# AssetOps Validation Report");
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
        }

        private static string ToAssetPath(string absolutePath)
        {
            return absolutePath.Replace("\\", "/").Replace(Application.dataPath, "Assets");
        }

        [Serializable]
        private sealed class AssetRegistryFile
        {
            public List<AssetRegistryEntry> entries = new List<AssetRegistryEntry>();
        }

        [Serializable]
        private sealed class AssetRegistryEntry
        {
            public string name;
            public string category;
            public string projectPath;
            public string prefabOrMaterialPath;
            public string license;
            public string author;
            public string recommendedUse;
            public string[] tags;
        }

        private sealed class AssetSource
        {
            public AssetSource(
                string id,
                string name,
                string category,
                string author,
                string sourceName,
                string sourceUrl,
                string license,
                bool requiresAttribution,
                string archivePath,
                string extractPath,
                string plannedUse,
                string legalNotes)
            {
                Id = id;
                Name = name;
                Category = category;
                Author = author;
                SourceName = sourceName;
                SourceUrl = sourceUrl;
                License = license;
                RequiresAttribution = requiresAttribution;
                ArchivePath = archivePath;
                ExtractPath = extractPath;
                PlannedUse = plannedUse;
                LegalNotes = legalNotes;
            }

            public string Id { get; }
            public string Name { get; }
            public string Category { get; }
            public string Author { get; }
            public string SourceName { get; }
            public string SourceUrl { get; }
            public string License { get; }
            public bool RequiresAttribution { get; }
            public string ArchivePath { get; }
            public string ExtractPath { get; }
            public string PlannedUse { get; }
            public string LegalNotes { get; }
        }

        private sealed class RejectedAsset
        {
            public RejectedAsset(string name, string url, string license, string reason)
            {
                Name = name;
                Url = url;
                License = license;
                Reason = reason;
            }

            public string Name { get; }
            public string Url { get; }
            public string License { get; }
            public string Reason { get; }
        }
    }
}
#endif
