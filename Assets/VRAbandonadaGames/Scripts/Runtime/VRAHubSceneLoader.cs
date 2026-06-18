using UnityEngine;
using UnityEngine.SceneManagement;

namespace VRAbandonadaGames.Runtime
{
    public sealed class VRAHubSceneLoader : MonoBehaviour
    {
        private const string RioVivoSceneName = "RioVivoParaiba_Main";
        private const string OnibusZeroSceneName = "OnibusZero_Main";

        public void LoadSceneByPath(string scenePath)
        {
            if (string.IsNullOrEmpty(scenePath))
            {
                return;
            }

            SceneManager.LoadScene(scenePath);
        }

        public void LoadRioVivoParaiba()
        {
            SceneManager.LoadScene(RioVivoSceneName);
        }

        public void LoadOnibusZero()
        {
            SceneManager.LoadScene(OnibusZeroSceneName);
        }
    }
}
