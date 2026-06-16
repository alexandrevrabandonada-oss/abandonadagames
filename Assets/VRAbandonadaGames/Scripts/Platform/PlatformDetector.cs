using UnityEngine;

namespace VRAbandonadaGames.Platform
{
    public enum RuntimePlatformProfile
    {
        Editor,
        WebDesktop,
        WebMobile,
        Android,
        IOS,
        WindowsBuild,
        Unknown
    }

    public static class PlatformDetector
    {
        public static RuntimePlatformProfile Detect()
        {
#if UNITY_EDITOR
            return RuntimePlatformProfile.Editor;
#elif UNITY_WEBGL
            return Application.isMobilePlatform
                ? RuntimePlatformProfile.WebMobile
                : RuntimePlatformProfile.WebDesktop;
#elif UNITY_ANDROID
            return RuntimePlatformProfile.Android;
#elif UNITY_IOS
            return RuntimePlatformProfile.IOS;
#elif UNITY_STANDALONE_WIN
            return RuntimePlatformProfile.WindowsBuild;
#else
            return RuntimePlatformProfile.Unknown;
#endif
        }
    }
}
