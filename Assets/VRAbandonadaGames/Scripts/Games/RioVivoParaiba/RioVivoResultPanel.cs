using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;

namespace VRAbandonadaGames.Games.RioVivoParaiba
{
    public sealed class RioVivoResultPanel : MonoBehaviour
    {
        [SerializeField] private GameObject panelRoot;
        [SerializeField] private Text titleText;
        [SerializeField] private Text bodyText;
        [SerializeField] private Text statsText;
        [SerializeField] private Text shareText;

        public string CurrentShareText { get; private set; } = string.Empty;

        public void Hide()
        {
            if (panelRoot != null)
            {
                panelRoot.SetActive(false);
            }
        }

        public void Show(RioVivoGameManager gameManager)
        {
            CurrentShareText =
                "Cuidar do rio e cuidar da cidade. Eu joguei Rio Vivo Paraiba e recuperei "
                + gameManager.RiverHealth
                + "% da margem.";

            if (panelRoot != null)
            {
                panelRoot.SetActive(true);
            }

            if (titleText != null)
            {
                titleText.text = "Rio Vivo Paraiba";
            }

            if (bodyText != null)
            {
                bodyText.text = "Voce ajudou a recuperar a margem do rio.";
            }

            if (statsText != null)
            {
                statsText.text = "Residuos coletados: " + gameManager.TrashCollected
                    + "\nPontos recuperados: " + gameManager.RecoveryPointsActivated
                    + "\nSaude final do rio: " + gameManager.RiverHealth + "%";
            }

            if (shareText != null)
            {
                shareText.text = CurrentShareText;
            }
        }

        public void CopyShareText()
        {
            GUIUtility.systemCopyBuffer = CurrentShareText;
        }

        public void RestartGame()
        {
            SceneManager.LoadScene(SceneManager.GetActiveScene().path);
        }

        public void ReturnToHub()
        {
            SceneManager.LoadScene("Assets/VRAbandonadaGames/Scenes/VRA_Games_PrototypeHub.unity");
        }
    }
}
