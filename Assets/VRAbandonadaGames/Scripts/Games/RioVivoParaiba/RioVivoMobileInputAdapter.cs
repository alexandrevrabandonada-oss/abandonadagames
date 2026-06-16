using UnityEngine;

namespace VRAbandonadaGames.Games.RioVivoParaiba
{
    public sealed class RioVivoMobileInputAdapter : MonoBehaviour
    {
        [SerializeField] private RioVivoTouchHUD touchHud;

        public bool IsMobileRuntime =>
            Application.isMobilePlatform || Screen.width < 900;

        private void Start()
        {
            if (touchHud != null)
            {
                touchHud.SetVisible(IsMobileRuntime);
            }
        }
    }
}
