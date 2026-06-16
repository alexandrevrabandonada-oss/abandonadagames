using UnityEngine;

namespace VRAbandonadaGames.Runtime
{
    public enum GameExperienceType
    {
        Hub,
        Narrative,
        Strategy,
        Simulation,
        Exploration,
        Cooperative,
        Educational,
        Other
    }

    public enum GameExperienceStatus
    {
        Prototype,
        Playable,
        Published,
        Archived
    }

    public enum SupportedPlatform
    {
        Editor,
        WebDesktop,
        WebMobile,
        Android,
        IOS,
        WindowsBuild
    }

    [CreateAssetMenu(
        fileName = "GameExperienceDefinition",
        menuName = "VR Abandonada Games/Game Experience Definition")]
    public sealed class GameExperienceDefinition : ScriptableObject
    {
        [Header("Identity")]
        public string experienceName;
        [TextArea(3, 6)] public string description;
        public string theme;

        [Header("Experience")]
        public string mainScenePath;
        public GameExperienceType gameType = GameExperienceType.Educational;
        public string estimatedDuration = "5-15 min";
        public string targetAudience = "General";

        [Header("Impact")]
        [TextArea(2, 5)] public string educationalMessage;
        [TextArea(2, 5)] public string callToAction;

        [Header("Release")]
        public SupportedPlatform[] supportedPlatforms =
        {
            SupportedPlatform.Editor,
            SupportedPlatform.WebDesktop
        };

        public GameExperienceStatus status = GameExperienceStatus.Prototype;
    }
}
