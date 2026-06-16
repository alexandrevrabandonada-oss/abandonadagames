using UnityEngine;
using UnityEngine.SceneManagement;

namespace VRAbandonadaGames.Runtime
{
    public sealed class VRAHubSceneLoader : MonoBehaviour
    {
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
            LoadSceneByPath("Assets/VRAbandonadaGames/Scenes/Games/RioVivoParaiba/RioVivoParaiba_Main.unity");
        }
    }
}
